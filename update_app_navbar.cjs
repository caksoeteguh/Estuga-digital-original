const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<SneatNavbar/g, '<SneatNavbar\n          schoolIdentity={schoolIdentity}');

fs.writeFileSync('src/App.tsx', code);
