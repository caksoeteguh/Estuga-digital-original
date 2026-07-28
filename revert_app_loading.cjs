const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const \[isAppLoaded, setIsAppLoaded\] = useState\(false\);\n  /g, '');
content = content.replace(/setIsAppLoaded\(true\);\n/g, '');
content = content.replace(/setIsAppLoaded\(true\);/g, '');

const loadingScreen = `if (!session) {
    if (!isAppLoaded) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-200">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-semibold animate-pulse">Menyiapkan Aplikasi...</p>
        </div>
      );
    }
    return (
      <LoginGate`;

const newStart = `if (!session) {
    return (
      <LoginGate`;

content = content.replace(loadingScreen, newStart);

fs.writeFileSync('src/App.tsx', content);
console.log('Reverted isAppLoaded');
