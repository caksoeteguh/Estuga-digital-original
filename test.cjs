const fs = require('fs');
let ad = fs.readFileSync('src/components/AnalyticsDashboard.tsx', 'utf8');
if (ad.includes('triggerClearHistory')) {
  console.log('triggerClearHistory STILL EXISTS');
} else {
  console.log('Clean');
}
