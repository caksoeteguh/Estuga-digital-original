# Panduan Instalasi EstuGa Digital v4 di Localhost (XAMPP) & Hosting

Aplikasi ini dibangun menggunakan teknologi React (Vite) untuk frontend. Dokumen ini akan memandu Anda untuk menyiapkan file build frontend agar dapat dihosting menggunakan XAMPP (Localhost) maupun layanan Hosting (cPanel / DirectAdmin), beserta instalasi databasenya.

---

## 1. Persiapan Database (MySQL/MariaDB)

1. Pastikan **XAMPP** sudah berjalan (aktifkan **Apache** dan **MySQL**).
2. Buka browser dan akses `http://localhost/phpmyadmin`.
3. Buat database baru:
   - Klik menu **Baru (New)**.
   - Masukkan nama database: `estugadigital_v4`.
   - Klik tombol **Buat (Create)**.
4. Import tabel database:
   - Pilih database `estugadigital_v4` yang baru saja dibuat.
   - Klik tab **Impor (Import)** di bagian atas.
   - Klik tombol **Choose File** / **Pilih File**, lalu cari file `estugadigital_v4.sql` yang ada di direktori ini.
   - Gulir ke bawah dan klik tombol **Kirim (Go)** atau **Import**.
5. Jika berhasil, Anda akan melihat pesan sukses dan tabel-tabel (seperti `teachers`, `students`, `attendance`, dll) sudah terbuat di dalam database.

---

## 2. Persiapan Aplikasi (Build Frontend)

Karena aplikasi ini menggunakan React + Vite, kode mentahnya perlu dikompilasi (build) menjadi file statis (`HTML`, `CSS`, `JS`) agar bisa langsung dibaca oleh web server (seperti Apache di XAMPP).

Jika Anda mengekspor source code ini, Anda perlu melakukan *build* terlebih dahulu (menggunakan Node.js):
1. Buka terminal/Command Prompt di dalam folder aplikasi ini.
2. Pastikan Anda sudah menginstal **Node.js**.
3. Jalankan perintah instalasi modul (jika belum):
   ```bash
   npm install
   ```
4. Lakukan proses build:
   ```bash
   npm run build
   ```
5. Setelah selesai, akan muncul folder baru bernama `dist/`. Di dalam folder `dist/` inilah file-file aplikasi web siap pakai berada.

---

## 3. Cara Menginstal di Localhost (XAMPP)

1. Buka direktori instalasi XAMPP Anda, biasanya di `C:\xampp\htdocs\`.
2. Buat folder baru dengan nama `estugadigital` (contoh: `C:\xampp\htdocs\estugadigital`).
3. Salin (copy) **semua isi** dari dalam folder `dist/` yang telah di-build tadi, lalu paste ke dalam folder `C:\xampp\htdocs\estugadigital\`.
4. Buka browser Anda dan akses: 
   👉 `http://localhost/estugadigital`

*(Catatan: Jika Anda menambahkan API Backend berbasis PHP, simpan file PHP tersebut di folder ini juga, misalnya di dalam folder `api/` lalu sesuaikan konfigurasi koneksi database PHP Anda dengan root, password kosong, dan db `estugadigital_v4`)*.

---

## 4. Cara Menginstal di Hosting (cPanel)

1. Login ke akun **cPanel** hosting Anda.
2. Buka **MySQL Databases** untuk membuat database baru (misal: `u12345_estugadigital_v4`) dan User Database-nya. Berikan hak akses penuh (All Privileges) user ke database tersebut.
3. Buka **phpMyAdmin** di cPanel.
4. Pilih database yang baru dibuat, lalu masuk ke tab **Import** dan unggah file `estugadigital_v4.sql`.
5. Kembali ke beranda cPanel, lalu buka **File Manager**.
6. Masuk ke dalam direktori `public_html` (atau subdomain tujuan Anda).
7. Kompres (zip) **isi dari folder `dist/`** di komputer Anda (bukan folder dist-nya yang di-zip, melainkan file dan folder di dalamnya).
8. **Upload** file zip tersebut ke dalam `public_html` di cPanel.
9. **Extract** file zip tersebut.
10. Aplikasi Anda sekarang sudah bisa diakses melalui domain utama atau subdomain Anda.

---

## FAQ Tambahan

**Q: Bagaimana cara menghubungkan React Frontend ke MySQL Database?**
Frontend React berjalan di sisi klien (browser), sehingga tidak dapat terhubung langsung ke MySQL dengan aman. Anda perlu membuat jembatan (API Backend) menggunakan PHP (misalnya dengan framework Laravel atau PHP Native PDO) atau Node.js (Express). Aplikasi versi berjalan saat ini menggunakan *Mock Data* (data simulasi pada local storage) sebagai purwarupa untuk demonstrasi. Anda cukup mengganti endpoint *Mock* di source code dengan URL API backend Anda (misal `http://localhost/estugadigital/api/get_teachers.php`).
