const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// onAddExam
content = content.replace(
  /onAddExam=\{\(exam\) => \{\s*setExams\(prev => \[\{ \.\.\.exam \}, \.\.\.prev\]\);/g,
  `onAddExam={(exam) => {\n              setExams(prev => [{ ...exam }, ...prev]);\n              addGenericToFirestore('exams', exam);`
);

// onAddResult
content = content.replace(
  /onAddResult=\{\(res\) => \{\s*setResults\(prev => \[\{ \.\.\.res \}, \.\.\.prev\]\);/g,
  `onAddResult={(res) => {\n              setResults(prev => [{ ...res }, ...prev]);\n              addGenericToFirestore('results', res);`
);
content = content.replace(
  /onAddResult=\{\(res\) => \{\s*setResults\(prev => \[\{ \.\.\.res \}, \.\.\.prev\]\);/g,
  `onAddResult={(res) => {\n                  setResults(prev => [{ ...res }, ...prev]);\n                  addGenericToFirestore('results', res);`
);

// onAddMaterial
content = content.replace(
  /onAddMaterial=\{\(mat\) => \{\s*setMaterials\(prev => \[\{ \.\.\.mat \}, \.\.\.prev\]\);/g,
  `onAddMaterial={(mat) => {\n              setMaterials(prev => [{ ...mat }, ...prev]);\n              addGenericToFirestore('materials', mat);`
);

// onUpdateMaterial
content = content.replace(
  /onUpdateMaterial=\{\(id, updated\) => \{\s*setMaterials\(prev => prev\.map\(m => m\.id === id \? \{ \.\.\.m, \.\.\.updated \} : m\)\);/g,
  `onUpdateMaterial={(id, updated) => {\n              const m = materials.find(x => x.id === id); if(m) addGenericToFirestore('materials', { ...m, ...updated });\n              setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));`
);

// onDeleteMaterial
content = content.replace(
  /onDeleteMaterial=\{\(id\) => \{\s*setMaterials\(prev => prev\.filter\(m => m\.id !== id\)\);/g,
  `onDeleteMaterial={(id) => {\n              deleteGenericFromFirestore('materials', id);\n              setMaterials(prev => prev.filter(m => m.id !== id));`
);

// onAddAssignment
content = content.replace(
  /onAddAssignment=\{\(assignment\) => \{\s*setAssignments\(prev => \[\.\.\.prev, \{ \.\.\.assignment \}\]\);/g,
  `onAddAssignment={(assignment) => {\n                  setAssignments(prev => [...prev, { ...assignment }]);\n                  addGenericToFirestore('assignments', assignment);`
);

// onUpdateAssignment
content = content.replace(
  /onUpdateAssignment=\{\(updated\) => \{\s*setAssignments\(prev => prev\.map\(a => a\.id === updated\.id \? updated : a\)\);/g,
  `onUpdateAssignment={(updated) => {\n                  setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));\n                  addGenericToFirestore('assignments', updated);`
);

// onDeleteAssignment
content = content.replace(
  /onDeleteAssignment=\{\(id\) => \{\s*setAssignments\(prev => prev\.filter\(a => a\.id !== id\)\);/g,
  `onDeleteAssignment={(id) => {\n                  setAssignments(prev => prev.filter(a => a.id !== id));\n                  deleteGenericFromFirestore('assignments', id);`
);

// onAddSubmission
content = content.replace(
  /onAddSubmission=\{\(sub\) => \{\s*setSubmissions\(prev => \[\.\.\.prev, \{ \.\.\.sub \}\]\);/g,
  `onAddSubmission={(sub) => {\n                  setSubmissions(prev => [...prev, { ...sub }]);\n                  addGenericToFirestore('submissions', sub);`
);

// onAddJournal
content = content.replace(
  /onAddJournal=\{\(journal\) => \{\s*setJournals\(prev => \[\{ \.\.\.journal \}, \.\.\.prev\]\);/g,
  `onAddJournal={(journal) => {\n              setJournals(prev => [{ ...journal }, ...prev]);\n              addGenericToFirestore('journals', journal);`
);


fs.writeFileSync('src/App.tsx', content);
