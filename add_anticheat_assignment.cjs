const fs = require('fs');
let content = fs.readFileSync('src/components/AssignmentManager.tsx', 'utf8');

// 1. Add cheat states
const stateTarget = `  const [solveSuccess, setSolveSuccess] = useState(false);`;
const stateReplacement = `  const [solveSuccess, setSolveSuccess] = useState(false);
  
  // Anti-cheat / Lockdown Mode state
  const [cheatAttempts, setCheatAttempts] = useState<number>(0);
  const [showCheatWarning, setShowCheatWarning] = useState<boolean>(false);`;
if (!content.includes('cheatAttempts')) {
  content = content.replace(stateTarget, stateReplacement);
}

// 2. Add useEffect for anti-cheat
const effectTarget = `  const handleSolveSubmit = (e: React.FormEvent) => {`;
const effectReplacement = `  const submitRef = useRef<() => void>();
  useEffect(() => {
    submitRef.current = () => {
      if (!activeTaskToSolve) return;
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSolveSubmit(fakeEvent);
    };
  }, [activeTaskToSolve, studentAnswers, studentPhoto]);

  useEffect(() => {
    if (!activeTaskToSolve || solveSuccess) {
      setCheatAttempts(0);
      setShowCheatWarning(false);
      return;
    }

    // Disable right click, copy, paste, cut inside the exam
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("⚠️ Tindakan mencurigakan terdeteksi. Jangan menyalin (copy) soal.");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("⚠️ Dilarang memotong/cut soal.");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("⚠️ Dilarang menyisipkan/paste dari sumber luar. Kerjakan secara mandiri.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C, Ctrl+V
      const isCtrl = e.ctrlKey || e.metaKey;
      if (
        e.key === 'F12' ||
        (isCtrl && e.shiftKey && e.key?.toLowerCase() === 'i') ||
        (isCtrl && e.key?.toLowerCase() === 'u') ||
        (isCtrl && e.key?.toLowerCase() === 'c') ||
        (isCtrl && e.key?.toLowerCase() === 'v')
      ) {
        e.preventDefault();
      }
    };

    // Tab Switch Detection (Anti-Cheat / Focus Lost)
    const handleWindowBlur = () => {
      setCheatAttempts(prev => {
        const nextCount = prev + 1;
        if (nextCount >= 3) {
          // Auto submit the exam!
          setTimeout(() => {
            if (submitRef.current) submitRef.current();
          }, 100);
        } else {
          setShowCheatWarning(true);
        }
        return nextCount;
      });
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCut);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeTaskToSolve, solveSuccess]);

  const handleSolveSubmit = (e: React.FormEvent) => {`;
if (!content.includes('handleWindowBlur')) {
  content = content.replace(effectTarget, effectReplacement);
}

// 3. Add Cheat warning UI and anti-cheat tag
const uiTarget = `          {solveSuccess && (
            <div className="absolute inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center text-white space-y-3">`;
const uiReplacement = `          {/* Anti-cheat Alert warning modal */}
          {showCheatWarning && (
            <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#111625] rounded-2xl max-w-md w-full p-6 border-2 border-rose-500 shadow-2xl text-center space-y-4 my-auto">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                    Tindakan Mencurigakan
                  </h3>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Kamu terdeteksi membuka tab/aplikasi lain! ({cheatAttempts}/3 Pelanggaran)
                  </p>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg text-left">
                  <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                    Tugas ini diawasi oleh sistem anti-contek otomatis. Jangan membuka Google, ChatGPT, atau aplikasi lainnya. Jika mencapai 3 pelanggaran, tugas akan <strong>dikumpulkan paksa dengan nilai saat ini</strong>.
                  </p>
                </div>

                <button
                  onClick={() => setShowCheatWarning(false)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg cursor-pointer"
                >
                  Saya Mengerti, Kembali Kerjakan
                </button>
              </div>
            </div>
          )}

          {solveSuccess && (
            <div className="absolute inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center text-white space-y-3">`;
content = content.replace(uiTarget, uiReplacement);

// 4. Also add the visual indicator for anti cheat
const indicatorTarget = `              <p className="text-xs text-slate-400 mt-1">Mapel: {activeTaskToSolve.subject} • Pengajar: {activeTaskToSolve.teacherName}</p>
            </div>
            <button`;
const indicatorReplacement = `              <p className="text-xs text-slate-400 mt-1">Mapel: {activeTaskToSolve.subject} • Pengajar: {activeTaskToSolve.teacherName}</p>
              
              <div className="mt-3 flex items-center justify-center gap-2 bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-[10px] font-bold font-mono max-w-fit mx-auto">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>ANTI-CHEAT AKTIF ({cheatAttempts}/3 PELANGGARAN)</span>
              </div>
            </div>
            <button`;
content = content.replace(indicatorTarget, indicatorReplacement);

// 5. Add user-select-none to the form container
content = content.replace(/<form onSubmit=\{handleSolveSubmit\} className="grid grid-cols-1 lg:grid-cols-12 gap-8">/g, 
`<form onSubmit={handleSolveSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">`);

fs.writeFileSync('src/components/AssignmentManager.tsx', content);
console.log('Added anti-cheat to assignments');
