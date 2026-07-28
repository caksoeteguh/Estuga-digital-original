const fs = require('fs');

let content = fs.readFileSync('src/mockData.ts', 'utf8');

// Inside syncFromServer, when we find login_session, delete it
content = content.replace(
  /if \(docSnap\.id === 'login_session' \|\| docSnap\.id === 'is_dark'\) return;/m,
  `if (docSnap.id === 'login_session' || docSnap.id === 'is_dark') {
        try { deleteDoc(doc(db, 'app_data', docSnap.id)); } catch(e) {}
        return;
      }`
);

// We need to import deleteDoc if it's not imported
if (!content.includes('deleteDoc')) {
  content = content.replace(
    /import \{ collection, doc, setDoc, getDocs, onSnapshot, serverTimestamp \} from 'firebase\/firestore';/,
    "import { collection, doc, setDoc, getDocs, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';"
  );
}

fs.writeFileSync('src/mockData.ts', content);
console.log('Cleanup script added.');
