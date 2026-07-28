const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Hide demo data prompt if admin is not "admin"
const demoPromptReplacement = `
            {/* Simulation/Demo Help Notice - Hide if using real credentials */}
            {(schoolIdentity?.adminEmail === 'admin' || !schoolIdentity?.adminEmail) && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-indigo-50 dark:bg-indigo-950/20 border-l-4 border-indigo-500 rounded-lg gap-4 mb-8">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                    <span className="text-base">🚀</span> Uji Coba Lebih Cepat?
                  </h3>
                  <p className="text-xs text-indigo-750/90 dark:text-indigo-300/80 max-w-2xl">
                    Kami telah menyiapkan **contoh data sekolah riil yang saling terhubung** (siswa, wali murid, guru, ujian CBT, tugas, &amp; pesan WhatsApp) agar pengguna awam dapat langsung melihat keterkaitan antar pengguna tanpa harus mengisi manual dari nol!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetToFullSimulationData}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0 cursor-pointer hover:scale-[1.02] flex items-center gap-2 self-start md:self-center font-bold"
                >
                  <span className="text-xs">🔄</span>
                  <span>Muat Contoh Data Terhubung Lengkap</span>
                </button>
              </div>
            )}
`;
code = code.replace(/\{\/\* Simulation\/Demo Help Notice \*\/\}\s*<div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-indigo-50 dark:bg-indigo-950\/20 border-l-4 border-indigo-500 rounded-lg gap-4 mb-8">[\s\S]*?<\/div>\s*<\/div>/m, demoPromptReplacement + "\n          </div>");

// Let's manually write the change to be sure
fs.writeFileSync('src/App.tsx', code);
