const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace all MySQL fetch effect blocks
content = content.replace(/useEffect\(\(\) => \{\s*const fetch[A-Za-z]+FromMySQL = async \(\) => \{[\s\S]*?fetch[A-Za-z]+FromMySQL\(\);\s*\}, \[\]\);/g, '');

fs.writeFileSync('src/App.tsx', content);
