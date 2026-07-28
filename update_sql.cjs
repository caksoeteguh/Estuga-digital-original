const fs = require('fs');
let code = fs.readFileSync('src/components/PhpExporter.tsx', 'utf-8');

const oldSqlNote = `-- Catatan: 
-- Silakan buat database terlebih dahulu di phpMyAdmin/cPanel (misal: estugadigital_v7).
-- Setelah dibuat, klik database tersebut, lalu pilih tab Import dan masukkan file ini.`;

code = code.replace(oldSqlNote, `-- Database Creation (For XAMPP/Localhost)
-- Jika di cPanel, hapus 2 baris di bawah ini atau buat DB manual dan abaikan errornya.
CREATE DATABASE IF NOT EXISTS estugadigital_v7;
USE estugadigital_v7;`);

fs.writeFileSync('src/components/PhpExporter.tsx', code);
