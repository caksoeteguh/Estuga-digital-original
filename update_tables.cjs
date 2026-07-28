const fs = require('fs');

// Update StudentIdCard
let studentContent = fs.readFileSync('src/components/StudentIdCard.tsx', 'utf8');
const studentRegex = /\{\/\* Credentials Table Layout \*\/\}[\s\S]*?<\/table>\s*<\/div>/;
const studentReplacement = `{/* Credentials Table Layout */}
        <div className="relative z-10 mt-1.5 flex-1 w-full flex flex-col">
          <div className="rounded-lg overflow-hidden shadow-sm bg-white/95 backdrop-blur-md border border-white/40">
            <table className="w-full text-left border-collapse text-[9px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-400/20 text-[8px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-1 px-1.5 w-1/3">Layanan</th>
                  <th className="py-1 px-1.5 border-l border-slate-400/20 w-1/3">User</th>
                  <th className="py-1 px-1.5 border-l border-slate-400/20 w-1/3">Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400/20 font-mono">
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-1 px-1.5 font-bold text-indigo-700">Ujian CBT</td>
                  <td className="py-1 px-1.5 border-l border-slate-400/20 font-black text-slate-800 text-[10px] break-all">{student.usernameCbt}</td>
                  <td className="py-1 px-1.5 border-l border-slate-400/20 font-black text-slate-800 text-[10px] break-all">{student.passwordCbt}</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-1 px-1.5 font-bold text-sky-700">E-Learning</td>
                  <td className="py-1 px-1.5 border-l border-slate-400/20 font-black text-slate-800 text-[10px] break-all">{student.id}</td>
                  <td className="py-1 px-1.5 border-l border-slate-400/20 font-black text-slate-800 text-[10px] break-all">{student.dob.replace(/-/g, '')}</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-1 px-1.5 font-bold text-emerald-700">Portal Wali</td>
                  <td className="py-1 px-1.5 border-l border-slate-400/20 font-black text-slate-800 text-[10px] break-all">{student.usernameParent}</td>
                  <td className="py-1 px-1.5 border-l border-slate-400/20 font-black text-slate-800 text-[10px] break-all">{student.passwordParent}</td>
                </tr>
              </tbody>
            </table>
          </div>`;

if (studentContent.match(studentRegex)) {
  fs.writeFileSync('src/components/StudentIdCard.tsx', studentContent.replace(studentRegex, studentReplacement));
  console.log('Updated StudentIdCard table');
}

// Update StaffIdCard
let staffContent = fs.readFileSync('src/components/StaffIdCard.tsx', 'utf8');
const staffRegex = /<div className="relative z-10 mt-2 mx-auto w-full max-w-\[240px\]">[\s\S]*?<\/table>\s*<\/div>/;
const staffReplacement = `<div className="relative z-10 mt-2 mx-auto w-full max-w-[240px]">
          <div className="rounded-lg overflow-hidden border border-white/40 shadow-sm bg-white/95 backdrop-blur-md">
            <table className="w-full text-left border-collapse text-[9px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-400/20 text-[8px] font-bold text-slate-600 uppercase tracking-wider text-center">
                  <th className="py-1.5 px-2 w-1/2">Username / Email</th>
                  <th className="py-1.5 px-2 border-l border-slate-400/20 w-1/2">Password</th>
                </tr>
              </thead>
              <tbody className="font-mono text-center">
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="py-2 px-2 font-black text-slate-800 text-[11px] break-all">{staff.username}</td>
                  <td className="py-2 px-2 border-l border-slate-400/20 font-black text-slate-800 text-[11px] break-all">{staff.password || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>`;

if (staffContent.match(staffRegex)) {
  fs.writeFileSync('src/components/StaffIdCard.tsx', staffContent.replace(staffRegex, staffReplacement));
  console.log('Updated StaffIdCard table');
}
