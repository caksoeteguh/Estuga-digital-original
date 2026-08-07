const fs = require('fs');
let code = fs.readFileSync('src/sync.ts', 'utf8');
code = code.replace(/const \{ doc, onSnapshot, setDoc \} = require\('firebase\/firestore'\);/, '');
fs.writeFileSync('src/sync.ts', code);
