const fs = require('fs');
let ad = fs.readFileSync('src/components/AnalyticsDashboard.tsx', 'utf8');

// If triggerClearHistory is just defined, we can safely ignore it or remove the definition.
ad = ad.replace(/const triggerClearHistory = \(\) => \{[\s\S]*?\};\n/g, '');

fs.writeFileSync('src/components/AnalyticsDashboard.tsx', ad);
console.log('Removed unused triggerClearHistory function');
