#!/bin/bash
sed -i '/id: '\''barcode-scan'\'',/,/},/a \
    {\n      id: '\''rekap-presensi'\'',\n      label: '\''Rekap Presensi Siswa'\'',\n      icon: ClipboardList,\n      roles: ['\''admin'\'', '\''guru'\'']\n    },' src/components/SneatSidebar.tsx
