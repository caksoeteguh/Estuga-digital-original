const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `          {/* Elegant Stats Grid */}`;

const newStr = `          {/* Clear Demo Data Prompt */}
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <RefreshCw size={16} />
                Bersihkan Riwayat Data Lama
              </h2>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/70 mt-1">
                Jika dashboard masih menampilkan riwayat sisa demo (Jurnal, Kinerja, Kehadiran), klik tombol ini agar data lama terhapus sepenuhnya. Data Master (Siswa, Guru, Identitas) <strong>tidak</strong> akan terhapus.
              </p>
            </div>
            <button
              type="button"
              onClick={clearHistoryData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Hapus Semua Riwayat Data</span>
            </button>
          </div>

          {/* Elegant Stats Grid */}`;

content = content.replace(targetStr, newStr);

// Also replace "Bapak Kepala Sekolah!" with dynamic or generic
content = content.replace(/Selamat bekerja, Bapak Kepala Sekolah!/g, 'Selamat bekerja!');

fs.writeFileSync('src/App.tsx', content);
console.log('Added clear button to kepsek dashboard');
