const fs = require('fs');
let code = fs.readFileSync('src/components/SneatNavbar.tsx', 'utf-8');

const saveButtonStr = `
        {/* Explicit Save Button for user peace of mind */}
        <button
          onClick={() => {
            const btn = document.getElementById('save-indicator-btn');
            if (btn) {
              btn.innerHTML = '<span class="text-xs">⏳</span> Menyimpan...';
              btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500');
              btn.classList.remove('bg-white', 'dark:bg-[#2b2c40]', 'text-slate-600', 'dark:text-slate-300');
            }
            // Trigger local storage save forcefully via a custom event if needed
            window.dispatchEvent(new Event('force-save-local'));
            setTimeout(() => {
              if (btn) {
                btn.innerHTML = '<span class="text-xs">✅</span> Tersimpan';
                setTimeout(() => {
                  btn.innerHTML = '<span class="text-xs">💾</span> Simpan';
                  btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-500');
                  btn.classList.add('bg-white', 'dark:bg-[#2b2c40]', 'text-slate-600', 'dark:text-slate-300');
                }, 2000);
              }
            }, 800);
          }}
          id="save-indicator-btn"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#2b2c40] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          title="Simpan perubahan ke memori perangkat"
        >
          <span className="text-xs">💾</span> Simpan
        </button>
`;

code = code.replace(/\{\/\* Direct Logout Button \*\/\}/, saveButtonStr + '\n        {/* Direct Logout Button */}');

fs.writeFileSync('src/components/SneatNavbar.tsx', code);
