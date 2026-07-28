const fs = require('fs');
const file = 'src/components/BulkPrintCards.tsx';
let text = fs.readFileSync(file, 'utf8');

const tableBlock = `
                        {/* Credentials Table */}
                        <div className="relative z-10 mt-1.5 flex-1 flex flex-col justify-center">
                          <div className="bg-black/30 rounded-lg border border-white/10 overflow-hidden w-full">
                            <table className="w-full text-left font-mono border-collapse" style={{ fontSize: '3mm' }}>
                              <thead>
                                <tr className="bg-black/40 text-slate-300 text-center" style={{ fontSize: '2.5mm' }}>
                                  <th className="py-[1.2mm] px-[1.5mm] font-bold border-b border-white/10" style={{ width: '25%' }}>Portal</th>
                                  <th className="py-[1.2mm] px-[1.5mm] font-bold border-b border-white/10 border-l border-white/10">Username</th>
                                  <th className="py-[1.2mm] px-[1.5mm] font-bold border-b border-white/10 border-l border-white/10">Password</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-white/5">
                                  <td className="py-[1.5mm] px-[1.5mm] text-indigo-300 font-sans font-bold text-center leading-none">CBT</td>
                                  <td className="py-[1.5mm] px-[1.5mm] text-amber-400 font-bold tracking-wide border-l border-white/5 leading-none">{student.usernameCbt}</td>
                                  <td className="py-[1.5mm] px-[1.5mm] text-amber-400 font-bold tracking-wide border-l border-white/5 leading-none">{student.passwordCbt}</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                  <td className="py-[1.5mm] px-[1.5mm] text-sky-300 font-sans font-bold text-center leading-none">E-Learn</td>
                                  <td className="py-[1.5mm] px-[1.5mm] text-sky-300 font-bold tracking-wide border-l border-white/5 leading-none">{student.id}</td>
                                  <td className="py-[1.5mm] px-[1.5mm] text-sky-300 font-bold tracking-wide border-l border-white/5 leading-none">{student.dob.replace(/-/g, '')}</td>
                                </tr>
                                <tr>
                                  <td className="py-[1.5mm] px-[1.5mm] text-emerald-300 font-sans font-bold text-center leading-none">Wali</td>
                                  <td className="py-[1.5mm] px-[1.5mm] text-emerald-400 font-bold tracking-wide border-l border-white/5 leading-none">{student.usernameParent}</td>
                                  <td className="py-[1.5mm] px-[1.5mm] text-emerald-400 font-bold tracking-wide border-l border-white/5 leading-none">{student.passwordParent}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <p className="text-slate-300 italic leading-none text-center" style={{ fontSize: '2mm', marginTop: '1.5mm' }}>
                            Simpan kerahasiaan akun Anda.
                          </p>
                        </div>
`;

// There are two occurrences, one for screen preview and one for print
// We can use a regex to replace everything between {/* Credentials side-by-side grid */} and {/* Bottom card system credit */}

text = text.replace(/\{\/\* Credentials side-by-side grid \*\/\}[\s\S]*?(?=\{\/\* Bottom card system credit \*\/\})/g, tableBlock + '                        ');

fs.writeFileSync(file, text);
