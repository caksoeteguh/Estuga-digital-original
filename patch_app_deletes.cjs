const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/deleteGenericFromFirestore\('[^']+', id\);/g, '// Deleted from array instead');

fs.writeFileSync('src/App.tsx', code);
