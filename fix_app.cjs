const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/addGenericToFirestore\('results', res\);\n              addGenericToFirestore\('results', res\);/g, "addGenericToFirestore('results', res);");
content = content.replace(/addGenericToFirestore\('results', res\);\n                  addGenericToFirestore\('results', res\);/g, "addGenericToFirestore('results', res);");

fs.writeFileSync('src/App.tsx', content);
