const fs = require('fs');
let content = fs.readFileSync('src/components/AssignmentManager.tsx', 'utf8');

const regex = /              <div className="flex flex-col sm:flex-row gap-2 mt-3">/g;

const newString = `              {/* Image Reference Gallery */}
              {(qImage || mcOptionImages.some(img => img !== '')) && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Galeri Referensi Gambar (Soal Ini)</h4>
                  <div className="flex flex-wrap gap-3">
                    {qImage && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">Gambar Soal</span>
                        <div className="h-20 w-20 rounded border dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden p-1">
                          <img src={qImage} alt="Soal" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                    {mcOptionImages.map((img, idx) => img ? (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Opsi {String.fromCharCode(65 + idx)}</span>
                        <div className="h-20 w-20 rounded border dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden p-1">
                          <img src={img} alt={\`Opsi \${String.fromCharCode(65 + idx)}\`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 mt-3">`;

content = content.replace(regex, newString);

fs.writeFileSync('src/components/AssignmentManager.tsx', content);
console.log('Added image gallery to AssignmentManager');
