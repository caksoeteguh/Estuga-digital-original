const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// For teachers
content = content.replace(
  /setTeachers\(t\);\s*\}\s*return t;\s*\}\);/,
  `setTeachers(t);\n    }\n    return t;\n  });\n  useEffect(() => {\n    const unsubscribe = setupGenericSync('teachers', teachers, setTeachers);\n    return () => unsubscribe();\n  }, []);`
);

// For grades
content = content.replace(
  /\]\);\s*\}\);/,
  `]);\n  });\n  useEffect(() => {\n    const unsubscribe = setupGenericSync('student_grades', grades, setGrades);\n    return () => unsubscribe();\n  }, []);`
);

fs.writeFileSync('src/App.tsx', content);
