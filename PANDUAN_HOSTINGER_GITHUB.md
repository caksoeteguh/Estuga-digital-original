# Panduan Deploy Otomatis ke Hostinger via GitHub (CI/CD) dengan Database MySQL

Panduan ini menjelaskan langkah-langkah untuk menghubungkan pengembangan di AI Studio, sinkronisasi ke GitHub, dan deploy otomatis ke hosting Hostinger dengan database MySQL (tanpa Firebase).

## 1. Persiapan Database MySQL di Hostinger
Karena aplikasi ini akan sepenuhnya menggunakan database MySQL (bukan Firebase), langkah pertama adalah menyiapkan databasenya di server Hostinger:
1. Login ke panel Hostinger (hPanel).
2. Buka menu **Databases** -> **Management** -> **MySQL Databases**.
3. Buat database baru. Contoh: 
   - MySQL database name: `u123456789_estuga`
   - MySQL username: `u123456789_admin`
   - Password: `PasswordRahasiaAnda123!`
4. Buka **phpMyAdmin** dari hPanel.
5. Import file database yang sudah ada di proyek ini (contoh: `estugadigital_v4.sql` atau file `.sql` terbaru) ke dalam database yang baru dibuat tersebut.

## 2. Konfigurasi Koneksi Database PHP
Aplikasi React (Vite) ini akan dibuild dan menghasilkan file statis, namun akan memanggil API PHP yang berada di folder `/public/api/` (folder ini akan disalin ke `/dist/api/` saat build).
Oleh karena itu, file koneksi database PHP Anda harus diarahkan ke database Hostinger Anda.

Buka file `public/api/db.php` (bisa dari GitHub Anda nanti atau File Manager Hostinger setelah deploy pertama), sesuaikan isinya:

```php
<?php
// public/api/db.php
$host = "localhost"; // Di Hostinger biasanya localhost
$user = "u123456789_admin";
$password = "PasswordRahasiaAnda123!";
$database = "u123456789_estuga";

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    die("Koneksi Gagal: " . $conn->connect_error);
}
?>
```
*Catatan: Pastikan repository GitHub Anda disetting PRIVATE agar password database di `db.php` ini tidak dilihat oleh publik. Jika repository PUBLIC, Anda JANGAN mengcommit file ini beserta passwordnya ke GitHub, melainkan edit file `db.php` langsung di File Manager Hostinger setelah deploy.*

## 3. Setup GitHub Actions untuk Deploy Otomatis (CI/CD)
Saya telah membuatkan file konfigurasi deployment di `.github/workflows/deploy.yml`. File ini akan otomatis mem-build (compile) project Node.js / React, lalu meng-upload hasil jadinya (folder `/dist`) ke Hostinger melalui FTP setiap kali Anda push ke GitHub.

Agar GitHub bisa login ke FTP Hostinger, Anda perlu memasukkan kredensial FTP ke rahasia (Secrets) GitHub:
1. Buka halaman Repository GitHub Anda.
2. Klik tab **Settings** -> pilih menu **Secrets and variables** (di sidebar kiri) -> pilih **Actions**.
3. Klik tombol hijau **New repository secret**.
4. Buat 3 secret berikut satu per satu:
   * **Nama:** `FTP_SERVER` 
     **Isi:** Alamat IP server atau nama host FTP Anda (Contoh: `ftp.domainanda.com` atau IP `185.xxx.xxx.xxx`). Bisa dilihat di hPanel Hostinger menu **Files** -> **FTP Accounts**.
   * **Nama:** `FTP_USERNAME` 
     **Isi:** Username FTP Anda di Hostinger (Contoh: `u123456789.domainanda`).
   * **Nama:** `FTP_PASSWORD` 
     **Isi:** Password FTP Anda.

## 4. Penyesuaian Folder Deploy (Jika Menggunakan Subdomain)
Buka file `.github/workflows/deploy.yml`. Di bagian bawah terdapat baris:
```yaml
          local-dir: ./dist/
          server-dir: ./public_html/
```
* Jika Anda menginstall aplikasi ini di domain utama, `server-dir: ./public_html/` sudah tepat.
* Jika Anda menginstallnya di subdomain atau Addon Domain (misal `app.sekolah.com`), Anda perlu menyesuaikan `server-dir` ke folder path subdomain tersebut di Hostinger (misal: `server-dir: ./domains/app.sekolah.com/public_html/`).

## 5. Routing React di Hostinger (.htaccess)
Karena ini adalah aplikasi *Single Page Application (SPA)* React, jika pengguna me-refresh halaman pada rute tertentu, server Apache (Hostinger) akan mencari folder yang tidak ada dan menghasilkan error 404. 
Untuk mencegahnya, saya sudah menyiapkan file `.htaccess` di dalam folder `/public`. File ini akan mengarahkan semua *request* ke `index.html` dan membiarkan React Router mengambil alih. File ini otomatis ikut di-deploy karena ada di dalam folder `/public`.

## 6. Alur Kerja (Workflow) Anda Sehari-hari
Sekarang, alurnya sangat mudah:
1. Anda melakukan penambahan fitur atau *coding* bersama saya (AI) di **Google AI Studio**.
2. Setelah fitur selesai dan dirasa cukup, Anda mengekspor/push perubahan kode ini ke Repository **GitHub** Anda.
3. GitHub Actions akan mendeteksi ada kode baru yang masuk ke branch `main`. Ia akan otomatis menjalankan proses instalasi, *build*, dan mengirim file jadinya ke **Hostinger**.
4. Anda bisa melihat prosesnya di tab **Actions** di GitHub.
5. Selesai! Web Anda di Hostinger sudah ter-update secara instan dengan fitur baru.

---

### Migrasi Penuh ke MySQL (Catatan Pengembangan)
Saat ini beberapa bagian frontend (UI React) masih dirancang untuk menyimpan/membaca data ke State lokal (Simulasi), MockData, atau *Firebase*. 

Agar frontend React bisa *benar-benar* membaca/menyimpan ke database MySQL 50GB di Hostinger:
* Ke depan, kita (Anda dan saya) harus memastikan fungsi-fungsi pemanggilan data di React (*fetch*, *axios*) diarahkan ke skrip PHP yang ada di `/api/...`.
* Anda dapat memberikan instruksi ke saya bertahap, misalnya: *"Buatkan script PHP untuk mengambil data Siswa dari MySQL, lalu hubungkan ke halaman Data Master di React"*. Saya akan membuatkan `public/api/get_students.php` dan mengedit komponen React untuk menggunakan API tersebut.
