#!/bin/bash
sed -i '47,151c\
  const menuItems = [\
    {\
      id: '\''dashboard'\'',\
      label: '\''Dashboard'\'',\
      icon: LayoutDashboard,\
      roles: ['\''admin'\'', '\''guru'\'', '\''kepsek'\'', '\''siswa'\'', '\''walimurid'\'']\
    },\
    {\
      id: '\''barcode-scan'\'',\
      label: '\''Presensi QR Code'\'',\
      icon: QrCode,\
      roles: ['\''admin'\'', '\''guru'\'']\
    },\
    {\
      id: '\''rekap-presensi'\'',\
      label: '\''Rekap Presensi Siswa'\'',\
      icon: ClipboardList,\
      roles: ['\''admin'\'', '\''guru'\'']\
    },\
    {\
      id: '\''daftar-nilai'\'',\
      label: '\''Daftar Nilai Siswa'\'',\
      icon: FileText,\
      roles: ['\''guru'\'', '\''admin'\'']\
    },\
    {\
      id: '\''jurnal-harian'\'',\
      label: '\''Jurnal Harian'\'',\
      icon: BookOpen,\
      roles: ['\''guru'\'', '\''admin'\'', '\''kepsek'\'']\
    },\
    {\
      id: '\''cbt-exam'\'',\
      label: '\''Penilaian CBT'\'',\
      icon: Award,\
      roles: ['\''guru'\'', '\''siswa'\'', '\''admin'\'', '\''walimurid'\'']\
    },\
    {\
      id: '\''e-learning'\'',\
      label: '\''E-Learning'\'',\
      icon: GraduationCap,\
      roles: ['\''guru'\'', '\''siswa'\'', '\''admin'\'', '\''walimurid'\'']\
    },\
    {\
      id: '\''data-master'\'',\
      label: '\''Data Kelengkapan'\'',\
      icon: Users,\
      roles: ['\''admin'\'']\
    },\
    {\
      id: '\''kepsek-overview'\'',\
      label: '\''Monitoring Kinerja'\'',\
      icon: TrendingUp,\
      roles: ['\''kepsek'\'']\
    },\
    {\
      id: '\''parent-realtime'\'',\
      label: '\''Presensi & Nilai Anak'\'',\
      icon: BookmarkCheck,\
      roles: ['\''walimurid'\'']\
    },\
    {\
      id: '\''calendar'\'',\
      label: '\''Kalender Akademik'\'',\
      icon: Calendar,\
      roles: ['\''admin'\'', '\''guru'\'', '\''kepsek'\'', '\''siswa'\'', '\''walimurid'\'']\
    },\
    {\
      id: '\''wa-logs'\'',\
      label: '\''Notifikasi WA'\'',\
      icon: MessageSquare,\
      roles: ['\''admin'\'']\
    },\
    {\
      id: '\''rekap-sholat'\'',\
      label: '\''Rekap Sholat Jamaah'\'',\
      icon: ClipboardList,\
      roles: ['\''admin'\'', '\''guru'\'']\
    },\
    {\
      id: '\''php-export'\'',\
      label: '\''Ekspor PHP & MySQL'\'',\
      icon: Database,\
      roles: ['\''admin'\'']\
    }\
  ];' src/components/SneatSidebar.tsx
