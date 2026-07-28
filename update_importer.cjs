const fs = require('fs');

let code = fs.readFileSync('src/components/DataImporter.tsx', 'utf-8');

// State
code = code.replace(
  "const [sReligion, setSReligion] = useState('Islam');",
  "const [sReligion, setSReligion] = useState('Islam');\n  const [sGender, setSGender] = useState<'Laki-laki'|'Perempuan'>('Laki-laki');"
);

// Edit
code = code.replace(
  "setSReligion(student.religion || 'Islam');",
  "setSReligion(student.religion || 'Islam');\n    setSGender(student.gender || 'Laki-laki');"
);

// Cancel edit
code = code.replace(
  "setSReligion('Islam');\n    setPName",
  "setSReligion('Islam');\n    setSGender('Laki-laki');\n    setPName"
);

// Update student object
code = code.replace(
  "className: sClass,\n        religion: sReligion,\n        parentName: pName",
  "className: sClass,\n        religion: sReligion,\n        gender: sGender,\n        parentName: pName"
);

// New student object
code = code.replace(
  "className: sClass,\n        religion: sReligion,\n        parentName: pName",
  "className: sClass,\n        religion: sReligion,\n        gender: sGender,\n        parentName: pName"
);

// JSX
const jsxTarget = `<div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Rombongan Belajar (Kelas)</label>`;

const jsxReplacement = `<div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Rombongan Belajar (Kelas)</label>`;

code = code.replace(jsxTarget, jsxReplacement);

const jsxTarget2 = `</select>
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-3 space-y-3">`;

const jsxReplacement2 = `</select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Jenis Kelamin</label>
                  <select
                    value={sGender}
                    onChange={(e) => setSGender(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-3 space-y-3">`;

code = code.replace(jsxTarget2, jsxReplacement2);

fs.writeFileSync('src/components/DataImporter.tsx', code);
