const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/addGenericToFirestore\([^)]+\);?/g, '');
code = code.replace(/import { addGenericToFirestore, deleteGenericFromFirestore } from '..\/sync';/g, '');

fs.writeFileSync('src/App.tsx', code);
