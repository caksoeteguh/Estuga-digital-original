const fs = require('fs');
let code = fs.readFileSync('src/components/SneatNavbar.tsx', 'utf-8');

const replacement = `
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
                    if (onLogout) {
                      onLogout();
                    } else {
                      alert('Session logout disimulasikan.');
                    }
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left transition-all cursor-pointer"
                >
                  <LogOut size={14} className="text-rose-500" />
                  <span>Logout Sesi</span>
                </button>
              </div>
`;

code = code.replace(/<div className="p-2 border-t border-slate-100 dark:border-slate-800">[\s\S]*?<\/button>\s*<\/div>/m, replacement.trim() + "\n            </div>");

fs.writeFileSync('src/components/SneatNavbar.tsx', code);
