export type UserRole = 'admin' | 'guru' | 'kepsek' | 'walimurid' | 'siswa';

export interface Student {
  id: string; // NIS
  name: string;
  pob: string; // Place of Birth
  dob: string; // Date of Birth
  className: string;
  parentName: string;
  parentPhone: string;
  usernameCbt: string;
  passwordCbt: string;
  usernameParent: string;
  passwordParent: string;
  religion?: string;
  gender?: 'Laki-laki' | 'Perempuan';
}

export interface Teacher {
  id: string; // NIP
  name: string;
  subject: string;
  username: string;
  password: string;
  classesTaught?: string; // Classes taught by the teacher
  isHomeroom?: boolean;
  homeroomClass?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  status: 'hadir' | 'sakit' | 'izin' | 'alfa';
  notes?: string;
  notifiedIn: boolean;
  notifiedOut: boolean;
}

export interface ClassJournal {
  id: string;
  date: string;
  className: string;
  subject: string;
  teacherName: string;
  topic: string;
  method: string;
  notes: string;
  rppFile?: string;
  rppFileName?: string;
  rppFeedback?: string;
  rppFeedbackDate?: string;
  rppUploadedAt?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  image?: string; // Optional image URL or base64 data
}

export interface MatchingPair {
  leftId: string;
  leftText: string;
  leftImage?: string;
  rightId: string;
  rightText: string;
  rightImage?: string;
}

export interface CBTQuestion {
  id: string;
  type: 'pg_sederhana' | 'pg_kompleks' | 'benar_salah' | 'menjodohkan' | 'isian_singkat' | 'uraian';
  stimulus?: string; // Teks stimulus
  stimulusImage?: string; // Gambar stimulus
  questionText: string;
  questionImage?: string; // Optional image URL or base64 data for the question
  options?: QuestionOption[]; // For pg_sederhana and pg_kompleks
  correctAnswer?: string | string[]; // For pg_sederhana, pg_kompleks, benar_salah, isian_singkat
  matchingPairs?: MatchingPair[]; // For menjodohkan
  scoreWeight: number;
}

export interface CBTExam {
  id: string;
  title: string;
  subject: string;
  className: string;
  date: string;
  startTime?: string; // e.g. "07:30"
  endTime?: string; // e.g. "10:30"
  durationMinutes: number;
  totalQuestions: number;
  questions: CBTQuestion[];
  isPublished: boolean;
  isRandomized: boolean;
}

export interface StudentCBTResult {
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  subject: string;
  score: number;
  submittedAt: string;
  isGraded: boolean;
  teacherFeedback?: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  date: string;
  type: 'cbt' | 'holiday' | 'event' | 'meeting' | 'task' | 'deadline';
  className?: string;
  description?: string;
}

export interface PrayerAttendance {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  time: string;
  type: 'sholat_dhuhur' | 'sholat_jumat';
  status: 'hadir' | 'tidak_hadir';
  reason?: 'Menstruasi' | 'Sakit' | 'Kegiatan Lain' | 'Tanpa Keterangan' | null;
}

export interface TeacherFeedback {
  id: string;
  teacherId: string;
  teacherName: string;
  principalNote: string;
  date: string;
}

export interface ELearningMaterial {
  id: string;
  title: string;
  subject: string;
  className: string;
  teacherName: string;
  type: 'pdf' | 'video' | 'link' | 'text' | 'png';
  content: string; // URL or HTML description
  fileName?: string;
  createdAt: string;
  startDate?: string; // Optional start datetime (YYYY-MM-DDTHH:mm)
  expiryDate?: string; // Optional expiry datetime (YYYY-MM-DDTHH:mm)
}


export interface AssignmentTask {
  id: string;
  title: string;
  subject: string;
  className: string;
  teacherName: string;
  deadline: string; // ISO string or YYYY-MM-DD HH:mm
  description: string;
  questions: CBTQuestion[]; // Supporting pg_sederhana, pg_kompleks, benar_salah, menjodohkan
  allowImageUpload: boolean;
  taskType?: 'tugas' | 'latihan';
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, any>; // questionId -> answer
  uploadedPhotoUrl?: string; // Image upload for photo tasks
  submittedAt: string;
  score?: number;
  feedback?: string;
  isGraded: boolean;
}

export interface StudentGradeRecord {
  id: string; // key: studentId_subject
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  tugas: Array<number | "">; // 10 scores
  ulangan: Array<number | "">; // 8 scores
  pts: number | "";
  pas: number | "";
}




export interface AppNotification {
  id: string;
  text: string;
  message?: string;
  time: string;
  timestamp: string;
  recipientId: string;
  read: boolean;
  type: 'attendance' | 'grade' | 'announcement' | 'system';
}

export interface VirtualMeet {
  id: string;
  title: string;
  subject: string;
  className: string;
  teacherName: string;
  meetLink: string;
  scheduledAt: string;
  description?: string;
  createdAt: string;
}
