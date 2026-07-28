const fs = require('fs');
const content = fs.readFileSync('src/components/PhpExporter.tsx', 'utf8');

function extractVar(name) {
  const regex = new RegExp(`const ${name} = \\\`([\\\\s\\\\S]*?)\\\`;`);
  const match = content.match(regex);
  return match ? match[1] : null;
}

const sql = extractVar('sqlSchema');
const db = extractVar('phpDb');
const absen = extractVar('phpAbsen');
const wa = extractVar('phpWa');

// For sync.php, it's defined inside handleDownloadPackage:
const syncPhpRegex = /apiFolder\.file\("sync\.php", \\\`([\s\S]*?)\\\`\);/;
const syncPhpMatch = content.match(syncPhpRegex);
const sync = syncPhpMatch ? syncPhpMatch[1] : null;

fs.mkdirSync('public/api', { recursive: true });
fs.mkdirSync('public/database_schema', { recursive: true });

if (sql) fs.writeFileSync('public/database_schema/estugadigital_v7.sql', sql);
if (db) fs.writeFileSync('public/api/db.php', db);
if (absen) fs.writeFileSync('public/api/absen_scan.php', absen);
if (wa) fs.writeFileSync('public/api/wa_notif.php', wa);
if (sync) fs.writeFileSync('public/api/sync.php', sync);

console.log('Extraction complete');
