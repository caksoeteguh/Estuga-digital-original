const fs = require('fs');
let content = fs.readFileSync('src/mockData.ts', 'utf-8');

// Insert import if not exists
if (!content.includes('syncArrayToFirestore')) {
  content = `import { syncArrayToFirestore } from './utils/diffSync';\n` + content;
}

const syncCall = `
      // Sync via Firebase diffSync
      const collectionsMap: Record<string, string> = {
        'students': 'students',
        'teachers': 'teachers',
        'attendance': 'attendance',
        'prayer_attendance': 'prayerAttendance',
        'journals': 'journals',
        'exams': 'exams',
        'results': 'results',
        'events': 'events',
        'feedbacks': 'feedbacks',
        'materials': 'materials',
        'assignments': 'assignments',
        'submissions': 'submissions',
        'student_grades': 'student_grades'
      };
      
      if (collectionsMap[key] && Array.isArray(value)) {
        syncArrayToFirestore(collectionsMap[key], value);
      }
`;

content = content.replace(
  /try \{ storage\.setItem\(\`adminguruku_v2_\$\{key\}\`, stringified\); \} catch\(e\) \{ console\.warn\("QuotaExceededError for " \+ key, e\); \}/,
  `try { storage.setItem(\`adminguruku_v2_\${key}\`, stringified); } catch(e) { console.warn("QuotaExceededError for " + key, e); }${syncCall}`
);

fs.writeFileSync('src/mockData.ts', content);
