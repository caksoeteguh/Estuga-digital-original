Panduan Pemasangan di XAMPP
===========================

File-file di dalam folder "xampp_deploy" ini disiapkan agar Anda dapat dengan mudah meng-online-kan aplikasi secara lokal menggunakan XAMPP (Apache & MySQL).

Langkah-langkah Pemasangan:

1. Import Database MySQL:
   - Buka XAMPP Control Panel dan jalankan Apache dan MySQL.
   - Buka browser dan akses http://localhost/phpmyadmin
   - Buat database baru dengan nama "estugadigital_v5" (atau langsung import karena script SQL sudah mengandung perintah CREATE DATABASE).
   - Klik tab "Import", pilih file "estugadigital_v5.sql" yang ada di folder ini, lalu klik "Go" (Kirim).

2. Salin File Aplikasi (Frontend SPA):
   - Aplikasi React ini telah kami atur dengan metode "Vite Build".
   - Jika Anda memiliki akses ke kode sumber dan ingin mem-build ulang, jalankan perintah `npm run build` di terminal (pastikan Node.js terinstall). File hasil jadinya akan berada di folder `dist`.
   - Salin SEMUA isi folder `dist` (termasuk folder assets, file index.html, dll) ke dalam folder `xampp_deploy/htdocs/`.

3. Salin ke Server Apache (XAMPP):
   - Salin folder `htdocs` yang ada di dalam `xampp_deploy` (dan sekarang sudah berisi file dari langkah 2) ke folder instalasi XAMPP Anda, biasanya di `C:\xampp\htdocs\`.
   - Anda bisa mengganti nama foldernya menjadi "estugadigital", misal: `C:\xampp\htdocs\estugadigital\`.

4. Pengaturan .htaccess (PENTING untuk SPA):
   - Kami sudah menyediakan file `.htaccess` di dalam folder `htdocs`. Ini sangat penting agar proses perutean (routing) aplikasi React berfungsi dengan baik di Apache tanpa terjadi error 404 saat halaman di-refresh.
   - Jika Anda menaruh aplikasi di dalam sub-folder (seperti `C:\xampp\htdocs\estugadigital\`), pastikan Anda mengubah baris `RewriteBase /` di dalam file `.htaccess` menjadi `RewriteBase /estugadigital/`.

5. Akses Aplikasi:
   - Buka browser (Chrome, Edge, Opera, Safari) di laptop atau HP Android apa pun yang terhubung dalam satu jaringan Wi-Fi/LAN yang sama.
   - Akses alamat: http://localhost/estugadigital (jika di laptop)
   - Atau akses via IP Address, misalnya: http://192.168.1.5/estugadigital (untuk HP Android, sesuaikan dengan IP laptop Anda).

6. Integrasi Backend (PHP & MySQL):
   - Kami menyediakan folder `api` dengan contoh `db.php` untuk koneksi database.
   - Anda dapat membuat file-file PHP lainnya di folder `api` (contoh: `api/get_assignments.php`) untuk melakukan proses CRUD ke MySQL.

Selesai. Aplikasi sudah dioptimasi agar ringan, cepat, dan kompatibel dengan browser modern apa pun (Progressive Web App support dapat ditambahkan selanjutnya).
