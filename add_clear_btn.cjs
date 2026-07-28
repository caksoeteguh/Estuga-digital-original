const fs = require('fs');
let content = fs.readFileSync('src/components/AnalyticsDashboard.tsx', 'utf8');

const anchor = /{?\/\* Visual Summary Cards Banner \*\/}?/g;

const newBlock = `{activeRole === 'kepsek' && onClearHistory && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <RefreshCw size={16} />
              Bersihkan Riwayat Data Lama (Reset)
            </h2>
            <p className="text-xs text-rose-700/80 dark:text-rose-300/70 mt-1">
              Hapus semua data riwayat sisa demo (Jurnal, Kinerja, Kehadiran, Nilai, dll) agar dashboard Anda bersih mengikuti data Guru dan Siswa yang baru. Data Guru, Siswa, dan Identitas Sekolah <strong>tidak</strong> akan terhapus.
            </p>
          </div>
          <button
            type="button"
            onClick={triggerClearHistory}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0 flex items-center gap-2"
          >
            <RefreshCw size={14} className={demoSuccess ? "animate-spin" : ""} />
            <span>{demoSuccess ? "Riwayat Bersih! ✨" : "Hapus Semua Riwayat Data"}</span>
          </button>
        </div>
      )}

      {/* Visual Summary Cards Banner */}`;

content = content.replace(anchor, newBlock);

fs.writeFileSync('src/components/AnalyticsDashboard.tsx', content);
console.log('Added clear button');
