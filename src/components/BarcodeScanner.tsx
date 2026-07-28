import React, { useState, useRef, useEffect } from 'react';
import { Student, Attendance, WA_NotificationSim, PrayerAttendance } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Scan, 
  UserCheck, 
  Volume2, 
  MessageSquareShare, 
  Clock, 
  AlertCircle, 
  FileText,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Wifi,
  History
} from 'lucide-react';

interface BarcodeScannerProps {
  students: Student[];
  attendance: Attendance[];
  prayerAttendance: PrayerAttendance[];
  onAddAttendance: (att: Attendance) => void;
  onUpdateAttendance: (att: Attendance) => void;
  onAddPrayerAttendance: (att: PrayerAttendance) => void;
  onAddWaNotification: (notif: WA_NotificationSim) => void;
  isOnline: boolean;
  addOfflineQueue: (action: string, payload: any) => void;
}

export default function BarcodeScanner({
  students,
  attendance,
  prayerAttendance,
  onAddAttendance,
  onUpdateAttendance,
  onAddPrayerAttendance,
  onAddWaNotification,
  isOnline,
  addOfflineQueue
}: BarcodeScannerProps) {
  const [scanInput, setScanInput] = useState('');
  const [scanMode, setScanMode] = useState<'masuk' | 'pulang' | 'sholat_dhuhur' | 'sholat_jumat'>('masuk');
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [recentScan, setRecentScan] = useState<{
    student: Student;
    time: string;
    type: 'masuk' | 'pulang' | 'sholat_dhuhur' | 'sholat_jumat';
    status: 'success' | 'duplicate' | 'error';
    message: string;
  } | null>(null);

  // Camera real scanning state
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  // Sync state refs to prevent stale closure capture in Html5Qrcode callbacks
  const studentsRef = useRef(students);
  const attendanceRef = useRef(attendance);
  const prayerAttendanceRef = useRef(prayerAttendance);
  const scanModeRef = useRef(scanMode);
  const isOnlineRef = useRef(isOnline);

  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  useEffect(() => {
    attendanceRef.current = attendance;
  }, [attendance]);
  
  useEffect(() => {
    prayerAttendanceRef.current = prayerAttendance;
  }, [prayerAttendance]);

  useEffect(() => {
    scanModeRef.current = scanMode;
  }, [scanMode]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  // Parent permission form state
  const [permStudentId, setPermStudentId] = useState('');
  const [permStatus, setPermStatus] = useState<'sakit' | 'izin'>('sakit');
  const [permNotes, setPermNotes] = useState('');
  const [permSuccess, setPermSuccess] = useState(false);

  // Audio Context for scan beep sound (synthesized, no external audio file required!)
  const playBeepSound = (success: boolean) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (success) {
        // High pitch clean double beep for success
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1000, ctx.currentTime); // 1000 Hz
        gain1.gain.setValueAtTime(0.2, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc1.start();
        osc1.stop(ctx.currentTime + 0.1);
        
        // Second beep
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1300, ctx.currentTime); // 1300 Hz
          gain2.gain.setValueAtTime(0.2, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          
          osc2.start();
          osc2.stop(ctx.currentTime + 0.12);
        }, 100);
      } else {
        // Low pitch buzzing sound for error/warning
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime); // 180 Hz
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (err) {
      console.warn("Audio Context blocked by browser policy or unsupported:", err);
    }
  };

  // Unified QR Code / NIS processor
  const processNisCode = (nis: string) => {
    const trimmedNis = nis.trim();
    if (!trimmedNis) return;

    // Find student
    const student = studentsRef.current.find(s => s.id === trimmedNis);
    const mode = scanModeRef.current;
    const online = isOnlineRef.current;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNowStr = new Date().toLocaleTimeString();

    if (!student) {
      playBeepSound(false);
      setRecentScan({
        student: { id: trimmedNis, name: "Siswa Tidak Ditemukan", className: "-", pob: "", dob: "", parentName: "", parentPhone: "", usernameCbt: "", passwordCbt: "", usernameParent: "", passwordParent: "" },
        time: timeNowStr,
        type: mode,
        status: 'error',
        message: `Nomor Induk Siswa (NIS) "${trimmedNis}" tidak terdaftar di sistem database EstugaDigital.`
      });
      return;
    }

    const existingAtt = attendanceRef.current.find(a => a.studentId === student.id && a.date === todayStr);

    if (mode === 'masuk') {
      if (existingAtt && (existingAtt.status === 'hadir' || existingAtt.status === 'sakit' || existingAtt.status === 'izin')) {
        playBeepSound(false);
        setRecentScan({
          student,
          time: timeNowStr,
          type: 'masuk',
          status: 'duplicate',
          message: `${student.name} sudah melakukan presensi masuk hari ini atau memiliki izin tertulis.`
        });
        return;
      }

      // Generate successful scan
      const newAtt: Attendance = {
        id: `att_${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        date: todayStr,
        timeIn: timeNowStr,
        timeOut: null,
        status: 'hadir',
        notifiedIn: online, // notify parents directly if online
        notifiedOut: false
      };

      // Play Beep!
      playBeepSound(true);

      if (online) {
        onAddAttendance(newAtt);
        // Generate WhatsApp Notification message
        const waMessage = `Presensi Masuk: Yth. Bapak/Ibu ${student.parentName}, dengan hormat kami menginfokan bahwa putra/putri Anda atas nama *${student.name}* (NIS: *${student.id}*, Kelas: *${student.className}*) telah melakukan presensi masuk sekolah dengan memindai kartu identitas pada pukul *${timeNowStr}* WIB. Semoga Ananda dapat mengikuti proses belajar hari ini dengan lancar. Salam hangat, EstugaDigital.`;
        
        const waNotif: WA_NotificationSim = {
          id: `wa_${Date.now()}`,
          timestamp: `${todayStr} ${timeNowStr}`,
          recipient: `${student.parentName} (Orangtua ${student.name})`,
          phone: student.parentPhone,
          message: waMessage,
          type: 'masuk'
        };
        onAddWaNotification(waNotif);
      } else {
        // Queue offline
        addOfflineQueue('addAttendance', newAtt);
        // Simulate local response
        onAddAttendance({ ...newAtt, notifiedIn: false });
      }

      setRecentScan({
        student,
        time: timeNowStr,
        type: 'masuk',
        status: 'success',
        message: `Presensi MASUK berhasil tercatat. Pesan konfirmasi WhatsApp dikirimkan ke wali murid: ${student.parentPhone}`
      });

    } else if (mode === 'pulang') {
      // PULANG MODE
      if (!existingAtt) {
        playBeepSound(false);
        setRecentScan({
          student,
          time: timeNowStr,
          type: 'pulang',
          status: 'error',
          message: `${student.name} belum mencatat presensi MASUK hari ini. Harap lakukan presensi masuk terlebih dahulu.`
        });
        return;
      }

      if (existingAtt.timeOut) {
        playBeepSound(false);
        setRecentScan({
          student,
          time: timeNowStr,
          type: 'pulang',
          status: 'duplicate',
          message: `${student.name} sudah melakukan presensi pulang hari ini pada pukul ${existingAtt.timeOut}.`
        });
        return;
      }

      // Update existing attendance
      const updatedAtt = {
        ...existingAtt,
        timeOut: timeNowStr,
        notifiedOut: online
      };

      playBeepSound(true);

      if (online) {
        onUpdateAttendance(updatedAtt);
        // WhatsApp notify
        const waMessage = `Presensi Pulang: Yth. Bapak/Ibu ${student.parentName}, dengan hormat kami sampaikan bahwa putra/putri Anda atas nama *${student.name}* (NIS: *${student.id}*, Kelas: *${student.className}*) telah melakukan presensi pulang sekolah dengan memindai kartu identitas pada pukul *${timeNowStr}* WIB. Terima kasih atas kerja samanya. Salam hangat, EstugaDigital.`;
        
        const waNotif: WA_NotificationSim = {
          id: `wa_${Date.now()}`,
          timestamp: `${todayStr} ${timeNowStr}`,
          recipient: `${student.parentName} (Orangtua ${student.name})`,
          phone: student.parentPhone,
          message: waMessage,
          type: 'pulang'
        };
        onAddWaNotification(waNotif);
      } else {
        addOfflineQueue('updateAttendance', updatedAtt);
        onUpdateAttendance(updatedAtt);
      }

      setRecentScan({
        student,
        time: timeNowStr,
        type: 'pulang',
        status: 'success',
        message: `Presensi PULANG berhasil tercatat (Jam Pulang Fleksibel). Pesan WhatsApp dikirimkan ke wali murid: ${student.parentPhone}`
      });
    } else if (mode === 'sholat_dhuhur') {
      const today = new Date().getDay();
      const isWeekend = today === 0 || today === 6;
      const isFriday = today === 5;
      
      if (isWeekend) {
        playBeepSound(false);
        setRecentScan({
          student, time: timeNowStr, type: 'sholat_dhuhur', status: 'error',
          message: `Absen Sholat Dhuhur tidak berlaku pada hari libur (Sabtu-Minggu).`
        });
        return;
      }
      
      if (isFriday && student.gender && student.gender.toLowerCase() === 'laki-laki') {
        playBeepSound(false);
        setRecentScan({
          student, time: timeNowStr, type: 'sholat_dhuhur', status: 'error',
          message: `Siswa laki-laki wajib mengikuti Sholat Jum'at pada hari Jum'at.`
        });
        return;
      }
      
      const grade = student.className.match(/\d/)?.[0];
      const gradeNum = grade ? parseInt(grade) : 0;
      if (gradeNum < 3 || gradeNum > 6) {
        playBeepSound(false);
        setRecentScan({
          student, time: timeNowStr, type: 'sholat_dhuhur', status: 'error',
          message: `Siswa kelas ${gradeNum} tidak wajib Sholat Dhuhur berjamaah (hanya Kelas 3 - 6).`
        });
        return;
      }
      
      if (student.religion && student.religion.toLowerCase() !== 'islam') {
         playBeepSound(false);
         setRecentScan({
           student, time: timeNowStr, type: 'sholat_dhuhur', status: 'error',
           message: `Absen sholat ini hanya untuk siswa beragama Islam.`
         });
         return;
      }

      const existingPrayer = prayerAttendanceRef.current.find(a => a.studentId === student.id && a.date === todayStr && a.type === 'sholat_dhuhur');
      if (existingPrayer) {
        playBeepSound(false);
        setRecentScan({
          student, time: timeNowStr, type: 'sholat_dhuhur', status: 'duplicate',
          message: `${student.name} sudah tercatat hadir Sholat Dhuhur hari ini.`
        });
        return;
      }

      const newPrayerAtt: PrayerAttendance = {
        id: `pray_${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        date: todayStr,
        time: timeNowStr,
        type: 'sholat_dhuhur',
        status: 'hadir'
      };

      playBeepSound(true);
      
      if (online) {
        onAddPrayerAttendance(newPrayerAtt);
      } else {
        addOfflineQueue('addPrayerAttendance', newPrayerAtt);
        onAddPrayerAttendance(newPrayerAtt);
      }

      setRecentScan({
        student,
        time: timeNowStr,
        type: 'sholat_dhuhur',
        status: 'success',
        message: `Hadir Sholat Dhuhur tercatat. (Tidak ada pesan WA, rekap masuk ke akun Guru Agama & Orang Tua)`
      });
    } else if (mode === 'sholat_jumat') {
      const today = new Date().getDay();
      if (today !== 5) { // Only Friday
        playBeepSound(false);
        setRecentScan({
          student, time: timeNowStr, type: 'sholat_jumat', status: 'error',
          message: `Absen Sholat Jum'at hanya berlaku pada hari Jum'at.`
        });
        return;
      }
      
      if (student.religion && student.religion.toLowerCase() !== 'islam') {
         playBeepSound(false);
         setRecentScan({
           student, time: timeNowStr, type: 'sholat_jumat', status: 'error',
           message: `Absen Sholat Jum'at ini hanya untuk siswa beragama Islam.`
         });
         return;
      }

      if (student.gender && student.gender.toLowerCase() !== 'laki-laki') {
         playBeepSound(false);
         setRecentScan({
           student, time: timeNowStr, type: 'sholat_jumat', status: 'error',
           message: `Absen Sholat Jum'at ini hanya diwajibkan untuk siswa laki-laki.`
         });
         return;
      }

      const existingPrayer = prayerAttendanceRef.current.find(a => a.studentId === student.id && a.date === todayStr && a.type === 'sholat_jumat');
      if (existingPrayer) {
        playBeepSound(false);
        setRecentScan({
          student, time: timeNowStr, type: 'sholat_jumat', status: 'duplicate',
          message: `${student.name} sudah tercatat hadir Sholat Jum'at hari ini.`
        });
        return;
      }

      const newPrayerAtt: PrayerAttendance = {
        id: `pray_${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        date: todayStr,
        time: timeNowStr,
        type: 'sholat_jumat',
        status: 'hadir'
      };

      playBeepSound(true);
      
      if (online) {
        onAddPrayerAttendance(newPrayerAtt);
      } else {
        addOfflineQueue('addPrayerAttendance', newPrayerAtt);
        onAddPrayerAttendance(newPrayerAtt);
      }

      setRecentScan({
        student,
        time: timeNowStr,
        type: 'sholat_jumat',
        status: 'success',
        message: `Hadir Sholat Jum'at tercatat. (Tidak ada pesan WA, rekap masuk ke akun Guru Agama & Orang Tua)`
      });
    }
  };

  // Load cameras list on mount
  useEffect(() => {
    let isMounted = true;
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (isMounted && devices && devices.length > 0) {
          setCameras(devices);
          // Auto-select back camera if found on mobile, otherwise first camera (laptop webcam)
          const backCamera = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('belakang') || 
            d.label.toLowerCase().includes('environment')
          );
          if (backCamera) {
            setSelectedCameraId(backCamera.id);
          } else {
            setSelectedCameraId(devices[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn("Gagal mendeteksi list kamera awal:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Real camera QR Code scanner lifecycle hook
  useEffect(() => {
    let isMounted = true;
    const elementId = "qr-video-reader";
    let qrScanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      // Delay slightly to ensure browser DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 350));
      if (!isCameraActive || !isMounted) return;

      const element = document.getElementById(elementId);
      if (!element) return;

      try {
        qrScanner = new Html5Qrcode(elementId);
        qrReaderRef.current = qrScanner;

        // Choose camera config: selected ID or default facingMode
        const cameraConfig = selectedCameraId ? selectedCameraId : { facingMode: "environment" };

        await qrScanner.start(
          cameraConfig,
          {
            fps: 15, // Smooth high FPS
            qrbox: (width, height) => {
              // Flexible responsive scanning frame
              const size = Math.max(250, Math.min(width, height) * 0.75);
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            if (!isMounted) return;
            const cleanText = decodedText.trim();
            if (!cleanText) return;

            const now = Date.now();
            // 3-second throttle for scanning the exact same student QR Code
            if (lastScannedRef.current.code === cleanText && (now - lastScannedRef.current.time) < 3000) {
              return;
            }
            lastScannedRef.current = { code: cleanText, time: now };
            processNisCode(cleanText);
          },
          () => {
            // Quiet fallback for non-detected camera frames
          }
        );
        if (!isMounted) {
          qrScanner.stop().catch(console.error);
          return;
        }
        if (isMounted) {

          setCameraError(null);
          
          // Re-query camera devices after permission is granted to populate list
          Html5Qrcode.getCameras()
            .then((devices) => {
              if (isMounted && devices && devices.length > 0) {
                setCameras(devices);
                if (!selectedCameraId) {
                  // Fallback to select rear camera or first camera
                  const backCamera = devices.find(d => 
                    d.label.toLowerCase().includes('back') || 
                    d.label.toLowerCase().includes('rear') || 
                    d.label.toLowerCase().includes('belakang') || 
                    d.label.toLowerCase().includes('environment')
                  );
                  setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
                }
              }
            })
            .catch(err => console.warn("Gagal mematangkan list kamera setelah start:", err));
        }
      } catch (err) {
        console.error("Gagal menyalakan kamera absensi:", err);
        if (isMounted) {
          setCameraError(
            "Gagal mengakses kamera. Silakan berikan izin akses kamera pada peramban web Anda atau pilih kamera lain di atas jika tersedia."
          );
        }
      }
    };

    startScanner();
    return () => {
      isMounted = false;
      if (qrScanner && typeof qrScanner.getState === 'function') {
        const state = qrScanner.getState();
        // 2 is SCANNING, 3 is PAUSED
        if (state === 2 || state === 3) {
          qrScanner.stop().then(() => console.log("Kamera dihentikan.")).catch(err => console.log("Gagal menghentikan atau sudah berhenti", err));
        } else if (qrScanner.isScanning) {
          qrScanner.stop().then(() => console.log("Kamera dihentikan.")).catch(err => console.log("Gagal menghentikan atau sudah berhenti", err));
        }
      } else if (qrScanner) {
        try {
          qrScanner.stop().then(() => console.log("Kamera dihentikan.")).catch(err => console.log("Gagal menghentikan atau sudah berhenti", err));
        } catch(e) {}
      }
    };
  }, [isCameraActive, selectedCameraId]);

  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scanInput.trim()) return;

    processNisCode(scanInput.trim());
    setScanInput('');
  };

  // Simulated Quick Scan click
  const simulateScan = (nis: string) => {
    setScanInput(nis);
    setTimeout(() => {
      processNisCode(nis);
      setScanInput('');
    }, 150);
  };

  const runMultiScanSimulation = () => {
    const today = new Date().toISOString().split('T')[0];
    // Find students matching the current mode for a beautiful demonstration
    const targets = students.filter(s => {
      const att = attendance.find(a => a.studentId === s.id && a.date === today);
      if (scanMode === 'masuk') {
        return !att;
      } else {
        return att && !att.timeOut;
      }
    }).slice(0, 3);

    const scanList = targets.length > 0 ? targets : students.slice(0, 3);
    
    scanList.forEach((st, idx) => {
      setTimeout(() => {
        processNisCode(st.id);
      }, idx * 550);
    });
  };

  // Save Sick or Permitted form (Parent comes to school with physical note)
  const handlePermissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permStudentId || !permNotes) return;

    const student = students.find(s => s.id === permStudentId);
    if (!student) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeNowStr = new Date().toLocaleTimeString();

    // Check if attendance exists
    const existingAtt = attendance.find(a => a.studentId === student.id && a.date === todayStr);
    
    const newAtt: Attendance = {
      id: existingAtt?.id || `att_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      date: todayStr,
      timeIn: null,
      timeOut: null,
      status: permStatus,
      notes: permNotes,
      notifiedIn: isOnline,
      notifiedOut: false
    };

    if (isOnline) {
      if (existingAtt) {
        onUpdateAttendance(newAtt);
      } else {
        onAddAttendance(newAtt);
      }
      // Send WhatsApp WA notification
      const statusIndo = permStatus === 'sakit' ? 'Sakit' : 'Izin Keperluan Lain';
      const waMessage = `Keterangan Kehadiran: Yth. Bapak/Ibu ${student.parentName}, kami telah menerima surat keterangan tertulis dan mencatat kehadiran putra/putri Anda atas nama *${student.name}* (NIS: *${student.id}*) sebagai *${statusIndo}* pada hari ini tanggal *${todayStr}* dengan keterangan: "${permNotes}". Semoga lekas sembuh/urusan berjalan lancar. Terima kasih. EstugaDigital.`;
      
      onAddWaNotification({
        id: `wa_${Date.now()}`,
        timestamp: `${todayStr} ${timeNowStr}`,
        recipient: `${student.parentName} (Orangtua ${student.name})`,
        phone: student.parentPhone,
        message: waMessage,
        type: 'sakit'
      });
    } else {
      addOfflineQueue(existingAtt ? 'updateAttendance' : 'addAttendance', newAtt);
      if (existingAtt) {
        onUpdateAttendance(newAtt);
      } else {
        onAddAttendance({ ...newAtt, notifiedIn: false });
      }
    }

    setPermSuccess(true);
    setPermNotes('');
    setPermStudentId('');
    
    setTimeout(() => {
      setPermSuccess(false);
    }, 3000);
  };

  // Filter students who haven't logged in/out today
  const todayStr = new Date().toISOString().split('T')[0];
  const loggedInStudentIds = attendance
    .filter(a => a.date === todayStr && a.status === 'hadir')
    .map(a => a.studentId);

  const loggedOutStudentIds = attendance
    .filter(a => a.date === todayStr && a.timeOut !== null)
    .map(a => a.studentId);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-sans text-gray-800 dark:text-white">Terminal Absensi QR Code</h1>
        <p className="text-sm text-gray-500 dark:text-[#a3a4cc]">
          Pindai kartu QR Code siswa atau input manual untuk pencatatan masuk/pulang real-time serta notifikasi WhatsApp otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SCANNER SIMULATOR WINDOW (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <Scan size={18} className={`text-indigo-600 dark:text-indigo-400 ${isCameraActive && !cameraError ? 'animate-pulse' : ''}`} />
                Kamera / Scanner Status: <span className={`${isCameraActive && !cameraError ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1 font-semibold`}>● {isCameraActive && !cameraError ? 'Siap Memindai' : 'Kamera Nonaktif'}</span>
              </span>
              <div className="flex bg-gray-100 dark:bg-[#232333] p-1 rounded-lg">
                <button
                  id="scan-mode-masuk"
                  onClick={() => setScanMode('masuk')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer
                    ${scanMode === 'masuk' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  Masuk (06.00-07.15)
                </button>
                <button
                  id="scan-mode-pulang"
                  onClick={() => setScanMode('pulang')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer
                    ${scanMode === 'pulang' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  Pulang
                </button>
                <button
                  id="scan-mode-sholat"
                  onClick={() => setScanMode('sholat_dhuhur')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer
                    ${scanMode === 'sholat_dhuhur' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  Sholat Dhuhur
                </button>
                <button
                  id="scan-mode-sholat-jumat"
                  onClick={() => setScanMode('sholat_jumat')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer
                    ${scanMode === 'sholat_jumat' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  Sholat Jum'at
                </button>
              </div>
            </div>
 
            {/* Camera Selector Dropdown */}
            {isCameraActive && cameras.length > 0 && (
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/30 rounded-xl">
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5 shrink-0">
                  📷 Pilih Kamera Aktif:
                </span>
                <select
                  id="camera-select"
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3e405b] bg-white dark:bg-[#1a1b2e] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto min-w-[220px]"
                >
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${cam.id.slice(0, 5)}...`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Real Camera QR Code Scanner */}
            <div className="relative bg-[#0b0c15] rounded-xl overflow-hidden border border-indigo-500/30 flex flex-col items-center justify-center min-h-[300px] shadow-inner mb-4">
              {isCameraActive ? (
                <div className="w-full relative py-4">
                  {/* html5-qrcode video container */}
                  <div id="qr-video-reader" className="w-full max-w-[420px] bg-black mx-auto overflow-hidden rounded-lg shadow-lg border border-indigo-500/15" />
                  
                  {/* Overlay decorative scanned laser frame */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-500 opacity-60 pointer-events-none shadow-[0_0_8px_#6366f1] animate-pulse" />
                  
                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 z-20">
                      <AlertCircle size={40} className="text-rose-500 mb-2" />
                      <p className="text-xs text-rose-200 leading-relaxed font-semibold max-w-sm mb-4">
                        {cameraError}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCameraActive(false);
                          setTimeout(() => setIsCameraActive(true), 150);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105"
                      >
                        Buka Ulang Kamera
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3 z-10">
                  <div className="p-3.5 bg-slate-900 border border-slate-800 text-indigo-400 rounded-full w-fit mx-auto">
                    <Scan size={36} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-300">Kamera Dinonaktifkan</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">Klik tombol di bawah untuk membuka kamera scanner QR Code secara langsung.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCameraActive(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    Nyalakan Kamera Sekarang
                  </button>
                </div>
              )}

              {/* Status badge for camera */}
              <div className="absolute top-3 left-3 bg-black/85 border border-slate-800  text-gray-300 text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 font-mono">
                <span className={`w-2 h-2 rounded-full ${isCameraActive && !cameraError ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>Kamera: {isCameraActive && !cameraError ? 'AKTIF' : 'NONAKTIF'}</span>
              </div>

              {/* Toggle camera button */}
              {isCameraActive && (
                <button
                  type="button"
                  onClick={() => setIsCameraActive(false)}
                  className="absolute top-3 right-3 bg-black/85 hover:bg-black border border-slate-800 -sm text-slate-300 hover:text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 z-10 cursor-pointer font-bold transition-colors"
                >
                  Matikan Kamera
                </button>
              )}

              {/* Sound icon badge */}
              <div className="absolute bottom-3 right-3 bg-black/85 border border-slate-800 text-gray-300 text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10">
                <Volume2 size={12} className="text-emerald-400" />
                <span>Audio Bip Aktif 🔊</span>
              </div>
            </div>

            {/* Manual NIS Scanner Input */}
            <form onSubmit={handleBarcodeSubmit} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <input
                  id="barcode-input"
                  type="text"
                  placeholder="Ketik NIS Siswa (contoh: 102401) lalu tekan Enter..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                />
              </div>
              <button
                id="submit-barcode-btn"
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <UserCheck size={16} />
                <span>Scan</span>
              </button>
            </form>

            {/* Scan Feedback message */}
            {recentScan && (
              <div 
                id="scan-result-card"
                className={`mt-4 p-4 rounded-lg border flex gap-3 animate-fade-in
                  ${recentScan.status === 'success' 
                    ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                    : recentScan.status === 'duplicate'
                      ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/40 text-amber-800 dark:text-amber-400'
                      : 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/40 text-rose-800 dark:text-rose-400'}`}
              >
                <div className="mt-0.5">
                  {recentScan.status === 'success' ? (
                    <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
                  ) : recentScan.status === 'duplicate' ? (
                    <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
                  ) : (
                    <AlertCircle className="text-rose-600 dark:text-rose-400" size={20} />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{recentScan.student.name} ({recentScan.student.id})</span>
                    <span>{recentScan.time}</span>
                  </div>
                  <p className="mt-1">{recentScan.message}</p>
                  
                  {recentScan.status === 'success' && (
                    <div className="mt-2.5 p-2 bg-white dark:bg-[#232333] border rounded flex items-center gap-2">
                      <MessageSquareShare size={14} className="text-indigo-500" />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono italic">
                        Notifikasi Terkirim ke WA Ortu: {recentScan.student.parentPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* HELP GUIDE: SUCCESSFUL SCAN TIPS FOR MOBILE AND LAPTOP */}
          <div className="bg-slate-50 dark:bg-[#232333]/50 rounded-xl p-5 border border-slate-150 dark:border-[#3e405b]/40 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              💡 Panduan & Tips Sukses Scan via HP / Laptop
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="space-y-1.5">
                <p className="font-bold text-indigo-600 dark:text-indigo-400">📱 Panduan Memindai via HP (Android/iPhone):</p>
                <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                  <li><strong>Izin Kamera:</strong> Saat pertama kali membuka menu ini, pilih <strong>"Allow/Izinkan"</strong> pada pop-up peramban Anda.</li>
                  <li><strong>Gunakan Kamera Belakang:</strong> Jika HP Anda memiliki banyak kamera, gunakan dropdown <strong>"Pilih Kamera Aktif"</strong> di atas untuk berganti ke lensa utama belakang agar mendapat fokus makro terbaik.</li>
                  <li><strong>Jarak & Cahaya:</strong> Posisikan kartu ID sekitar <strong>15-20 cm</strong> di depan lensa kamera. Cari area yang terang namun hindari pantulan silau lampu langsung pada laminasi kartu.</li>
                </ul>
              </div>
              <div className="space-y-1.5">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">💻 Panduan Memindai via Laptop/Webcam:</p>
                <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                  <li><strong>Tegak Lurus:</strong> Dekatkan kartu ID siswa menghadap langsung ke kamera depan/webcam laptop Anda secara tegak lurus dan simetris.</li>
                  <li><strong>Hindari Goyangan:</strong> Pegang kartu dengan mantap selama 1 detik agar software kamera dapat memfokuskan QR Code secara sempurna.</li>
                  <li><strong>Gunakan Input Manual jika Perlu:</strong> Jika kamera laptop buram/low-res, Anda selalu bisa mengetikkan NIS siswa di kolom pencarian manual lalu tekan <strong>Enter</strong>.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SICK/PERMISSION FORM: WALIMURID WRITTEN SUBMISSION */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-3">
              <FileText size={18} className="text-amber-500" />
              Input Izin / Sakit Tertulis (Keterangan Orang Tua)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Gunakan form ini jika orang tua siswa menyerahkan surat izin tertulis fisik ke sekolah.
            </p>

            {permSuccess && (
              <div id="permission-success-alert" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-xs rounded-lg flex items-center gap-2 mb-4">
                <CheckCircle size={16} />
                <span>Keterangan izin/sakit berhasil diinput! Terkoneksi otomatis ke Jurnal Guru dan WhatsApp Wali Murid.</span>
              </div>
            )}

            <form onSubmit={handlePermissionSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Siswa Penerima Izin</label>
                  <select
                    id="perm-student-select"
                    value={permStudentId}
                    onChange={(e) => setPermStudentId(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status Kehadiran</label>
                  <select
                    id="perm-status-select"
                    value={permStatus}
                    onChange={(e) => setPermStatus(e.target.value as 'sakit' | 'izin')}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  >
                    <option value="sakit">Sakit (Keterangan Dokter / Ortu)</option>
                    <option value="izin">Izin Keperluan Mendesak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Catatan Keterangan Surat / Deskripsi</label>
                <textarea
                  id="perm-notes-textarea"
                  rows={2}
                  placeholder="Sebutkan detail izin/sakit (misal: Demam tinggi, Surat Klinik dr. Roy, atau Izin pernikahan keluarga...)"
                  value={permNotes}
                  onChange={(e) => setPermNotes(e.target.value)}
                  required
                  className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  id="submit-permission-btn"
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Keterangan Izin
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SIMULATOR ASSISTANT PANEL: CLICK TO TEST (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
              <HelpCircle size={18} className="text-indigo-500" />
              Pintas Simulasi Kartu QR Code
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Untuk menguji scan tanpa device fisik, klik tombol <span className="font-semibold text-indigo-600">Pindai</span> di bawah. Ini akan meniru pembacaan QR Code dan memutar audio bip asli!
            </p>

            {/* Continuous Multi-Scan Demonstration Box */}
            <div className="mb-4 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-150/40 dark:border-indigo-900/30 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Fitur Multi-Scan Cepat Aktif ⚡</span>
              </div>
              <p className="text-[11px] text-indigo-750/90 dark:text-indigo-300/80 leading-relaxed">
                Kamera dan simulator Anda mendukung **pembacaan massal tanpa henti**. Anda dapat memindai kartu siswa satu per satu secara langsung tanpa perlu menutup kamera atau berpindah halaman!
              </p>
              <button
                type="button"
                onClick={runMultiScanSimulation}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Simulasi Multi-Scan (Pindai Massal 3 Siswa)</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {students.map(student => {
                const isPresent = loggedInStudentIds.includes(student.id);
                const isOut = loggedOutStudentIds.includes(student.id);
                const todayAtt = attendance.find(a => a.studentId === student.id && a.date === todayStr);

                return (
                  <div 
                    key={student.id} 
                    className="p-3 border rounded-lg border-gray-100 dark:border-[#3e405b]/60 flex justify-between items-center bg-gray-50/50 dark:bg-[#232333]/30"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200">{student.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">NIS: {student.id} • {student.className}</p>
                      
                      {/* Live Badge status */}
                      <div className="mt-1 flex items-center gap-1.5">
                        {todayAtt ? (
                          todayAtt.status === 'hadir' ? (
                            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded font-semibold uppercase">
                              Hadir {todayAtt.timeIn}
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded font-semibold uppercase">
                              {todayAtt.status}
                            </span>
                          )
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded font-semibold uppercase">
                            Belum Absen
                          </span>
                        )}

                        {todayAtt?.timeOut && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 rounded font-semibold uppercase">
                            Pulang {todayAtt.timeOut}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      id={`simulate-scan-${student.id}`}
                      onClick={() => simulateScan(student.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer transition-all
                        ${scanMode === 'masuk' && isPresent
                          ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                          : scanMode === 'pulang' && (!isPresent || isOut)
                            ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700 font-semibold shadow-sm'}`}
                    >
                      <span>Pindai</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HISTORICAL RECENT ATTENDANCE LOG */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-3">
              <History size={18} className="text-gray-500" />
              Presensi Hari Ini ({todayStr})
            </h2>
            <div className="space-y-2.5">
              {attendance.filter(a => a.date === todayStr).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada aktivitas presensi hari ini.</p>
              ) : (
                attendance
                  .filter(a => a.date === todayStr)
                  .map(att => (
                    <div key={att.id} className="text-xs border-b pb-2 last:border-b-0 last:pb-0 dark:border-[#3e405b]/40">
                      <div className="flex justify-between font-bold text-gray-700 dark:text-gray-200">
                        <span>{att.studentName}</span>
                        <span className="font-mono text-gray-400">{att.className}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[11px]">
                        <span className="text-gray-500">
                          {att.status === 'hadir' ? (
                            <span>Masuk: {att.timeIn || '-'} | Pulang: {att.timeOut || 'Sekolah (Flexible)'}</span>
                          ) : (
                            <span className="text-amber-600 italic font-semibold capitalize">{att.status}: {att.notes}</span>
                          )}
                        </span>
                        
                        {/* WA icon to reflect notification connection */}
                        <div className="flex gap-1">
                          {att.notifiedIn && (
                            <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 text-[9px] px-1 py-0.25 rounded" title="WA Masuk Terkirim">
                              WA In
                            </span>
                          )}
                          {att.timeOut && att.notifiedOut && (
                            <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 text-[9px] px-1 py-0.25 rounded" title="WA Pulang Terkirim">
                              WA Out
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
