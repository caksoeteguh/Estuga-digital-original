import React, { useState, useEffect, useRef } from 'react';
import { Student, Teacher } from '../types';
import * as XLSX from 'xlsx';
import { syncAllToServer } from '../mockData';
import { 
  Users, 
  UserPlus, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Key,
  ShieldAlert,
  CreditCard,
  Edit,
  School,
  Settings,
  Smartphone,
  Check,
  X,
  Printer
} from 'lucide-react';
import StudentIdCard from './StudentIdCard';
import StaffIdCard from './StaffIdCard';
import StudentBarcode from './StudentBarcode';
import BulkPrintCards from './BulkPrintCards';
import BulkPrintStaffCards from './BulkPrintStaffCards';

interface DataImporterProps {
  students: Student[];
  teachers: Teacher[];
  schoolIdentity: {
    name: string;
    city: string;
    logo?: string;
    kepsekName?: string;
    kepsekNip?: string;
    kepsekEmail?: string;
    kepsekPassword?: string;
    adminEmail?: string;
    adminPassword?: string;
  };
  schoolClasses?: string[];
  onUpdateSchoolClasses?: (classes: string[]) => void;
  schoolSubjects?: string[];
  onUpdateSchoolSubjects?: (subjects: string[]) => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onUpdateSchoolIdentity: (identity: any) => void;
}


