import AttendanceRecap from "./components/AttendanceRecap";

import React, { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load components
const BarcodeScanner = lazy(() => import('./components/BarcodeScanner'));
const JournalManager = lazy(() => import('./components/JournalManager'));
const CBTManager = lazy(() => import('./components/CBTManager'));
const DataImporter = lazy(() => import('./components/DataImporter'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const CalendarScheduler = lazy(() => import('./components/CalendarScheduler'));
const PhpExporter = lazy(() => import('./components/PhpExporter'));
const AssignmentManager = lazy(() => import('./components/AssignmentManager'));
const VirtualMeetManager = lazy(() => import('./components/VirtualMeetManager'));
const StudentGradesManager = lazy(() => import('./components/StudentGradesManager'));
const PrayerAttendanceManager = lazy(() => import('./components/PrayerAttendanceManager'));
const SholatDhuhurWidget = lazy(() => import('./components/SholatDhuhurWidget'));

import { setupGenericSync, addGenericToFirestore, deleteGenericFromFirestore } from "./sync";
import { UserRole, Student, Teacher, Attendance, PrayerAttendance, ClassJournal, CBTExam, StudentCBTResult, AcademicEvent, TeacherFeedback, ELearningMaterial, AppNotification, AssignmentTask, AssignmentSubmission, StudentGradeRecord } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS, 
  INITIAL_ATTENDANCE, 
  INITIAL_PRAYER_ATTENDANCE,
  INITIAL_JOURNALS, 
  INITIAL_EXAMS, 
  INITIAL_CBT_RESULTS, 
  INITIAL_EVENTS, 
  INITIAL_FEEDBACKS, 
  INITIAL_MATERIALS, 
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  loadFromStorage, 
  saveToStorage 
} from './mockData';

// Component imports
import SneatSidebar from './components/SneatSidebar';
import SneatNavbar from './components/SneatNavbar';
import LoginGate from './components/LoginGate';

// Icons for central UI
import { 
  Wifi, 
  CloudLightning, 
  RefreshCw, 
  MessageSquare, 
  Clock, 
  PhoneCall, 
  CheckCircle, 
  User, 
  HelpCircle,
  Database,
  ArrowRight,
  Menu,
  X,
  Smartphone,
  BookOpen,
  Users,
  Award,
  GraduationCap,
  QrCode,
  Activity,
  Sparkles,
  UserCheck,
  ClipboardList,
  FileText,
  Search, Video
} from 'lucide-react';

const generateInitialGrades = (studentsList: Student[], subjectsList: string[]): StudentGradeRecord[] => {
  const list: StudentGradeRecord[] = [];
  studentsList.forEach(st => {
    subjectsList.forEach(sub => {
      list.push({
        id: `${st.id}_${sub}`,
        studentId: st.id,
        studentName: st.name,
        className: st.className,
        subject: sub,
        tugas: [85, 90, 75, "", "", "", "", "", "", ""],
        ulangan: [80, 85, 78, "", "", "", "", ""],
        pts: 82,
        pas: 88
      });
    });
  });
  return list;
};

export const ALLOWED_TABS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'barcode-scan', 'jurnal-harian', 'data-master', 'calendar', 'php-export', 'daftar-nilai', 'rekap-sholat', 'rekap-presensi'],
  guru: ['dashboard', 'barcode-scan', 'jurnal-harian', 'cbt-exam', 'e-learning', 'calendar', 'daftar-nilai', 'rekap-sholat', 'rekap-presensi'],
  kepsek: ['dashboard', 'jurnal-harian', 'kepsek-overview', 'calendar', 'rekap-sholat', 'rekap-presensi'],
  walimurid: ['parent-realtime'],
  siswa: ['dashboard', 'cbt-exam', 'e-learning', 'calendar', 'parent-realtime']
};

