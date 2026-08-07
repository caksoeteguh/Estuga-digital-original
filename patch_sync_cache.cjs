const fs = require('fs');
let code = fs.readFileSync('src/sync.ts', 'utf8');

const searchAgg = `  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (window.FIREBASE_QUOTA_EXCEEDED) return;
    if (snapshot.exists()) {`;

const replaceAgg = `  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (window.FIREBASE_QUOTA_EXCEEDED) return;
    if (snapshot.metadata.fromCache) return; // Mencegah data lama dari cache menimpa data lokal baru
    if (snapshot.exists()) {`;

code = code.replace(searchAgg, replaceAgg);

const searchMeta = `  const unsubscribe = onSnapshot(metaRef, (snapshot) => {
    if (window.FIREBASE_QUOTA_EXCEEDED) return;
    if (snapshot.exists()) {`;

const replaceMeta = `  const unsubscribe = onSnapshot(metaRef, (snapshot) => {
    if (window.FIREBASE_QUOTA_EXCEEDED) return;
    if (snapshot.metadata.fromCache) return; // Mencegah data lama dari cache menimpa data lokal baru
    if (snapshot.exists()) {`;

code = code.replace(searchMeta, replaceMeta);

const searchError1 = `    if (error.message && error.message.includes("Quota exceeded")) {
       window.FIREBASE_QUOTA_EXCEEDED = true;
       alert("🚨 Firebase Quota Exceeded! Aplikasi akan beralih ke Mode Lokal Sementara. Data yang Anda ubah hari ini mungkin tidak tersinkronisasi ke pengguna lain sampai besok. Jangan hapus cache browser Anda.");
    }`;

const replaceError1 = `    if (error.message && error.message.includes("Quota exceeded")) {
       if (!window.FIREBASE_QUOTA_EXCEEDED) {
           window.FIREBASE_QUOTA_EXCEEDED = true;
           alert("🚨 Kuota Server Tersinkronisasi (Firebase) telah habis untuk hari ini. Aplikasi otomatis beralih ke Mode Lokal (Offline). Data Anda aman di perangkat ini, namun tidak akan tersinkronisasi ke perangkat lain hingga kuota di-reset besok.");
       }
    }`;

code = code.replace(searchError1, replaceError1);

fs.writeFileSync('src/sync.ts', code);
