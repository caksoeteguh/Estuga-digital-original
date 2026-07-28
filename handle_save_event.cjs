const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const eventListener = `
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
      saveToStorage('wa_notifs', waNotifs);
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
    events, feedbacks, materials, waNotifs, assignments, submissions, grades,
    schoolIdentity, schoolClasses, schoolSubjects
  ]);
`;

code = code.replace(/  \/\/ Sync to localStorage whenever states change/, eventListener + "\n  // Sync to localStorage whenever states change");

fs.writeFileSync('src/App.tsx', code);
