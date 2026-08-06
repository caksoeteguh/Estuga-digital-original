const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const statesToFetch = [
  { name: 'students', setter: 'setStudents', endpoint: 'get_students.php' },
  { name: 'teachers', setter: 'setTeachers', endpoint: 'get_teachers.php' },
  { name: 'attendance', setter: 'setAttendance', endpoint: 'get_attendance.php' },
  { name: 'prayerAttendance', setter: 'setPrayerAttendance', endpoint: 'get_prayer_attendance.php' },
  { name: 'journals', setter: 'setJournals', endpoint: 'get_journals.php' },
  { name: 'exams', setter: 'setExams', endpoint: 'get_exams.php' },
  { name: 'results', setter: 'setResults', endpoint: 'get_results.php' },
  { name: 'events', setter: 'setEvents', endpoint: 'get_events.php' },
  { name: 'materials', setter: 'setMaterials', endpoint: 'get_materials.php' },
  { name: 'assignments', setter: 'setAssignments', endpoint: 'get_assignments.php' },
  { name: 'submissions', setter: 'setSubmissions', endpoint: 'get_submissions.php' },
  { name: 'grades', setter: 'setGrades', endpoint: 'get_grades.php' }
];

const getHostingerPrefix = `const HOSTINGER_BASE = window.location.hostname === 'localhost' || window.location.hostname.includes('run.app') ? 'https://estugadigital.online' : '';`;

if (!content.includes('HOSTINGER_BASE')) {
    content = content.replace(/(const \[students, setStudents\] = [^\n]+)/, `${getHostingerPrefix}\n  $1`);
}

statesToFetch.forEach(state => {
  const capName = state.name.charAt(0).toUpperCase() + state.name.slice(1);
  const fetcherName = `fetch${capName}FromMySQL`;
  
  if (content.includes(fetcherName)) return; // Already exists
  
  const block = `
  useEffect(() => {
    const ${fetcherName} = async () => {
      try {
        const response = await fetch(HOSTINGER_BASE + '/api/${state.endpoint}');
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
            ${state.setter}(result.data);
          }
        }
      } catch (error) {
        console.log('API fetch failed for ${state.name}, falling back to local storage', error);
      }
    };
    ${fetcherName}();
  }, []);`;
  
  const declarationRegex = new RegExp(`(const \\\[${state.name}, ${state.setter}\\\] = [^;]+;[\\s\\S]*?setupGenericSync[^;]+;[\\s\\S]*?\\}, \\\[\\\]\\);)`);
  content = content.replace(declarationRegex, `$1\n${block}`);
});

fs.writeFileSync('src/App.tsx', content);
