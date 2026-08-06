const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the setupAttendanceSync imports with our hook
content = content.replace(
  /import \{ setupAttendanceSync, addAttendanceToFirestore, setupPrayerAttendanceSync, addPrayerAttendanceToFirestore \} from "\.\/sync";/,
  `import { setupGenericSync, addGenericToFirestore, deleteGenericFromFirestore } from "./sync";`
);

// Remove the old setupAttendanceSync effect
content = content.replace(/useEffect\(\(\) => \{\s*const unsubscribe = setupAttendanceSync\(attendance, setAttendance\);\s*return \(\) => unsubscribe\(\);\s*\}, \[\]\);/, '');

// Remove the old setupPrayerAttendanceSync effect
content = content.replace(/useEffect\(\(\) => \{\s*const unsubscribe = setupPrayerAttendanceSync\(prayerAttendance, setPrayerAttendance\);\s*return \(\) => unsubscribe\(\);\s*\}, \[\]\);/, '');

// Add the setupGenericSync effects for all state variables just after their declarations!
const statesToSync = [
  { name: 'students', setter: 'setStudents' },
  { name: 'teachers', setter: 'setTeachers' },
  { name: 'attendance', setter: 'setAttendance' },
  { name: 'prayerAttendance', setter: 'setPrayerAttendance' },
  { name: 'journals', setter: 'setJournals' },
  { name: 'exams', setter: 'setExams' },
  { name: 'results', setter: 'setResults' },
  { name: 'events', setter: 'setEvents' },
  { name: 'feedbacks', setter: 'setFeedbacks' },
  { name: 'materials', setter: 'setMaterials' },
  { name: 'assignments', setter: 'setAssignments' },
  { name: 'submissions', setter: 'setSubmissions' },
  { name: 'grades', setter: 'setGrades', collection: 'student_grades' }
];

statesToSync.forEach(state => {
  const collectionName = state.collection || state.name;
  
  // Find where the state is declared
  const declarationRegex = new RegExp(`const \\\[${state.name}, ${state.setter}\\\] = useState.*?;`, 'g');
  
  content = content.replace(declarationRegex, (match) => {
    return `${match}\n  useEffect(() => {\n    const unsubscribe = setupGenericSync('${collectionName}', ${state.name}, ${state.setter});\n    return () => unsubscribe();\n  }, []);`;
  });
});

fs.writeFileSync('src/App.tsx', content);
