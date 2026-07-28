#!/bin/bash
sed -i '/case '\''rekap-sholat'\'':/i \
      case '\''rekap-presensi'\'':\n        return (\n          <AttendanceRecap\n            students={students}\n            attendance={s_attendance}\n          />\n        );' src/App.tsx
