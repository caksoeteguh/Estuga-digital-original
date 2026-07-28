const fs = require('fs');
let content = fs.readFileSync('src/components/CBTManager.tsx', 'utf8');

const regex = /              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-3">/g;

const newString = `              {/* Image Reference Gallery */}
              {(qImage || mcOptionImages.some(img => img !== '')) && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-[#1e1e2d] rounded-lg border border-slate-200 dark:border-[#3e405b]">
                  <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Galeri Referensi Gambar (Soal Ini)</h4>
                  <div className="flex flex-wrap gap-3">
                    {qImage && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">Gambar Soal</span>
                        <div className="h-20 w-20 rounded border dark:border-[#3e405b] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden p-1">
                          <img src={qImage} alt="Soal" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                    {mcOptionImages.map((img, idx) => img ? (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Opsi {String.fromCharCode(65 + idx)}</span>
                        <div className="h-20 w-20 rounded border dark:border-[#3e405b] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden p-1">
                          <img src={img} alt={\`Opsi \${String.fromCharCode(65 + idx)}\`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-3">`;

content = content.replace(regex, newString);

fs.writeFileSync('src/components/CBTManager.tsx', content);
console.log('Added image gallery');
