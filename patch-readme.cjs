const fs = require('fs');

let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

const targetStrXampp = `8. File React (Front-End) yang telah dibangun (dist) dapat diletakkan bersama di folder project tersebut.`;
const replacementStrXampp = `8. Seluruh file sistem aplikasi beserta file API (termasuk folder assets, index.html) SUDAH TERMASUK DALAM ZIP INI.`;

const targetStrCpanel = `12. Upload juga hasil build React (isi dari folder "dist") ke dalam public_html.`;
const replacementStrCpanel = `12. Seluruh file Front-End (index.html, assets, dll) SUDAH TERMASUK DALAM ZIP INI dan sudah otomatis di-unpack dalam folder public_html bersama file API. Tidak perlu upload hasil build React secara terpisah.`;

code = code.replace(targetStrXampp, replacementStrXampp);
code = code.replace(targetStrCpanel, replacementStrCpanel);
fs.writeFileSync('src/components/PhpExporter.tsx', code);