const generateCbtUsername = (name: string, id: string) => {
  const words = name.toLowerCase().trim().split(/\s+/);
  const firstWord = words[0] || '';
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${firstWord}${randomNum}`;
};

const generateParentUsername = (name: string, id: string) => {
  const words = name.toLowerCase().trim().split(/\s+/);
  const firstWord = words[0] || '';
  const suffix = id.substring(Math.max(0, id.length - 4));
  return "parent_" + firstWord + suffix;
};

export default function DataImporter({
  students,
  teachers,
  schoolIdentity,
  schoolClasses = [
    "Kelas 1-A (SD)",
    "Kelas 1-B (SD)",
    "Kelas 2-A (SD)",
    "Kelas 3-A (SD)",
    "Kelas 4-A (SD)",
    "Kelas 5-A (SD)",
    "Kelas 6-A (SD)",
    "Kelas 7-A (SMP)",
    "Kelas 7-B (SMP)",
    "Kelas 8-A (SMP)",
    "Kelas 8-B (SMP)",
    "Kelas 9-A (SMP)"
  ],
  onUpdateSchoolClasses = () => {},
  schoolSubjects = [
    "Matematika",
    "IPA (Sains)",
    "IPS (Sosial)",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Pendidikan Pancasila"
  ],
  onUpdateSchoolSubjects = () => {},
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onUpdateSchoolIdentity
}: DataImporterProps) {
  const [activeTab, setActiveTab] = useState<'siswa' | 'kelas' | 'ortu' | 'guru' | 'identitas' | 'import-export'>('siswa');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleForceSync = async () => {
    if (confirm("Gunakan fitur ini SETELAH MENGGANTI DATABASE KE MySQL. Semua data di browser (Admin) saat ini akan ditimpa/diupload paksa ke Server (Database Baru). Lanjutkan?")) {
      setIsSyncing(true);
      const success = await syncAllToServer();
      if (success === true) {
        alert("Sinkronisasi paksa berhasil! Data lokal telah diunggah ke server database MySQL yang baru.");
      } else {
        alert(`Gagal sinkronisasi. Pesan Error: ${typeof success === 'string' ? success : 'Koneksi gagal / API tidak merespon'}`);
      }
      setIsSyncing(false);
    }
  };

  // --- STUDENT FORM & EDIT STATE ---
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [nis, setNis] = useState('');
  const [sName, setSName] = useState('');
  const [pob, setPob] = useState('');
  const [dob, setDob] = useState('');
  const [sClass, setSClass] = useState(schoolClasses[0] || 'Kelas 4-A (SD)');
  const [sReligion, setSReligion] = useState('Islam');
  const [sGender, setSGender] = useState<'Laki-laki'|'Perempuan'>('Laki-laki');
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [sUserCbt, setSUserCbt] = useState('');
  const [sPassCbt, setSPassCbt] = useState('');
  const [pUser, setPUser] = useState('');
  const [pPass, setPPass] = useState('');
  const [studentSuccess, setStudentSuccess] = useState(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
  const [selectedStaffForCard, setSelectedStaffForCard] = useState<any>(null);
  const [showBulkPrint, setShowBulkPrint] = useState(false);
  const [showStaffBulkPrint, setShowStaffBulkPrint] = useState(false);

  // --- TEACHER FORM & EDIT STATE ---
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [nip, setNip] = useState('');
  const [tName, setTName] = useState('');
  const [tSubject, setTSubject] = useState(schoolSubjects[0] || 'Matematika');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [tClasses, setTClasses] = useState(schoolClasses[0] || 'Kelas 4-A (SD)');
  const [tUser, setTUser] = useState('');
  const [tPass, setTPass] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState(false);

  // --- CLASS MANAGEMENT STATES ---
  const [newClassName, setNewClassName] = useState('');
  const [editingClassName, setEditingClassName] = useState<string | null>(null);
  const [renameClassValue, setRenameClassValue] = useState('');

  // --- SUBJECT MANAGEMENT STATES ---
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingSubjectName, setEditingSubjectName] = useState<string | null>(null);
  const [renameSubjectValue, setRenameSubjectValue] = useState('');

  // --- PARENT DIRECT EDIT STATE ---
  const [editingParent, setEditingParent] = useState<Student | null>(null);
  const [epName, setEpName] = useState('');
  const [epPhone, setEpPhone] = useState('');
  const [epUser, setEpUser] = useState('');
  const [epPass, setEpPass] = useState('');

  // --- SCHOOL IDENTITY FORM STATE ---
  const [scName, setScName] = useState(schoolIdentity?.name || 'SDN TULUNGREJO 03 BATU');
  const [scCity, setScCity] = useState(schoolIdentity?.city || 'KEC. BUMIAJI, KOTA BATU');
  const [scLogo, setScLogo] = useState(schoolIdentity?.logo || '🏫');
  const [scKepsekName, setScKepsekName] = useState(schoolIdentity?.kepsekName || 'Bapak/Ibu Kepala Sekolah');
  const [scKepsekNip, setScKepsekNip] = useState(schoolIdentity?.kepsekNip || '19700101 199802 2 001');
  const [scKepsekEmail, setScKepsekEmail] = useState(schoolIdentity?.kepsekEmail || 'kepsek123');
  const [scKepsekPassword, setScKepsekPassword] = useState(schoolIdentity?.kepsekPassword || 'kepsek123');
  const [scAdminEmail, setScAdminEmail] = useState(schoolIdentity?.adminEmail || 'admin');
  const [scAdminPassword, setScAdminPassword] = useState(schoolIdentity?.adminPassword || 'admin123');
  const [identitySuccess, setIdentitySuccess] = useState(false);

  // CSV Import simulation
  const [csvText, setCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

  // Keep track of the last schoolIdentity prop we synced to state to avoid resetting on background sync
  const prevIdentityRef = useRef<any>(null);

  // Sync state whenever props update (only if values actually changed on parent/server)
  useEffect(() => {
    if (schoolIdentity) {
      const isDifferent = !prevIdentityRef.current || 
        prevIdentityRef.current.name !== schoolIdentity.name ||
        prevIdentityRef.current.city !== schoolIdentity.city ||
        prevIdentityRef.current.logo !== schoolIdentity.logo ||
        prevIdentityRef.current.kepsekName !== schoolIdentity.kepsekName ||
        prevIdentityRef.current.kepsekNip !== schoolIdentity.kepsekNip ||
        prevIdentityRef.current.kepsekEmail !== schoolIdentity.kepsekEmail ||
        prevIdentityRef.current.kepsekPassword !== schoolIdentity.kepsekPassword ||
        prevIdentityRef.current.adminEmail !== schoolIdentity.adminEmail ||
        prevIdentityRef.current.adminPassword !== schoolIdentity.adminPassword;

      if (isDifferent) {
        setScName(schoolIdentity.name);
        setScCity(schoolIdentity.city);
        setScLogo(schoolIdentity.logo || '🏫');
        setScKepsekName(schoolIdentity.kepsekName || 'Bapak/Ibu Kepala Sekolah');
        setScKepsekNip(schoolIdentity.kepsekNip || '19700101 199802 2 001');
        setScKepsekEmail(schoolIdentity.kepsekEmail || 'kepsek123');
        setScKepsekPassword(schoolIdentity.kepsekPassword || 'kepsek123');
        setScAdminEmail(schoolIdentity.adminEmail || 'admin');
        setScAdminPassword(schoolIdentity.adminPassword || 'admin123');
        prevIdentityRef.current = { ...schoolIdentity };
      }
    }
  }, [schoolIdentity]);

  // Handle student trigger edit
  const handleEditStudentClick = (student: Student) => {
    setEditingStudent(student);
    setNis(student.id);
    setSName(student.name);
    setPob(student.pob);
    setDob(student.dob);
    setSClass(student.className);
    setSReligion(student.religion || 'Islam');
    setSGender(student.gender || 'Laki-laki');
    setPName(student.parentName);
    setPPhone(student.parentPhone);
    setSUserCbt(student.usernameCbt || '');
    setSPassCbt(student.passwordCbt || '');
    setPUser(student.usernameParent || '');
    setPPass(student.passwordParent || '');
  };

  const handleCancelEditStudent = () => {
    setEditingStudent(null);
    setNis('');
    setSName('');
    setPob('');
    setDob('');
    setSClass('Kelas 4-A (SD)');
    setSReligion('Islam');
    setSGender('Laki-laki');
    setPName('');
    setPPhone('');
    setSUserCbt('');
    setSPassCbt('');
    setPUser('');
    setPPass('');
  };

  // Add/Edit Student handler
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !sName || !pPhone) {
      alert("Harap lengkapi NIS, Nama Siswa, dan No HP Wali Murid!");
      return;
    }

    if (editingStudent) {
      // Update
      const updatedStudent: Student = {
        id: nis,
        name: sName,
        pob: pob || "Bumiaji, Kota Batu",
        dob: dob || "2010-01-01",
        className: sClass,
        religion: sReligion,
        gender: sGender,
        parentName: pName || `Ortu ${sName}`,
        parentPhone: pPhone,
        usernameCbt: sUserCbt || editingStudent.usernameCbt || (generateCbtUsername(sName, nis)),
        passwordCbt: sPassCbt || editingStudent.passwordCbt || ("cbt" + nis.substring(Math.max(0, nis.length-4))),
        usernameParent: pUser || editingStudent.usernameParent || generateParentUsername(sName, nis),
        passwordParent: pPass || editingStudent.passwordParent || ("parent" + nis.substring(Math.max(0, nis.length-4)))
      };

      onUpdateStudent(updatedStudent);
      setStudentSuccess(true);
      handleCancelEditStudent();
    } else {
      // Add New
      if (students.some(s => s.id === nis)) {
        alert(`NIS ${nis} sudah terdaftar di sistem.`);
        return;
      }

      const generatedUserCbt = sUserCbt || (generateCbtUsername(sName, nis));
      const generatedPassCbt = sPassCbt || ("cbt" + nis.substring(Math.max(0, nis.length-4)));
      const generatedUserParent = pUser || generateParentUsername(sName, nis);
      const generatedPassParent = pPass || ("parent" + nis.substring(Math.max(0, nis.length-4)));

      const newStudent: Student = {
        id: nis,
        name: sName,
        pob: pob || "Bumiaji, Kota Batu",
        dob: dob || "2010-01-01",
        className: sClass,
        religion: sReligion,
        gender: sGender,
        parentName: pName || `Ortu ${sName}`,
        parentPhone: pPhone,
        usernameCbt: generatedUserCbt,
        passwordCbt: generatedPassCbt,
        usernameParent: generatedUserParent,
        passwordParent: generatedPassParent
      };

      onAddStudent(newStudent);
      setStudentSuccess(true);
      handleCancelEditStudent();
    }

    setTimeout(() => {
      setStudentSuccess(false);
    }, 3000);
  };

  // Handle teacher trigger edit
  const handleEditTeacherClick = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setNip(teacher.id);
    setTName(teacher.name);
    setTSubject(teacher.subject);
    
    // Parse comma-separated list into selectedSubjects state
    const subs = teacher.subject ? teacher.subject.split(',').map(s => s.trim()).filter(Boolean) : [];
    setSelectedSubjects(subs);
    
    setTClasses(teacher.classesTaught || '');
    setTUser(teacher.username);
    setTPass(teacher.password);
  };

  const handleCancelEditTeacher = () => {
    setEditingTeacher(null);
    setNip('');
    setTName('');
    setTSubject(schoolSubjects[0] || 'Matematika');
    setSelectedSubjects([]);
    setTClasses(schoolClasses[0] || 'Kelas 4-A (SD)');
    setTUser('');
    setTPass('');
  };

  // Add/Edit Teacher handler
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip || !tName || !tUser || !tPass) {
      alert("Harap lengkapi NIP, Nama Guru, Username, dan Password!");
      return;
    }

    if (selectedSubjects.length === 0) {
      alert("Harap pilih minimal satu mata pelajaran yang diampu!");
      return;
    }

    const joinedSubjects = selectedSubjects.join(', ');

    if (editingTeacher) {
      // Update
      const updatedTeacher: Teacher = {
        id: nip,
        name: tName,
        subject: joinedSubjects,
        classesTaught: tClasses,
        username: tUser,
        password: tPass
      };

      onUpdateTeacher(updatedTeacher);
      setTeacherSuccess(true);
      handleCancelEditTeacher();
    } else {
      // Add New
      if (teachers.some(t => t.id === nip)) {
        alert(`NIP ${nip} sudah terdaftar.`);
        return;
      }

      const newTeacher: Teacher = {
        id: nip,
        name: tName,
        subject: joinedSubjects,
        classesTaught: tClasses,
        username: tUser,
        password: tPass
      };

      onAddTeacher(newTeacher);
      setTeacherSuccess(true);
      handleCancelEditTeacher();
    }

    setTimeout(() => {
      setTeacherSuccess(false);
    }, 3000);
  };

  // Handle parent trigger edit
  const handleEditParentClick = (student: Student) => {
    setEditingParent(student);
    setEpName(student.parentName);
    setEpPhone(student.parentPhone);
    setEpUser(student.usernameParent || '');
    setEpPass(student.passwordParent || '');
  };

  const handleCancelEditParent = () => {
    setEditingParent(null);
    setEpName('');
    setEpPhone('');
    setEpUser('');
    setEpPass('');
  };

  // Update Parent directly
  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent) return;

    const updatedStudent: Student = {
      ...editingParent,
      parentName: epName,
      parentPhone: epPhone,
      usernameParent: epUser,
      passwordParent: epPass
    };

    onUpdateStudent(updatedStudent);
    handleCancelEditParent();
    alert("Kredensial dan profil orang tua berhasil diperbarui!");
  };

  const handleRenameClassSubmit = (oldName: string) => {
    if (!renameClassValue.trim()) return;
    if (schoolClasses.includes(renameClassValue.trim()) && renameClassValue.trim() !== oldName) {
      alert("Nama kelas sudah ada!");
      return;
    }
    
    // Update class array
    const updatedClasses = schoolClasses.map(c => c === oldName ? renameClassValue.trim() : c);
    onUpdateSchoolClasses(updatedClasses);
    
    // Update students in this class
    students.forEach(st => {
      if (st.className === oldName) {
        onUpdateStudent({
          ...st,
          className: renameClassValue.trim()
        });
      }
    });

    // Update teachers teaching this class
    teachers.forEach(t => {
      const classesList = t.classesTaught ? t.classesTaught.split(',').map(item => item.trim()) : [];
      if (classesList.includes(oldName)) {
        const updatedList = classesList.map(item => item === oldName ? renameClassValue.trim() : item);
        onUpdateTeacher({
          ...t,
          classesTaught: updatedList.join(', ')
        });
      }
    });

    setEditingClassName(null);
    setRenameClassValue('');
    alert(`Nama kelas berhasil diganti dari "${oldName}" menjadi "${renameClassValue.trim()}"!`);
  };

  const handleRenameSubjectSubmit = (oldName: string) => {
    if (!renameSubjectValue.trim()) return;
    if (schoolSubjects.includes(renameSubjectValue.trim()) && renameSubjectValue.trim() !== oldName) {
      alert("Nama mata pelajaran sudah ada!");
      return;
    }

    const updatedSubjects = schoolSubjects.map(s => s === oldName ? renameSubjectValue.trim() : s);
    onUpdateSchoolSubjects(updatedSubjects);

    // Update teachers teaching this subject
    teachers.forEach(t => {
      const subjectList = t.subject ? t.subject.split(',').map(item => item.trim()) : [];
      if (subjectList.includes(oldName)) {
        const updatedList = subjectList.map(item => item === oldName ? renameSubjectValue.trim() : item);
        onUpdateTeacher({
          ...t,
          subject: updatedList.join(', ')
        });
      }
    });

    setEditingSubjectName(null);
    setRenameSubjectValue('');
    alert(`Nama mata pelajaran berhasil diganti dari "${oldName}" menjadi "${renameSubjectValue.trim()}"!`);
  };

  // Handle Logo Upload as Base64 Data URL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar tidak boleh melebihi 2MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target?.result as string;
        setScLogo(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update School Identity
  const handleSchoolIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolIdentity({
      ...schoolIdentity,
      name: scName,
      city: scCity,
      logo: scLogo,
      kepsekName: scKepsekName,
      kepsekNip: scKepsekNip,
      kepsekEmail: scKepsekEmail,
      kepsekPassword: scKepsekPassword,
      adminEmail: scAdminEmail,
      adminPassword: scAdminPassword
    });
    setIdentitySuccess(true);
    setTimeout(() => {
      setIdentitySuccess(false);
    }, 3000);
  };

  // Export to Excel (.xlsx) representation
  const exportToExcel = (type: 'siswa' | 'guru') => {
    let dataToExport = [];
    let filename = `estugadigital_export_${type}.xlsx`;

    if (type === 'siswa') {
      dataToExport = students.map(s => ({
        'NIS': s.id,
        'Nama Lengkap': s.name,
        'Tempat Lahir': s.pob,
        'Tanggal Lahir': s.dob,
        'Kelas': s.className,
        'Nama Wali Murid': s.parentName,
        'No HP Wali Murid': s.parentPhone,
        'Username CBT': s.usernameCbt,
        'Password CBT': s.passwordCbt,
        'Username Wali': s.usernameParent,
        'Password Wali': s.passwordParent
      }));
    } else {
      dataToExport = teachers.map(t => ({
        'NIP': t.id,
        'Nama Lengkap': t.name,
        'Mata Pelajaran': t.subject,
        'Kelas Diampu': t.classesTaught || '',
        'Username': t.username,
        'Password': t.password
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'siswa' ? 'Siswa' : 'Guru');
    XLSX.writeFile(workbook, filename);
  };

  // Helper functions to download Excel templates for data entry
  const downloadStudentTemplate = () => {
    const data = [
      {
        'NIS': '102410',
        'Nama Lengkap': 'Ahmad Dani',
        'Tempat Lahir': 'Bumiaji, Kota Batu',
        'Tanggal Lahir': '2015-05-14',
        'Kelas': 'Kelas 4-A (SD)',
        'Agama': 'Islam',
        'Jenis Kelamin': 'Laki-laki',
        'Nama Wali Murid': 'Wawan Wijaya',
        'No HP Wali Murid': '081299998888'
      },
      {
        'NIS': '102411',
        'Nama Lengkap': 'Siti Aminah',
        'Tempat Lahir': 'Sidoarjo',
        'Tanggal Lahir': '2015-08-22',
        'Kelas': 'Kelas 4-B (SD)',
        'Agama': 'Islam',
        'Jenis Kelamin': 'Perempuan',
        'Nama Wali Murid': 'Agus Rahayu',
        'No HP Wali Murid': '082188887777'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
    XLSX.writeFile(workbook, 'Template_Data_Siswa.xlsx');
  };

  const downloadTeacherTemplate = () => {
    const data = [
      {
        'NIP': '19851010123',
        'Nama Lengkap': 'Budi Santoso, S.Pd.',
        'Mata Pelajaran': 'Matematika',
        'Kelas Diampu': 'Kelas 4-A (SD)'
      },
      {
        'NIP': '19890405456',
        'Nama Lengkap': 'Dewi Lestari, M.Pd.',
        'Mata Pelajaran': 'IPA (Sains)',
        'Kelas Diampu': 'Kelas 4-B (SD)'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Guru');
    XLSX.writeFile(workbook, 'Template_Data_Guru.xlsx');
  };

  const downloadSubjectTemplate = () => {
    const data = [
      {
        'Kode Mapel': 'MAPEL01',
        'Nama Mata Pelajaran': 'Seni Musik',
        'Keterangan': 'Kurikulum Merdeka'
      },
      {
        'Kode Mapel': 'MAPEL02',
        'Nama Mata Pelajaran': 'Pendidikan Jasmani',
        'Keterangan': 'Kurikulum Merdeka'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Mapel');
    XLSX.writeFile(workbook, 'Template_Mata_Pelajaran.xlsx');
  };

  // Parse Excel Input file (With Smart Auto-Detection of Sheet Type)
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (rawData.length === 0) {
          setImportStatus({
            status: 'error',
            message: 'File Excel kosong atau tidak dapat dibaca.'
          });
          return;
        }

        // Smart detection of spreadsheet headers
        const firstRowKeys = Object.keys(rawData[0]).map(k => k.toLowerCase());
        const isTeacher = firstRowKeys.some(k => k.includes('nip') || k.includes('kelas diampu') || k.includes('guru'));
        const isSubject = firstRowKeys.some(k => k.includes('kode mapel') || k.includes('nama mata pelajaran') || k.includes('keterangan'));

        if (isTeacher) {
          // Process as Teacher sheet
          let count = 0;
          let errorCount = 0;

          rawData.forEach((row: any) => {
            const findVal = (keys: string[]) => {
              const foundKey = Object.keys(row).find(k => keys.some(key => k.toLowerCase().includes(key.toLowerCase())));
              return foundKey ? row[foundKey] : undefined;
            };

            const nip = String(findVal(['nip', 'id', 'nomor']) || '').trim();
            const name = String(findVal(['nama', 'name']) || '').trim();
            const subject = String(findVal(['mapel', 'subject', 'mata pelajaran']) || 'Matematika').trim();
            const classesTaught = String(findVal(['kelas diampu', 'kelas', 'class']) || '').trim();

            if (!nip || !name) {
              errorCount++;
              return;
            }

            if (teachers.some(t => t.id === nip)) {
              errorCount++;
              return;
            }

            const parsedTeacher: Teacher = {
              id: nip,
              name,
              subject,
              classesTaught,
              username: name.toLowerCase().replace(/\s+/g, '') + nip.substring(Math.max(0, nip.length-3)),
              password: "guru" + nip.substring(Math.max(0, nip.length-4))
            };

            onAddTeacher(parsedTeacher);
            count++;
          });

          if (count > 0) {
            setImportStatus({
              status: 'success',
              message: `Berhasil mengimpor ${count} data guru baru dari Excel! ${errorCount > 0 ? `(${errorCount} baris diabaikan karena tidak lengkap atau duplikasi NIP)` : ''}`
            });
          } else {
            setImportStatus({
              status: 'error',
              message: 'Gagal mengimpor data guru. Pastikan format kolom sesuai dengan template guru.'
            });
          }

        } else if (isSubject) {
          // Process as Subject sheet
          let count = 0;
          let errorCount = 0;
          const newSubjectsList = [...schoolSubjects];

          rawData.forEach((row: any) => {
            const findVal = (keys: string[]) => {
              const foundKey = Object.keys(row).find(k => keys.some(key => k.toLowerCase().includes(key.toLowerCase())));
              return foundKey ? row[foundKey] : undefined;
            };

            const subjectName = String(findVal(['nama mata pelajaran', 'mapel', 'subject', 'nama']) || '').trim();
            
            if (!subjectName) {
              errorCount++;
              return;
            }

            if (newSubjectsList.includes(subjectName)) {
              errorCount++;
              return;
            }

            newSubjectsList.push(subjectName);
            count++;
          });

          if (count > 0) {
            onUpdateSchoolSubjects(newSubjectsList);
            setImportStatus({
              status: 'success',
              message: `Berhasil mengimpor ${count} mata pelajaran baru dari Excel! ${errorCount > 0 ? `(${errorCount} baris diabaikan karena sudah terdaftar)` : ''}`
            });
          } else {
            setImportStatus({
              status: 'error',
              message: 'Gagal mengimpor mata pelajaran. Pastikan format kolom sesuai dengan template mata pelajaran.'
            });
          }

        } else {
          // Process as Student sheet (Original Flow)
          let count = 0;
          let errorCount = 0;

          rawData.forEach((row: any) => {
            const findVal = (keys: string[]) => {
              const foundKey = Object.keys(row).find(k => keys.some(key => k.toLowerCase().includes(key.toLowerCase())));
              return foundKey ? row[foundKey] : undefined;
            };

            const id = String(findVal(['nis', 'id', 'nomor']) || '').trim();
            const name = String(findVal(['nama', 'name']) || '').trim();
            const pobVal = String(findVal(['tempat', 'pob', 'lahir']) || 'Bumiaji, Kota Batu').trim();
            const dobVal = String(findVal(['tanggal', 'dob', 'birth', 'tgl']) || '2010-01-01').trim();
            const className = String(findVal(['kelas', 'class']) || 'Kelas 4-A (SD)').trim();
            const parentName = String(findVal(['wali', 'ortu', 'parent']) || `Ortu ${name}`).trim();
            const parentPhone = String(findVal(['hp', 'phone', 'telepon', 'whatsapp', 'telp']) || '').trim();
            const religion = String(findVal(['agama', 'religion']) || 'Islam').trim();
            const genderRaw = String(findVal(['jenis kelamin', 'kelamin', 'gender', 'jk']) || 'Laki-laki').trim();
            const gender = (genderRaw.toLowerCase().includes('perempuan') || genderRaw.toLowerCase() === 'p') ? 'Perempuan' : 'Laki-laki';

            if (!id || !name) {
              errorCount++;
              return;
            }

            if (students.some(s => s.id === id)) {
              errorCount++;
              return;
            }

            const parsedStudent: Student = {
              id,
              name,
              pob: pobVal,
              dob: dobVal,
              className,
              parentName,
              parentPhone,
              religion,
              gender,
              usernameCbt: generateCbtUsername(name, id),
              passwordCbt: "cbt" + id.substring(Math.max(0, id.length-4)),
              usernameParent: generateParentUsername(name, id),
              passwordParent: "parent" + id.substring(Math.max(0, id.length-4))
            };

            onAddStudent(parsedStudent);
            count++;
          });

          if (count > 0) {
            setImportStatus({
              status: 'success',
              message: `Berhasil mengimpor ${count} data siswa baru dari Excel! ${errorCount > 0 ? `(${errorCount} baris diabaikan karena tidak lengkap atau duplikasi NIS)` : ''}`
            });
          } else {
            setImportStatus({
              status: 'error',
              message: `Gagal mengimpor data siswa. Pastikan format kolom sesuai dengan template siswa.`
            });
          }
        }

      } catch (err) {
        setImportStatus({
          status: 'error',
          message: 'Terjadi kesalahan saat membaca file Excel. Pastikan file tidak rusak.'
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-800 dark:text-white flex items-center gap-2">
            <School className="text-emerald-600 dark:text-emerald-400" />
            <span>Workspace Data Master Admin</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-[#a3a4cc]">
            Kelola data siswa, e-learning/CBT, guru, data orang tua siswa, serta ganti nama/logo identitas sekolah.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-slate-100 dark:bg-[#1f2030] px-4 py-2.5 rounded-xl border dark:border-[#3e405b] text-xs font-semibold text-gray-700 dark:text-slate-300 whitespace-nowrap">
            Identitas: <span className="font-bold text-emerald-600 dark:text-emerald-400">{scLogo} {scName}</span>
          </div>
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/40 rounded-lg text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <Upload size={14} />
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data Lokal ke DB Baru'}
          </button>
        </div>
      </div>

      {/* Tabs - Modern Responsive Grid on Mobile, Classic on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap border-b dark:border-[#3e405b] gap-2 md:gap-1.5 pb-3 md:pb-0">
        <button
          onClick={() => setActiveTab('siswa')}
          className={`px-3 py-2 md:py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center justify-center md:justify-start gap-1.5 rounded-lg md:rounded-b-none
            ${activeTab === 'siswa' 
              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-400 shadow-xs' 
              : 'border-transparent text-gray-500 hover:text-gray-700 bg-slate-50 dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent'}`}
        >
          <Users size={14} />
          <span>Siswa & CBT</span>
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`px-3 py-2 md:py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center justify-center md:justify-start gap-1.5 rounded-lg md:rounded-b-none
            ${activeTab === 'kelas' 
              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-400 shadow-xs' 
              : 'border-transparent text-gray-500 hover:text-gray-700 bg-slate-50 dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent'}`}
        >
          <Settings size={14} className="text-purple-500" />
          <span>Kelas & Mapel</span>
        </button>
        <button
          onClick={() => setActiveTab('ortu')}
          className={`px-3 py-2 md:py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center justify-center md:justify-start gap-1.5 rounded-lg md:rounded-b-none
            ${activeTab === 'ortu' 
              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-400 shadow-xs' 
              : 'border-transparent text-gray-500 hover:text-gray-700 bg-slate-50 dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent'}`}
        >
          <Smartphone size={14} className="text-amber-500" />
          <span>Orang Tua (Wali)</span>
        </button>
        <button
          onClick={() => setActiveTab('guru')}
          className={`px-3 py-2 md:py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center justify-center md:justify-start gap-1.5 rounded-lg md:rounded-b-none
            ${activeTab === 'guru' 
              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-400 shadow-xs' 
              : 'border-transparent text-gray-500 hover:text-gray-700 bg-slate-50 dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent'}`}
        >
          <ShieldAlert size={14} className="text-emerald-500" />
          <span>Guru & Mapel</span>
        </button>
        <button
          onClick={() => setActiveTab('identitas')}
          className={`px-3 py-2 md:py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center justify-center md:justify-start gap-1.5 rounded-lg md:rounded-b-none
            ${activeTab === 'identitas' 
              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-400 shadow-xs' 
              : 'border-transparent text-gray-500 hover:text-gray-700 bg-slate-50 dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent'}`}
        >
          <Settings size={14} className="text-emerald-500" />
          <span>Identitas & Logo</span>
        </button>
        <button
          onClick={() => setActiveTab('import-export')}
          className={`px-3 py-2 md:py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center justify-center md:justify-start gap-1.5 rounded-lg md:rounded-b-none
            ${activeTab === 'import-export' 
              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-400 shadow-xs' 
              : 'border-transparent text-gray-500 hover:text-gray-700 bg-slate-50 dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent'}`}
        >
          <FileSpreadsheet size={14} className="text-emerald-500" />
          <span>Impor/Ekspor Excel</span>
        </button>
      </div>

      {/* --- TAB 1: DATA SISWA & CBT --- */}
      {activeTab === 'siswa' && (
        <div id="student-data-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Manual Student Form */}
          <div className="lg:col-span-4 bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <h2 id="student-form-heading" className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserPlus size={18} className="text-emerald-600" />
                {editingStudent ? 'Edit Data Siswa' : 'Daftarkan Siswa Baru'}
              </span>
              {editingStudent && (
                <button 
                  type="button" 
                  onClick={handleCancelEditStudent}
                  className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline"
                >
                  <X size={12} /> Batal
                </button>
              )}
            </h2>

            {studentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle size={14} />
                <span>Kredensial dan profil siswa berhasil disimpan!</span>
              </div>
            )}

            <form onSubmit={handleStudentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Nomor Induk Siswa (NIS)</label>
                <input
                  id="nis-input"
                  type="text"
                  placeholder="Contoh: 102410"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  disabled={!!editingStudent}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap Siswa</label>
                <input
                  id="student-name-input"
                  type="text"
                  placeholder="Nama Siswa..."
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    placeholder="Bumiaji, Kota Batu"
                    value={pob}
                    onChange={(e) => setPob(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Rombongan Belajar (Kelas)</label>
                  <select
                    value={sClass}
                    onChange={(e) => setSClass(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                  >
                    {schoolClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Agama</label>
                  <select
                    value={sReligion}
                    onChange={(e) => setSReligion(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Jenis Kelamin</label>
                  <select
                    value={sGender}
                    onChange={(e) => setSGender(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-3 space-y-3">
                <p className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">Kredensial Login Siswa (CBT & E-Learning)</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Username Siswa</label>
                    <input
                      type="text"
                      placeholder="Auto"
                      value={sUserCbt}
                      onChange={(e) => setSUserCbt(e.target.value)}
                      className="w-full text-[11px] font-mono px-3 py-1.5 rounded border bg-gray-50 dark:bg-[#232333] text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Password Siswa</label>
                    <input
                      type="text"
                      placeholder="Auto"
                      value={sPassCbt}
                      onChange={(e) => setSPassCbt(e.target.value)}
                      className="w-full text-[11px] font-mono px-3 py-1.5 rounded border bg-gray-50 dark:bg-[#232333] text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-3 space-y-3">
                <p className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">Data Orangtua (Wali Murid)</p>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Nama Orangtua / Wali</label>
                  <input
                    type="text"
                    placeholder="Nama Ortu..."
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Nomor WhatsApp Ortu</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxxx"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Username Wali</label>
                    <input
                      type="text"
                      placeholder="Auto"
                      value={pUser}
                      onChange={(e) => setPUser(e.target.value)}
                      className="w-full text-[11px] font-mono px-3 py-1.5 rounded border bg-gray-50 dark:bg-[#232333] text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Password Wali</label>
                    <input
                      type="text"
                      placeholder="Auto"
                      value={pPass}
                      onChange={(e) => setPPass(e.target.value)}
                      className="w-full text-[11px] font-mono px-3 py-1.5 rounded border bg-gray-50 dark:bg-[#232333] text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                id="submit-student-btn"
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                {editingStudent ? 'Simpan Perubahan Siswa' : 'Daftarkan & Generate Akun'}
              </button>
            </form>
          </div>

          {/* Student Grid / List */}
          <div className="lg:col-span-8 bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Daftar Kredensial Siswa (E-Learning & CBT)</h2>
                <p className="text-[11px] text-gray-400">Menampilkan {students.length} data siswa aktif dengan kredensial sistem.</p>
              </div>
              {students.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBulkPrint(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Printer size={13} />
                  <span>Cetak Massal A4 (4 Kartu)</span>
                </button>
              )}
            </div>
            
            {/* Mobile-friendly Card List (no horizontal scroll) */}
            <div className="block md:hidden space-y-3.5">
              {students.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-4">Belum ada data siswa terdaftar.</p>
              ) : (
                students.map(student => (
                  <div key={`m-student-${student.id}`} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-[#3e405b]/60 rounded-xl p-4 space-y-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">{student.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">NIS: {student.id}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/40">
                          Kelas {student.className}
                        </span>
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/40">
                          {student.religion || 'Islam'}
                        </span>
                        <span className="bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 text-[10px] font-bold px-2 py-0.5 rounded border border-pink-100/50 dark:border-pink-900/40">
                          {student.gender || 'Laki-laki'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-dashed border-gray-200 dark:border-slate-850 pt-2.5">
                      <div className="space-y-0.5">
                        <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">TTL / Lahir</span>
                        <p className="text-gray-700 dark:text-slate-300 font-medium">{student.pob}, {student.dob}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Kredensial CBT</span>
                        <p className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">U: {student.usernameCbt}</p>
                        <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">P: {student.passwordCbt}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-white dark:bg-[#1f2030] p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <div className="space-y-0.5">
                        <span className="text-gray-400 text-[9px] uppercase font-bold tracking-wider block">Kredensial E-Learning</span>
                        <p className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">U: {student.id}</p>
                        <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">P: {student.dob.replace(/-/g, '')}</p>
                      </div>
                      
                      <div className="flex gap-1 shrink-0 pl-2">
                        <button
                          onClick={() => handleEditStudentClick(student)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => setSelectedStudentForCard(student)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 cursor-pointer"
                          title="Lihat Kartu ID"
                        >
                          <CreditCard size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-400 cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#3e405b] text-gray-400">
                    <th className="py-2">Siswa & Kelas</th>
                    <th className="py-2">TTL & NIS</th>
                    <th className="py-2">Kredensial CBT</th>
                    <th className="py-2">Kredensial E-Learning</th>
                    <th className="py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#3e405b]/40">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/30">
                      <td className="py-3 pr-2">
                        <span className="font-bold text-gray-800 dark:text-gray-100 block">{student.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Kelas: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{student.className}</span></span>
                        <span className="text-[10px] text-gray-400 font-medium block">Agama: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{student.religion || 'Islam'}</span></span>
                        <span className="text-[10px] text-gray-400 font-medium block">JK: <span className="text-pink-600 dark:text-pink-400 font-bold">{student.gender || 'Laki-laki'}</span></span>
                      </td>
                      <td className="py-3">
                        <span className="text-[11px] text-gray-700 dark:text-slate-300 block">{student.pob}, {student.dob}</span>
                        <span className="text-[10px] text-gray-400 font-mono">NIS: {student.id}</span>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Key size={11} className="text-amber-500" />
                          <span>User: <span className="font-bold">{student.usernameCbt}</span></span>
                        </div>
                        <div className="mt-0.5 ml-4 text-gray-400">
                          Pass: <span>{student.passwordCbt}</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle size={11} className="text-emerald-500" />
                          <span>User: <span className="font-bold">{student.id}</span></span>
                        </div>
                        <div className="mt-0.5 ml-4 text-gray-400">
                          Pass: <span>{student.dob.replace(/-/g, '')}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => handleEditStudentClick(student)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer"
                            title="Edit data siswa"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => setSelectedStudentForCard(student)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer"
                            title="Lihat / Cetak Kartu ID & Barcode"
                          >
                            <CreditCard size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                            title="Hapus data siswa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB: MANAJEMEN KELAS & MAPEL --- */}
      {activeTab === 'kelas' && (
        <div id="class-subject-panel" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Kelola Kelas */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Settings size={16} className="text-purple-500" />
                <span>Daftar & Penempatan Rombongan Belajar (Kelas)</span>
              </h2>
              <p className="text-[11px] text-gray-500">
                Tambah, ganti nama, atau hapus kelas. Anda juga dapat memindahkan siswa ke kelas lain dengan cepat.
              </p>
            </div>

            {/* Tambah Kelas Baru */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newClassName.trim()) return;
              if (schoolClasses.includes(newClassName.trim())) {
                alert("Kelas sudah terdaftar!");
                return;
              }
              onUpdateSchoolClasses([...schoolClasses, newClassName.trim()]);
              setNewClassName('');
              alert("Kelas baru berhasil ditambahkan!");
            }} className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah nama kelas (contoh: Kelas 4-B (SD))"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                + Tambah
              </button>
            </form>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {schoolClasses.map(className => {
                const classStudents = students.filter(s => s.className === className);
                const isEditing = editingClassName === className;

                return (
                  <div key={className} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={renameClassValue}
                            onChange={(e) => setRenameClassValue(e.target.value)}
                            className="flex-1 text-xs px-2 py-1 rounded border bg-white dark:bg-[#232333] dark:border-[#3e405b] text-gray-800 dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameClassSubmit(className)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer"
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClassName(null);
                              setRenameClassValue('');
                            }}
                            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-[10px] font-bold rounded cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{className}</span>
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500 font-semibold">
                            {classStudents.length} Siswa
                          </span>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClassName(className);
                              setRenameClassValue(className);
                            }}
                            className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            Ubah Nama
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (classStudents.length > 0) {
                                alert(`Tidak dapat menghapus kelas ini karena masih memiliki ${classStudents.length} siswa! Pindahkan siswa ke kelas lain terlebih dahulu.`);
                                return;
                              }
                              if (confirm(`Apakah Anda yakin ingin menghapus kelas "${className}"?`)) {
                                onUpdateSchoolClasses(schoolClasses.filter(c => c !== className));
                                alert(`Kelas "${className}" berhasil dihapus.`);
                              }
                            }}
                            className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Class Students Dropdown/Expander */}
                    {classStudents.length > 0 && (
                      <div className="text-[10px] bg-white dark:bg-[#1e1f2c] p-2 rounded border border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto space-y-1.5">
                        <span className="text-slate-400 font-bold uppercase tracking-wider block">Penempatan Anggota Kelas:</span>
                        {classStudents.map(student => (
                          <div key={student.id} className="flex justify-between items-center gap-2 border-b border-dashed border-slate-100 dark:border-slate-800 pb-1 last:border-none">
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                              {student.name} ({student.id})
                            </span>
                            
                            {/* Move student selector */}
                            <select
                              value={className}
                              onChange={(e) => {
                                const targetClass = e.target.value;
                                onUpdateStudent({
                                  ...student,
                                  className: targetClass
                                });
                                alert(`Siswa ${student.name} berhasil dipindahkan ke ${targetClass}!`);
                              }}
                              className="text-[9px] px-1 py-0.5 rounded border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 focus:outline-none"
                            >
                              {schoolClasses.map(c => (
                                <option key={c} value={c}>Pindahkan ke: {c}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kelola Mata Pelajaran */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Settings size={16} className="text-emerald-500" />
                <span>Daftar Mata Pelajaran (Mapel) Sekolah</span>
              </h2>
              <p className="text-[11px] text-gray-500">
                Tambah, ganti nama, atau hapus daftar mata pelajaran kurikulum sekolah secara fleksibel.
              </p>
            </div>

            {/* Tambah Mapel Baru */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newSubjectName.trim()) return;
              if (schoolSubjects.includes(newSubjectName.trim())) {
                alert("Mata pelajaran sudah terdaftar!");
                return;
              }
              onUpdateSchoolSubjects([...schoolSubjects, newSubjectName.trim()]);
              setNewSubjectName('');
              alert("Mata pelajaran baru berhasil ditambahkan!");
            }} className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah nama mapel (contoh: Biologi)"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                + Tambah
              </button>
            </form>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {schoolSubjects.map(subject => {
                const isEditing = editingSubjectName === subject;
                const associatedTeachers = teachers.filter(t => t.subject?.split(',').map(item => item.trim()).includes(subject));

                return (
                  <div key={subject} className="flex justify-between items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800">
                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={renameSubjectValue}
                          onChange={(e) => setRenameSubjectValue(e.target.value)}
                          className="flex-1 text-xs px-2 py-1 rounded border bg-white dark:bg-[#232333] dark:border-[#3e405b] text-gray-800 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameSubjectSubmit(subject)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubjectName(null);
                            setRenameSubjectValue('');
                          }}
                          className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-[10px] font-bold rounded cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{subject}</span>
                        {associatedTeachers.length > 0 && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 font-semibold">
                            Diajarkan {associatedTeachers.length} Guru
                          </span>
                        )}
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubjectName(subject);
                            setRenameSubjectValue(subject);
                          }}
                          className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Ubah Nama
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${subject}"?`)) {
                              onUpdateSchoolSubjects(schoolSubjects.filter(s => s !== subject));
                              alert(`Mata pelajaran "${subject}" berhasil dihapus.`);
                            }
                          }}
                          className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 2: DATA ORANG TUA (WALI) --- */}
      {activeTab === 'ortu' && (
        <div id="parent-data-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Edit Parent Form (When selected) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone size={18} className="text-amber-500" />
                <span>{editingParent ? 'Edit Data Wali Murid' : 'Sistem Wali Murid'}</span>
              </span>
              {editingParent && (
                <button 
                  onClick={handleCancelEditParent}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Batal
                </button>
              )}
            </h2>

            {editingParent ? (
              <form onSubmit={handleParentSubmit} className="space-y-3.5 text-xs">
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl">
                  <p className="font-semibold text-[10px] text-gray-400">Siswa Terhubung:</p>
                  <p className="font-bold text-gray-800 dark:text-slate-100 mt-1">{editingParent.name}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">NIS: {editingParent.id} • {editingParent.className}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap Wali Murid</label>
                  <input
                    type="text"
                    value={epName}
                    onChange={(e) => setEpName(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Nomor WhatsApp Wali (Notifikasi & Login)</label>
                  <input
                    type="text"
                    value={epPhone}
                    onChange={(e) => setEpPhone(e.target.value)}
                    required
                    placeholder="Contoh: 0812xxxxxxxx"
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Username Login Aplikasi Ortu</label>
                  <input
                    type="text"
                    value={epUser}
                    onChange={(e) => setEpUser(e.target.value)}
                    required
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Password Login Aplikasi Ortu</label>
                  <input
                    type="text"
                    value={epPass}
                    onChange={(e) => setEpPass(e.target.value)}
                    required
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Kredensial Orang Tua
                </button>
              </form>
            ) : (
              <div className="p-4 border dark:border-slate-800 rounded-xl space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pilih salah satu baris Wali Murid di tabel kanan untuk melakukan perubahan no WhatsApp, nama wali, ataupun username & password login aplikasi.
                </p>
                <div className="p-3 bg-slate-50 dark:bg-[#1a1b2e] rounded-lg text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">Simulasi WhatsApp Gateway:</p>
                  <p>Semua absensi barcode masuk & pulang akan otomatis dikirimkan ke nomor WhatsApp terdaftar ini.</p>
                </div>
              </div>
            )}
          </div>

          {/* Parents List */}
          <div className="lg:col-span-8 bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Data Orang Tua (Wali Murid) Lengkap</h2>
              <p className="text-[11px] text-gray-400">Menampilkan data wali murid yang terhubung dengan akun login aplikasi & sinkronisasi WhatsApp absensi.</p>
            </div>

            {/* Mobile-friendly Card List for Parents (no horizontal scroll) */}
            <div className="block md:hidden space-y-3.5">
              {students.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-4">Belum ada data orang tua terdaftar.</p>
              ) : (
                students.map(student => (
                  <div key={`m-parent-${student.id}`} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-[#3e405b]/60 rounded-xl p-4 space-y-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">
                          {student.parentName || `Wali dari ${student.name}`}
                        </h4>
                        <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
                          📞 {student.parentPhone}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditParentClick(student)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 cursor-pointer"
                        title="Edit Data Wali Murid"
                      >
                        <Edit size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-dashed border-gray-200 dark:border-slate-850 pt-2.5">
                      <div className="space-y-0.5">
                        <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Siswa Terhubung</span>
                        <p className="font-bold text-gray-700 dark:text-slate-200">{student.name}</p>
                        <p className="text-gray-400 text-[10px]">NIS: {student.id} • {student.className}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Akun Login Ortu</span>
                        <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300">User: <span className="font-bold text-emerald-600 dark:text-emerald-400">{student.usernameParent}</span></p>
                        <p className="font-mono text-[10px] text-slate-500">Pass: {student.passwordParent}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#3e405b] text-gray-400">
                    <th className="py-2">Nama Wali / Ortu</th>
                    <th className="py-2">Nomor WhatsApp</th>
                    <th className="py-2">Akun Login (User / Pass)</th>
                    <th className="py-2">Siswa Terhubung</th>
                    <th className="py-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#3e405b]/40">
                  {students.map(student => (
                    <tr key={`parent-${student.id}`} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/30">
                      <td className="py-3">
                        <span className="font-bold text-gray-800 dark:text-gray-100 block">{student.parentName || `Wali dari ${student.name}`}</span>
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {student.parentPhone}
                      </td>
                      <td className="py-3 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Key size={11} className="text-amber-500" />
                          <span>User: <span className="font-bold text-slate-700 dark:text-slate-300">{student.usernameParent}</span></span>
                        </div>
                        <div className="ml-4 mt-0.5 text-gray-400">
                          Pass: <span>{student.passwordParent}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-gray-700 dark:text-slate-300 block">{student.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">NIS: {student.id} • {student.className}</span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleEditParentClick(student)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer inline-flex items-center"
                          title="Edit Data Wali Murid"
                        >
                          <Edit size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 3: DATA GURU & KEPALA SEKOLAH --- */}
      {activeTab === 'guru' && (
        <div id="teacher-data-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Manual Teacher Form */}
          <div className="lg:col-span-4 bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <h2 id="teacher-form-heading" className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserPlus size={18} className="text-emerald-500" />
                <span>{editingTeacher ? 'Edit Data Guru' : 'Daftarkan Guru Baru'}</span>
              </span>
              {editingTeacher && (
                <button 
                  onClick={handleCancelEditTeacher}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Batal
                </button>
              )}
            </h2>

            {teacherSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle size={14} />
                <span>Profil dan akun guru berhasil disimpan!</span>
              </div>
            )}

            <form onSubmit={handleTeacherSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  placeholder="Contoh: 19881105"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  disabled={!!editingTeacher}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Nama Lengkap Guru (Beserta Gelar)</label>
                <input
                  type="text"
                  placeholder="Contoh: Abdillah Putra, M.Pd."
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Mata Pelajaran yang Diampu (Bisa Pilih Beberapa)</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-[#232333] p-3 rounded-lg border dark:border-[#3e405b] max-h-36 overflow-y-auto">
                  {schoolSubjects.map(subject => {
                    const isChecked = selectedSubjects.includes(subject);
                    return (
                      <label key={subject} className="flex items-center gap-1.5 cursor-pointer py-0.5 text-xs select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedSubjects(prev => prev.filter(s => s !== subject));
                            } else {
                              setSelectedSubjects(prev => [...prev, subject]);
                            }
                          }}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{subject}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Kelas yang Diampu (Gunakan Koma atau Klik Tombol di Bawah)</label>
                <input
                  type="text"
                  placeholder="Contoh: Kelas 4-A (SD), Kelas 8-B (SMP)"
                  value={tClasses}
                  onChange={(e) => setTClasses(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
                <div className="flex flex-wrap gap-1 mt-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                  {schoolClasses.map(c => {
                    const isAssigned = tClasses.split(',').map(item => item.trim()).includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          const currentList = tClasses.split(',').map(item => item.trim()).filter(Boolean);
                          if (currentList.includes(c)) {
                            // Remove
                            setTClasses(currentList.filter(item => item !== c).join(', '));
                          } else {
                            // Add
                            setTClasses([...currentList, c].join(', '));
                          }
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-all ${
                          isAssigned 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isAssigned ? '✓ ' : '+ '} {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-3 space-y-3">
                <p className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">Akun Login Aplikasi Guru</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Username Login</label>
                    <input
                      type="text"
                      placeholder="Username..."
                      value={tUser}
                      onChange={(e) => setTUser(e.target.value)}
                      required
                      className="w-full text-xs font-mono px-3 py-1.5 rounded border bg-gray-50 dark:bg-[#232333] text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Password Login</label>
                    <input
                      type="text"
                      placeholder="Sandi..."
                      value={tPass}
                      onChange={(e) => setTPass(e.target.value)}
                      required
                      className="w-full text-xs font-mono px-3 py-1.5 rounded border bg-gray-50 dark:bg-[#232333] text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                {editingTeacher ? 'Simpan Perubahan Guru' : 'Daftarkan Guru Baru'}
              </button>
            </form>
          </div>

          {/* Teacher List */}
          <div className="lg:col-span-8 bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Daftar Lengkap Guru Pengampu Mata Pelajaran</h2>
                <p className="text-[11px] text-gray-400">Kelola mata pelajaran, daftar kelas yang diampu, dan kredensial login para guru.</p>
              </div>
              {teachers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowStaffBulkPrint(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto"
                >
                  <Printer size={13} />
                  <span>Cetak Massal Kartu Guru</span>
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {teachers.map(teacher => (
                <div key={teacher.id} className="p-3.5 border rounded-xl dark:border-[#3e405b]/60 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-[#232333]/20">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">{teacher.name}</h4>
                    <p className="text-[11px] text-gray-400 font-mono">
                      NIP: <span className="font-bold text-gray-600 dark:text-slate-300">{teacher.id}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40">
                        Mapel: {teacher.subject}
                      </span>
                      {teacher.classesTaught && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40">
                          Kelas: {teacher.classesTaught}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] bg-white dark:bg-[#2b2c40] p-2 border rounded-lg font-mono text-slate-700 dark:text-slate-300">
                      <p>User: <span className="font-bold text-emerald-600 dark:text-emerald-400">{teacher.username}</span></p>
                      <p>Pass: <span className="text-gray-400">{teacher.password}</span></p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedStaffForCard({ ...teacher, role: teacher.isHomeroom ? 'Admin / Wali Kelas' : 'Guru' })}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer"
                        title="Cetak ID Card Guru"
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        onClick={() => handleEditTeacherClick(teacher)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer"
                        title="Edit data guru"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteTeacher(teacher.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                        title="Hapus data guru"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Kepala Sekolah Section */}
            <div className="bg-slate-50 dark:bg-[#1a1b2e] p-4 rounded-xl border dark:border-[#3e405b]/40 mt-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-500" />
                <span>Kredensial Default Kepala Sekolah</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Kepala sekolah menggunakan satu akun pusat pemantauan untuk meninjau seluruh data kinerja guru & grafik kehadiran.
              </p>
              <div className="p-3 bg-white dark:bg-[#232333]/60 rounded-lg border dark:border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Bapak/Ibu Kepala Sekolah</span>
                  <span className="text-[10px] text-slate-400">Peran: Kepala Sekolah</span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 text-right">
                  <p>User: <span className="font-bold text-emerald-600">kepsek123</span></p>
                  <p>Pass: <span className="font-bold text-emerald-600">kepsek123</span></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 4: IDENTITAS & LOGO SEKOLAH --- */}
      {activeTab === 'identitas' && (
        <div id="school-identity-panel" className="max-w-3xl mx-auto bg-white dark:bg-[#2b2c40] rounded-xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-6">
          <div>
            <h2 className="text-md font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Settings className="text-emerald-500" />
              <span>Konfigurasi Identitas & Branding Sekolah</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Sesuaikan nama institusi, kota, serta lambang/logo utama yang akan tertera otomatis di kartu pelajar, e-learning, dan CBT.
            </p>
          </div>

          {identitySuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle size={14} />
              <span>Identitas sekolah berhasil diperbarui dan diterapkan ke seluruh sistem!</span>
            </div>
          )}

          <form onSubmit={handleSchoolIdentitySubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Nama Sekolah</label>
                <input
                  type="text"
                  value={scName}
                  onChange={(e) => setScName(e.target.value)}
                  required
                  placeholder="Contoh: SDN TULUNGREJO 03 BATU"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Kota / Lokasi Sekolah</label>
                <input
                  type="text"
                  value={scCity}
                  onChange={(e) => setScCity(e.target.value)}
                  required
                  placeholder="Contoh: KEC. BUMIAJI, KOTA BATU"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Simbol / Logo Sekolah (Emoji atau File Gambar)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={scLogo.startsWith('data:image') ? 'Gambar Kustom (Base64)' : scLogo}
                      onChange={(e) => setScLogo(e.target.value)}
                      required
                      placeholder="Contoh: 🏫 atau 🎓 atau ⭐"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                    />
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      {['🏫', '🎓', '⭐', '📚', '🏛️'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setScLogo(emoji)}
                          className="p-1.5 text-sm hover:bg-white dark:hover:bg-slate-700 rounded transition-all"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Image Upload Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="logo-image-file"
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-image-file"
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer text-xs font-semibold select-none transition-colors"
                    >
                      <Upload size={14} />
                      <span>Upload Gambar Logo Kustom</span>
                    </label>
                    {scLogo.startsWith('data:image') && (
                      <button
                        type="button"
                        onClick={() => setScLogo('🏫')}
                        className="text-xs text-rose-500 hover:underline font-bold"
                      >
                        Reset ke Emoji
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 rounded-2xl space-y-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Preview Cap Kartu Digital:</span>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-emerald-100 dark:border-emerald-950">
                  {scLogo.startsWith('data:image') || scLogo.startsWith('http') ? (
                    <img src={scLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl">{scLogo}</div>
                  )}
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 dark:text-white block text-xs">{scName}</span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider">{scCity}</span>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200 dark:border-slate-800" />

            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[14px] font-bold text-gray-800 dark:text-white">Identitas Kepala Sekolah</h4>
              <button
                type="button"
                onClick={() => setSelectedStaffForCard({ id: scKepsekNip, name: scKepsekName, role: 'Kepala Sekolah', username: scKepsekEmail, password: scKepsekPassword })}
                className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Cetak ID Card Kepsek
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Nama Kepala Sekolah</label>
                <input
                  type="text"
                  value={scKepsekName}
                  onChange={(e) => setScKepsekName(e.target.value)}
                  placeholder="Contoh: Bapak/Ibu Kepala Sekolah"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={scKepsekNip}
                  onChange={(e) => setScKepsekNip(e.target.value)}
                  placeholder="Contoh: 19700101 199802 2 001"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Akun Login Kepsek (Email/Username)</label>
                <input
                  type="text"
                  value={scKepsekEmail}
                  onChange={(e) => setScKepsekEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Password Login Kepsek</label>
                <input
                  type="text"
                  value={scKepsekPassword}
                  onChange={(e) => setScKepsekPassword(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200 dark:border-slate-800" />

            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[14px] font-bold text-gray-800 dark:text-white">Keamanan Akun Admin Utama</h4>
              <button
                type="button"
                onClick={() => setSelectedStaffForCard({ id: 'ADMIN-1', name: 'Administrator', role: 'Admin Utama', username: scAdminEmail, password: scAdminPassword })}
                className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Cetak ID Card Admin
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Email / Username Admin Utama</label>
                <input
                  type="text"
                  value={scAdminEmail}
                  onChange={(e) => setScAdminEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">Password Admin Utama</label>
                <input
                  type="text"
                  value={scAdminPassword}
                  onChange={(e) => setScAdminPassword(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-lg transition-colors cursor-pointer"
            >
              Simpan & Terapkan Identitas Baru
            </button>
          </form>
        </div>
      )}

      {/* --- TAB 5: IMPORT & EXPORT EXCEL --- */}
      {activeTab === 'import-export' && (
        <div id="import-export-panel" className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Impor & Ekspor Data Master Excel</h2>
              <p className="text-xs text-gray-400">Unduh atau unggah file berformat Excel (.xlsx) untuk mengelola data siswa dan guru secara massal.</p>
            </div>
            
            <div className="flex gap-2">
              <button
                id="export-siswa-btn"
                onClick={() => exportToExcel('siswa')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download size={14} />
                <span>Ekspor Excel Siswa</span>
              </button>
              <button
                id="export-guru-btn"
                onClick={() => exportToExcel('guru')}
                className="border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Ekspor Excel Guru</span>
              </button>
            </div>
          </div>
          
          
          
          
          
          
          
          
          {/* --- NEW SECTION: DATABASE BACKUP --- */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl dark:bg-indigo-950/20 dark:border-indigo-900/50 mb-6">
            <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5 mb-2">
              <Database size={16} className="text-indigo-600 dark:text-indigo-400" />
              Backup Manual ke Database Server
            </h3>
            <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mb-3">
              Data aplikasi secara otomatis dibackup setiap pukul 01:00 WIB dinihari ke server Hostinger (kelas6.estugadigital.online). Anda juga dapat memaksa backup seketika ke database server menggunakan tombol di bawah ini.
            </p>
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin melakukan backup seluruh data ke database server Hostinger sekarang?')) {
                  window.dispatchEvent(new CustomEvent('trigger-hostinger-backup'));
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Backup Sekarang
            </button>
          </div>
          
          {/* --- NEW SECTION: DOWNLOAD EXCEL TEMPLATES --- */}
          <div className="border-t dark:border-[#3e405b]/40 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Download size={16} className="text-emerald-600" />
              Unduh Template Entri Data Excel (.xlsx)
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Gunakan file template terstruktur di bawah ini agar format kolom data Anda sesuai dengan sistem. Klik untuk langsung mengunduh template:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Template Siswa */}
              <button
                type="button"
                onClick={downloadStudentTemplate}
                className="p-4 bg-slate-50 hover:bg-emerald-50/50 dark:bg-[#202134] dark:hover:bg-emerald-950/20 rounded-xl border border-gray-150 dark:border-[#3e405b] text-left flex items-start gap-3 transition-all cursor-pointer group"
              >
                <div className="p-2.5 bg-emerald-500 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <FileSpreadsheet size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white">Template Data Siswa</h4>
                  <p className="text-[10px] text-gray-400">NIS, Nama Lengkap, Tempat Lahir, Tanggal Lahir, Kelas, Agama, Jenis Kelamin, Wali Murid, No HP</p>
                  <span className="inline-block text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Unduh Berkas 📥</span>
                </div>
              </button>

              {/* Template Guru */}
              <button
                type="button"
                onClick={downloadTeacherTemplate}
                className="p-4 bg-slate-50 hover:bg-emerald-50/50 dark:bg-[#202134] dark:hover:bg-emerald-950/20 rounded-xl border border-gray-150 dark:border-[#3e405b] text-left flex items-start gap-3 transition-all cursor-pointer group"
              >
                <div className="p-2.5 bg-emerald-500 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <FileSpreadsheet size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white">Template Data Guru</h4>
                  <p className="text-[10px] text-gray-400">NIP, Nama Lengkap, Mata Pelajaran Diampu, Kelas Diampu</p>
                  <span className="inline-block text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Unduh Berkas 📥</span>
                </div>
              </button>

              {/* Template Mata Pelajaran */}
              <button
                type="button"
                onClick={downloadSubjectTemplate}
                className="p-4 bg-slate-50 hover:bg-emerald-50/50 dark:bg-[#202134] dark:hover:bg-emerald-950/20 rounded-xl border border-gray-150 dark:border-[#3e405b] text-left flex items-start gap-3 transition-all cursor-pointer group"
              >
                <div className="p-2.5 bg-amber-500 text-white rounded-lg shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <FileSpreadsheet size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white">Template Mata Pelajaran</h4>
                  <p className="text-[10px] text-gray-400">Kode Mapel, Nama Mata Pelajaran, Keterangan Kurikulum</p>
                  <span className="inline-block text-[9px] text-amber-600 dark:text-amber-400 font-semibold mt-1">Unduh Berkas 📥</span>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t dark:border-[#3e405b]/40 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Upload size={16} className="text-emerald-600" />
              Unggah Berkas Spreadsheet Excel (.xlsx / .xls)
            </h3>

            {importStatus.status === 'success' && (
              <div id="import-success-alert" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle size={14} />
                <span>{importStatus.message}</span>
              </div>
            )}

            {importStatus.status === 'error' && (
              <div id="import-error-alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{importStatus.message}</span>
              </div>
            )}

            {/* Premium File Uploader with Drag & Drop styling */}
            <div className="border-2 border-dashed border-emerald-200 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-[#090d16]/30 hover:bg-emerald-50/30 dark:hover:bg-[#090d16]/50 transition-all relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-3 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Klik untuk memilih file atau seret file Excel ke sini
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Mendukung format .xlsx, .xls, atau .csv
                  </p>
                </div>
                <div className="text-[10px] bg-white dark:bg-slate-800 p-2.5 border rounded-lg inline-block text-left text-slate-500 font-mono">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-center">Format Judul Kolom (Header):</span>
                  NIS | Nama Lengkap | Tempat Lahir | Tanggal Lahir | Kelas | Agama | Jenis Kelamin | Nama Wali Murid | No HP Wali Murid
                </div>
              </div>
            </div>

            {/* Simulated CSV/Text Area import as a secure robust fallback */}
            <details className="text-xs text-slate-500 dark:text-slate-400">
              <summary className="cursor-pointer font-bold select-none hover:text-slate-700 dark:hover:text-slate-200">
                Atau ingin mengunggah via salin teks Excel? Klik di sini.
              </summary>
              <div className="mt-3 space-y-3 p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30">
                <p className="text-[11px]">Anda juga bisa mem-paste baris data dari spreadsheet Excel Anda ke dalam kolom di bawah ini (Pemisah Koma):</p>
                <textarea
                  id="csv-textarea"
                  rows={4}
                  placeholder={`102410,Indra Wijaya,Kota Batu,2009-02-12,Kelas 4-A (SD),Wawan Wijaya,081299998888\n102411,Lina Rahayu,Bumiaji, Kota Batu,2010-06-25,Kelas 4-A (SD),Agus Rahayu,082188887777`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full text-xs font-mono p-3.5 rounded-lg border bg-white text-gray-800 dark:bg-[#090d16] dark:border-slate-800 dark:text-white focus:outline-none"
                />
                <button
                  id="import-csv-submit-btn"
                  onClick={() => {
                    if (!csvText.trim()) return;
                    // Trigger manual parser simulation
                    const fakeEvent = {
                      target: {
                        files: [
                          new File([csvText], "fallback.csv", { type: "text/csv" })
                        ]
                      }
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleExcelImport(fakeEvent);
                    setCsvText('');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                >
                  <Upload size={14} />
                  <span>Impor Teks Salinan</span>
                </button>
              </div>
            </details>

          </div>
        </div>
      )}

      {/* Modal for Student Card & Barcode */}
      {selectedStudentForCard && (
        <div className="fixed inset-0 bg-slate-950/80 z-[9999] overflow-y-auto print:hidden flex justify-center p-4">
          <div className="bg-white dark:bg-[#1a1b2e] border border-slate-100 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 relative shadow-2xl space-y-6 my-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  KARTU IDENTITAS DIGITAL
                </span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-2">
                  Preview Kartu & QR Code Presensi
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Mendukung download kartu portrait modern dan unduh file QR Code PNG terpisah untuk dicetak atau ditempel di sistem sekolah.
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForCard(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors font-bold text-sm"
                title="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
              
              {/* Left Side: Student Portrait ID Card mockup */}
              <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-[#11121e]/50 p-6 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">
                  Desain Kartu Portrait Modern
                </p>
                <StudentIdCard student={selectedStudentForCard} schoolIdentity={schoolIdentity} />
              </div>

              {/* Right Side: Separate QR Code Downloader & Instructions */}
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Informasi QR Code NIS Siswa
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Siswa atas nama <strong className="text-slate-800 dark:text-white">{selectedStudentForCard.name}</strong> memiliki Nomor Induk Siswa (NIS) <strong className="font-mono text-emerald-600 dark:text-emerald-400">{selectedStudentForCard.id}</strong>. QR Code di bawah ini telah di-encode dengan NIS tersebut dan langsung terintegrasi dengan mesin scanner absensi di gerbang sekolah.
                  </p>
                </div>

                {/* Pure QR Code Renderer Component */}
                <div className="bg-slate-50 dark:bg-[#11121e]/50 p-6 rounded-2xl border border-slate-100/50 dark:border-[#3e405b]/40 flex flex-col items-center justify-center space-y-4">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    Unduh QR Code PNG Terpisah
                  </p>
                  <StudentBarcode value={selectedStudentForCard.id} showText={true} />
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[280px] leading-relaxed">
                    Format PNG yang diunduh memiliki resolusi tinggi, sangat ideal untuk dicetak pada kertas label, stiker kover buku, atau dicetak langsung di kartu pelajar fisik lainnya.
                  </div>
                </div>

                {/* Quick Print guide */}
                <div className="text-xs text-slate-400 flex items-start gap-2 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border dark:border-slate-800">
                  <span className="text-base">💡</span>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Rekomendasi Cetak Kartu:</p>
                    <p>Cetak dengan ukuran standar CR-80 (85.6mm x 54mm) menggunakan printer kartu PVC termal untuk hasil portrait yang maksimal dan tahan air.</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {showBulkPrint && (
        <BulkPrintCards 
          students={students}
          schoolIdentity={schoolIdentity}
          onClose={() => setShowBulkPrint(false)}
        />
      )}

      {showStaffBulkPrint && (
        <BulkPrintStaffCards 
          staffs={teachers}
          schoolIdentity={schoolIdentity}
          onClose={() => setShowStaffBulkPrint(false)}
        />
      )}

      {/* Modal for Staff Card */}
      {selectedStaffForCard && (
        <div className="fixed inset-0 bg-slate-950/80 z-[9999] overflow-y-auto print:hidden flex justify-center p-4">
          <div className="bg-white dark:bg-[#1a1b2e] border border-slate-100 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 relative shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  KARTU IDENTITAS STAF
                </span>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-2">
                  Preview Kartu {selectedStaffForCard.role}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Preview detail informasi ID card {selectedStaffForCard.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedStaffForCard(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors font-bold text-sm"
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
              
              <div className="flex flex-col items-center border-r-0 md:border-r border-slate-100 dark:border-[#3e405b]/40 pr-0 md:pr-4">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">
                  Desain Kartu Portrait Modern
                </p>
                <StaffIdCard staff={selectedStaffForCard} schoolIdentity={schoolIdentity} />
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Informasi QR Code Staf
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Staf atas nama <strong className="text-slate-800 dark:text-white">{selectedStaffForCard.name}</strong> memiliki ID <strong className="font-mono text-emerald-600 dark:text-emerald-400">{selectedStaffForCard.id || selectedStaffForCard.username}</strong>. QR Code di bawah ini telah di-encode dengan ID tersebut.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#11121e]/50 p-6 rounded-2xl border border-slate-100/50 dark:border-[#3e405b]/40 flex flex-col items-center justify-center space-y-4">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                    Unduh QR Code PNG Terpisah
                  </p>
                  <StudentBarcode value={selectedStaffForCard.id || selectedStaffForCard.username} showText={true} />
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[280px] leading-relaxed">
                    Format PNG yang diunduh memiliki resolusi tinggi, sangat ideal untuk dicetak pada kertas label atau stiker.
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-start gap-2 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border dark:border-slate-800">
                  <span className="text-base">💡</span>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Tips Keamanan:</p>
                    <p className="leading-relaxed">Pastikan staf menjaga kerahasiaan password yang tercetak di kartu. Jika hilang, segera ganti password akun staf tersebut.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
