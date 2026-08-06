const fs = require('fs');
let content = fs.readFileSync('src/mockData.ts', 'utf-8');

const getHostingerPrefix = `const HOSTINGER_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('run.app')) ? 'https://estugadigital.online' : '';`;

if (!content.includes('HOSTINGER_BASE')) {
    content = content.replace(/(const API_URL = )/, `${getHostingerPrefix}\n$1`);
}

content = content.replace(/'\/api\/save_relational\.php'/, 'HOSTINGER_BASE + "/api/save_relational.php"');

fs.writeFileSync('src/mockData.ts', content);
