const fs = require('fs');
let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

// Replace handleDownloadXampp with handleDownloadPackage
const oldFn = `  const handleDownloadXampp = async () => {
    try {
      const zip = new JSZip();
      const xamppFolder = zip.folder("estugadigital_xampp");
      
      // Add SQL schema
      xamppFolder.file("database_schema/estugadigital_v7.sql", sqlSchema);
      
      // Add PHP API files
      const apiFolder = xamppFolder.folder("htdocs/api");
      apiFolder.file("db.php", phpDb);
      apiFolder.file("absen_scan.php", phpAbsen);
      apiFolder.file("wa_notif.php", phpWa);
      
      // Generate the XAMPP README instructions
      const readme = \`INSTALASI ESTUGA DIGITAL V7 DI XAMPP LOCALHOST
==============================================

1. Pastikan XAMPP telah terinstall dan modul Apache serta MySQL sudah berjalan (Start).

2. Buka phpMyAdmin di browser Anda: http://localhost/phpmyadmin/
3. Buat database baru bernama: estugadigital_v7
4. Pilih tab "Import", klik "Choose File", dan pilih file: database_schema/estugadigital_v7.sql
5. Klik "Go" / "Import" untuk menjalankan skema database.

6. Buka folder instalasi XAMPP Anda, masuk ke folder "htdocs" (biasanya C:/xampp/htdocs/)
7. Ekstrak (copy) folder "api" dan konten di dalamnya ke dalam folder project Anda di htdocs, misalnya C:/xampp/htdocs/estugadigital\\api\\
8. File React (Front-End) yang telah dibangun (dist) dapat diletakkan bersama di folder project tersebut.

Aplikasi Anda sudah siap digunakan!
\`;
      xamppFolder.file("README_INSTALL.txt", readme);
      
      
      // Generate .htaccess for Apache CORS & Clean URLs
      const htaccess = \`<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
\`;
      apiFolder.file(".htaccess", htaccess.trim());
      const phpIndex = \`<?php
header("Content-Type: application/json");
echo json_encode(["status" => "success", "message" => "AdminGuruku API V7 is running properly on XAMPP."]);
?>\`;
      apiFolder.file("index.php", phpIndex.trim());

      // Add Root .htaccess for React SPA routing
      const rootHtaccessCode = \`
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
\`;
      xamppFolder.folder("htdocs").file(".htaccess", rootHtaccessCode.trim());

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
  };`;

const newFn = `  const handleDownloadPackage = async (type: 'xampp' | 'cpanel') => {
    try {
      const zip = new JSZip();
      const isCpanel = type === 'cpanel';
      const rootFolderName = isCpanel ? "estugadigital_cpanel" : "estugadigital_xampp";
      const targetFolder = isCpanel ? "public_html" : "htdocs";
      const zipFolder = zip.folder(rootFolderName);
      
      // Add SQL schema
      zipFolder.file("database_schema/estugadigital_v7.sql", sqlSchema);
      
      // Add PHP API files
      const apiFolder = zipFolder.folder(\`\${targetFolder}/api\`);
      apiFolder.file("db.php", phpDb);
      apiFolder.file("absen_scan.php", phpAbsen);
      apiFolder.file("wa_notif.php", phpWa);
      
      // Generate the README instructions
      const readmeXampp = \`INSTALASI ESTUGA DIGITAL V7 DI XAMPP LOCALHOST
==============================================

1. Pastikan XAMPP telah terinstall dan modul Apache serta MySQL sudah berjalan (Start).

2. Buka phpMyAdmin di browser Anda: http://localhost/phpmyadmin/
3. Buat database baru bernama: estugadigital_v7
4. Pilih tab "Import", klik "Choose File", dan pilih file: database_schema/estugadigital_v7.sql
5. Klik "Go" / "Import" untuk menjalankan skema database.

6. Buka folder instalasi XAMPP Anda, masuk ke folder "htdocs" (biasanya C:/xampp/htdocs/)
7. Ekstrak (copy) folder "api" dan konten di dalamnya ke dalam folder project Anda di htdocs, misalnya C:/xampp/htdocs/estugadigital\\api\\
8. File React (Front-End) yang telah dibangun (dist) dapat diletakkan bersama di folder project tersebut.

Aplikasi Anda sudah siap digunakan!
\`;

      const readmeCpanel = \`INSTALASI ESTUGA DIGITAL V7 DI CPANEL HOSTING
==============================================

1. Login ke akun cPanel Hosting Anda.

2. Buka MySQL Databases.
3. Buat database baru (misal: domain_estugadigital_v7).
4. Buat user database baru dan tambahkan user tersebut ke database dengan privileges "ALL PRIVILEGES".
5. Buka phpMyAdmin di cPanel.
6. Pilih database yang baru dibuat, klik tab "Import", dan upload file: database_schema/estugadigital_v7.sql
7. Buka folder "public_html/api" di paket ini, lalu edit file "db.php":
   Ubah DB_USER, DB_PASS, dan DB_NAME sesuai dengan yang Anda buat di langkah 3 & 4.

8. Buka File Manager di cPanel.
9. Masuk ke folder "public_html".
10. Upload seluruh isi dari folder "public_html" yang ada di paket zip ini ke dalam public_html di cPanel Anda.
11. Pastikan file .htaccess (file tersembunyi) juga ikut ter-upload.
12. Upload juga hasil build React (isi dari folder "dist") ke dalam public_html.

Aplikasi Anda sudah online dan siap digunakan!
\`;
      zipFolder.file("README_INSTALL.txt", isCpanel ? readmeCpanel : readmeXampp);
      
      // Generate .htaccess for Apache CORS & Clean URLs
      const htaccess = \`<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
\`;
      apiFolder.file(".htaccess", htaccess.trim());
      const phpIndex = \`<?php
header("Content-Type: application/json");
echo json_encode(["status" => "success", "message" => "AdminGuruku API V7 is running properly on \${isCpanel ? 'cPanel' : 'XAMPP'}."]);
?>\`;
      apiFolder.file("index.php", phpIndex.trim());

      // Add Root .htaccess for React SPA routing
      const rootHtaccessCode = \`
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
\`;
      zipFolder.folder(targetFolder).file(".htaccess", rootHtaccessCode.trim());

      const content = await zip.generateAsync({ type: "blob" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      element.download = \`\${rootFolderName}_package.zip\`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error("Failed to generate zip", err);
      alert("Gagal membuat file ZIP.");
    }
  };`;

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

if (code.includes('onClick={handleDownloadXampp}')) {
  // It's using XAMPP directly
  code = code.replace(oldFn, newFn);
  code = code.replace(buttonSection, newButtonSection);
  fs.writeFileSync('src/components/PhpExporter.tsx', code);
  console.log("Updated handleDownloadXampp successfully.");
} else {
  console.error("Could not find handleDownloadXampp function");
}
