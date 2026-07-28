const fs = require('fs');
const content = `import { Student, Teacher, Attendance, PrayerAttendance, ClassJournal, CBTExam, StudentCBTResult, AcademicEvent, TeacherFeedback, ELearningMaterial, WA_NotificationSim } from './types';

// Mock Data Arrays
export const INITIAL_STUDENTS: any[] = [];
let initialSyncCompleted = false;
export const INITIAL_TEACHERS: any[] = [
  {
    id: "admin1",
    name: "Admin Utama",
    subject: "Administrator",
    username: "adminutama",
    password: "adminutama",
    classesTaught: "Semua Kelas",
    isHomeroom: false,
    homeroomClass: ""
  }
];
export const INITIAL_ATTENDANCE: any[] = [];
export const INITIAL_JOURNALS: any[] = [];
export const INITIAL_EXAMS: any[] = [];
export const INITIAL_CBT_RESULTS: any[] = [];
export const INITIAL_EVENTS: any[] = [];
export const INITIAL_FEEDBACKS: any[] = [];
export const INITIAL_MATERIALS: any[] = [];
export const INITIAL_WA_NOTIFS: WA_NotificationSim[] = [];
export const INITIAL_ASSIGNMENTS: any[] = [];
export const INITIAL_SUBMISSIONS: any[] = [];
export const INITIAL_PRAYER_ATTENDANCE: PrayerAttendance[] = [];

// LocalStorage helpers
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const storage = key === 'login_session' ? sessionStorage : localStorage;
    const stored = storage.getItem(\`adminguruku_v2_\${key}\`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed === null || parsed === undefined) return defaultValue;
      return parsed;
    }
    return defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const API_URL = '/api/sync.php';

export const saveToStorage = async <T>(key: string, value: T): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      const storage = key === 'login_session' ? sessionStorage : localStorage;
      const stringified = JSON.stringify(value);
      const current = storage.getItem(\`adminguruku_v2_\${key}\`);
      
      if (current === stringified) {
        return; // Prevent infinite loop if data hasn't changed
      }
      storage.setItem(\`adminguruku_v2_\${key}\`, stringified);
      
      // Do not sync local-only state to API
      if (key === 'login_session' || key === 'is_dark') return;
      if (!initialSyncCompleted) return;
      
      // Sync to PHP API on Hostinger
      try {
         await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               doc_id: key,
               doc_data: stringified
            })
         });
      } catch (e) {
         console.warn("Failed to sync to API. Data saved locally.", e);
      }
      
    } catch (e) {
      console.error("Storage error:", e);
    }
  }
};

export const syncFromServer = async (): Promise<boolean> => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API not reachable");
    
    const result = await res.json();
    if (result.status !== 'success') throw new Error(result.message || "Unknown API error");
    
    let hasData = false;
    
    if (result.data) {
        for (const [doc_id, doc_data] of Object.entries(result.data)) {
           if (doc_id === 'login_session' || doc_id === 'is_dark') continue;
           
           if (doc_data !== undefined) {
             const stringified = typeof doc_data === 'string' ? doc_data : JSON.stringify(doc_data);
             localStorage.setItem(\`adminguruku_v2_\${doc_id}\`, stringified);
             hasData = true;
           }
        }
    }
    
    initialSyncCompleted = true;
    return hasData;
  } catch (e: any) {
    console.error("Failed to sync from PHP API:", e);
    // If API is down (e.g. running on local dev without PHP), we just rely on localStorage
    initialSyncCompleted = true; // allow local saves
    return false;
  }
};
`;

fs.writeFileSync('src/mockData.ts', content);
console.log('Rewritten mockData.ts to use PHP API');
