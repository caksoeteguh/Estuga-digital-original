const fs = require('fs');
let code = fs.readFileSync('src/components/DataImporter.tsx', 'utf-8');

// Import BulkPrintStaffCards
code = code.replace(/import BulkPrintCards from '\.\/BulkPrintCards';/, "import BulkPrintCards from './BulkPrintCards';\nimport BulkPrintStaffCards from './BulkPrintStaffCards';");

// Add showStaffBulkPrint state
code = code.replace(/const \[showBulkPrint, setShowBulkPrint\] = useState\(false\);/, "const [showBulkPrint, setShowBulkPrint] = useState(false);\n  const [showStaffBulkPrint, setShowStaffBulkPrint] = useState(false);");

// Render button for Teacher Bulk Print
const teacherPrintButton = `
              {teachers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowStaffBulkPrint(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Printer size={13} />
                  <span>Cetak Massal A4 (9 Kartu)</span>
                </button>
              )}
`;
code = code.replace(/<p className="text-\[11px\] text-gray-400">Menampilkan \{teachers\.length\} data staf pengajar\.\<\/p>\n\s*\<\/div>/, `<p className="text-[11px] text-gray-400">Menampilkan {teachers.length} data staf pengajar.</p>\n              </div>\n${teacherPrintButton}`);

// Render BulkPrintStaffCards modal
const modalRender = `
      {showStaffBulkPrint && (
        <BulkPrintStaffCards 
          staffs={teachers}
          schoolIdentity={schoolIdentity}
          onClose={() => setShowStaffBulkPrint(false)}
        />
      )}
`;
code = code.replace(/\{showBulkPrint && \([\s\S]*?<\/BulkPrintCards>\n\s*\)\}/, `$&${modalRender}`);

fs.writeFileSync('src/components/DataImporter.tsx', code);
