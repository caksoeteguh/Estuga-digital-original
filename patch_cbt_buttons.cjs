const fs = require('fs');
let code = fs.readFileSync('src/components/CBTManager.tsx', 'utf8');

// Replace the inline button click logic with exportExamToWord(exam)
const oldInline = `                    {(activeRole !== 'siswa' && activeRole !== 'walimurid') && (
                      <button 
                        onClick={() => {
                          const htmlContent = \``;
                          
const regexOldInline = /\{\(activeRole !== 'siswa' && activeRole !== 'walimurid'\) && \(\s*<button\s*onClick=\{\(\) => \{\s*const htmlContent = `[\s\S]*?URL\.revokeObjectURL\(url\);\s*\}\}\s*className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"\s*title="Unduh Naskah Soal \(Format Microsoft Word\)"\s*>\s*📄 Unduh Soal \(Word\)\s*<\/button>\s*\)\}/;

code = code.replace(regexOldInline, `{(activeRole !== 'siswa' && activeRole !== 'walimurid') && (
                      <button 
                        onClick={() => exportExamToWord(exam)}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        title="Unduh Naskah Soal (Format Microsoft Word)"
                      >
                        📄 Unduh Soal (Word)
                      </button>
                    )}`);
                    

const draftHeading = `          {/* List of current draft questions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200">
              Draft Pertanyaan Ujian ({questions.length} Soal)
            </h3>`;

const replaceDraftHeading = `          {/* List of current draft questions */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200">
                Draft Pertanyaan Ujian ({questions.length} Soal)
              </h3>
              {questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => exportExamToWord({
                    id: 'draft',
                    title: newTitle || 'Draft_Ujian',
                    subject: newSubject || 'Pelajaran',
                    className: newClass || 'Kelas',
                    durationMinutes: newDuration || 60,
                    totalQuestions: questions.length,
                    questions: questions,
                    isRandomized: false,
                    isStrictActive: false,
                    isLocked: false,
                    startTime: '',
                    endTime: '',
                    date: '',
                    createdAt: new Date().toISOString()
                  })}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  📄 Export ke Word
                </button>
              )}
            </div>`;

code = code.replace(draftHeading, replaceDraftHeading);

fs.writeFileSync('src/components/CBTManager.tsx', code);
