const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Comment out all setupGenericSync
code = code.replace(/const unsubscribe = setupGenericSync/g, '// const unsubscribe = setupGenericSync');
// Comment out return () => unsubscribe() where it was used for setupGenericSync
code = code.replace(/return \(\) => unsubscribe\(\);/g, '// return () => unsubscribe();');

// Comment out setupMetadataSync
code = code.replace(/const unsubscribe = setupMetadataSync/g, '// const unsubscribe = setupMetadataSync');

// Comment out updateMetadataInFirestore
code = code.replace(/updateMetadataInFirestore/g, '// updateMetadataInFirestore');

fs.writeFileSync('src/App.tsx', code);
