const fs = require('fs');
let code = fs.readFileSync('src/utils/hostingerSync.ts', 'utf8');

code = code.replace("if (!HOSTINGER_BASE) return false;", "");

fs.writeFileSync('src/utils/hostingerSync.ts', code);
