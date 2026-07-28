const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const replaced = content.replace(/walikelas/g, 'admin').replace(/Walikelas/g, 'Admin');
  fs.writeFileSync(filePath, replaced, 'utf-8');
  console.log(`Replaced in ${filePath}`);
}

const filesToUpdate = [
  'src/types.ts',
  'src/App.tsx',
  'src/components/SneatNavbar.tsx',
  'src/components/AnalyticsDashboard.tsx',
  'src/components/CalendarScheduler.tsx',
  'src/components/SneatSidebar.tsx',
  'src/components/LoginGate.tsx',
  'src/mockData.ts'
];

filesToUpdate.forEach(f => {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) {
    replaceInFile(p);
  } else {
    console.log(`File not found: ${p}`);
  }
});
