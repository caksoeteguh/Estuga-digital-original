const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace imports
code = code.replace(
  'import { setupGenericSync, addGenericToFirestore, deleteGenericFromFirestore, setupMetadataSync, updateMetadataInFirestore } from "./sync";',
  'import { setupAggregatedSync, setupMetadataSync, updateMetadataInFirestore } from "./sync";'
);

// Uncomment and replace setupGenericSync
code = code.replace(/\/\/ const unsubscribe = setupGenericSync\(/g, 'const unsubscribe = setupAggregatedSync(');
code = code.replace(/\/\/ return \(\) => unsubscribe\(\);/g, 'return () => unsubscribe();');

// Uncomment metadata sync
code = code.replace(/\/\/ const unsubscribe = setupMetadataSync\(/g, 'const unsubscribe = setupMetadataSync(');
code = code.replace(/\/\/  schoolIdentity, setSchoolIdentity,/g, ' schoolIdentity, setSchoolIdentity,');
code = code.replace(/\/\/  schoolClasses, setSchoolClasses,/g, ' schoolClasses, setSchoolClasses,');
code = code.replace(/\/\/  schoolSubjects, setSchoolSubjects/g, ' schoolSubjects, setSchoolSubjects');
code = code.replace(/\/\/ \);/g, ');');

// Uncomment updateMetadataInFirestore
code = code.replace(/\/\/ updateMetadataInFirestore/g, 'updateMetadataInFirestore');

fs.writeFileSync('src/App.tsx', code);
