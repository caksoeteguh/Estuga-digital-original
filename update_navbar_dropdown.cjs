const fs = require('fs');
let code = fs.readFileSync('src/components/SneatNavbar.tsx', 'utf-8');

const saveLogoutBtnStr = `
              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => {
                    const btn = document.getElementById('save-logout-btn-text');
                    if (btn) btn.innerText = 'Menyimpan...';
                    window.dispatchEvent(new Event('force-save-local'));
                    setTimeout(() => {
                      if (onLogout) {
                        onLogout();
                      } else {
                        alert('Session logout disimulasikan.');
                      }
                      setShowProfileDropdown(false);
                    }, 500);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/20 text-left transition-all cursor-pointer mb-1"
                >
                  <span className="text-emerald-500">💾</span>
                  <span id="save-logout-btn-text">Simpan & Logout</span>
                </button>
                <button 
                  onClick={() => {
`;

code = code.replace(/<div className="p-2 border-t border-slate-100 dark:border-slate-800">\s*<button\s*onClick=\{([^}]+)\}\s*className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-rose-600/m, saveLogoutBtnStr + "\n                    $1}\n                  className=\"w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-rose-600");

fs.writeFileSync('src/components/SneatNavbar.tsx', code);
