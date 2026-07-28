const fs = require('fs');
let code = fs.readFileSync('src/components/DataImporter.tsx', 'utf-8');

const target1 = `<span className="text-[10px] text-gray-400 font-medium block">Agama: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{student.religion || 'Islam'}</span></span>`;
const replacement1 = `<span className="text-[10px] text-gray-400 font-medium block">Agama: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{student.religion || 'Islam'}</span></span>
                        <span className="text-[10px] text-gray-400 font-medium block">JK: <span className="text-pink-600 dark:text-pink-400 font-bold">{student.gender || 'Laki-laki'}</span></span>`;

code = code.replace(target1, replacement1);

const target2 = `<span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/40">
                          {student.religion || 'Islam'}
                        </span>`;
const replacement2 = `<span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/40">
                          {student.religion || 'Islam'}
                        </span>
                        <span className="bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 text-[10px] font-bold px-2 py-0.5 rounded border border-pink-100/50 dark:border-pink-900/40">
                          {student.gender || 'Laki-laki'}
                        </span>`;
code = code.replace(target2, replacement2);
fs.writeFileSync('src/components/DataImporter.tsx', code);
