const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Semangat Memimpin! {schoolIdentity?.kepsekName || "Bapak/Ibu Kepala Sekolah"} 💼</h1>`;

const newStr = `<div className="flex items-center gap-3">
                  {schoolIdentity?.logo && (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center text-xl md:text-2xl border border-white/20 shrink-0">
                      {schoolIdentity.logo}
                    </div>
                  )}
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Semangat Memimpin! {schoolIdentity?.kepsekName || "Bapak/Ibu Kepala Sekolah"}</h1>
                </div>`;

content = content.replace(targetStr, newStr);
fs.writeFileSync('src/App.tsx', content);
console.log('Updated logo in kepsek dashboard');
