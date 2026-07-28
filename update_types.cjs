const fs = require('fs');

let code = fs.readFileSync('src/types.ts', 'utf-8');

// 1. Add gender to Student
code = code.replace(
  "  religion?: string;",
  "  religion?: string;\n  gender?: 'Laki-laki' | 'Perempuan';"
);

// 2. Add 'sholat_jumat' to PrayerAttendance type
code = code.replace(
  "  type: 'sholat_dhuhur';",
  "  type: 'sholat_dhuhur' | 'sholat_jumat';"
);

fs.writeFileSync('src/types.ts', code);
