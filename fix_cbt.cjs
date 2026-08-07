const fs = require('fs');

let code = fs.readFileSync('src/components/CBTManager.tsx', 'utf8');

const lines = code.split('\n');
const exportIndex = lines.findIndex(l => l.startsWith('export const exportExamToWord ='));
const cbtIndex = lines.findIndex((l, i) => i > exportIndex && l.startsWith('export default function CBTManager({'));

console.log('exportIndex:', exportIndex);
console.log('cbtIndex:', cbtIndex);

const part1 = lines.slice(0, exportIndex).join('\n');
const part2 = lines.slice(cbtIndex).join('\n');

const exportFunc = `export const exportExamToWord = (exam: CBTExam) => {
  const htmlContent = \`
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="UTF-8">
      <title>Naskah Soal - \${exam.title}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; text-transform: uppercase; }
        .header p { margin: 5px 0; font-size: 14px; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-weight: bold; font-size: 14px; }
        .question-card { margin-bottom: 30px; page-break-inside: avoid; }
        .q-type { font-weight: bold; margin-bottom: 5px; font-size: 14px; }
        .stimulus { font-style: italic; background: #f9f9f9; padding: 10px; border-left: 3px solid #666; margin-bottom: 10px; font-size: 13px; }
        .q-text { margin-bottom: 10px; font-size: 14px; }
        .options { margin-top: 10px; margin-left: 20px; font-size: 14px; }
        .option-item { margin-bottom: 8px; }
        .match-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
        .match-table th, .match-table td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        img { max-width: 100%; max-height: 250px; display: block; margin: 10px 0; border: 1px solid #eee; }
        @media print {
          body { padding: 0; max-width: 100%; }
          .stimulus { background: transparent; border-left: 1px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>\${exam.title}</h1>
        <p>Mata Pelajaran: \${exam.subject}</p>
      </div>
      <div class="meta">
        <span>Kelas: \${exam.className}</span>
        <span>Waktu: \${exam.durationMinutes} Menit</span>
        <span>Total: \${exam.totalQuestions} Soal</span>
      </div>
      <div class="questions-list">
        \${exam.questions.map((q, idx) => \`
          <div class="question-card">
            <div class="q-type">Soal \${idx + 1} (\${q.type.replace('_', ' ').toUpperCase()}) - Bobot: \${q.scoreWeight}</div>
            \${q.stimulus ? \`<div class="stimulus"><strong>Stimulus:</strong><br/>\${q.stimulus}</div>\` : ''}
            \${q.stimulusImage ? \`<img src="\${q.stimulusImage}" alt="Stimulus"/>\` : ''}
            <div class="q-text">\${parseMathForWord(q.questionText)}</div>
            \${q.questionImage ? \`<img src="\${q.questionImage}" alt="Soal"/>\` : ''}
            
            \${q.options ? \`
              <div class="options">
                \${q.options.map(opt => \`
                  <div class="option-item">
                    <strong>\${opt.id}.</strong> \${parseMathForWord(opt.text)}
                    \${opt.image ? \`<img src="\${opt.image}" alt="Opsi" style="max-height: 100px;"/>\` : ''}
                  </div>
                \`).join('')}
              </div>
            \` : ''}
            \${q.matchingPairs ? \`
              <table class="match-table">
                <tr><th>Bagian Kiri (Istilah)</th><th>Bagian Kanan (Cocokkan)</th></tr>
                \${q.matchingPairs.map(mp => \`
                  <tr>
                    <td>
                      \${mp.leftImage ? \`<img src="\${mp.leftImage}" style="max-height: 80px;"/>\` : ''}
                      \${mp.leftText}
                    </td>
                    <td>
                      \${mp.rightImage ? \`<img src="\${mp.rightImage}" style="max-height: 80px;"/>\` : ''}
                      \${mp.rightText}
                    </td>
                  </tr>
                \`).join('')}
              </table>
            \` : ''}
            
            \${(q.type === 'uraian' || q.type === 'isian_singkat') ? \`
              <div style="margin-top: 15px; border-bottom: 1px dashed #ccc; height: 30px;"></div>
              \${q.type === 'uraian' ? \`<div style="border-bottom: 1px dashed #ccc; height: 30px;"></div><div style="border-bottom: 1px dashed #ccc; height: 30px;"></div>\` : ''}
            \` : ''}
          </div>
        \`).join('')}
      </div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
            renderMathInElement(document.body, {
              delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false},
                  {left: '\\\\\\\\(', right: '\\\\\\\\)', display: false},
                  {left: '\\\\\\\\[', right: '\\\\\\\\]', display: true}
              ],
              throwOnError : false
            });
            setTimeout(() => { window.print(); }, 1500);
        });
      </script>
    </body>
    </html>
  \`;
  
  const blob = new Blob(['\\ufeff', htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`Naskah_Soal_\${exam.title.replace(/\\s+/g, '_')}.doc\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
`;

let newCode = part1 + '\n\n' + exportFunc + '\n' + part2;

// Apply button patches manually to newCode

const regexOldInline = /\{\(activeRole !== 'siswa' && activeRole !== 'walimurid'\) && \(\s*<button\s*onClick=\{\(\) => \{\s*const htmlContent = `[\s\S]*?URL\.revokeObjectURL\(url\);\s*\}\}\s*className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"\s*title="Unduh Naskah Soal \(Format Microsoft Word\)"\s*>\s*📄 Unduh Soal \(Word\)\s*<\/button>\s*\)\}/;

newCode = newCode.replace(regexOldInline, `{(activeRole !== 'siswa' && activeRole !== 'walimurid') && (
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

newCode = newCode.replace(draftHeading, replaceDraftHeading);

fs.writeFileSync('src/components/CBTManager.tsx', newCode);
console.log('Fixed CBTManager.tsx');
