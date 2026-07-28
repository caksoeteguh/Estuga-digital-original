const fs = require('fs');
let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

const downloadXamppStr = `
  const handleDownloadXampp = async () => {
    try {
      const zip = new JSZip();
      const xamppFolder = zip.folder("estugadigital_xampp");
      
      // Add SQL schema
      xamppFolder.file("database_schema/estugadigital_V6.sql", sqlSchema);
      
      // Add PHP API files
      const apiFolder = xamppFolder.folder("htdocs/api");
      apiFolder.file("db.php", phpDb);
      apiFolder.file("absen_scan.php", phpAbsen);
      apiFolder.file("wa_notif.php", phpWa);
      
      // Generate the XAMPP README instructions
      const readme = \`
INSTALASI ESTUGA DIGITAL V6 DI XAMPP LOCALHOST
==============================================

1. Pastikan XAMPP telah terinstall dan modul Apache serta MySQL sudah berjalan (Start).

2. Buka phpMyAdmin di browser Anda: http://localhost/phpmyadmin/
3. Buat database baru bernama: estugadigital_V6
4. Pilih tab "Import", klik "Choose File", dan pilih file: database_schema/estugadigital_V6.sql
5. Klik "Go" / "Import" untuk menjalankan skema database.

6. Buka folder instalasi XAMPP Anda, masuk ke folder "htdocs" (biasanya C:\\xampp\\htdocs\\)
7. Ekstrak (copy) folder "api" dan konten di dalamnya ke dalam folder project Anda di htdocs, misalnya C:\\xampp\\htdocs\\estugadigital\\api\\
8. File React (Front-End) yang telah dibangun (dist) dapat diletakkan bersama di folder project tersebut.

Aplikasi Anda sudah siap digunakan!
\`;
      xamppFolder.file("README_INSTALL.txt", readme);
      
      const content = await zip.generateAsync({ type: "blob" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      element.download = "estugadigital_xampp_package.zip";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error("Failed to generate zip", err);
      alert("Gagal membuat file ZIP.");
    }
  };
`;

if (!code.includes('handleDownloadXampp')) {
  code = code.replace("const handleDownloadCode = () => {", downloadXamppStr + "\n  const handleDownloadCode = () => {");
}

const buttonsReplacement = `
            <div className="flex gap-2">
              <button
                onClick={handleDownloadXampp}
                className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-sm"
              >
                <Download size={14} />
                <span>Unduh Paket XAMPP (.zip)</span>
              </button>
              <button
                onClick={handleDownloadCode}
`;
code = code.replace(/<div className="flex gap-2">\s*<button\s*onClick=\{handleDownloadCode\}/, buttonsReplacement);

fs.writeFileSync('src/components/PhpExporter.tsx', code);
