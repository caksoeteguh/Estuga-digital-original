import React, { useState } from 'react';
import { Student, Teacher, Attendance, ClassJournal, StudentCBTResult, TeacherFeedback, ELearningMaterial, AssignmentTask } from '../types';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Calendar, 
  Activity, 
  CheckCircle, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingDown,
  UserCheck,
  ClipboardList,
  Smartphone,
  HelpCircle,
  GraduationCap,
  QrCode,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface AnalyticsDashboardProps {
  students: Student[];
  teachers: Teacher[];
  attendance: Attendance[];
  journals: ClassJournal[];
  results: StudentCBTResult[];
  feedbacks: TeacherFeedback[];
  onAddFeedback: (fb: TeacherFeedback) => void;
  activeRole: string;
  onClearHistory?: () => void;
  materials?: ELearningMaterial[];
  assignments?: AssignmentTask[];
  schoolIdentity?: any;
}

export default function AnalyticsDashboard({
  students,
  teachers,
  attendance,
  journals,
  results,
  feedbacks,
  onAddFeedback,
  activeRole,
  onClearHistory,
  materials = [],
  assignments = [],
  schoolIdentity
}: AnalyticsDashboardProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers.length > 0 ? teachers[0].id : '');
  const [fbNotes, setFbNotes] = useState('');
  const [fbSuccess, setFbSuccess] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculated statistics
  const totalStudents = students.length;
  const uniqueClassesCount = new Set(students.map(s => s.className)).size;
  const presentCount = attendance.filter(a => a.date === todayStr && a.status === 'hadir').length;
  const sickCount = attendance.filter(a => a.date === todayStr && a.status === 'sakit').length;
  const permissionCount = attendance.filter(a => a.date === todayStr && a.status === 'izin').length;
  const absentCount = totalStudents - presentCount - sickCount - permissionCount;

  // Percentage calculations
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const journalCompleteness = teachers.length > 0 ? Math.round((journals.length / (teachers.length * 2)) * 100) : 0;

  // Handle Feedback Submission from Kepala Sekolah
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbNotes.trim()) return;

    const teacher = teachers.find(t => t.id === selectedTeacherId);
    if (!teacher) return;

    const newFb: TeacherFeedback = {
      id: `fb_${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      principalNote: fbNotes,
      date: todayStr
    };

    onAddFeedback(newFb);
    setFbNotes('');
    setFbSuccess(true);

    setTimeout(() => {
      setFbSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Summary Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Attendance Rate */}
        <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-4 border border-gray-100 dark:border-[#3e405b] shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400">Kehadiran Hari Ini</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{attendanceRate}%</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{presentCount} Hadir • {sickCount} Sakit</p>
          </div>
        </div>

        {/* Card 2: Total Active Students */}
        <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-4 border border-gray-100 dark:border-[#3e405b] shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400">Jumlah Siswa</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{totalStudents} Anak</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{uniqueClassesCount} Kelas Terdaftar</p>
          </div>
        </div>

        {/* Card 3: Jurnal Harian Completeness */}
        <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-4 border border-gray-100 dark:border-[#3e405b] shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400">Jurnal Guru Terisi</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{journals.length} Jurnal</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Mencegah materi lewat</p>
          </div>
        </div>

        {/* Card 4: CBT Evaluations */}
        <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-4 border border-gray-100 dark:border-[#3e405b] shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-lg">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400">Hasil CBT Terunggah</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-0.5">{results.length} Nilai</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Real-time ke Orangtua</p>
          </div>
        </div>

      </div>

      {/* GUIDELINES/FLOW CHART FOR DATA FILLING - SNEAT INSPIRED MODERN CARD */}
      {activeRole === 'admin' && (
        <div className="bg-[#e0e7ff] dark:bg-[#1e1b4b]/40 rounded-xl p-5 border border-emerald-150 dark:border-[#3e405b] shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-md shrink-0">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Panduan Urutan Pengisian Data Sekolah (Alur Kerja Lancar)
              </h2>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                Ikuti urutan langkah di bawah ini untuk mengonfigurasi data awal sekolah Anda agar seluruh menu e-learning, CBT, presensi QR Code, dan notifikasi WhatsApp berjalan otomatis tanpa hambatan:
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-5 relative">
            
            {/* Step 1: Subjects */}
            <div className="bg-white dark:bg-[#202134] p-4 rounded-xl border border-emerald-100 dark:border-[#3e405b] space-y-3 relative hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold font-mono">1</span>
                <BookOpen size={16} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">Mata Pelajaran</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Isi/impor daftar Mata Pelajaran di menu <span className="font-semibold text-emerald-600 dark:text-emerald-400">Data Master & Impor</span> terlebih dahulu agar siap dihubungkan dengan jadwal guru.
                </p>
              </div>
            </div>

            {/* Step 2: Teachers */}
            <div className="bg-white dark:bg-[#202134] p-4 rounded-xl border border-emerald-100 dark:border-[#3e405b] space-y-3 relative hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold font-mono">2</span>
                <GraduationCap size={16} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">Daftar Guru</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Daftarkan guru beserta mata pelajaran & kelas yang diampu. Akun login guru otomatis dibuat dengan sandi default yang aman.
                </p>
              </div>
            </div>

            {/* Step 3: Students & QR Code Generation */}
            <div className="bg-white dark:bg-[#202134] p-4 rounded-xl border border-emerald-100 dark:border-[#3e405b] space-y-3 relative hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold font-mono">3</span>
                <Users size={16} className="text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">Siswa &amp; QR Code</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Impor data siswa via Excel atau manual. Sistem otomatis membuat kartu identitas digital dan kode QR NIS untuk setiap siswa baru.
                </p>
              </div>
            </div>

            {/* Step 4: WhatsApp Integration */}
            <div className="bg-white dark:bg-[#202134] p-4 rounded-xl border border-emerald-100 dark:border-[#3e405b] space-y-3 relative hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold font-mono">4</span>
                <MessageSquare size={16} className="text-rose-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-white">Notifikasi WhatsApp</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Hubungkan Token Fonnte Anda di menu <span className="font-semibold text-emerald-600 dark:text-emerald-400">Log Notifikasi WhatsApp</span> untuk mengaktifkan pengiriman SMS WA otomatis.
                </p>
              </div>
            </div>

            {/* Step 5: Start Scanning & Activities */}
            <div className="bg-emerald-600 text-white p-4 rounded-xl border border-emerald-500 space-y-3 relative hover:scale-[1.01] transition-all shadow-md">
              <div className="flex justify-between items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-emerald-700 text-xs font-bold font-mono">5</span>
                <QrCode size={16} className="text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Siap Presensi QR &amp; CBT</h4>
                <p className="text-[11px] text-emerald-100 mt-1 leading-relaxed">
                  Masuk ke menu <span className="font-semibold text-yellow-300">Presensi QR Code</span> untuk memindai kehadiran secara riil. Guru juga bisa mulai mengisi jurnal &amp; meng-upload nilai CBT dengan lancar!
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TWO COLUMN GRID BASED ON ROLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: attendance graphics & overview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Attendance breakdown map */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 mb-1">
              <Activity size={18} className="text-emerald-600 dark:text-emerald-400" />
              Grafik Kehadiran per Rombongan Belajar (Kelas)
            </h2>
            <p className="text-xs text-gray-400 mb-5">Distribusi persentase kehadiran murid hari ini berdasarkan absensi barcode.</p>

            {/* Custom high-fidelity visual bars showing progress for each class */}
            <div className="space-y-4">
              {Array.from(new Set(students.map(s => s.className))).map((className, index) => {
                const cls = { name: className, color: index % 2 === 0 ? 'bg-emerald-500' : 'bg-emerald-500' };
                const classPresent = attendance.filter(a => a.className === cls.name && a.date === todayStr && a.status === 'hadir').length;
                const classTotal = students.filter(s => s.className === cls.name).length;
                const classRate = classTotal > 0 ? Math.round((classPresent / classTotal) * 100) : 0;

                return (
                  <div key={cls.name} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-700 dark:text-gray-200">{cls.name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{classRate}% Kehadiran ({classPresent} dari {classTotal} siswa)</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-[#232333] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cls.color} rounded-full transition-all duration-500`}
                        style={{ width: `${classRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attendance Status Summary Bar */}
            <div className="grid grid-cols-4 gap-2 text-center pt-5 border-t dark:border-[#3e405b]/40 mt-5 text-[11px]">
              <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded">
                <span className="block text-emerald-600 dark:text-emerald-400 font-bold text-sm">{presentCount}</span>
                <span className="text-gray-400 font-medium">Hadir</span>
              </div>
              <div className="p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded">
                <span className="block text-amber-600 dark:text-amber-400 font-bold text-sm">{sickCount}</span>
                <span className="text-gray-400 font-medium">Sakit</span>
              </div>
              <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded">
                <span className="block text-emerald-600 dark:text-emerald-400 font-bold text-sm">{permissionCount}</span>
                <span className="text-gray-400 font-medium">Izin</span>
              </div>
              <div className="p-2 bg-rose-50/50 dark:bg-rose-950/20 rounded">
                <span className="block text-rose-600 dark:text-rose-400 font-bold text-sm">{absentCount}</span>
                <span className="text-gray-400 font-medium">Alfa</span>
              </div>
            </div>
          </div>

          {/* Teacher Performance & Journals Logs */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 mb-1">
              <ClipboardList size={18} className="text-emerald-600 dark:text-emerald-400" />
              Progres Jurnal & Pelaksanaan E-Learning Guru
            </h2>
            <p className="text-xs text-gray-400 mb-4">Sejauh mana setiap guru telah mengisi jurnal harian dan merilis media e-learning.</p>
            
            <div className="space-y-4">
              {teachers.map(t => {
                const teacherJournals = journals.filter(j => j.teacherName.toLowerCase().includes(t.name.toLowerCase()));
                const teacherJournalsCount = teacherJournals.length;
                const teacherMaterialsCount = materials.filter(m => m.teacherName.toLowerCase().includes(t.name.toLowerCase())).length;
                const teacherAssignmentsCount = assignments.filter(a => a.teacherName.toLowerCase().includes(t.name.toLowerCase())).length;

                return (
                  <div key={t.id} className="p-4 border rounded-xl dark:border-[#3e405b]/60 bg-gray-50/50 dark:bg-[#232333]/20 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-xs">{t.name}</h4>
                        <p className="text-[10px] text-gray-400">NIP: {t.id} • Mata Pelajaran: {t.subject}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full font-mono text-[9px] font-bold">
                        Aktif Mengajar
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white dark:bg-[#1e2030] rounded-lg border dark:border-[#3e405b]/40">
                        <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">{teacherJournalsCount}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-medium">Jurnal Harian</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#1e2030] rounded-lg border dark:border-[#3e405b]/40">
                        <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">{teacherMaterialsCount}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-medium">Materi Pelajaran</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#1e2030] rounded-lg border dark:border-[#3e405b]/40">
                        <span className="block text-xs font-black text-amber-600 dark:text-amber-400">{teacherAssignmentsCount}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-medium">Tugas/Penugasan</span>
                      </div>
                    </div>

                    {teacherJournalsCount > 0 && (
                      <div className="text-[10px] bg-emerald-50/30 dark:bg-emerald-950/20 p-2 rounded border border-emerald-100/20">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">Topik Terakhir:</span>{" "}
                        <span className="text-slate-600 dark:text-slate-300 italic">"{teacherJournals[teacherJournals.length - 1].topic}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Performance assessment or specific logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Kepala Sekolah Performance feedback tool */}
          {activeRole === 'kepsek' && (
            <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Evaluasi & Catatan Kinerja Guru
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Sebagai {schoolIdentity?.kepsekName || "Kepala Sekolah"}, Anda dapat memantau jurnal mengajar guru dan memberikan catatan rekomendasi atau evaluasi kinerja guru di bawah ini.
              </p>

              {fbSuccess && (
                <div id="feedback-success-alert" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
                  Catatan kinerja berhasil dikirim dan diintegrasikan ke dashboard guru!
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Pilih Guru Sasaran</label>
                  <select
                    id="feedback-teacher-select"
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Catatan {schoolIdentity?.kepsekName || "Kepala Sekolah"} / Rekomendasi Kinerja</label>
                  <textarea
                    id="feedback-notes-textarea"
                    rows={3}
                    placeholder="Tulis instruksi perbaikan silabus, apresiasi, atau rekomendasi metode pembelajaran..."
                    value={fbNotes}
                    onChange={(e) => setFbNotes(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  id="submit-feedback-btn"
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Kirim Catatan Evaluasi Guru
                </button>
              </form>
            </div>
          )}

          {/* Teacher Feedback list */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 mb-1">
              <MessageSquare size={18} className="text-emerald-600" />
              Catatan Kinerja Kepala Sekolah (Terintegrasi)
            </h2>
            <p className="text-xs text-gray-400 mb-3">Tanggapan tertulis kepala sekolah terhadap ketercapaian guru.</p>
            
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {feedbacks.map(fb => (
                <div key={fb.id} className="p-3 border rounded-lg bg-gray-50/50 dark:bg-[#232333]/30 dark:border-[#3e405b]/60 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between font-bold border-b dark:border-[#3e405b]/40 pb-1.5 mb-1.5">
                    <span>{fb.teacherName}</span>
                    <span className="font-mono text-[10px] text-gray-400 font-normal">{fb.date}</span>
                  </div>
                  <p className="italic text-gray-600 dark:text-gray-400 font-sans">" {fb.principalNote} "</p>
                  <p className="text-[9px] text-amber-600 font-semibold mt-1.5">{schoolIdentity?.kepsekName || "Kepala Sekolah"}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
