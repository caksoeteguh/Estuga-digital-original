const fs = require('fs');
let code = fs.readFileSync('src/components/BarcodeScanner.tsx', 'utf-8');

// Update scan mode types
code = code.replace(
  "scanMode, setScanMode] = useState<'masuk' | 'pulang' | 'sholat_dhuhur'>('masuk');",
  "scanMode, setScanMode] = useState<'masuk' | 'pulang' | 'sholat_dhuhur' | 'sholat_jumat'>('masuk');"
);

code = code.replace(
  "type: 'masuk' | 'pulang' | 'sholat_dhuhur';",
  "type: 'masuk' | 'pulang' | 'sholat_dhuhur' | 'sholat_jumat';"
);

// Add button for Sholat Jumat
const buttonHTML = `<button
                  id="scan-mode-sholat"
                  onClick={() => setScanMode('sholat_dhuhur')}
                  className={\`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer
                    \${scanMode === 'sholat_dhuhur' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}\`}
                >
                  Sholat Dhuhur
                </button>`;

const replacementButtonHTML = `<button
                  id="scan-mode-sholat"
                  onClick={() => setScanMode('sholat_dhuhur')}
                  className={\`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer
                    \${scanMode === 'sholat_dhuhur' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}\`}
                >
                  Sholat Dhuhur
                </button>
                <button
                  id="scan-mode-sholat-jumat"
                  onClick={() => setScanMode('sholat_jumat')}
                  className={\`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer
                    \${scanMode === 'sholat_jumat' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}\`}
                >
                  Sholat Jum'at
                </button>`;

code = code.replace(buttonHTML, replacementButtonHTML);

fs.writeFileSync('src/components/BarcodeScanner.tsx', code);
