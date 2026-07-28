const fs = require('fs');
let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

// Also replace the button onClick and UI
let buttonSection = `
            <div className="flex gap-2">
              <button
                onClick={handleDownloadXampp}
                className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-sm"
              >
                <Download size={14} />
                <span>Unduh Paket XAMPP (.zip)</span>
              </button>
              <button
                onClick={handleDownloadCode}`;

let newButtonSection = `
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadPackage('cpanel')}
                className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-sm"
              >
                <Server size={14} />
                <span>Unduh Paket cPanel</span>
              </button>
              <button
                onClick={() => handleDownloadPackage('xampp')}
                className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-sm"
              >
                <Download size={14} />
                <span>Unduh Paket XAMPP</span>
              </button>
              <button
                onClick={handleDownloadCode}`;

code = code.replace(buttonSection, newButtonSection);
fs.writeFileSync('src/components/PhpExporter.tsx', code);