export default function App() {
  // Theme & Layout state
  const [isDark, setIsDark] = useState<boolean>(() => loadFromStorage<boolean>('is_dark', false));
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Authentication & session state
  const [session, setSession] = useState<{
    username: string;
    role: UserRole;
    name: string;
    detailId?: string;
    subject?: string;
    originalRole?: UserRole;
  } | null>(() => loadFromStorage<any>('login_session', null));

  const [dbError, setDbError] = useState<string | null>(null);

  // Active perspective and tab
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = loadFromStorage<any>('login_session', null);
    return saved ? saved.role : 'admin';
  });
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Network Offline Mode & Sync Simulation
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncQueue, setSyncQueue] = useState<Array<{ action: string; payload: any }>>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Academic Database States
  const HOSTINGER_BASE = window.location.hostname === 'localhost' || window.location.hostname.includes('run.app') ? 'https://estugadigital.online' : '';
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage<Student[]>('students', INITIAL_STUDENTS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('students', students, setStudents);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStudentsFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_students.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setStudents(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for students, falling back to local storage', error);
      }
    };
    fetchStudentsFromMySQL();
  }, []);
  
  // Fetch from MySQL PHP API if available
  

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    let t = loadFromStorage<Teacher[]>('teachers', INITIAL_TEACHERS);
    let migrated = false;
    t = t.map(teacher => {
      if (teacher.username === 'mujiteguhmulyono') {
        migrated = true;
        return {
          ...teacher,
          username: 'adminutama',
          password: 'adminutama'
        };
      }
      return teacher;
    });
    if (migrated) {
      saveToStorage('teachers', t);
    }
    return t;
  });

  

  const [attendance, setAttendance] = useState<Attendance[]>(() => loadFromStorage<Attendance[]>('attendance', INITIAL_ATTENDANCE));
  useEffect(() => {
    const unsubscribe = setupGenericSync('attendance', attendance, setAttendance);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAttendanceFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_attendance.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setAttendance(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for attendance, falling back to local storage', error);
      }
    };
    fetchAttendanceFromMySQL();
  }, []);

  useEffect(() => {
    const fetchTeachersFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_teachers.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setTeachers(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for teachers, falling back to local storage', error);
      }
    };
    fetchTeachersFromMySQL();
  }, []);
  
  
  const [prayerAttendance, setPrayerAttendance] = useState<PrayerAttendance[]>(() => loadFromStorage<PrayerAttendance[]>('prayer_attendance', INITIAL_PRAYER_ATTENDANCE));
  useEffect(() => {
    const unsubscribe = setupGenericSync('prayerAttendance', prayerAttendance, setPrayerAttendance);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPrayerAttendanceFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_prayer_attendance.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setPrayerAttendance(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for prayerAttendance, falling back to local storage', error);
      }
    };
    fetchPrayerAttendanceFromMySQL();
  }, []);
  
  
  const [journals, setJournals] = useState<ClassJournal[]>(() => loadFromStorage<ClassJournal[]>('journals', INITIAL_JOURNALS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('journals', journals, setJournals);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchJournalsFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_journals.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setJournals(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for journals, falling back to local storage', error);
      }
    };
    fetchJournalsFromMySQL();
  }, []);
  
  const [exams, setExams] = useState<CBTExam[]>(() => loadFromStorage<CBTExam[]>('exams', INITIAL_EXAMS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('exams', exams, setExams);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchExamsFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_exams.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setExams(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for exams, falling back to local storage', error);
      }
    };
    fetchExamsFromMySQL();
  }, []);
  
  const [results, setResults] = useState<StudentCBTResult[]>(() => loadFromStorage<StudentCBTResult[]>('results', INITIAL_CBT_RESULTS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('results', results, setResults);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchResultsFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_results.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setResults(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for results, falling back to local storage', error);
      }
    };
    fetchResultsFromMySQL();
  }, []);
  
  const [events, setEvents] = useState<AcademicEvent[]>(() => loadFromStorage<AcademicEvent[]>('events', INITIAL_EVENTS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('events', events, setEvents);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEventsFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_events.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setEvents(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for events, falling back to local storage', error);
      }
    };
    fetchEventsFromMySQL();
  }, []);
  
  const [feedbacks, setFeedbacks] = useState<TeacherFeedback[]>(() => loadFromStorage<TeacherFeedback[]>('feedbacks', INITIAL_FEEDBACKS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('feedbacks', feedbacks, setFeedbacks);
    return () => unsubscribe();
  }, []);
  const [materials, setMaterials] = useState<ELearningMaterial[]>(() => loadFromStorage<ELearningMaterial[]>('materials', INITIAL_MATERIALS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('materials', materials, setMaterials);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMaterialsFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_materials.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setMaterials(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for materials, falling back to local storage', error);
      }
    };
    fetchMaterialsFromMySQL();
  }, []);
  
  const [virtualMeets, setVirtualMeets] = useState<any[]>(() => loadFromStorage<any[]>('virtual_meets', []));
  
  const [assignments, setAssignments] = useState<AssignmentTask[]>(() => loadFromStorage<AssignmentTask[]>('assignments', INITIAL_ASSIGNMENTS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('assignments', assignments, setAssignments);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAssignmentsFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_assignments.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setAssignments(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for assignments, falling back to local storage', error);
      }
    };
    fetchAssignmentsFromMySQL();
  }, []);
  
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => loadFromStorage<AssignmentSubmission[]>('submissions', INITIAL_SUBMISSIONS));
  useEffect(() => {
    const unsubscribe = setupGenericSync('submissions', submissions, setSubmissions);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSubmissionsFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_submissions.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setSubmissions(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for submissions, falling back to local storage', error);
      }
    };
    fetchSubmissionsFromMySQL();
  }, []);
  
  const [grades, setGrades] = useState<StudentGradeRecord[]>(() => {
    const saved = loadFromStorage<StudentGradeRecord[]>('student_grades', []);
    if (saved && saved.length > 0) return saved;
    return generateInitialGrades(INITIAL_STUDENTS, [
      "Matematika",
      "IPA (Sains)",
      "IPS (Sosial)",
      "Bahasa Indonesia",
      "Bahasa Inggris",
      "Pendidikan Pancasila"
    ]);
  });
  useEffect(() => {
    const unsubscribe = setupGenericSync('student_grades', grades, setGrades);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchGradesFromMySQL = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/get_grades.php');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            setGrades(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for grades, falling back to local storage', error);
      }
    };
    fetchGradesFromMySQL();
  }, []);

  
  const [elearningSubTab, setElearningSubTab] = useState<'materials' | 'meet' | 'assignments'>('materials');

  // Real-time Push Toaster & Sound States
  const [activeToasts, setActiveToasts] = useState<Array<{ id: string; text: string; type: 'attendance' | 'grade' | 'announcement' | 'system'; timestamp: number }>>([]);

  // Kepsek Feedback states on dashboard
  const [kepsekSelectedTeacherId, setKepsekSelectedTeacherId] = useState<string>('');
  const [kepsekFbNotes, setKepsekFbNotes] = useState<string>('');
  const [kepsekFbSuccess, setKepsekFbSuccess] = useState<boolean>(false);
  const [kepsekSelectedRppId, setKepsekSelectedRppId] = useState<string | null>(null);
  const [kepsekRppCommentText, setKepsekRppCommentText] = useState<string>('');
  const [kepsekRppSearch, setKepsekRppSearch] = useState('');
  const [kepsekRppFilterOnlyWithAttachment, setKepsekRppFilterOnlyWithAttachment] = useState(false);

  // School identity state
  const [schoolIdentity, setSchoolIdentity] = useState(() => loadFromStorage('school_identity', {
    name: 'SDN TULUNGREJO 03 BATU',
    city: 'KEC. BUMIAJI, KOTA BATU',
    logo: '🏫'
  }));

  // Dynamic Classes and Subjects States
  const [schoolClasses, setSchoolClasses] = useState<string[]>(() => loadFromStorage<string[]>('school_classes', [
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
  ]));

  const [schoolSubjects, setSchoolSubjects] = useState<string[]>(() => loadFromStorage<string[]>('school_subjects', [
    "Matematika",
    "IPA (Sains)",
    "IPS (Sosial)",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Pendidikan Pancasila"
  ]));

  // In-app interactive notifications center synced via Firebase Realtime
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadFromStorage<AppNotification[]>('app_notifications', []));

  const handleActiveRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (session) {
      const origRole = session.originalRole || session.role;
      if (newRole === 'admin') {
        setSession({
          username: schoolIdentity?.adminEmail || 'admin',
          role: 'admin',
          originalRole: 'admin',
          name: 'Administrator'
        });
      } else if (newRole === 'kepsek') {
        setSession({
          username: schoolIdentity?.kepsekEmail || 'kepsek123',
          role: 'kepsek',
          originalRole: origRole,
          name: schoolIdentity?.kepsekName || 'Bapak/Ibu Kepala Sekolah'
        });
      } else if (newRole === 'guru') {
        const firstTeacher = teachers.find(t => t.id !== 'admin1') || teachers[0] || { id: '19850101', name: 'Abdillah Putra', username: 'abdillah_math', subject: 'Matematika' };
        setSession({
          username: firstTeacher.username,
          role: 'guru',
          originalRole: origRole,
          name: firstTeacher.name,
          detailId: firstTeacher.id,
          subject: firstTeacher.subject
        });
      } else if (newRole === 'walimurid') {
        let simStudent = students[0];
        if (session.role === 'siswa' && session.detailId) {
           simStudent = students.find(s => s.id === session.detailId) || students[0];
        }
        if (!simStudent) simStudent = { id: '1024', name: 'Ahmad Fauzi', usernameParent: 'parent_ahmad', parentName: 'Budi' } as any;

        setSession({
          username: simStudent.usernameParent || 'parent_ahmad',
          role: 'walimurid',
          originalRole: origRole,
          name: `Wali Murid dari ${simStudent.name}`,
          detailId: simStudent.id
        });
      } else if (newRole === 'siswa') {
        let simStudent = students[0];
        if (session.role === 'walimurid' && session.detailId) {
           simStudent = students.find(s => s.id === session.detailId) || students[0];
        }
        if (!simStudent) simStudent = { id: '1024', name: 'Ahmad Fauzi', usernameCbt: 'ahmad1024' } as any;

        setSession({
          username: simStudent.usernameCbt || 'ahmad1024',
          role: 'siswa',
          originalRole: origRole,
          name: simStudent.name,
          detailId: simStudent.id
        });
      }
    }
  };

  // Explicitly listen to force-save-local event
  useEffect(() => {
    const handleForceSave = () => {
      saveToStorage('students', students);
      saveToStorage('teachers', teachers);
      saveToStorage('attendance', attendance);
      saveToStorage('prayer_attendance', prayerAttendance);
      saveToStorage('journals', journals);
      saveToStorage('exams', exams);
      saveToStorage('results', results);
      saveToStorage('events', events);
      saveToStorage('feedbacks', feedbacks);
      saveToStorage('materials', materials);
      saveToStorage('virtual_meets', virtualMeets);
      saveToStorage('assignments', assignments);
      saveToStorage('submissions', submissions);
      saveToStorage('student_grades', grades);
      saveToStorage('school_identity', schoolIdentity);
      saveToStorage('school_classes', schoolClasses);
      saveToStorage('school_subjects', schoolSubjects);
    };
    window.addEventListener('force-save-local', handleForceSave);
    return () => window.removeEventListener('force-save-local', handleForceSave);
  }, [
    students, teachers, attendance, prayerAttendance, journals, exams, results,
    events, feedbacks, materials, virtualMeets, assignments, submissions, grades,
    schoolIdentity, schoolClasses, schoolSubjects
  ]);

  // Sync to localStorage whenever states change
  useEffect(() => { saveToStorage('is_dark', isDark); }, [isDark]);
  useEffect(() => {
    saveToStorage('login_session', session);
    if (session) {
      setActiveRole(session.role);
    }
  }, [session]);

  // Sync polling every 10s
  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (!active) return;
      try {
        const m = await import('./mockData');
        const updated = await m.syncFromServer();
        if (updated) {
          window.dispatchEvent(new CustomEvent('data-updated'));
        }
        setDbError(null);
      } catch (e: any) {
        setDbError(e.message || 'Gagal terhubung ke database.');
      }
    };
    poll(); // Run immediately
    const i = setInterval(poll, 5000);
    return () => {
      active = false;
      clearInterval(i);
    };
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      // Reload states from storage
      import('./mockData').then(m => {
        setStudents(m.loadFromStorage('students', INITIAL_STUDENTS));
        setTeachers(m.loadFromStorage('teachers', INITIAL_TEACHERS));
        setAttendance(m.loadFromStorage('attendance', INITIAL_ATTENDANCE));
        setPrayerAttendance(m.loadFromStorage('prayer_attendance', INITIAL_PRAYER_ATTENDANCE));
        setJournals(m.loadFromStorage('journals', INITIAL_JOURNALS));
        setExams(m.loadFromStorage('exams', INITIAL_EXAMS));
        setResults(m.loadFromStorage('results', INITIAL_CBT_RESULTS));
        setEvents(m.loadFromStorage('events', INITIAL_EVENTS));
        setFeedbacks(m.loadFromStorage('feedbacks', INITIAL_FEEDBACKS));
        setMaterials(m.loadFromStorage('materials', INITIAL_MATERIALS));
        setVirtualMeets(m.loadFromStorage('virtual_meets', []));
        setAssignments(m.loadFromStorage('assignments', INITIAL_ASSIGNMENTS));
        setSubmissions(m.loadFromStorage('submissions', INITIAL_SUBMISSIONS));
        setGrades(m.loadFromStorage('student_grades', []));
        setNotifications(m.loadFromStorage('app_notifications', []));
        setSchoolIdentity(m.loadFromStorage('school_identity', { name: 'SDN TULUNGREJO 03 BATU', city: 'KEC. BUMIAJI, KOTA BATU', logo: '🏫' }));
        setSchoolClasses(m.loadFromStorage('school_classes', []));
        setSchoolSubjects(m.loadFromStorage('school_subjects', []));
              });
    };
    window.addEventListener('data-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const handleQuota = (e: any) => {
       addNotification('⚠️ Koneksi Server Bermasalah: Gagal mengunduh data terbaru dari server API Hostinger atau Firebase.');
    };
    window.addEventListener('quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('data-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('quota-exceeded', handleQuota);
    };
  }, []);

  useEffect(() => { saveToStorage('students', students); }, [students]);
  useEffect(() => { saveToStorage('teachers', teachers); }, [teachers]);
  useEffect(() => { saveToStorage('attendance', attendance); }, [attendance]);
  useEffect(() => { saveToStorage('prayer_attendance', prayerAttendance); }, [prayerAttendance]);
  useEffect(() => { saveToStorage('journals', journals); }, [journals]);
  useEffect(() => { saveToStorage('exams', exams); }, [exams]);
  useEffect(() => { saveToStorage('results', results); }, [results]);
  useEffect(() => { saveToStorage('events', events); }, [events]);
  useEffect(() => { saveToStorage('feedbacks', feedbacks); }, [feedbacks]);
  useEffect(() => { saveToStorage('materials', materials); }, [materials]);

  // Auto-prune expired CBT exams (Ujian yang masa tayangnya habis)
  useEffect(() => {
    if (exams && exams.length > 0) {
      const nowMs = Date.now();
      const unexpired = exams.filter(exam => {
        if (!exam.date) return true; // If no date, don't expire it
        
        // If there's an end time, use that to calculate exact expiry
        if (exam.endTime) {
          const endDateTime = new Date(`${exam.date}T${exam.endTime}`);
          if (!isNaN(endDateTime.getTime())) {
            return endDateTime.getTime() > nowMs;
          }
        }
        
        // If no end time, expire it at the end of the day (23:59:59)
        const endOfDay = new Date(`${exam.date}T23:59:59`);
        if (!isNaN(endOfDay.getTime())) {
          return endOfDay.getTime() > nowMs;
        }
        
        return true;
      });
      if (unexpired.length !== exams.length) {
        setExams(unexpired);
      }
    }
  }, [exams]);

  // Auto-prune expired E-learning materials
  useEffect(() => {
    if (materials && materials.length > 0) {
      const nowMs = Date.now();
      const unexpired = materials.filter(m => {
        if (!m.expiryDate) return true;
        return new Date(m.expiryDate).getTime() > nowMs;
      });
      if (unexpired.length !== materials.length) {
        setMaterials(unexpired);
      }
    }
  }, [materials]);

  // Auto-prune expired Virtual Meets (Hapus jadwal virtual meet setelah masa berlakunya lewat)
  useEffect(() => {
    if (virtualMeets && virtualMeets.length > 0) {
      const nowMs = Date.now();
      const unexpired = virtualMeets.filter(meet => {
        if (!meet.scheduledAt) return true;
        // Expire if more than 3 hours have passed since scheduledAt
        return new Date(meet.scheduledAt).getTime() + (3600000 * 3) > nowMs;
      });
      if (unexpired.length !== virtualMeets.length) {
        setVirtualMeets(unexpired);
      }
    }
  }, [virtualMeets]);

  // Auto-delete RPP files (attachments) older than 24 hours to save memory
  useEffect(() => {
    const checkAndCleanRPPs = () => {
      setJournals(prev => {
        let changed = false;
        const now = new Date().getTime();
        
        const cleaned = prev.map(j => {
          if ((j.rppFile || j.rppFileName) && j.rppUploadedAt) {
            const uploadTime = new Date(j.rppUploadedAt).getTime();
            const hoursPassed = (now - uploadTime) / (1000 * 60 * 60);
            if (hoursPassed >= 24) {
              changed = true;
              return {
                ...j,
                rppFile: undefined,
                rppFileName: undefined,
              };
            }
          }
          return j;
        });

        if (changed) {
          saveToStorage('journals', cleaned);
          return cleaned;
        }
        return prev;
      });
    };

    // Run immediately on mount
    checkAndCleanRPPs();

    // Run every 5 minutes to clean up memory
    const interval = setInterval(checkAndCleanRPPs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { saveToStorage('virtual_meets', virtualMeets); }, [virtualMeets]);
  useEffect(() => { saveToStorage('assignments', assignments); }, [assignments]);
  useEffect(() => { saveToStorage('submissions', submissions); }, [submissions]);
  useEffect(() => { saveToStorage('student_grades', grades); }, [grades]);
  useEffect(() => { saveToStorage('school_identity', schoolIdentity); }, [schoolIdentity]);
  useEffect(() => { saveToStorage('school_classes', schoolClasses); }, [schoolClasses]);
  useEffect(() => { saveToStorage('school_subjects', schoolSubjects); }, [schoolSubjects]);

  // Sync role-based tab availability
  useEffect(() => {
    if (!ALLOWED_TABS[activeRole].includes(currentTab)) {
      setCurrentTab(activeRole === 'walimurid' ? 'parent-realtime' : 'dashboard');
    }
  }, [activeRole, currentTab]);

  // Handle HTML document body class for Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Push new notification
  const clearHistoryData = () => {
    if (!confirm('Peringatan: Ini akan menghapus semua riwayat Kehadiran, Jurnal, Ujian, Nilai, Tugas, dan Kinerja. Data Siswa, Guru, dan Identitas Sekolah akan tetap aman. Lanjutkan?')) {
      return;
    }
    const keysToReset = [
      'attendance', 'journals', 'exams', 'results',
      'events', 'feedbacks', 'materials', 'virtual_meets', 'wa_notifs', 'assignments', 'submissions', 'student_grades', 'prayer_attendance'
    ];
    keysToReset.forEach(k => {
      localStorage.removeItem(`adminguruku_v2_${k}`);
      // Also delete from server via saveToStorage
      saveToStorage(k, []);
    });

    setAttendance([]);
    setPrayerAttendance([]);
    setJournals([]);
    setExams([]);
    setResults([]);
    setEvents([]);
    setFeedbacks([]);
    setMaterials([]);
    setAssignments([]);
    setSubmissions([]);
    setGrades([]);
    
    addNotification('Seluruh riwayat data berhasil dibersihkan.', 'system');
  };

  const resetToFullSimulationData = () => {
    if (!confirm('Peringatan: Ini akan menimpa SEMUA data yang ada dengan data simulasi. Lanjutkan?')) {
      return;
    }
    const simStudents = [
      {
        id: "1024",
        name: "Ahmad Fauzi",
        pob: "Jakarta",
        dob: "2010-01-01",
        className: "Kelas 1",
        parentName: "Budi",
        parentPhone: "08123456789",
        religion: "Islam",
        gender: "Laki-laki",
        usernameCbt: "ahmad1024",
        passwordCbt: "cbt123",
        usernameParent: "",
        passwordParent: "parent123"
      }
    ];
    const simTeachers = [
      {
        id: "19850101",
        name: "Abdillah Putra",
        subject: "Matematika",
        classesTaught: "Kelas 1, Kelas 2",
        username: "abdillah_math",
        password: "guru123",
        isHomeroom: false
      }
    ];
    setStudents(simStudents);
    setTeachers(simTeachers);
    addNotification('Data simulasi berhasil dimuat.', 'system');
  };

  const resetToRealSchoolData = () => {
    if (!confirm('Peringatan: Ini akan me-reset dan menimpa SEMUA data di browser Anda saat ini dengan database riil SDN TULUNGREJO 03 BATU (129 siswa). Lanjutkan?')) {
      return;
    }
    
    // Set to real school identity
    setSchoolIdentity({
      name: 'SDN TULUNGREJO 03 BATU',
      city: 'KEC. BUMIAJI, KOTA BATU',
      logo: '🏫',
      kepsekName: 'Bapak/Ibu Kepala Sekolah',
      kepsekNip: '19700101 199802 2 001',
      kepsekEmail: 'kepsek123',
      kepsekPassword: 'kepsek123',
      adminEmail: 'adminutama',
      adminPassword: 'adminutama'
    });

    // Set classes and subjects
    setSchoolClasses([
      "Kelas 6-A (SD)",
      "Kelas 6-B (SD)"
    ]);

    setSchoolSubjects([
      "Matematika",
      "IPA (Sains)",
      "IPS (Sosial)",
      "Bahasa Indonesia",
      "Bahasa Inggris",
      "Pendidikan Pancasila"
    ]);

    // Set students and teachers
    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);

    // Clear history logs for safety/fresh start
    setAttendance([]);
    setPrayerAttendance([]);
    setJournals([]);
    setExams([]);
    setResults([]);
    setEvents([]);
    setFeedbacks([]);
    setMaterials([]);
    setAssignments([]);
    setSubmissions([]);
    setGrades([]);

    addNotification('Identitas Sekolah & 129 Data Siswa SDN TULUNGREJO 03 BATU berhasil dimuat ke browser lokal Anda! Silakan klik tombol "Sinkronkan Data Lokal ke DB Baru" di tab "Identitas & Logo" untuk mengunggahnya ke database online MySQL.', 'system');
    alert('Identitas Sekolah & 129 Data Siswa SDN TULUNGREJO 03 BATU berhasil dimuat!\n\nLangkah selanjutnya:\n1. Masuk ke tab "Identitas & Logo" atau "Impor/Ekspor Excel".\n2. Klik tombol "Sinkronkan Data Lokal ke DB Baru" agar data ini diunggah permanen ke website online MySQL Anda.');
  };

  const playChimeSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc2.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.15); // D6
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      
      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.4);
      osc2.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio block or API not supported, ignore gracefully
    }
  };

  const addNotification = (text: string, type: 'attendance' | 'grade' | 'announcement' | 'system' = 'system', recipientId: string = 'all') => {
    const newNotif: AppNotification = {
      id: String(Date.now()) + Math.random().toString(36).substr(2, 4),
      text,
      message: text,
      time: 'Baru saja',
      timestamp: new Date().toISOString(),
      read: false,
      type,
      recipientId
    };
    
    // Check if duplicate toast within 1 second to prevent spam
    const isSpam = activeToasts.some(t => t.text === text && Date.now() - t.timestamp < 1000);
    if (!isSpam) {
      // Only show toast if the user is the intended recipient, or if recipientId is 'all', or if we created it
      if (recipientId === 'all' || (session && (session.username === recipientId || session.role === recipientId || session.detailId === recipientId))) {
        const toastId = String(Date.now()) + Math.random().toString(36).substr(2, 4);
        setActiveToasts(prev => [...prev, { id: toastId, text, type, timestamp: Date.now() }]);
        playChimeSound();
      }
    }

    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 500);
      saveToStorage('app_notifications', updated);
      return updated;
    });
  };

  // Auto-dismiss toasts older than 5 seconds
  useEffect(() => {
    if (activeToasts.length > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        setActiveToasts(prev => prev.filter(t => now - t.timestamp < 5000));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [activeToasts]);

  const markAllNotificationsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => {
        if (session && (n.recipientId === 'all' || n.recipientId === session.username || n.recipientId === session.role || n.recipientId === session.detailId)) {
          return { ...n, read: true };
        }
        return n;
      });
      saveToStorage('app_notifications', updated);
      return updated;
    });
  };

  // Add event/action to offline queue
  const addOfflineQueue = (action: string, payload: any) => {
    setSyncQueue(prev => [...prev, { action, payload }]);
    addNotification(`[Offline] Menyimpan perubahan ke antrean lokal: ${action}`);
  };

  // Simulate auto-synchronize when reconnecting
  const triggerAutoSync = async () => {
    setIsSyncing(true);
    addNotification('Menyinkronkan data dari server...');
    try {
      const m = await import('./mockData');
      const updated = await m.syncFromServer();
      if (updated) {
        window.dispatchEvent(new CustomEvent('data-updated'));
        addNotification('Data berhasil diperbarui.');
      } else {
        addNotification('Data sudah yang terbaru.');
      }
    } catch (e: any) {
      if (e.message?.includes('Quota') || String(e).includes('quota')) {
        window.dispatchEvent(new CustomEvent('quota-exceeded', { detail: e.message }));
      } else {
        addNotification('Gagal menyinkronkan data.');
      }
    }
    
    if (syncQueue.length === 0) return;
    setIsSyncing(true);
    addNotification('Memulai sinkronisasi otomatis data tertunda...');

    setTimeout(() => {
      // Process pending queue actions
      syncQueue.forEach(item => {
        if (item.action === 'addAttendance') {
          const attPayload = { ...item.payload, notifiedIn: true }; addGenericToFirestore('attendance', attPayload);
          // ensure notifiedIn is set true upon upload
          const payload = { ...item.payload, notifiedIn: true };
          setAttendance(prev => {
            const index = prev.findIndex(a => a.id === payload.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = { ...payload };
              return updated;
            }
            return [...prev, { ...payload }];
          });
        } else if (item.action === 'updateAttendance') {
          const attPayload = { ...item.payload, notifiedOut: true }; addGenericToFirestore('attendance', attPayload);
          const payload = { ...item.payload, notifiedOut: true };
          setAttendance(prev => prev.map(a => a.id === payload.id ? { ...payload } : a));
        } else if (item.action === 'addPrayerAttendance') {
          const payload = { ...item.payload };
          setPrayerAttendance(prev => {
            if (prev.some(p => p.id === payload.id)) return prev;
            addGenericToFirestore('prayerAttendance', payload);
            return [...prev, payload];
          });
        }
      });

      addNotification(`Sinkronisasi sukses! ${syncQueue.length} data berhasil diupload ke server.`);
      setSyncQueue([]);
      setIsSyncing(false);
    }, 1200);
  };

  const toggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    addNotification(`Koneksi perangkat beralih ke: ${nextState ? 'ONLINE' : 'OFFLINE'}`);
    if (nextState) {
      // trigger auto-sync
      setTimeout(() => triggerAutoSync(), 400);
    }
  };

  // Render proper tab screen
  const renderTabContent = () => {
    let allowedClasses: string[] = [];
    let allowedSubjects: string[] = [];

    if (activeRole === 'guru' && session) {
      const teacher = teachers.find(t => t.id === session.id);
      if (teacher) {
        allowedSubjects = [teacher.subject];
        if (teacher.classesTaught) {
          allowedClasses = teacher.classesTaught.split(',').map(c => c.trim());
        }
      }
    }

        const s_attendance = attendance;
    const s_prayerAttendance = prayerAttendance;
    const s_journals = journals;
    const s_exams = exams;
    const s_results = results;
    const s_materials = materials;
    const s_virtual_meets = virtualMeets;
    const s_assignments = assignments;
    const s_feedbacks = feedbacks;
    const s_submissions = submissions;
    const s_grades = grades;
    const s_events = events;

    switch (currentTab) {
      case 'dashboard':
        return renderUnifiedDashboard();
      case 'barcode-scan':
        return (
          <BarcodeScanner
            students={students}
            attendance={s_attendance}
            prayerAttendance={s_prayerAttendance}
            onAddAttendance={(att) => {
              setAttendance(prev => [...prev, { ...att }]);
              addGenericToFirestore('attendance', att);
              addNotification(`Presensi masuk berhasil dicatat: ${att.studentName}`, 'system');
              const student = students.find(s => s.id === att.studentId);
              if (student && student.usernameParent) {
                addNotification(`Anak Anda (${att.studentName}) telah hadir di sekolah pada jam ${att.timeIn}.`, 'attendance', student.usernameParent);
              }
            }}
            onUpdateAttendance={(att) => {
              setAttendance(prev => prev.map(a => a.id === att.id ? att : a));
              addGenericToFirestore('attendance', att);
              addNotification(`Presensi pulang berhasil dicatat: ${att.studentName}`, 'system');
              const student = students.find(s => s.id === att.studentId);
              if (student && student.usernameParent) {
                addNotification(`Anak Anda (${att.studentName}) telah melakukan presensi pulang pada jam ${att.timeOut}.`, 'attendance', student.usernameParent);
              }
            }}
            onAddPrayerAttendance={(att) => {
              setPrayerAttendance(prev => [...prev, { ...att }]);
              addGenericToFirestore('prayerAttendance', att);
              addNotification(`Presensi Sholat Dhuhur berhasil dicatat: ${att.studentName}`);
            }}
            isOnline={isOnline}
            addOfflineQueue={addOfflineQueue}
          />
        );
      case 'rekap-presensi':
        return (
          <AttendanceRecap
            students={students}
            attendance={s_attendance}
          />
        );
      case 'rekap-sholat':
        return (
          <PrayerAttendanceManager
            students={students}
            prayerAttendance={s_prayerAttendance}
            onAddPrayerAttendance={(att) => {
              setPrayerAttendance(prev => [...prev, { ...att }]);
              addGenericToFirestore('prayerAttendance', att);
              addNotification(`Kehadiran sholat dicatat: ${att.studentName}`);
            }}
            onUpdatePrayerAttendance={(att) => {
              setPrayerAttendance(prev => prev.map(a => a.id === att.id ? att : a));
              addGenericToFirestore('prayerAttendance', att);
              addNotification(`Kehadiran sholat diperbarui: ${att.studentName}`);
            }}
          />
        );
      case 'jurnal-harian':
        return (
          <JournalManager
            journals={s_journals}
            onAddJournal={(journal) => {
              setJournals(prev => [{ ...journal }, ...prev]);
              addGenericToFirestore('journals', journal);
              addNotification(`Jurnal pembelajaran baru dicatat untuk kelas ${journal.className}`);
            }}
            students={students}
            attendance={attendance}
            activeRole={activeRole}
            schoolClasses={allowedClasses.length > 0 ? allowedClasses : schoolClasses}
            schoolSubjects={allowedSubjects.length > 0 ? allowedSubjects : schoolSubjects}
            session={session}
          />
        );
      case 'cbt-exam':
        return (
          <CBTManager
            exams={s_exams}
            onAddExam={(exam) => {
              setExams(prev => [{ ...exam }, ...prev]);
              addGenericToFirestore('exams', exam);
              addNotification(`Ujian CBT baru dipublikasikan: ${exam.title}`);
            }}
            results={s_results}
            onAddResult={(res) => {
                  setResults(prev => [{ ...res }, ...prev]);
                  addGenericToFirestore('results', res);
              const student = students.find(s => s.id === res.studentId);
              if (student) {
                addNotification(`Nilai ulangan CBT Anda keluar: ${res.score} untuk pelajaran ${res.subject}`, 'grade', student.usernameCbt);
                if (student.usernameParent) {
                  addNotification(`Nilai ulangan CBT anak Anda (${student.name}) keluar: ${res.score} untuk ${res.subject}`, 'grade', student.usernameParent);
                }
              }
            }}
            materials={s_materials}
            onAddMaterial={(mat) => {
              setMaterials(prev => [{ ...mat }, ...prev]);
              addGenericToFirestore('materials', mat);
              addNotification(`Materi e-learning baru ditambahkan: ${mat.title}`);
            }}
            onUpdateMaterial={(id, updated) => {
              const m = materials.find(x => x.id === id); if(m) addGenericToFirestore('materials', { ...m, ...updated });
              setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
              addNotification(`Materi e-learning berhasil diperbarui`);
            }}
            onDeleteMaterial={(id) => {
              deleteGenericFromFirestore('materials', id);
              setMaterials(prev => prev.filter(m => m.id !== id));
              addNotification(`Materi e-learning berhasil dihapus`);
            }}
            students={students}
            activeRole={activeRole}
            schoolClasses={schoolClasses}
            schoolSubjects={schoolSubjects}
            mode="cbt-only"
            session={session}
          />
        );
      case 'e-learning':
        return (
          <div className="space-y-6">
            {/* Elegant Sub Tabs selector */}
            <div className="flex border-b border-gray-100 dark:border-slate-800 gap-4 pb-1">
              <button
                onClick={() => setElearningSubTab('materials')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer
                  ${elearningSubTab === 'materials'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                📚 Materi Pembelajaran
              </button>
              <button
                onClick={() => setElearningSubTab('meet')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5
                  ${elearningSubTab === 'meet'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                🎥 Jadwal Meet
              </button>
              <button
                onClick={() => setElearningSubTab('assignments')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5
                  ${elearningSubTab === 'assignments'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                ✍️ Tugas & Latihan Soal
                <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">NEW</span>
              </button>
            </div>

            {elearningSubTab === 'materials' ? (
              <CBTManager
                exams={s_exams}
                onAddExam={() => {}}
                results={s_results}
                onAddResult={(res) => {
                  setResults(prev => [{ ...res }, ...prev]);
                  addGenericToFirestore('results', res);
                  const student = students.find(s => s.id === res.studentId);
                  if (student) {
                    addNotification(`Nilai ulangan CBT Anda keluar: ${res.score} untuk pelajaran ${res.subject}`, 'grade', student.usernameCbt);
                    if (student.usernameParent) {
                      addNotification(`Nilai ulangan CBT anak Anda (${student.name}) keluar: ${res.score} untuk ${res.subject}`, 'grade', student.usernameParent);
                    }
                  }
                }}
                materials={s_materials}
                onAddMaterial={(mat) => {
              setMaterials(prev => [{ ...mat }, ...prev]);
              addGenericToFirestore('materials', mat);
                  addNotification(`Materi e-learning baru ditambahkan: ${mat.title}`);
                }}
                onUpdateMaterial={(id, updated) => {
              const m = materials.find(x => x.id === id); if(m) addGenericToFirestore('materials', { ...m, ...updated });
              setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
                  addNotification(`Materi e-learning berhasil diperbarui`);
                }}
                onDeleteMaterial={(id) => {
              deleteGenericFromFirestore('materials', id);
              setMaterials(prev => prev.filter(m => m.id !== id));
                  addNotification(`Materi e-learning berhasil dihapus`);
                }}
                students={students}
                activeRole={activeRole}
                schoolClasses={schoolClasses}
                schoolSubjects={schoolSubjects}
                mode="elearning-only"
                session={session}
              />
            ) : elearningSubTab === 'meet' ? (
              <VirtualMeetManager
                virtualMeets={s_virtual_meets}
                setVirtualMeets={setVirtualMeets}
                students={students}
                activeRole={activeRole}
                session={session}
                schoolClasses={schoolClasses}
              />
            ) : (
              <AssignmentManager
                assignments={s_assignments}
                virtualMeets={s_virtual_meets}
                setVirtualMeets={setVirtualMeets}
                onUpdateAssignment={(updated) => {
                  setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
                  addGenericToFirestore('assignments', updated);
                  addNotification(`Tugas e-learning diupdate: ${updated.title}`);
                }}
                onDeleteAssignment={(id) => {
                  setAssignments(prev => prev.filter(a => a.id !== id));
                  deleteGenericFromFirestore('assignments', id);
                  addNotification(`Tugas e-learning dihapus`);
                }}
                onAddAssignment={(assignment) => {
                  setAssignments(prev => [...prev, { ...assignment }]);
                  addGenericToFirestore('assignments', assignment);
                  addNotification(`Tugas e-learning baru ditambahkan: ${assignment.title}`);
                }}
                submissions={s_submissions}
                onAddSubmission={(sub) => {
                  setSubmissions(prev => [...prev, { ...sub }]);
                  addGenericToFirestore('submissions', sub);
                  const student = students.find(s => s.id === sub.studentId);
                  const task = s_assignments.find(a => a.id === sub.assignmentId);
                  if (student && task) {
                    addNotification(`Tugas/latihan telah dikerjakan oleh ${student.name} untuk materi ${task.title}`, 'system', task.teacherName);
                    if (student.usernameParent) {
                      addNotification(`Anak Anda (${student.name}) telah menyelesaikan tugas ${task.title} dengan nilai otomatis ${sub.score}.`, 'grade', student.usernameParent);
                    }
                  }
                }}
                setSubmissions={setSubmissions}
                grades={s_grades}
                setGrades={setGrades}
                students={students}
                activeRole={activeRole}
                session={session}
                isDark={isDark}
                schoolClasses={schoolClasses}
              />
            )}
          </div>
        );
      case 'data-master':
        return (
          <DataImporter
            students={students}
            teachers={teachers}
            schoolIdentity={schoolIdentity}
            schoolClasses={schoolClasses}
            onUpdateSchoolClasses={setSchoolClasses}
            schoolSubjects={schoolSubjects}
            onUpdateSchoolSubjects={setSchoolSubjects}
            onAddStudent={(newStudent) => {
              setStudents(prev => [...prev, newStudent]);
              addNotification(`Siswa ${newStudent.name} berhasil terdaftar`);
            }}
            onUpdateStudent={(updatedStudent) => {
              setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
              addNotification(`Siswa ${updatedStudent.name} berhasil diperbarui`);
            }}
            onDeleteStudent={(id) => {
              setStudents(prev => prev.filter(s => s.id !== id));
              addNotification(`Siswa dengan NIS ${id} telah dihapus`);
            }}
            onAddTeacher={(newTeacher) => {
              setTeachers(prev => [...prev, newTeacher]);
              addNotification(`Guru ${newTeacher.name} berhasil terdaftar`);
            }}
            onUpdateTeacher={(updatedTeacher) => {
              setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
              addNotification(`Guru ${updatedTeacher.name} berhasil diperbarui`);
            }}
            onDeleteTeacher={(id) => {
              setTeachers(prev => prev.filter(t => t.id !== id));
              addNotification(`Guru dengan NIP ${id} telah dihapus`);
            }}
            onUpdateSchoolIdentity={(updatedIdentity) => {
              setSchoolIdentity(updatedIdentity);
              addNotification(`Identitas Sekolah berhasil diperbarui`);
            }}
          />
        );
      case 'kepsek-overview':
        return (
          <AnalyticsDashboard
            students={students}
            teachers={teachers}
            attendance={s_attendance}
            journals={s_journals}
            results={s_results}
            feedbacks={s_feedbacks}
            materials={s_materials}
            assignments={s_assignments}
            schoolIdentity={schoolIdentity}
            onAddFeedback={(fb) => {
              setFeedbacks(prev => [{ ...fb }, ...prev]);
              addNotification(`Catatan/pengumuman dari ${schoolIdentity?.kepsekName || "Kepala Sekolah"} dikirimkan`, 'system', 'kepsek');
              addNotification(`Pengumuman ${schoolIdentity?.kepsekName || "Kepala Sekolah"}: ${fb.principalNote}`, 'announcement', fb.teacherId);
            }}
            activeRole={activeRole}
            onClearHistory={clearHistoryData}
          />
        );
      case 'parent-realtime':
        return renderParentRealtimeView();
      case 'daftar-nilai': {
        return (
          <StudentGradesManager
            students={students}
            schoolClasses={allowedClasses.length > 0 ? allowedClasses : schoolClasses}
            schoolSubjects={allowedSubjects.length > 0 ? allowedSubjects : schoolSubjects}
            grades={s_grades}
            attendance={s_attendance}
            onUpdateGrades={(newGrades) => {
              setGrades(prev => [...prev.filter(g => !newGrades.some(ng => ng.id === g.id)), ...newGrades]);
              addNotification(`Pembaruan rekap nilai berhasil disimpan`, 'system', 'guru');
              newGrades.forEach(ng => {
                const student = students.find(s => s.id === ng.studentId);
                if (student && student.usernameParent) {
                  addNotification(`Terdapat pembaruan data nilai untuk ${student.name} pada mata pelajaran ${ng.subject}`, 'grade', student.usernameParent);
                }
              });
            }}
            isDark={isDark}
          />
        );
      }
      case 'calendar':
        return (
          <CalendarScheduler
            events={s_events}
            onAddEvent={(evt) => {
              setEvents(prev => [...prev, { ...evt }]);
              addNotification(`Acara akademik dijadwalkan: ${evt.title}`, 'announcement');
            }}
            activeRole={activeRole}
            schoolClasses={schoolClasses}
            assignments={s_assignments}
            onAddAssignment={(assignment) => {
                  setAssignments(prev => [...prev, { ...assignment }]);
                  addGenericToFirestore('assignments', assignment);
            }}
            schoolSubjects={schoolSubjects}
            onTriggerPushNotification={(text, type) => addNotification(text, type)}
          />
        );
      case 'php-export':
        return <PhpExporter />;
      default:
        return renderUnifiedDashboard();
    }
  };

  // Unified summary page containing details based on role
  const renderUnifiedDashboard = () => {
    // Filter for dashboard
    const s_attendance = attendance;
    const s_prayerAttendance = prayerAttendance;
    const s_journals = journals;
    const s_exams = exams;
    const s_materials = materials;
    const s_events = events;
    const s_assignments = assignments;
    const s_feedbacks = feedbacks;

    if (activeRole === 'siswa' || activeRole === 'walimurid') {
      const studentUsername = session?.username || "";
      const student = students.find(s => (s.usernameCbt || "").toLowerCase() === studentUsername.toLowerCase()) || students.find(s => s.id === session?.detailId) || { id: '', className: '', name: '', usernameCbt: '' } as any;

      // Tagihan tugas belum dikerjakan: matching student.className, not submitted by student yet, and deadline not passed
      const studentSubmissions = submissions.filter(sub => sub.studentId === student.id);
      const pendingAssignments = s_assignments.filter(task => 
        task.className === student.className &&
        !studentSubmissions.some(sub => sub.assignmentId === task.id) &&
        (!task.deadline || new Date(task.deadline).getTime() >= Date.now())
      );

      // Jadwal ujian CBT yang harus diikuti: matching student.className, published, not taken by student yet
      const studentResults = results.filter(res => res.studentId === student.id);
      const pendingExams = s_exams.filter(exam => 
        exam.isPublished &&
        exam.className === student.className &&
        !studentResults.some(res => res.examId === exam.id)
      );

      const pendingMeets = virtualMeets.filter(meet => 
        (meet.className === student.className || meet.className === 'Semua Kelas' || meet.className.includes(student.className)) &&
        new Date(meet.scheduledAt).getTime() > Date.now() - 3600000 * 3 // still show if started within last 3 hours
      ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      return (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-violet-600 to-emerald-600 dark:from-emerald-900/70 dark:to-emerald-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="space-y-2">
                <span className="text-[10px] bg-emerald-500/30 text-emerald-100 font-mono font-black tracking-widest uppercase px-2.5 py-1 rounded-full">
                  Dashboard {activeRole === 'walimurid' ? 'Wali Murid' : 'Murid / Siswa'}
                </span>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Halo, {activeRole === 'walimurid' ? 'Wali dari ' + student.name : student.name}! 👋</h1>
                <p className="text-xs text-emerald-100 leading-relaxed max-w-xl">
                  {activeRole === 'walimurid' ? 'Pantau perkembangan belajar anak Anda! Anak Anda terdaftar di ' : 'Selamat belajar! Kamu terdaftar di '}<span className="font-extrabold text-yellow-300">{student.className}</span> (NIS: {student.id}). Selalu periksa daftar tugas mandiri dan jadwal ujian CBT agar {activeRole === 'walimurid' ? 'anak Anda' : 'kamu'} tidak ketinggalan nilai terbaik!
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10  shrink-0 space-y-1 text-center min-w-[140px]">
                <span className="text-[10px] uppercase font-mono font-extrabold text-emerald-200">Kehadiran Hari Ini</span>
                <div className="text-lg font-black text-yellow-300">
                  {s_attendance.find(a => a.studentId === student.id && a.date === new Date().toISOString().split('T')[0])?.status?.toUpperCase() || 'BELUM ABSEN ⚠️'}
                </div>
                <p className="text-[9px] text-emerald-100 font-medium">Scan kartu QR saat tiba</p>
              </div>
            </div>
          </div>

          {pendingMeets.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-900/60 dark:to-teal-900/60 p-5 rounded-2xl shadow-sm text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse-slow border border-emerald-400/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl shrink-0">
                  <Video size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Virtual Meet Segera Dimulai!
                  </h3>
                  <p className="text-[10px] text-emerald-100 mt-0.5 max-w-lg">Ada <b>{pendingMeets.length}</b> jadwal pertemuan online untuk kelas {activeRole === 'walimurid' ? 'anak Anda' : 'kamu'}. {activeRole === 'walimurid' ? 'Ingatkan anak Anda untuk gabung!' : 'Jangan sampai terlewat!'}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {pendingMeets.map(meet => 
                  activeRole === 'walimurid' ? (
                    <div key={meet.id} className="px-4 py-2 bg-white text-emerald-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 justify-between min-w-[200px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-70">{meet.subject}</span>
                        <span className="flex items-center gap-1"><Clock size={10}/> {new Date(meet.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[9px]">INGATKAN ANAK</span>
                    </div>
                  ) : (
                    <a key={meet.id} href={meet.meetLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 justify-between min-w-[200px]">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-70">{meet.subject}</span>
                        <span className="flex items-center gap-1"><Clock size={10}/> {new Date(meet.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[9px]">GABUNG</span>
                    </a>
                  )
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* TAGIHAN TUGAS BELUM DIKERJAKAN (6 COLS) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-[#111625] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-rose-500/10 text-rose-500 rounded-xl text-lg">✍️</span>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Tagihan Tugas Belum Dikerjakan</h3>
                      <p className="text-[10px] text-slate-400">Tugas e-learning interaktif kelas {student.className}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full font-mono text-[10px] font-black">
                    {pendingAssignments.length} Tugas
                  </span>
                </div>

                {pendingAssignments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🎉</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Semua Tugas Sudah Selesai!</p>
                    <p className="text-[10px]">Hebat sekali! Pertahankan prestasi belajarmu ya.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {pendingAssignments.map(task => (
                      <div key={task.id} className="py-3.5 first:pt-2 last:pb-0 flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold rounded">
                              {task.subject}
                            </span>
                            <span className="text-[9px] font-mono text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.2 rounded">
                              Batas: {new Date(task.deadline).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{task.title}</h4>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                          <p className="text-[9px] text-slate-500">Oleh: {task.teacherName}</p>
                        </div>
                        <button
                          onClick={() => {
                            setElearningSubTab('assignments');
                            setCurrentTab('e-learning');
                          }}
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded-xl shrink-0 transition-all cursor-pointer hover:scale-105"
                        >
                          Kerjakan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* JADWAL UJIAN CBT YANG HARUS DIKUTI (6 COLS) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-[#111625] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-lg">🏆</span>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Jadwal Ujian CBT Aktif</h3>
                      <p className="text-[10px] text-slate-400">Kompetensi Mandiri / CBT online kelas {student.className}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-mono text-[10px] font-black">
                    {pendingExams.length} Ujian
                  </span>
                </div>

                {pendingExams.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">☕</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tidak ada ujian CBT tertunda</p>
                    <p className="text-[10px]">Tidak ada jadwal ujian aktif untukmu hari ini.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {pendingExams.map(exam => (
                      <div key={exam.id} className="py-3.5 first:pt-2 last:pb-0 flex justify-between items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold rounded">
                              {exam.subject}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ⏱️ {exam.durationMinutes} Menit
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{exam.title}</h4>
                          <p className="text-[9px] text-slate-400">
                            Terbit: {new Date(exam.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })} • Total {exam.totalQuestions} Soal
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentTab('cbt-exam');
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl shrink-0 transition-all cursor-pointer hover:scale-105"
                        >
                          Mulai Ujian
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeRole === 'guru') {
      const teacherUsername = session?.username || "abdillah_math";
      const teacher = teachers.find(t => t.username.toLowerCase() === teacherUsername.toLowerCase()) || teachers[0];

      // 1. Catatan Kepala Sekolah
      const teacherFeedbacks = s_feedbacks.filter(fb => fb.teacherId === teacher.id);

      // 2. Jurnal mengajar (perkembangan materi)
      const teacherJournals = s_journals.filter(j => j.teacherName.toLowerCase().includes(teacher.name.toLowerCase()));

      // 3. Kewajiban mengisi/memasukkan nilai
      const pendingGradingSubmissions = submissions.filter(sub => {
        const assignment = s_assignments.find(a => a.id === sub.assignmentId);
        return assignment && assignment.teacherName.toLowerCase().includes(teacher.name.toLowerCase()) && !sub.isGraded;
      });

      const teacherAssignments = s_assignments.filter(a => a.teacherName.toLowerCase().includes(teacher.name.toLowerCase()));

      return (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-900/60 dark:to-teal-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="space-y-2">
                <span className="text-[10px] bg-emerald-500/30 text-emerald-100 font-mono font-black tracking-widest uppercase px-2.5 py-1 rounded-full">
                  Dashboard Guru Mata Pelajaran
                </span>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Semangat! Mengajar adalah Ibadah, {teacher.name}! 👩‍🏫</h1>
                <p className="text-xs text-emerald-100 leading-relaxed max-w-xl">
                  Mata Pelajaran utama Anda: <span className="font-extrabold text-yellow-300">{teacher.subject}</span> (NIP: {teacher.id}). Gunakan panel ini untuk mengunggah materi e-learning, merilis ujian CBT interaktif, mengabsen siswa, serta memantau instruksi kepala sekolah secara real-time.
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 shrink-0 space-y-1 text-center min-w-[150px]">
                <span className="text-[10px] uppercase font-mono font-extrabold text-emerald-200">Kelas yang Diampu</span>
                <div className="text-sm font-black text-yellow-300">
                  {teacher.classesTaught || "Semua Kelas"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Catatan Kepsek & Jurnal Mengajar (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. CATATAN KEPALA SEKOLAH */}
              <div className="bg-white dark:bg-[#111625] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
                  <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl text-sm">✍️</span>
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Catatan & Evaluasi Kepala Sekolah</h3>
                    <p className="text-[10px] text-slate-400">Instruksi perbaikan dan rekomendasi pribadi kepala sekolah</p>
                  </div>
                </div>

                {teacherFeedbacks.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
                    <span className="text-2xl">✨</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Catatan Khusus</p>
                    <p className="text-[10px]">Kinerja mengajar Anda dinilai sangat baik oleh kepala sekolah.</p>
                  </div>
                ) : (
                  <div className="mt-3.5 space-y-3.5">
                    {teacherFeedbacks.map(fb => (
                      <div key={fb.id} className="p-4 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-950/40 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-amber-800 dark:text-amber-400">Penilai: {schoolIdentity?.kepsekName || "Kepala Sekolah"}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">{fb.date}</span>
                        </div>
                        <p className="italic text-slate-600 dark:text-slate-300 leading-relaxed font-serif">" {fb.principalNote} "</p>
                        <div className="flex justify-end pt-1">
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                            Wajib Ditindaklanjuti
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. GAMBARAN PERKEMBANGAN MATERI YANG SUDAH DISAMPAIKAN */}
              <div className="bg-white dark:bg-[#111625] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-sm">📚</span>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Perkembangan Materi Mengajar (Jurnal)</h3>
                      <p className="text-[10px] text-slate-400">Daftar jurnal silabus harian yang telah Anda selesaikan</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-mono text-[10px] font-black">
                    {teacherJournals.length} Jurnal
                  </span>
                </div>

                {teacherJournals.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">📝</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada jurnal terisi</p>
                    <p className="text-[10px]">Klik menu Jurnal Harian untuk mencatat topik pengajaran pertama Anda.</p>
                  </div>
                ) : (
                  <div className="mt-3.5 space-y-3">
                    {teacherJournals.map((journal, index) => (
                      <div key={journal.id} className="p-3 bg-slate-50/50 dark:bg-[#161a2b] border dark:border-slate-800 rounded-xl text-xs space-y-1 relative">
                        <span className="absolute top-3 right-3 text-[10px] font-mono text-slate-400">
                          {journal.date}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded">
                            {journal.className}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Pertemuan {index + 1}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs pt-1">{journal.topic}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed pt-0.5">Metode: {journal.method} • Catatan: {journal.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: KEWAJIBAN INPUT NILAI & TUGAS (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 3. KEWAJIBAN SEGERA MENGISI/MEMASUKKAN NILAI TUGAS DLL */}
              <div className="bg-white dark:bg-[#111625] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-rose-500/10 text-rose-500 rounded-xl text-sm">🚨</span>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Kewajiban Pengisian Nilai</h3>
                      <p className="text-[10px] text-slate-400">Tugas / latihan siswa yang belum Anda koreksi/nilai</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full font-mono text-[10px] font-black">
                    {pendingGradingSubmissions.length} Pending
                  </span>
                </div>

                {pendingGradingSubmissions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
                    <span className="text-2xl">💯</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Semua Nilai Terisi!</p>
                    <p className="text-[10px]">Seluruh tugas e-learning & latihan telah dinilai penuh.</p>
                  </div>
                ) : (
                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/40">
                    {pendingGradingSubmissions.map(sub => {
                      const task = s_assignments.find(a => a.id === sub.assignmentId);
                      return (
                        <div key={sub.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-600 rounded px-1.5 py-0.2">
                              Belum Dinilai
                            </span>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{sub.studentName}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{task?.title || "Tugas"}</p>
                            <p className="text-[9px] text-slate-500 font-mono">Dikirim: {new Date(sub.submittedAt).toLocaleDateString('id-ID')}</p>
                          </div>
                          <button
                            onClick={() => {
                              setElearningSubTab('assignments');
                              setCurrentTab('e-learning');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            Koreksi
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LIST TUGAS GURU AKTIF */}
              <div className="bg-white dark:bg-[#111625] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs mb-3 flex justify-between items-center">
                  <span>Daftar Tugas Interaktif Guru</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">Total {teacherAssignments.length}</span>
                </h3>

                {teacherAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum membuat penugasan interaktif.</p>
                ) : (
                  <div className="space-y-2.5">
                    {teacherAssignments.map(a => (
                      <div key={a.id} className="p-3 bg-emerald-50/10 dark:bg-emerald-950/5 border dark:border-slate-800 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{a.className}</span>
                          <span className="text-[9px] font-mono text-rose-500 bg-rose-500/10 px-1.5 py-0.2 rounded font-bold">
                            Batas: {new Date(a.deadline).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] line-clamp-1">{a.title}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {teacher.subject?.toLowerCase().includes('agama') && (
            <div className="mt-6">
              <SholatDhuhurWidget prayerAttendance={prayerAttendance} students={students} />
            </div>
          )}
        </div>
      );
    }

    if (activeRole === 'kepsek') {
      const todayStr = new Date().toISOString().split('T')[0];
      const totalStudents = students.length;
      const presentCount = s_attendance.filter(a => a.date === todayStr && a.status === 'hadir').length;
      const sickCount = s_attendance.filter(a => a.date === todayStr && a.status === 'sakit').length;
      const permissionCount = s_attendance.filter(a => a.date === todayStr && a.status === 'izin').length;
      const absentCount = Math.max(0, totalStudents - presentCount - sickCount - permissionCount);
      const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
      
      const totalTeachers = teachers.length;
      const totalJournals = s_journals.length;
      const totalCbtResults = results.length;

      const handleKepsekFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!kepsekFbNotes.trim()) return;

        const tId = kepsekSelectedTeacherId || (teachers.length > 0 ? teachers[0].id : '');
        const teacher = teachers.find(t => t.id === tId);
        if (!teacher) return;

        const newFb: TeacherFeedback = {
          id: `fb_${Date.now()}`,
          teacherId: teacher.id,
          teacherName: teacher.name,
          principalNote: kepsekFbNotes,
          date: todayStr,
        };

        const updated = [...feedbacks, newFb];
        setFeedbacks(updated);
        saveToStorage('feedbacks', updated);
        
        setKepsekFbNotes('');
        setKepsekFbSuccess(true);
        setTimeout(() => setKepsekFbSuccess(false), 4000);
      };

      return (
        <div className="space-y-6 animate-fade-in" id="kepsek-dashboard-container">
          {/* Elegant Kepala Sekolah Welcome Card */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-850 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl border border-slate-700/40">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-2">
                <span className="text-[10px] bg-slate-700/60 text-emerald-300 font-mono font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Dashboard Kepala Sekolah (Executive Panel)
                </span>
                <div className="flex items-center gap-3">
                  {schoolIdentity?.logo && (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center text-xl md:text-2xl border border-white/20 shrink-0">
                      {(schoolIdentity.logo?.startsWith('data:image') || schoolIdentity.logo?.startsWith('http')) ? (
                        <img src={schoolIdentity.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span>{schoolIdentity.logo}</span>
                      )}
                    </div>
                  )}
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Semangat Memimpin! {schoolIdentity?.kepsekName || "Bapak/Ibu Kepala Sekolah"}</h1>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-normal">
                  "Memimpin dengan Teladan, Mendidik dengan Kasih Sayang." Selamat bekerja! Gunakan panel eksekutif ini untuk memantau rekam kehadiran harian siswa, mengawasi jurnal penyampaian materi kurikulum guru, dan memberikan masukan evaluasi akademis demi masa depan sekolah kita.
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10  shrink-0 space-y-1 text-center min-w-[170px] shadow-inner">
                <span className="text-[10px] uppercase font-mono font-extrabold text-slate-400">Presensi Harian Siswa</span>
                <div className="text-3xl font-black text-emerald-400 tracking-tight">
                  {attendanceRate}%
                </div>
                <p className="text-[9px] text-slate-400 font-bold">{presentCount} Hadir dari {totalStudents} Murid</p>
              </div>
            </div>
          </div>

          {/* Elegant Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1: Attendance Rate */}
            <div className="bg-white dark:bg-[#1e1f33] rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center gap-3 hover:shadow-md transition-all">
              <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg">
                <UserCheck size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-gray-400">Presensi Hari Ini</span>
                <h3 className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{attendanceRate}%</h3>
                <p className="text-[9px] text-gray-400 mt-0.5">{presentCount} Hadir • {sickCount} Sakit</p>
              </div>
            </div>

            {/* Stat 2: Total Teachers */}
            <div className="bg-white dark:bg-[#1e1f33] rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center gap-3 hover:shadow-md transition-all">
              <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-gray-400">Jumlah Pendidik</span>
                <h3 className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{totalTeachers} Guru</h3>
                <p className="text-[9px] text-gray-400 mt-0.5">Semua Mapel Terdaftar</p>
              </div>
            </div>

            {/* Stat 3: Total Journals */}
            <div className="bg-white dark:bg-[#1e1f33] rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center gap-3 hover:shadow-md transition-all">
              <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-gray-400">Jurnal Pengajaran</span>
                <h3 className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{totalJournals} Log</h3>
                <p className="text-[9px] text-gray-400 mt-0.5">Pertemuan Kelas Terisi</p>
              </div>
            </div>

            {/* Stat 4: CBT Exams */}
            <div className="bg-white dark:bg-[#1e1f33] rounded-xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs flex items-center gap-3 hover:shadow-md transition-all">
              <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-lg">
                <Award size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-gray-400">CBT Rilis</span>
                <h3 className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{totalCbtResults} Hasil</h3>
                <p className="text-[9px] text-gray-400 mt-0.5">Tersinkron Ortu &amp; Wali</p>
              </div>
            </div>
          </div>

          {/* Core Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Kehadiran Siswa per Kelas & Log Jurnal */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Elegant Attendance per Class Chart */}
              <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Grafik Presensi Siswa per Kelas
                    </h3>
                    <p className="text-[10px] text-slate-400">Distribusi real-time kehadiran murid hari ini</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-lg text-[10px] font-bold font-mono">
                    Absen QR Aktif 📡
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Kelas 4-A (SD)', color: 'from-emerald-500 to-emerald-600' },
                    { name: 'Kelas 8-B (SMP)', color: 'from-emerald-500 to-teal-500' }
                  ].map(cls => {
                    const classPresent = s_attendance.filter(a => a.className === cls.name && a.date === todayStr && a.status === 'hadir').length;
                    const classTotal = students.filter(s => s.className === cls.name).length;
                    const classRate = classTotal > 0 ? Math.round((classPresent / classTotal) * 100) : 0;

                    return (
                      <div key={cls.name} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{cls.name}</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded font-mono text-[10px]">
                            {classRate}% Kehadiran ({classPresent} dari {classTotal} siswa)
                          </span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 dark:bg-[#1a1b2e] rounded-full overflow-hidden p-[2px]">
                          <div 
                            className={`h-full bg-gradient-to-r ${cls.color} rounded-full transition-all duration-500`}
                            style={{ width: `${classRate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend details */}
                <div className="grid grid-cols-4 gap-2 text-center pt-4 border-t dark:border-slate-800 mt-4 text-[10px]">
                  <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/10">
                    <span className="block text-emerald-600 dark:text-emerald-400 font-extrabold text-base">{presentCount}</span>
                    <span className="text-gray-400 font-medium">Hadir</span>
                  </div>
                  <div className="p-2 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl border border-amber-100/10">
                    <span className="block text-amber-600 dark:text-amber-400 font-extrabold text-base">{sickCount}</span>
                    <span className="text-gray-400 font-medium">Sakit</span>
                  </div>
                  <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/10">
                    <span className="block text-emerald-600 dark:text-emerald-400 font-extrabold text-base">{permissionCount}</span>
                    <span className="text-gray-400 font-medium">Izin</span>
                  </div>
                  <div className="p-2 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-100/10">
                    <span className="block text-rose-600 dark:text-rose-400 font-extrabold text-base">{absentCount}</span>
                    <span className="text-gray-400 font-medium">Alfa</span>
                  </div>
                </div>
              </div>

              {/* Elegant Teacher Performance Logs */}
              <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Progres Jurnal &amp; E-Learning Guru
                    </h3>
                    <p className="text-[10px] text-slate-400">Monitoring rekapitulasi penyampaian materi kurikulum</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full font-mono text-[10px] font-bold">
                    Real-time Logs
                  </span>
                </div>

                <div className="space-y-3.5">
                  {teachers.map(t => {
                    const teacherJournals = s_journals.filter(j => j.teacherName.toLowerCase().includes(t.name.toLowerCase()));
                    const teacherJournalsCount = teacherJournals.length;
                    const teacherMaterialsCount = s_materials.filter(m => m.teacherName.toLowerCase().includes(t.name.toLowerCase())).length;
                    const teacherAssignmentsCount = s_assignments.filter(a => a.teacherName.toLowerCase().includes(t.name.toLowerCase())).length;

                    return (
                      <div key={t.id} className="p-3.5 border rounded-xl dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1b2e]/30 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{t.name}</h4>
                            <p className="text-[10px] text-slate-400">Mata Pelajaran: {t.subject} (NIP: {t.id})</p>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded font-mono text-[9px] font-bold">
                            Laporan Lengkap
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                          <div className="p-2 bg-white dark:bg-[#232333]/50 rounded-lg border dark:border-slate-800">
                            <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">{teacherJournalsCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Jurnal Harian</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-[#232333]/50 rounded-lg border dark:border-slate-800">
                            <span className="block text-xs font-black text-emerald-600 dark:text-emerald-400">{teacherMaterialsCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">E-Material</span>
                          </div>
                          <div className="p-2 bg-white dark:bg-[#232333]/50 rounded-lg border dark:border-slate-800">
                            <span className="block text-xs font-black text-amber-600 dark:text-amber-400">{teacherAssignmentsCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Tugas / CBT</span>
                          </div>
                        </div>

                        {teacherJournalsCount > 0 && (
                          <p className="text-[10px] bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded border border-emerald-100/10 text-slate-500 dark:text-slate-300">
                            💡 <span className="font-bold text-slate-700 dark:text-slate-200">Materi Terakhir:</span> "{teacherJournals[teacherJournals.length - 1].topic}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Evaluasi & Catatan Kinerja Guru Form */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Elegant Evaluation Form */}
              <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b dark:border-slate-800 pb-3">
                  <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-sm">✍️</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Beri Catatan &amp; Evaluasi Guru
                    </h3>
                    <p className="text-[10px] text-slate-400">Tulis umpan balik kinerja mengajar secara langsung</p>
                  </div>
                </div>

                {kepsekFbSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
                    Catatan kinerja berhasil dikirim dan diintegrasikan ke dashboard guru! ✨
                  </div>
                )}

                <form onSubmit={handleKepsekFeedbackSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Pilih Guru Sasaran</label>
                    <select
                      value={kepsekSelectedTeacherId || (teachers.length > 0 ? teachers[0].id : '')}
                      onChange={(e) => setKepsekSelectedTeacherId(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Catatan Kinerja / Rekomendasi</label>
                    <textarea
                      rows={3}
                      placeholder="Tulis instruksi perbaikan silabus, apresiasi, atau rekomendasi metode pembelajaran..."
                      value={kepsekFbNotes}
                      onChange={(e) => setKepsekFbNotes(e.target.value)}
                      required
                      className="w-full text-xs p-3 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Kirim Catatan Evaluasi Guru
                  </button>
                </form>
              </div>

              {/* Feedbacks list */}
              <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                  Riwayat Tanggapan Kepala Sekolah ({s_feedbacks.length})
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {s_feedbacks.map(fb => (
                    <div key={fb.id} className="p-3 border rounded-xl bg-slate-50/50 dark:bg-[#1a1b2e]/30 dark:border-slate-800 text-[11px] space-y-1.5 hover:shadow-xs transition-all">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 border-b dark:border-slate-850 pb-1.5 mb-1.5">
                        <span>{fb.teacherName}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">{fb.date}</span>
                      </div>
                      <p className="italic text-slate-600 dark:text-slate-400 font-serif">" {fb.principalNote} "</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Section: Peninjauan RPP & Jurnal Mengajar Guru */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in" id="kepsek-rpp-review-section">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-lg">📂</span>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Peninjauan RPP &amp; Jurnal Mengajar Guru
                  </h2>
                  <p className="text-[11px] text-slate-400">Buka RPP, berikan saran/komentar evaluasi, dan sinkronkan dengan guru pengampu</p>
                </div>
              </div>
              
              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={14} className="text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari guru atau materi..."
                    value={kepsekRppSearch}
                    onChange={(e) => setKepsekRppSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none w-48 focus:w-60 transition-all"
                  />
                </div>

                {/* Filter toggle */}
                <button
                  type="button"
                  onClick={() => setKepsekRppFilterOnlyWithAttachment(!kepsekRppFilterOnlyWithAttachment)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5
                    ${kepsekRppFilterOnlyWithAttachment 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-[#232333] text-slate-600 dark:text-slate-300 border dark:border-slate-800'}`}
                >
                  📄 {kepsekRppFilterOnlyWithAttachment ? 'Hanya dengan RPP ✓' : 'Semua Jurnal'}
                </button>
              </div>
            </div>

            {/* Main journal list & feedback flow */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left sidebar: list of journals (col-span-5) */}
              <div className="lg:col-span-5 border-r dark:border-slate-800 pr-0 lg:pr-6 space-y-3.5 max-h-[500px] overflow-y-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">Pilih Jurnal Pertemuan / RPP</span>
                
                {(() => {
                  const filteredJournals = s_journals.filter(j => {
                    const matchesSearch = j.teacherName.toLowerCase().includes(kepsekRppSearch.toLowerCase()) || 
                                          j.topic.toLowerCase().includes(kepsekRppSearch.toLowerCase()) ||
                                          j.subject.toLowerCase().includes(kepsekRppSearch.toLowerCase());
                    const matchesAttachment = !kepsekRppFilterOnlyWithAttachment || !!j.rppFile;
                    return matchesSearch && matchesAttachment;
                  });

                  if (filteredJournals.length === 0) {
                    return (
                      <p className="text-xs text-center py-8 text-gray-400 font-medium">
                        Tidak ada jurnal/RPP ditemukan.
                      </p>
                    );
                  }

                  return filteredJournals.map(j => {
                    const isSelected = kepsekSelectedRppId === j.id;
                    const hasRpp = !!j.rppFile;

                    return (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => {
                          setKepsekSelectedRppId(j.id);
                          setKepsekRppCommentText(j.rppFeedback || '');
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2
                          ${isSelected 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-xs' 
                            : 'bg-slate-50/50 dark:bg-[#1a1b2e]/30 border-slate-100 dark:border-slate-800 hover:bg-slate-100/40 dark:hover:bg-[#1a1b2e]/50'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400">{j.date} • {j.className}</span>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-0.5">{j.teacherName}</h4>
                          </div>
                          {hasRpp ? (
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded font-mono text-[9px] font-bold shrink-0">
                              📄 RPP AKTIF
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded font-mono text-[9px] font-bold shrink-0">
                              NO RPP
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{j.subject}:</span> {j.topic}
                        </div>

                        {j.rppFeedback ? (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20 px-2 py-1 rounded border border-amber-100/10 truncate">
                            💬 Terkomentari: "{j.rppFeedback}"
                          </p>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">
                            Belum ada komentar kepsek
                          </p>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Right area: Selected RPP review & comments (col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                {(() => {
                  const selectedJournal = s_journals.find(j => j.id === kepsekSelectedRppId);
                  
                  if (!selectedJournal) {
                    return (
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-2xl dark:border-slate-800 bg-slate-50/30 dark:bg-[#1a1b2e]/10">
                        <span className="text-4xl mb-2.5">📂</span>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Detail RPP &amp; Jurnal Pengajaran</h4>
                        <p className="text-[11px] text-slate-400 max-w-sm mt-1 leading-relaxed">
                          Pilih salah satu rekam jurnal/RPP guru di sebelah kiri untuk melihat rincian rencana pelaksanaan pembelajaran, mengunduh file RPP, dan memberikan komentar supervisi akademik secara langsung.
                        </p>
                      </div>
                    );
                  }

                  const hasRpp = !!selectedJournal.rppFile;

                  const handleSaveRppComment = (e: React.FormEvent) => {
                    e.preventDefault();
                    
                    const updatedJournals = s_journals.map(j => {
                      if (j.id === selectedJournal.id) {
                        return {
                          ...j,
                          rppFeedback: kepsekRppCommentText,
                          rppFeedbackDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                        };
                      }
                      return j;
                    });
                    
                    setJournals(updatedJournals);
                    saveToStorage('journals', updatedJournals);
                    addNotification(`Komentar RPP berhasil dikirim ke guru ${selectedJournal.teacherName}! ✨`);
                  };

                  return (
                    <div className="p-5 border rounded-2xl dark:border-slate-800 bg-slate-50/30 dark:bg-[#1a1b2e]/10 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b dark:border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            {selectedJournal.className} • {selectedJournal.subject}
                          </span>
                          <h3 className="text-xs font-black text-slate-850 dark:text-white mt-1">
                            {selectedJournal.topic}
                          </h3>
                          <p className="text-[10px] text-slate-400">Diampu oleh: <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedJournal.teacherName}</span> (Tanggal: {selectedJournal.date})</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold bg-white dark:bg-[#202134] px-2.5 py-1 rounded border dark:border-slate-800 shadow-inner">
                          NIP: {teachers.find(t => t.name.toLowerCase() === selectedJournal.teacherName.toLowerCase())?.id || "N/A"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-white dark:bg-[#232333] rounded-xl border dark:border-slate-800 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400">Metode Pengajaran</span>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{selectedJournal.method}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-[#232333] rounded-xl border dark:border-slate-800 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400">Rangkuman / Catatan</span>
                          <p className="text-slate-600 dark:text-slate-300 italic">"{selectedJournal.notes}"</p>
                        </div>
                      </div>

                      {/* RPP Attachment Block */}
                      <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-950/30 rounded-xl space-y-3.5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <div>
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider block">Status Lampiran Rencana Pembelajaran (RPP)</span>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                {hasRpp ? selectedJournal.rppFileName : "Belum Mengunggah File RPP"}
                              </h4>
                            </div>
                          </div>

                          {hasRpp ? (
                            <a
                              href={selectedJournal.rppFile}
                              download={selectedJournal.rppFileName}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                            >
                              <span>Unduh Dokumen RPP 📥</span>
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                              Tidak Ada Lampiran
                            </span>
                          )}
                        </div>

                        {/* Interactive base64 simulation preview or helper to let principal see content */}
                        {hasRpp && (
                          <div className="p-3 bg-white/70 dark:bg-[#1a1b2e]/80 rounded-lg border border-emerald-100/20 text-[11px] text-slate-600 dark:text-slate-300 space-y-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">📋 Pratinjau Pokok RPP (Lesson Plan Outline)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="p-2 bg-slate-50/50 dark:bg-[#232333]/40 rounded">
                                <span className="font-extrabold text-[9px] text-emerald-500 uppercase">A. Tujuan</span>
                                <p className="mt-0.5 text-[10px] leading-relaxed">Siswa mampu menjelaskan materi "{selectedJournal.topic}" dengan tepat.</p>
                              </div>
                              <div className="p-2 bg-slate-50/50 dark:bg-[#232333]/40 rounded">
                                <span className="font-extrabold text-[9px] text-emerald-500 uppercase">B. Kegiatan</span>
                                <p className="mt-0.5 text-[10px] leading-relaxed">Eksplorasi konsep menggunakan metode {selectedJournal.method.toLowerCase()}.</p>
                              </div>
                              <div className="p-2 bg-slate-50/50 dark:bg-[#232333]/40 rounded">
                                <span className="font-extrabold text-[9px] text-amber-500 uppercase">C. Asesmen</span>
                                <p className="mt-0.5 text-[10px] leading-relaxed">Penilaian kinerja individu, kuis interaktif, dan lembar kerja pendukung.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Commenting form */}
                      <form onSubmit={handleSaveRppComment} className="space-y-3.5 pt-2 border-t dark:border-slate-800">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                            <span>✍️</span> Beri Komentar, Saran, atau Persetujuan RPP
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Contoh: RPP sangat baik, langkah pembelajaran terstruktur. Harap tambahkan asesmen diagnostik di awal pembelajaran..."
                            value={kepsekRppCommentText}
                            onChange={(e) => setKepsekRppCommentText(e.target.value)}
                            required
                            className="w-full text-xs p-3 rounded-lg border bg-white text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="flex justify-between items-center gap-3">
                          {selectedJournal.rppFeedback && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded font-bold">
                              ✓ RPP Sudah Terkomentari
                            </span>
                          )}
                          <div className="flex gap-2 ml-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setKepsekSelectedRppId(null);
                                setKepsekRppCommentText('');
                              }}
                              className="px-4 py-2 border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#232333] text-slate-500 dark:text-slate-400 font-bold text-xs rounded-lg transition-all cursor-pointer"
                            >
                              Tutup Detail
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer hover:scale-[1.01]"
                            >
                              Simpan Komentar Supervisi
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>

          {/* Rekap Sholat Widget untuk Kepala Sekolah */}
          <SholatDhuhurWidget prayerAttendance={prayerAttendance} students={students} />

        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Welcome Greeting Card styled beautifully in Sneat style */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-900/60 dark:to-emerald-950 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] bg-emerald-400/30 text-emerald-100 font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded">
              Selamat Datang Kembali
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Portal Akademik EstugaDigital</h1>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Anda masuk sebagai <span className="font-bold uppercase text-yellow-300">{activeRole}</span>. Sistem terintegrasi penuh untuk pencatatan presensi QR Code instan, kurikulum jurnal harian guru, e-learning penunjang, hingga ujian CBT dengan penilaian otomatis real-time.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded border border-white/10 font-mono">
              📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="bg-white/10 px-3 py-1 rounded border border-white/10 font-mono flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              Sesi Aktif Aman
            </span>
          </div>
        </div>

        {/* Panduan Urutan Pengisian Data Sekolah (Only for Admin) */}
        {activeRole === 'admin' && session?.role === 'admin' && (
          <div className="bg-[#e0e7ff] dark:bg-[#1e1b4b]/40 rounded-xl p-5 border border-emerald-150 dark:border-[#3e405b] shadow-sm animate-fade-in" id="admin-filling-guide-card">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-md shrink-0">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Panduan Urutan Pengisian Data Sekolah (Alur Kerja Lancar)
                </h2>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  Ikuti urutan langkah di bawah ini untuk mengonfigurasi data awal sekolah Anda agar seluruh menu e-learning, CBT dan presensi QR Code berjalan otomatis tanpa hambatan:
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
                    Daftarkan guru beserta mata pelajaran &amp; kelas yang diampu. Akun login guru otomatis dibuat dengan sandi default yang aman.
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


              {/* Step 4: Start Scanning & Activities */}
              <div className="bg-emerald-600 text-white p-4 rounded-xl border border-emerald-500 space-y-3 relative hover:scale-[1.01] transition-all shadow-md">
                <div className="flex justify-between items-center">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-emerald-700 text-xs font-bold font-mono">4</span>
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


        {/* Sneat Quick Stats & Grid Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Dashboard Widget based on selected role */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3.5">Akses Pintas Cepat (Quick Actions)</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                
                {(activeRole !== 'walimurid' && activeRole !== 'siswa') && (
                  <button 
                    onClick={() => setCurrentTab('barcode-scan')}
                    className="p-3 border dark:border-[#3e405b] rounded-xl hover:bg-emerald-50/50 dark:hover:bg-[#232333]/40 cursor-pointer transition-colors"
                  >
                    <span className="block text-emerald-600 dark:text-emerald-400 text-lg mb-1">📷</span>
                    <span className="font-semibold block">Absen Scan</span>
                  </button>
                )}

                {(activeRole === 'walimurid' || activeRole === 'siswa') && (
                  <button 
                    onClick={() => setCurrentTab('parent-realtime')}
                    className="p-3 border dark:border-[#3e405b] rounded-xl hover:bg-emerald-50/50 dark:hover:bg-[#232333]/40 cursor-pointer transition-colors"
                  >
                    <span className="block text-emerald-600 dark:text-emerald-400 text-lg mb-1">📈</span>
                    <span className="font-semibold block">Nilai & Presensi</span>
                  </button>
                )}

                <button 
                  onClick={() => setCurrentTab('calendar')}
                  className="p-3 border dark:border-[#3e405b] rounded-xl hover:bg-emerald-50/50 dark:hover:bg-[#232333]/40 cursor-pointer transition-colors"
                >
                  <span className="block text-emerald-600 dark:text-emerald-400 text-lg mb-1">📅</span>
                  <span className="font-semibold block">Jadwal Kalender</span>
                </button>

                {ALLOWED_TABS[activeRole].includes('php-export') && (
                  <button 
                    onClick={() => setCurrentTab('php-export')}
                    className="p-3 border dark:border-[#3e405b] rounded-xl hover:bg-emerald-50/50 dark:hover:bg-[#232333]/40 cursor-pointer transition-colors"
                  >
                    <span className="block text-emerald-600 dark:text-emerald-400 text-lg mb-1">💾</span>
                    <span className="font-semibold block">Ekspor PHP/SQL</span>
                  </button>
                )}
              </div>
            </div>

            {/* Attendance Quick Board */}
            <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex justify-between items-center">
                <span>Rangkuman Statistik Kehadiran Hari Ini</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Total {students.length} Siswa</span>
              </h2>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg">
                  <span className="block text-lg font-bold">
                    {s_attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'hadir').length}
                  </span>
                  <span>Hadir</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg">
                  <span className="block text-lg font-bold">
                    {s_attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'sakit').length}
                  </span>
                  <span>Sakit</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg">
                  <span className="block text-lg font-bold">
                    {s_attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'izin').length}
                  </span>
                  <span>Izin</span>
                </div>
                <div className="p-3 bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 rounded-lg">
                  <span className="block text-lg font-bold">
                    {students.length - s_attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length}
                  </span>
                  <span>Alfa</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right helper info box explaining multi-role capabilities (4 cols) */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Petunjuk Simulasi Multi-Role</h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Ubah peran Anda kapan saja menggunakan **Dropdown Peran** di atas navbar kanan untuk menguji fitur eksklusif tiap akun:
              </p>

              <div className="space-y-3.5 text-xs">
                <div className="flex gap-2">
                  <span className="text-emerald-600">👩‍🏫</span>
                  <div>
                    <h4 className="font-bold">Homeroom (Admin)</h4>
                    <p className="text-[11px] text-gray-400">Mendaftarkan siswa, mengimpor Excel, dan melacak detail wali murid.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-emerald-600">👨‍🏫</span>
                  <div>
                    <h4 className="font-bold">Guru Mata Pelajaran</h4>
                    <p className="text-[11px] text-gray-400">Mengisi jurnal harian materi, merilis CBT, dan mengunggah e-learning.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-emerald-600">👨‍💼</span>
                  <div>
                    <h4 className="font-bold">Kepala Sekolah</h4>
                    <p className="text-[11px] text-gray-400">Memantau progres guru, grafik kehadiran, dan memberikan catatan kinerja.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-emerald-600">👪</span>
                  <div>
                    <h4 className="font-bold">Wali Murid (Orangtua)</h4>
                    <p className="text-[11px] text-gray-400">Melacak nilai CBT, melihat absensi realtime anak, dan mengakses materi.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // Dedicated view for parents (Walimurid) to track student real-time stats
  const renderParentRealtimeView = () => {
        const s_attendance = attendance;
    const s_prayerAttendance = prayerAttendance;
    const s_results = results;
    const s_assignments = assignments;
    const s_feedbacks = feedbacks;
    const s_submissions = submissions;
    const s_grades = grades;
    const s_events = events;

    // Parent simulated profile
    const parentUsername = session?.username || "";
    const student = students.find(s => s.usernameParent.toLowerCase() === parentUsername.toLowerCase()) || students.find(s => s.id === session?.detailId) || { id: '', className: '', name: '', usernameParent: '' } as any;

    // Filter attendance and CBT results for this student
    const studentAttList = s_attendance.filter(a => a.studentId === student.id);
    const studentCbtList = s_results.filter(r => r.studentId === student.id);

    // Filter assignments for this student's class
    const classTasks = s_assignments.filter(a => a.className === student.className);
    const pendingTasks = classTasks.filter(task => {
      const hasSubmitted = s_submissions.some(s => s.assignmentId === task.id && s.studentId === student.id);
      return !hasSubmitted;
    });

    const pendingMeets = virtualMeets.filter(meet => 
      (meet.className === student.className || meet.className === 'Semua Kelas' || meet.className.includes(student.className)) &&
      new Date(meet.scheduledAt).getTime() > Date.now() - 3600000 * 2
    ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const formatFriendlyDeadline = (deadlineStr: string) => {
      try {
        const d = new Date(deadlineStr);
        if (isNaN(d.getTime())) return deadlineStr;
        return d.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + " WIB";
      } catch (e) {
        return deadlineStr;
      }
    };

    // Calculate attendance statistics
    const totalDays = studentAttList.length;
    const presentDays = studentAttList.filter(a => a.status === 'hadir').length;
    const sickDays = studentAttList.filter(a => a.status === 'sakit').length;
    const permittedDays = studentAttList.filter(a => a.status === 'izin').length;
    const absentDays = studentAttList.filter(a => a.status === 'alfa').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    return (
      <div className="space-y-6">
        {/* Header Dashboard Portal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight font-sans text-gray-800 dark:text-white flex items-center gap-2">
              {activeRole === 'siswa' ? (
                <><span>🎓</span> Portal Rekap Akademik Siswa</>
              ) : (
                <><span>👪</span> Portal Pemantauan Orang Tua</>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-[#a3a4cc]">
              {activeRole === 'siswa' ? (
                <>Akses khusus <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{student.name}</strong> untuk memantau rekap kehadiran, nilai murni, dan tugas e-learning.</>
              ) : (
                <>Akses khusus Bapak/Ibu <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{student.parentName}</strong> untuk memantau kehadiran, nilai murni, dan tugas e-learning <strong className="text-gray-700 dark:text-slate-300">{student.name}</strong>.</>
              )}
            </p>
          </div>
        </div>

        {pendingMeets.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-900/60 dark:to-teal-900/60 p-5 rounded-2xl shadow-sm text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse-slow border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl shrink-0">
                <Video size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  {activeRole === 'siswa' ? 'Virtual Meet Anda Segera Dimulai!' : 'Virtual Meet Anak Anda Segera Dimulai!'}
                </h3>
                <p className="text-[10px] text-emerald-100 mt-0.5 max-w-lg">
                  {activeRole === 'siswa' ? (
                    <>Ada <b>{pendingMeets.length}</b> jadwal pertemuan online untuk kelas Anda. Segera bersiap untuk bergabung!</>
                  ) : (
                    <>Ada <b>{pendingMeets.length}</b> jadwal pertemuan online untuk kelas anak Anda. Ingatkan anak Anda untuk gabung!</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              {pendingMeets.map(meet => (
                <div key={meet.id} className="px-4 py-2 bg-white text-emerald-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 justify-between min-w-[200px]">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-70">{meet.subject}</span>
                    <span className="flex items-center gap-1"><Clock size={10}/> {new Date(meet.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[9px]">{activeRole === 'siswa' ? 'BERSIAPLAH' : 'INGATKAN ANAK'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE BANNER & ATTENDANCE RATE METER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Child Profile & Attendance Stats Card */}
          <div className="lg:col-span-4 bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-violet-600 rounded-full flex items-center justify-center text-3xl shadow-md text-white">
                  👦
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800 dark:text-white leading-tight">{student.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">NIS: {student.id}</p>
                  <p className="text-xs font-semibold text-emerald-500 mt-0.5">{student.className}</p>
                </div>
              </div>

              <div className="border-t dark:border-slate-800/80 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Sekolah Asal:</span>
                  <span className="font-bold text-gray-700 dark:text-slate-200">
                    {schoolIdentity.name}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">Kabupaten/Kota:</span>
                  <span className="font-bold text-gray-700 dark:text-slate-200">{schoolIdentity.city}</span>
                </div>
              </div>
            </div>

            {/* Attendance Percentage Indicator */}
            <div className="bg-slate-50/50 dark:bg-[#232333]/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">{activeRole === 'siswa' ? 'Tingkat Kehadiran:' : 'Tingkat Kehadiran Anak:'}</span>
                <span className={`text-lg font-black font-mono ${attendancePercentage >= 90 ? 'text-emerald-500' : attendancePercentage >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {attendancePercentage}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${attendancePercentage >= 90 ? 'bg-emerald-500' : attendancePercentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal text-center">
                Kehadiran dihitung berdasarkan rekam pindai QR Code Kartu Siswa di gerbang sekolah. Target kelayakan adalah &ge;85%.
              </p>
            </div>
          </div>

          {/* Attendance Rekapitulasi Grid & Latest Presensi Logs */}
          <div className="lg:col-span-8 bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <span>📊</span> Rekapitulasi Absensi & Tingkat Kehadiran
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center">
                  <span className="block text-2xl font-black font-mono text-emerald-500">{presentDays}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">Hadir</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center">
                  <span className="block text-2xl font-black font-mono text-amber-500">{sickDays}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">Sakit</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-center">
                  <span className="block text-2xl font-black font-mono text-blue-500">{permittedDays}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">Izin</span>
                </div>
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-center">
                  <span className="block text-2xl font-black font-mono text-rose-500">{absentDays}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">Alfa</span>
                </div>
              </div>
            </div>

            {/* Attendance logs list */}
            <div className="space-y-3 pt-4 border-t dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Log Presensi Terakhir</span>
              {studentAttList.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 bg-slate-50 dark:bg-[#232333]/30 rounded-xl">Belum ada data log presensi terekam.</p>
              ) : (
                <div className="space-y-2">
                  {studentAttList.slice(0, 3).map((att, idx) => (
                    <div key={idx} className="p-3 border dark:border-slate-800/80 rounded-xl bg-slate-50/40 dark:bg-[#232333]/30 text-xs flex justify-between items-center transition-all hover:bg-slate-50 dark:hover:bg-slate-900">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">Presensi Harian: {att.date}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {att.status === 'hadir' ? (
                            <span>Masuk: {att.timeIn || '--'} | Pulang: {att.timeOut || 'Flexible (Masih di sekolah)'}</span>
                          ) : (
                            <span className="text-amber-500 font-semibold italic capitalize">{att.status}: {att.notes || 'Ada Surat Permohonan'}</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider
                          ${att.status === 'hadir' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                           att.status === 'sakit' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                           att.status === 'izin' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                           'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}
                        >
                          {att.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🚨 NOTIFIKASI TUGAS BELUM DIKERJAKAN */}
        <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-[#3e405b] shadow-sm overflow-hidden">
          {/* Header */}
          <div className={`p-5 flex items-center gap-3 border-b dark:border-[#3e405b] transition-colors
            ${pendingTasks.length > 0 
              ? 'bg-rose-50 dark:bg-rose-950/15 border-rose-100/55 dark:border-rose-900/35' 
              : 'bg-emerald-50 dark:bg-emerald-950/15 border-emerald-100/55 dark:border-emerald-900/35'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm shrink-0
              ${pendingTasks.length > 0 
                ? 'bg-rose-500 text-white' 
                : 'bg-emerald-500 text-white'}`}
            >
              {pendingTasks.length > 0 ? '⚠️' : '🎉'}
            </div>
            <div>
              <h2 className="text-base font-black text-gray-800 dark:text-white">
                {pendingTasks.length > 0 
                  ? `Perhatian: Ada ${pendingTasks.length} Tugas E-Learning Belum Dikerjakan!` 
                  : 'Hebat! Semua Tugas E-Learning Telah Selesai'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {pendingTasks.length > 0 
                  ? (activeRole === 'siswa' 
                      ? `Silakan segera kerjakan tugas Anda sebelum melewati batas waktu.` 
                      : `Silakan hubungi atau tegur ${student.name} agar segera menyelesaikannya sebelum melewati batas waktu.` )
                  : (activeRole === 'siswa' 
                      ? `Kamu sangat disiplin dan rajin dalam menyelesaikan seluruh penugasan guru.` 
                      : `${student.name} sangat disiplin dan rajin dalam menyelesaikan seluruh penugasan guru.`)}
              </p>
            </div>
          </div>

          <div className="p-6">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <span className="text-4xl block">✨👨‍🎓👩‍🎓✨</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {activeRole === 'siswa' ? 'Kamu Bersih dari Tunggakan Tugas!' : 'Putra/Putri Anda Bersih dari Tunggakan Tugas!'}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {activeRole === 'siswa' 
                    ? 'Semua lembar kegiatan, materi interaktif, dan kuis telah disubmit tepat waktu. Terus pertahankan prestasimu!' 
                    : 'Semua lembar kegiatan, materi interaktif, dan kuis telah disubmit tepat waktu. Terus berikan dukungan moral agar anak terus berprestasi.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-4 border border-rose-100 dark:border-rose-900/30 rounded-2xl bg-rose-50/10 dark:bg-rose-950/5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xs hover:border-rose-200">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-full border border-rose-500/20 uppercase tracking-wider">
                          Belum Dikerjakan
                        </span>
                        <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide">{task.subject}</span>
                      </div>
                      
                      <h4 className="font-bold text-xs text-gray-800 dark:text-slate-200 leading-snug line-clamp-2">
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2">
                        Deskripsi: {task.description || "Silakan kerjakan instruksi tugas sesuai lampiran materi pelajaran."}
                      </p>
                    </div>

                    <div className="pt-3 border-t dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Batas Waktu (Deadline)</span>
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-1 mt-0.5">
                          🕒 {formatFriendlyDeadline(task.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* REKAP NILAI CBT & TRANSKRIP NILAI MURNI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Real-time CBT Exam results */}
          {activeRole !== 'walimurid' && (
          <div className="lg:col-span-5 bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <span>📝</span> Riwayat Penilaian CBT Online
            </h2>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {studentCbtList.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Belum ada nilai ujian CBT terunggah.</p>
              ) : (
                studentCbtList.map((res, idx) => (
                  <div key={idx} className="p-3 border dark:border-slate-800 rounded-xl bg-gray-50/50 dark:bg-[#232333]/30 text-xs flex justify-between items-center hover:border-emerald-500/30 transition-all">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200">{res.examTitle}</h4>
                      <p className="text-[10px] text-gray-400">Mapel: {res.subject} • Tanggal: {res.submittedAt.split(' ')[0]}</p>
                      {res.teacherFeedback && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic font-medium bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 inline-block mt-1">Ulasan Guru: "{res.teacherFeedback}"</p>
                      )}
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      <span className={`text-xl font-extrabold font-mono ${res.score >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {res.score}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-0.5">Skor / 100</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

          {/* Transcript Grade list per Subject */}
          <div className={`${activeRole === 'walimurid' ? 'lg:col-span-12' : 'lg:col-span-7'} bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4`}>
            <div className="flex justify-between items-center border-b dark:border-[#3e405b]/40 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <span>📖</span> Transkrip Nilai Per Mata Pelajaran
                </h2>
                <p className="text-[10px] text-gray-400">Rekam nilai orisinal harian, tugas, PTS, dan ujian akhir semester.</p>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-extrabold px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
                Nilai Murni Siswa
              </span>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {schoolSubjects.map(sub => {
                const rec = s_grades.find(g => g.studentId === student.id && g.subject === sub) || {
                  tugas: Array(10).fill(""),
                  ulangan: Array(8).fill(""),
                  pts: "",
                  pas: ""
                };

                return (
                  <div key={sub} className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/20 dark:bg-[#232333]/10 space-y-3">
                    <div className="flex justify-between items-center border-b dark:border-slate-800/40 pb-2">
                      <span className="font-bold text-xs text-gray-800 dark:text-white flex items-center gap-1.5">
                        <span className="text-emerald-500">📘</span>
                        {sub}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Kurikulum Merdeka</span>
                    </div>

                    <div className="space-y-3">
                      {/* Nilai Tugas Row */}
                      <div>
                        <span className="block text-[9px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Nilai Tugas & PR (Max 10)</span>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: 10 }).map((_, i) => {
                            const val = rec.tugas[i];
                            const hasVal = val !== "" && val !== undefined && val !== null;
                            return (
                              <div key={i} className="flex flex-col items-center">
                                <span className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-[10px] border
                                  ${hasVal 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-slate-100/30 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 border-dashed border-slate-200 dark:border-slate-800'}`}>
                                  {hasVal ? val : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nilai Ulangan Row */}
                      <div>
                        <span className="block text-[9px] font-bold text-amber-400 uppercase tracking-wider mb-1">Ulangan Harian (Max 8)</span>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: 8 }).map((_, i) => {
                            const val = rec.ulangan[i];
                            const hasVal = val !== "" && val !== undefined && val !== null;
                            return (
                              <div key={i} className="flex flex-col items-center">
                                <span className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-bold text-[10px] border
                                  ${hasVal 
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                    : 'bg-slate-100/30 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 border-dashed border-slate-200 dark:border-slate-800'}`}>
                                  {hasVal ? val : '-'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* PTS & PAS Row */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex justify-between items-center text-xs">
                          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">PTS:</span>
                          <span className="font-extrabold font-mono text-purple-400">
                            {rec.pts !== "" && rec.pts !== undefined && rec.pts !== null ? rec.pts : '-'}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex justify-between items-center text-xs">
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">PAS:</span>
                          <span className="font-extrabold font-mono text-rose-400">
                            {rec.pas !== "" && rec.pas !== undefined && rec.pas !== null ? rec.pas : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sholat Attendance for Parent */}
        {(!student.religion || student.religion.toLowerCase() === 'islam') && (
          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm mt-6">
            <div className="flex justify-between items-center border-b dark:border-[#3e405b]/40 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <span>🕌</span> Rekap Kehadiran Sholat Berjamaah
                </h2>
                <p className="text-[10px] text-gray-400">Data kehadiran sholat jamaah (Dhuhur & Jum'at) untuk siswa kelas 3-6.</p>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-extrabold px-2 py-1 rounded-full border border-emerald-500/20">
                Pendidikan Agama
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-[#232333] border-b border-gray-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Jenis Sholat</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Tanggal</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Waktu</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Status & Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {s_prayerAttendance.filter(p => p.studentId === student.id).length > 0 ? (
                    s_prayerAttendance.filter(p => p.studentId === student.id).reverse().map(att => (
                      <tr key={att.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-bold text-xs">{att.type === 'sholat_jumat' ? "Jum'at" : "Dhuhur"}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{att.date}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{att.time}</td>
                        <td className="px-4 py-3">
                          {att.status === 'hadir' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              Hadir
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                              Tidak Hadir ({att.reason || 'Tanpa Keterangan'})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">Ananda belum memiliki rekam kehadiran sholat.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    );
  };

  // List simulator logs of WA messages sent

  if (!session) {
    return (
      <LoginGate
        students={students}
        teachers={teachers}
        schoolIdentity={schoolIdentity}
        isDark={isDark}
        dbError={dbError}
        onLogin={(newSession) => {
          setSession({
            ...newSession,
            originalRole: newSession.role
          });
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-800'} transition-colors duration-300`}>
      
      {/* LUXURY ADMIN STYLE LAYOUT */}
      
      {/* 1. Collapsed & Mobile Drawers Menu */}
      <div className="hidden md:block">
        <SneatSidebar 
          activeRole={activeRole}
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false); // Close mobile drawer on switch
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          isDark={isDark}
          session={session}
        />
      </div>

      {/* Mobile Drawer Overlay - REMOVED */}

      {/* Main content frame (handles fluid offsets based on sidebar states) */}
      <div 
        className={`transition-all duration-300 min-h-screen flex flex-col justify-between pt-16 md:pt-16
          ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'}`}
      >
        {/* Top Header Navbar */}
        <SneatNavbar
          schoolIdentity={schoolIdentity}
          sidebarCollapsed={sidebarCollapsed}
          onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          activeRole={activeRole}
          setActiveRole={handleActiveRoleChange}
          isDark={isDark}
          toggleTheme={() => setIsDark(!isDark)}
          isOnline={isOnline}
          toggleOnline={toggleOnline}
          syncQueueCount={syncQueue.length}
          syncData={triggerAutoSync}
          isSyncing={isSyncing}
          notifications={notifications}
          markAllNotificationsRead={markAllNotificationsRead}
          session={session}
          onLogout={() => {
            setSession(null);
            addNotification('Sesi log masuk berakhir.');
          }}
        />

        {/* Inline Mobile Menu (pushes content down instead of covering it) */}
        {mobileMenuOpen && (
          <div className="md:hidden w-full bg-white dark:bg-[#111625] border-b border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in relative z-10">
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              <SneatSidebar 
                activeRole={activeRole}
                currentTab={currentTab}
                setCurrentTab={(tab) => {
                  setCurrentTab(tab);
                  setMobileMenuOpen(false);
                }}
                collapsed={false}
                setCollapsed={() => {}}
                isDark={isDark}
                isMobileInline={true}
                session={session}
              />
            </div>
          </div>
        )}

        {/* Content Body Area */}
        <main className="p-2 sm:p-4 md:p-6 flex-1 max-w-7xl w-full mx-auto animate-fade-in select-none">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>}>
            {renderTabContent()}
          </Suspense>
        </main>

        {/* Sneat Footer */}
        <footer 
          className={`py-4 px-6 border-t text-xs flex flex-wrap justify-between items-center gap-2
            ${isDark ? 'bg-[#2b2c40] border-[#3e405b] text-gray-400' : 'bg-white border-gray-100 text-gray-500'}`}
        >
          <span>© 2026 <b>EstugaDigital</b> • Created by Cak Soeteguh Estuga 2026. Semua Hak Cipta Dilindungi Undang-Undang.</span>
          <div className="flex gap-4 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="cursor-pointer hover:underline" onClick={() => setCurrentTab('php-export')}>PHP Native Core</span>
            <span>v1.2.0 Stable</span>
          </div>
        </footer>

      </div>

      {/* Real-time Push Toaster Overlay */}
      <div className="fixed top-20 right-4 z-[9999] w-full max-w-sm flex flex-col gap-3 pointer-events-none">
        {activeToasts.map((toast) => {
          let borderClass = 'border-l-4 border-l-emerald-600 border-slate-200 dark:border-slate-800';
          let icon = '🔔';
          let iconBg = 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400';
          let label = 'Sistem';

          if (toast.type === 'attendance') {
            borderClass = 'border-l-4 border-l-emerald-600 border-slate-200 dark:border-slate-800';
            icon = '👤';
            iconBg = 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400';
            label = 'Presensi Masuk/Pulang';
          } else if (toast.type === 'grade') {
            borderClass = 'border-l-4 border-l-amber-600 border-slate-200 dark:border-slate-800';
            icon = '🏆';
            iconBg = 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400';
            label = 'Nilai & Akademik';
          } else if (toast.type === 'announcement') {
            borderClass = 'border-l-4 border-l-sky-600 border-slate-200 dark:border-slate-800';
            icon = '📢';
            iconBg = 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-450';
            label = 'Pengumuman / Tugas';
          }

          return (
            <div 
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex gap-3 items-start animate-scale-up duration-300 relative overflow-hidden bg-white dark:bg-[#111625] ${borderClass}`}
            >
              {/* Animated Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 w-full">
                <div className="h-full bg-emerald-500 animate-toast-progress" style={{ animationDuration: '5s', animationTimingFunction: 'linear' }}></div>
              </div>

              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${iconBg}`}>
                {icon}
              </div>
              <div className="flex-1 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold tracking-wider uppercase text-[9px] text-slate-400 font-mono">{label}</span>
                  <button 
                    onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-200 leading-relaxed pr-2">
                  {toast.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
