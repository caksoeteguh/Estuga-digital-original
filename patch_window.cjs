const fs = require('fs');
let code = fs.readFileSync('src/sync.ts', 'utf8');
code = code.replace(/window\.FIREBASE_QUOTA_EXCEEDED/g, "(window as any).FIREBASE_QUOTA_EXCEEDED");
fs.writeFileSync('src/sync.ts', code);
