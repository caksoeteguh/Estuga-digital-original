const fs = require('fs');

let code = fs.readFileSync('src/components/BarcodeScanner.tsx', 'utf-8');

const targetStr = `      setRecentScan({
        student,
        time: timeNowStr,
        type: 'sholat_dhuhur',
        status: 'success',
        message: \`Hadir Sholat Dhuhur tercatat. (Tidak ada pesan WA, rekap masuk ke akun Guru Agama & Orang Tua)\`
      });
    }`;

const replacementStr = `      setRecentScan({
        student,
        time: timeNowStr,
        type: 'sholat_dhuhur',
        status: 'success',
        message: \`Hadir Sholat Dhuhur tercatat. (Tidak ada pesan WA, rekap masuk ke akun Guru Agama & Orang Tua)\`
      });
    } else if (mode === 'sholat_jumat') {
      const today = new Date().getDay();
      if (today !== 5) { // Only Friday
        playBeepSound(false);
        setRecentScan({
          student, time: timeNowStr, type: 'sholat_jumat', status: 'error',
          message: \`Absen Sholat Jum'at hanya berlaku pada hari Jum'at.\`
        });
        return;
      }
      
      if (student.religion && student.religion.toLowerCase() !== 'islam') {
         playBeepSound(false);
         setRecentScan({
           student, time: timeNowStr, type: 'sholat_jumat', status: 'error',
           message: \`Absen Sholat Jum'at ini hanya untuk siswa beragama Islam.\`
         });
         return;
      }

      if (student.gender && student.gender.toLowerCase() !== 'laki-laki') {
         playBeepSound(false);
         setRecentScan({
           student, time: timeNowStr, type: 'sholat_jumat', status: 'error',
           message: \`Absen Sholat Jum'at ini hanya diwajibkan untuk siswa laki-laki.\`
         });
         return;
      }

      const existingPrayer = prayerAttendanceRef.current.find(a => a.studentId === student.id && a.date === todayStr && a.type === 'sholat_jumat');
      if (existingPrayer) {
        playBeepSound(false);
        setRecentScan({
          student, time: timeNowStr, type: 'sholat_jumat', status: 'duplicate',
          message: \`\${student.name} sudah tercatat hadir Sholat Jum'at hari ini.\`
        });
        return;
      }

      const newPrayerAtt: PrayerAttendance = {
        id: \`pray_\${Date.now()}\`,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        date: todayStr,
        time: timeNowStr,
        type: 'sholat_jumat',
        status: 'hadir'
      };

      playBeepSound(true);
      
      if (online) {
        onAddPrayerAttendance(newPrayerAtt);
      } else {
        addOfflineQueue('addPrayerAttendance', newPrayerAtt);
        onAddPrayerAttendance(newPrayerAtt);
      }

      setRecentScan({
        student,
        time: timeNowStr,
        type: 'sholat_jumat',
        status: 'success',
        message: \`Hadir Sholat Jum'at tercatat. (Tidak ada pesan WA, rekap masuk ke akun Guru Agama & Orang Tua)\`
      });
    }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/BarcodeScanner.tsx', code);
