const fs = require('fs');
let code = fs.readFileSync('src/mockData.ts', 'utf8');

code = code.replace(/import \{ db \} from '\.\/firebase';\nimport \{ doc, getDoc, setDoc \} from 'firebase\/firestore';\n/, '');

code = code.replace(/export const saveToStorage =/g, "const API_URL = 'api/sync.php';\n\nexport const saveToStorage =");

code = code.replace(/const docSnap = await getDoc\(doc\(db, "app_data", key\)\);\n\s*if \(docSnap\.exists\(\)\) \{\n\s*const serverData = docSnap\.data\(\)\.doc_data;\n\s*if \(serverData\) \{\n\s*const serverArr = typeof serverData === 'string' \? JSON\.parse\(serverData\) : serverData;/g, 
`const res = await fetch(API_URL + '?t=' + Date.now(), { cache: 'no-store' });
             if (res.ok) {
                 const serverData = await res.json();
                 if (serverData?.status === 'success' && serverData?.data?.[key]) {
                     const serverArr = typeof serverData.data[key] === 'string' ? JSON.parse(serverData.data[key]) : serverData.data[key];`);

code = code.replace(/await setDoc\(doc\(db, "app_data", key\), \{\n\s*doc_id: key,\n\s*doc_data: payloadToSync\n\s*\}\);/g, 
`await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               doc_id: key,
               doc_data: payloadToSync
            })
         });`);

code = code.replace(/await setDoc\(doc\(db, "app_data", key\), \{\n\s*doc_id: key,\n\s*doc_data: stored\n\s*\}\);\n\s*successCount\+\+;/g,
`const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doc_id: key,
            doc_data: stored
          })
        });
        
        const text = await res.text();
        try {
           const json = JSON.parse(text);
           if (res.ok && json.status === 'success') {
               successCount++;
           } else {
               console.error(\`Sync failed for \${key}:\`, json.message || text);
               throw new Error(json.message || "Unknown error from server");
           }
        } catch(e: any) {
           console.error(\`Sync failed for \${key} - Non JSON response:\`, text);
           throw new Error(e.message || "Invalid response from server");
        }`);

code = code.replace(/const keys = \[\n\s*'students', 'teachers', 'attendance', 'journals', 'exams',\n\s*'results', 'events', 'feedbacks', 'materials', 'assignments',\n\s*'submissions', 'virtual_meets', 'prayer_attendance', 'settings'\n\s*\];\n\s*let hasData = false;\n\s*\/\/ We do multiple getDoc calls or just keep it simple\n\s*for \(const key of keys\) \{\n\s*try \{\n\s*const docSnap = await getDoc\(doc\(db, "app_data", key\)\);\n\s*if \(docSnap\.exists\(\)\) \{\n\s*const doc_data = docSnap\.data\(\)\.doc_data;\n\s*if \(doc_data !== undefined\) \{\n\s*const stringified = typeof doc_data === 'string' \? doc_data : JSON\.stringify\(doc_data\);\n\s*localStorage\.setItem\(\`adminguruku_v2_\$\{key\}\`, stringified\);\n\s*hasData = true;\n\s*\}\n\s*\}\n\s*\} catch\(e\) \{\n\s*console\.warn\(\`Failed to sync \$\{key\} from Firestore\`, e\);\n\s*\}\n\s*\}/g,
`const res = await fetch(API_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error("API not reachable");
    
    const text = await res.text();
    if (text.trim().startsWith('<?php') || text.trim().startsWith('<')) {
        // Quietly fallback for dev server
        throw new Error("PHP_DEV_SERVER");
    }
    let result;
    try {
        result = JSON.parse(text);
    } catch (e: any) {
        throw new Error("Invalid Response from Server: " + text.substring(0, 100));
    }
    if (result.status !== 'success') throw new Error(result.message || "Unknown API error");
    
    let hasData = false;
    
    if (result.data) {
        for (const [doc_id, doc_data] of Object.entries(result.data)) {
           if (doc_id === 'login_session' || doc_id === 'is_dark') continue;
           
           if (doc_data !== undefined) {
             const stringified = typeof doc_data === 'string' ? doc_data : JSON.stringify(doc_data);
             localStorage.setItem(\`adminguruku_v2_\${doc_id}\`, stringified);
             hasData = true;
           }
        }
    }`);

code = code.replace(/console\.error\("Failed to sync from Firestore:", e\);\n\s*\/\/ initialSyncCompleted = true; \/\/ allow local saves\n\s*return false;/, 
`if (e.message !== "PHP_DEV_SERVER") {
      console.error("Failed to sync from PHP API:", e);
      throw e; // Throw so UI can catch and display DB errors
    }
    // If API is down (e.g. running on local dev without PHP), we just rely on localStorage
    initialSyncCompleted = true; // allow local saves
    return false;`);

code = code.replace(/Sync to Firestore/g, "Sync to PHP API on Hostinger");

fs.writeFileSync('src/mockData.ts', code);
console.log('done modifying');
