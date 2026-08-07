const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `        if (success) {
          localStorage.setItem('last_hostinger_sync', todayStr);
          addNotification('Backup otomatis ke Hostinger berhasil dilakukan!', 'success');
        } else {
          addNotification('Sebagian backup otomatis ke Hostinger gagal. Akan dicoba lagi nanti.', 'error');
        }`;

const insert = `        // Selalu catat waktu percobaan sync hari ini, sukses maupun gagal
        // agar tidak terjadi spam notifikasi berulang setiap menit.
        localStorage.setItem('last_hostinger_sync', todayStr);

        if (success) {
          addNotification('Backup otomatis ke Hostinger berhasil dilakukan!', 'success');
        } else {
          console.warn('Backup otomatis ke Hostinger gagal. Pastikan endpoint api.php sudah ada di server.');
          // addNotification('Sebagian backup otomatis ke Hostinger gagal, namun akan dicoba lagi besok.', 'error'); // Bisa di-uncomment jika butuh notifikasi, saat ini kita silent saja agar tidak mengganggu
        }`;

code = code.replace(search, insert);

fs.writeFileSync('src/App.tsx', code);
