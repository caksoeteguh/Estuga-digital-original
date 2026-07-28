const fs = require('fs');

// AnalyticsDashboard.tsx
let ad = fs.readFileSync('src/components/AnalyticsDashboard.tsx', 'utf8');
const adRegex = /\{activeRole === 'kepsek' && onClearHistory && \([\s\S]*?\{\/\* Visual Summary Cards Banner \*\/\}/;
ad = ad.replace(adRegex, '{/* Visual Summary Cards Banner */}');
fs.writeFileSync('src/components/AnalyticsDashboard.tsx', ad);

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
const appRegex = /\{\/\* Clear Demo Data Prompt \*\/\}\s*<div className="bg-rose-50 dark:bg-rose-950\/20[\s\S]*?\{\/\* Elegant Stats Grid \*\/\}/;
app = app.replace(appRegex, '{/* Elegant Stats Grid */}');
fs.writeFileSync('src/App.tsx', app);

console.log('Removed clear buttons');
