const fs = require('fs');
let code = fs.readFileSync('src/sync.ts', 'utf8');

const searchAgg = `  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {`;

const replaceAgg = `  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (window.FIREBASE_QUOTA_EXCEEDED) return;
    if (snapshot.exists()) {`;

code = code.replace(searchAgg, replaceAgg);

const searchMeta = `  const unsubscribe = onSnapshot(metaRef, (snapshot) => {
    if (snapshot.exists()) {`;

const replaceMeta = `  const unsubscribe = onSnapshot(metaRef, (snapshot) => {
    if (window.FIREBASE_QUOTA_EXCEEDED) return;
    if (snapshot.exists()) {`;

code = code.replace(searchMeta, replaceMeta);

const searchError = `  }, (error) => {
    console.error("Firestore sync error for", key, error);
  });`;

const replaceError = `  }, (error) => {
    console.error("Firestore sync error for", key, error);
    if (error.message && error.message.includes("Quota exceeded")) {
       window.FIREBASE_QUOTA_EXCEEDED = true;
       alert("🚨 Firebase Quota Exceeded! Aplikasi akan beralih ke Mode Lokal Sementara. Data yang Anda ubah hari ini mungkin tidak tersinkronisasi ke pengguna lain sampai besok. Jangan hapus cache browser Anda.");
    }
  });`;

code = code.replace(searchError, replaceError);

const searchErrorMeta = `  }, (err) => console.error(err));`;

const replaceErrorMeta = `  }, (err) => {
    console.error(err);
    if (err.message && err.message.includes("Quota exceeded")) {
       window.FIREBASE_QUOTA_EXCEEDED = true;
    }
  });`;

code = code.replace(searchErrorMeta, replaceErrorMeta);

fs.writeFileSync('src/sync.ts', code);
