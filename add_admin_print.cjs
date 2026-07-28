const fs = require('fs');
let code = fs.readFileSync('src/components/DataImporter.tsx', 'utf-8');

const adminPrintBtn = `
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStaffForCard({
                      id: scAdminEmail || 'admin',
                      name: 'Administrator Sistem',
                      role: 'admin',
                      username: scAdminEmail || 'admin',
                      password: scAdminPassword || 'admin123',
                      subject: 'Administrator'
                    })}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <CreditCard size={14} />
                    <span>Cetak Kartu Admin</span>
                  </button>
                </div>
`;

code = code.replace(/<div className="space-y-4">\n\s*<div className="p-3 bg-slate-50 dark:bg-slate-900\/50 rounded-xl border border-slate-100 dark:border-\[\#3e405b\]\/60 space-y-3">\n\s*<h3 className="font-bold text-sm text-slate-800 dark:text-white">Admin Sistem<\/h3>/, 
`$&${adminPrintBtn}`);

fs.writeFileSync('src/components/DataImporter.tsx', code);
