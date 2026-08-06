const fs = require('fs');
let content = fs.readFileSync('src/mockData.ts', 'utf-8');

// We comment out the fetch to API_URL and save_relational.php inside saveToStorage
content = content.replace(
  /\/\/ Sync to PHP API on Hostinger\s*try \{\s*await fetch\(API_URL, \{[\s\S]*?\}\s*\} catch \(e\) \{\s*console\.warn\("Failed to sync to API\. Data saved locally\.", e\);\s*\}/,
  `// Sync to PHP API on Hostinger is DISABLED in real-time to prevent 100-student traffic spikes.
      // Data is safely stored in Firebase Firestore and LocalStorage.
      // It can be exported manually or via a nightly cron job on Hostinger.`
);

fs.writeFileSync('src/mockData.ts', content);
