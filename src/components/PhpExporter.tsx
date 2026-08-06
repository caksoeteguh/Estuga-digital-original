import { useState } from 'react';
import JSZip from 'jszip';
import { Database, FileCode, CheckCircle, Copy, Download, Server } from 'lucide-react';

export default function PhpExporter() {
  const [activeCodeTab, setActiveCodeTab] = useState<'sql' | 'db' | 'absen' | 'wa'>('sql');
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- ==========================================
-- EstugaDigital - MySQL / MariaDB Schema
-- Kompatibel dengan semua versi MySQL & MariaDB
-- ==========================================

-- Database Creation (For XAMPP/Localhost)
-- Jika di cPanel, hapus 2 baris di bawah ini atau buat DB manual dan abaikan errornya.
-- Database Creation (For XAMPP/Localhost)
-- CREATE DATABASE IF NOT EXISTS estugadigital_v7;
-- USE estugadigital_v7;

-- 1. Tabel Siswa (Kredensial Siswa & Orang Tua)
CREATE TABLE IF NOT EXISTS siswa (
    nis VARCHAR(20) NOT NULL PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    kelas VARCHAR(20) NOT NULL,
    nama_ortu VARCHAR(150) NOT NULL,
    phone_ortu VARCHAR(30) NOT NULL,
    username_cbt VARCHAR(50) NOT NULL UNIQUE,
    password_cbt VARCHAR(100) NOT NULL,
    username_parent VARCHAR(50) NOT NULL UNIQUE,
    password_parent VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Guru Mata Pelajaran
CREATE TABLE IF NOT EXISTS guru (
    nip VARCHAR(30) NOT NULL PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    mata_pelajaran VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Absensi (Presensi Kartu Barcode)
CREATE TABLE IF NOT EXISTS absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    tanggal DATE NOT NULL,
    jam_masuk TIME NULL,
    jam_pulang TIME NULL,
    status ENUM('hadir', 'sakit', 'izin', 'alfa') DEFAULT 'hadir',
    keterangan_tertulis TEXT,
    wa_notified_in TINYINT(1) DEFAULT 0,
    wa_notified_out TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES siswa(nis) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_attendance (student_id, tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Jurnal Harian Mengajar Guru
CREATE TABLE IF NOT EXISTS jurnal_mengajar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    teacher_nip VARCHAR(30) NOT NULL,
    topik_belajar VARCHAR(255) NOT NULL,
    metode_belajar VARCHAR(255) NOT NULL,
    catatan_kelas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_nip) REFERENCES guru(nip) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel CBT Ujian / Penilaian
CREATE TABLE IF NOT EXISTS cbt_ujian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    tanggal DATE NOT NULL,
    durasi_menit INT DEFAULT 45,
    is_published TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Soal CBT (Mendukung 6 tipe soal)
CREATE TABLE IF NOT EXISTS cbt_soal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ujian_id INT NOT NULL,
    tipe_soal ENUM('pg_sederhana', 'pg_kompleks', 'benar_salah', 'menjodohkan', 'isian_singkat', 'uraian') NOT NULL,
    teks_soal TEXT NOT NULL,
    opsi_jawaban_json JSON NULL, -- Untuk opsi pilihan ganda
    kunci_jawaban TEXT NULL,       -- Untuk kunci PG, B/S, Isian
    bobot_nilai INT DEFAULT 10,
    FOREIGN KEY (ujian_id) REFERENCES cbt_ujian(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Hasil Nilai CBT Siswa
CREATE TABLE IF NOT EXISTS cbt_hasil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ujian_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    nilai INT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    catatan_guru TEXT,
    FOREIGN KEY (ujian_id) REFERENCES cbt_ujian(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES siswa(nis) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

  const phpDb = `<?php
/**
 * EstugaDigital - Koneksi Database Universal PDO
 * Kompatibel dengan semua PHP 5.6, 7.x, 8.x, 9.x
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'u263814864_user');
define('DB_PASS', 'ilham@ERNA092420');
define('DB_NAME', 'u263814864_estugadigital');

try {
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        )
    );
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode(['status' => 'error', 'message' => 'DB_ERROR: ' . $e->getMessage()]));
}
?>`;

  const phpAbsen = `<?php
/**
 * EstugaDigital - Scanner Absensi Barcode API & Controller
 * File: absen_scan.php
 */
require_once 'db.php';
require_once 'wa_notif.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Metode request tidak valid']);
    exit;
}

$nis = isset($_POST['nis']) ? trim($_POST['nis']) : '';
$mode = isset($_POST['mode']) ? trim($_POST['mode']) : 'masuk'; // masuk atau pulang
$tanggal_hari_ini = date('Y-m-d');
$jam_sekarang = date('H:i:s');

if (empty($nis)) {
    echo json_encode(['status' => 'error', 'message' => 'Nomor Induk Siswa (NIS) kosong']);
    exit;
}

// 1. Cek keberadaan siswa
$stmt = $db->prepare("SELECT * FROM siswa WHERE nis = ?");
$stmt->execute([$nis]);
$siswa = $stmt->fetch();

if (!$siswa) {
    echo json_encode(['status' => 'error', 'message' => 'Siswa dengan NIS tersebut tidak ditemukan!']);
    exit;
}

if ($mode === 'masuk') {
    // 2. Cek apakah sudah absen masuk hari ini
    $check_stmt = $db->prepare("SELECT * FROM absensi WHERE student_id = ? AND tanggal = ?");
    $check_stmt->execute([$nis, $tanggal_hari_ini]);
    $absensi_hari_ini = $check_stmt->fetch();

    if ($absensi_hari_ini) {
        echo json_encode(['status' => 'duplicate', 'message' => 'Siswa ' . $siswa['nama_lengkap'] . ' sudah melakukan presensi masuk hari ini.']);
        exit;
    }

    // 3. Masukkan data presensi masuk
    $insert_stmt = $db->prepare("INSERT INTO absensi (student_id, tanggal, jam_masuk, status, wa_notified_in) VALUES (?, ?, ?, 'hadir', 1)");
    $insert_stmt->execute([$nis, $tanggal_hari_ini, $jam_sekarang]);

    // 4. Kirim Notifikasi WhatsApp Wali Murid (Simulasi API)
    $pesan_wa = "Presensi Masuk: Yth. Bapak/Ibu " . $siswa['nama_ortu'] . ", dengan hormat kami sampaikan bahwa putra/putri Anda atas nama *" . $siswa['nama_lengkap'] . "* (NIS: *" . $siswa['nis'] . "*, Kelas: *" . $siswa['kelas'] . "*) telah melakukan presensi masuk sekolah dengan memindai kartu barcode pada pukul *" . date('H:i') . "* WIB. Semoga lancar dalam belajar hari ini. Terima kasih. EstugaDigital.";
    
    kirim_notifikasi_wa($siswa['phone_ortu'], $pesan_wa);

    echo json_encode([
        'status' => 'success',
        'message' => 'Absensi masuk tercatat untuk ' . $siswa['nama_lengkap'],
        'time' => $jam_sekarang,
        'wa_sent' => true
    ]);

} else {
    // PRESENSI PULANG
    $check_stmt = $db->prepare("SELECT * FROM absensi WHERE student_id = ? AND tanggal = ?");
    $check_stmt->execute([$nis, $tanggal_hari_ini]);
    $absensi_hari_ini = $check_stmt->fetch();

    if (!$absensi_hari_ini) {
        echo json_encode(['status' => 'error', 'message' => 'Siswa ' . $siswa['nama_lengkap'] . ' belum melakukan presensi masuk hari ini!']);
        exit;
    }

    if (!empty($absensi_hari_ini['jam_pulang'])) {
        echo json_encode(['status' => 'duplicate', 'message' => 'Siswa ' . $siswa['nama_lengkap'] . ' sudah mencatatkan jam pulang hari ini pada pukul ' . $absensi_hari_ini['jam_pulang']]);
        exit;
    }

    // Update jam pulang
    $update_stmt = $db->prepare("UPDATE absensi SET jam_pulang = ?, wa_notified_out = 1 WHERE student_id = ? AND tanggal = ?");
    $update_stmt->execute([$jam_sekarang, $nis, $tanggal_hari_ini]);

    // Kirim notifikasi WA pulang
    $pesan_wa = "Presensi Pulang: Yth. Bapak/Ibu " . $siswa['nama_ortu'] . ", kami menginfokan bahwa putra/putri Anda atas nama *" . $siswa['nama_lengkap'] . "* (NIS: *" . $siswa['nis'] . "*) telah melakukan presensi pulang sekolah pada pukul *" . date('H:i') . "* WIB. Hati-hati di jalan. Terima kasih. EstugaDigital.";
    
    kirim_notifikasi_wa($siswa['phone_ortu'], $pesan_wa);

    echo json_encode([
        'status' => 'success',
        'message' => 'Absensi pulang tercatat untuk ' . $siswa['nama_lengkap'],
        'time' => $jam_sekarang,
        'wa_sent' => true
    ]);
}
?>`;

  const phpWa = `<?php
/**
 * EstugaDigital - Integrasi API Notifikasi WhatsApp Gateway
 * File: wa_notif.php
 */

/**
 * Mengirimkan pesan notifikasi WhatsApp ke Wali Murid menggunakan cURL API
 * Kompatibel dengan penyedia WhatsApp Gateway lokal (Fonnte, Woo-WA, RuangWA, dll)
 */
function kirim_notifikasi_wa($no_tujuan, $isi_pesan) {
    // Format nomor HP agar standar internasional (+62 / 62)
    $no_tujuan = preg_replace('/[^0-9]/', '', $no_tujuan);
    if (substr($no_tujuan, 0, 1) === '0') {
        $no_tujuan = '62' . substr($no_tujuan, 1);
    }

    // Silakan ganti URL endpoint & Token sesuai penyedia WhatsApp Gateway Anda
    $api_url = "https://api.fonnte.com/send"; 
    $token   = "YOUR_API_TOKEN_HERE";

    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => $api_url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => array(
            'target' => $no_tujuan,
            'message' => $isi_pesan,
            'countryCode' => '62', // kode negara Indonesia
        ),
        CURLOPT_HTTPHEADER => array(
            "Authorization: " . $token // Masukkan API Key token di header
        ),
    ));

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
        // Log error jika diperlukan
        error_log("WA Gateway Error: " . $err);
        return false;
    } else {
        return true;
    }
}
?>`;

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  
  const handleDownloadPackage = async (type: 'xampp' | 'cpanel') => {
    try {
      const zip = new JSZip();
      const isCpanel = type === 'cpanel';
      const rootFolderName = isCpanel ? "estugadigital_cpanel" : "estugadigital_xampp";
      const targetFolder = isCpanel ? "public_html" : "htdocs";
      const zipFolder = zip.folder(rootFolderName);
      
      // Add SQL schema
      if(zipFolder) {
        zipFolder.file("database_schema/estugadigital_v7.sql", sqlSchema);
        
        // Add PHP API files
        const apiFolder = zipFolder.folder(`api`);
        if(apiFolder) {
            apiFolder.file("db.php", phpDb);
            apiFolder.file("absen_scan.php", phpAbsen);
            apiFolder.file("wa_notif.php", phpWa);
            
            // Generate .htaccess for Apache CORS & Clean URLs
            const htaccess = `<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
`;
            apiFolder.file(".htaccess", htaccess.trim());
            const phpIndex = `<?php
header("Content-Type: application/json");
echo json_encode(["status" => "success", "message" => "EstugaDigital API V7 is running properly on ${isCpanel ? 'cPanel' : 'XAMPP'}."]);
?>`;
            apiFolder.file("index.php", phpIndex.trim());
            apiFolder.file("save_relational.php", "<?php\nheader(\"Access-Control-Allow-Origin: *\");\nheader(\"Access-Control-Allow-Methods: POST, OPTIONS\");\nheader(\"Access-Control-Allow-Headers: Content-Type\");\nheader(\"Content-Type: application/json; charset=UTF-8\");\n\nrequire_once 'db.php';\n\nif ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {\n    exit(0);\n}\n\n$input = file_get_contents(\"php://input\");\n$request = json_decode($input, true);\n\nif (!$request || !isset($request['table']) || !isset($request['data'])) {\n    echo json_encode([\"status\" => \"error\", \"message\" => \"Payload tidak valid.\"]);\n    exit;\n}\n\n$frontend_table = $request['table'];\n$data = $request['data'];\n\n// ==== KONFIGURASI MAPPING TABEL ====\n$table_map = [\n    'students' => 'siswa',\n    'teachers' => 'guru',\n    'attendance' => 'absensi',\n    'journals' => 'jurnal_mengajar',\n    'exams' => 'cbt_ujian',\n    'results' => 'cbt_hasil'\n];\n\n// ==== KONFIGURASI MAPPING KOLOM ====\n$column_map = [\n    'siswa' => [\n        'id' => 'nis',\n        'name' => 'nama_lengkap',\n        'pob' => 'tempat_lahir',\n        'dob' => 'tanggal_lahir',\n        'className' => 'kelas',\n        'parentName' => 'nama_ortu',\n        'parentPhone' => 'phone_ortu',\n        'usernameCbt' => 'username_cbt',\n        'passwordCbt' => 'password_cbt',\n        'usernameParent' => 'username_parent',\n        'passwordParent' => 'password_parent'\n    ],\n    'guru' => [\n        'id' => 'nip',\n        'name' => 'nama_lengkap',\n        'subject' => 'mata_pelajaran',\n        'username' => 'username',\n        'password' => 'password'\n    ],\n    'absensi' => [\n        'id' => 'id',\n        'studentId' => 'student_id',\n        'date' => 'tanggal',\n        'timeIn' => 'jam_masuk',\n        'timeOut' => 'jam_pulang',\n        'status' => 'status',\n        'notes' => 'keterangan_tertulis',\n        'notifiedIn' => 'wa_notified_in',\n        'notifiedOut' => 'wa_notified_out'\n    ],\n    'jurnal_mengajar' => [\n        'id' => 'id',\n        'date' => 'tanggal',\n        'className' => 'kelas',\n        'subject' => 'subject_name',\n        'teacherName' => 'teacher_nip',\n        'topic' => 'topik_belajar',\n        'method' => 'metode_belajar',\n        'notes' => 'catatan_kelas'\n    ],\n    'cbt_ujian' => [\n        'id' => 'id',\n        'title' => 'judul',\n        'subject' => 'subject',\n        'className' => 'kelas',\n        'date' => 'tanggal',\n        'durationMinutes' => 'durasi_menit',\n        'isPublished' => 'is_published'\n    ],\n    'cbt_hasil' => [\n        'id' => 'id',\n        'examId' => 'ujian_id',\n        'studentId' => 'student_id',\n        'score' => 'nilai',\n        'submittedAt' => 'submitted_at',\n        'teacherFeedback' => 'catatan_guru'\n    ]\n];\n\n$mysql_table = isset($table_map[$frontend_table]) ? $table_map[$frontend_table] : $frontend_table;\n\ntry {\n    $db->exec(\"SET FOREIGN_KEY_CHECKS = 0;\");\n    \n    // Auto create generic tables if not mapped\n    if (!isset($table_map[$frontend_table]) && count($data) > 0) {\n        $columns = array_keys($data[0]);\n        $colDefs = [];\n        foreach ($columns as $col) {\n            $colDefs[] = \"`{$col}` LONGTEXT\";\n        }\n        $colDefString = implode(\", \", $colDefs);\n        $db->exec(\"CREATE TABLE IF NOT EXISTS `{$mysql_table}` ({$colDefString}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\");\n    }\n\n    $db->beginTransaction();\n    \n    if (isset($table_map[$frontend_table])) {\n        $db->exec(\"DELETE FROM `\" . $mysql_table . \"`\");\n    } else {\n        $db->exec(\"TRUNCATE TABLE `\" . $mysql_table . \"`\");\n    }\n    \n    if (count($data) > 0) {\n        if (isset($column_map[$mysql_table])) {\n            $current_map = $column_map[$mysql_table];\n            $mysql_columns = [];\n            foreach (array_keys($data[0]) as $frontend_col) {\n                if (isset($current_map[$frontend_col])) {\n                    $mysql_columns[] = $current_map[$frontend_col];\n                }\n            }\n        } else {\n            $mysql_columns = array_keys($data[0]);\n        }\n        \n        if (count($mysql_columns) > 0) {\n            $colNames = implode(\", \", array_map(function($c) { return \"`{$c}`\"; }, $mysql_columns));\n            $placeholders = implode(\", \", array_map(function($c) { return \":\".$c; }, $mysql_columns));\n            \n            $insertQuery = \"INSERT INTO `{$mysql_table}` ({$colNames}) VALUES ({$placeholders})\";\n            $stmtInsert = $db->prepare($insertQuery);\n            \n            foreach ($data as $row) {\n                $params = [];\n                foreach ($row as $frontend_col => $value) {\n                    $mysql_col = null;\n                    if (isset($column_map[$mysql_table][$frontend_col])) {\n                        $mysql_col = $column_map[$mysql_table][$frontend_col];\n                    } else if (!isset($column_map[$mysql_table])) {\n                        $mysql_col = $frontend_col;\n                    }\n                    \n                    if ($mysql_col) {\n                        if (is_array($value) || is_object($value)) {\n                            $params[\":\".$mysql_col] = json_encode($value);\n                        } else {\n                            $params[\":\".$mysql_col] = $value;\n                        }\n                    }\n                }\n                if (count($params) > 0) {\n                    $stmtInsert->execute($params);\n                }\n            }\n        }\n    }\n    \n    $db->commit();\n    $db->exec(\"SET FOREIGN_KEY_CHECKS = 1;\");\n    echo json_encode([\"status\" => \"success\", \"message\" => \"Data {$frontend_table} berhasil disinkronisasi.\"]);\n} catch (PDOException $e) {\n    if ($db->inTransaction()) {\n        $db->rollBack();\n    }\n    $db->exec(\"SET FOREIGN_KEY_CHECKS = 1;\");\n    echo json_encode([\"status\" => \"error\", \"message\" => \"Gagal sinkronisasi {$frontend_table}: \" . $e->getMessage()]);\n}\n?>");
            apiFolder.file("sync.php", `<?php
ini_set('memory_limit', '256M');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'db.php';

try {
    // Auto-create table app_data if it doesn't exist
    \$db->exec("CREATE TABLE IF NOT EXISTS app_data (
        doc_id VARCHAR(100) PRIMARY KEY,
        doc_data LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch(PDOException \$e) {
    die(json_encode(['status' => 'error', 'message' => 'DB Setup Failed: ' . \$e->getMessage()]));
}

\$method = \$_SERVER['REQUEST_METHOD'];

if (\$method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (\$method === 'GET') {
    try {
        \$stmt = \$db->query("SELECT doc_id, doc_data FROM app_data");
        \$data = [];
        while(\$row = \$stmt->fetch(PDO::FETCH_ASSOC)) {
            \$data[\$row['doc_id']] = json_decode(\$row['doc_data'], true);
        }
        echo json_encode(['status' => 'success', 'data' => \$data]);
    } catch (Exception \$e) {
        echo json_encode(['status' => 'error', 'message' => \$e->getMessage()]);
    }
    exit;
}

if (\$method === 'POST') {
    \$input = json_decode(file_get_contents('php://input'), true);
    if(!\$input || !isset(\$input['doc_id']) || !isset(\$input['doc_data'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid payload or JSON too large']);
        exit;
    }
    
    \$doc_id = \$input['doc_id'];
    \$doc_data = is_string(\$input['doc_data']) ? \$input['doc_data'] : json_encode(\$input['doc_data']);
    
    try {
        \$stmt = \$db->prepare("INSERT INTO app_data (doc_id, doc_data) VALUES (:id, :data) ON DUPLICATE KEY UPDATE doc_data = :data2, updated_at = CURRENT_TIMESTAMP");
        \$stmt->execute(['id' => \$doc_id, 'data' => \$doc_data, 'data2' => \$doc_data]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception \$e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => \$e->getMessage()]);
    }
    exit;
}
?>`);
        }

        // Add Root .htaccess for React SPA routing
        const rootHtaccessCode = `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
        
        const targetDir = zipFolder;
        if(targetDir) {
            targetDir.file(".htaccess", rootHtaccessCode.trim());
            
            // Menggabungkan hasil build React Frontend (jika tersedia)
            try {
                const res = await fetch("estugadigital_react_build.zip");
                if (res.ok) {
                    const blob = await res.blob();
                    const reactZip = await JSZip.loadAsync(blob);
                    
                    const filePromises: Promise<void>[] = [];
                    reactZip.forEach((relativePath, file) => {
                        if (!file.dir) {
                            filePromises.push(
                                file.async("blob").then((fileBlob) => {
                                    targetDir.file(relativePath, fileBlob);
                                })
                            );
                        }
                    });
                    
                    // Tunggu semua file di ekstrak dan di copy ke folder public_html/htdocs
                    await Promise.all(filePromises);
                } else {
                    console.warn("Build React belum tersedia. Lakukan 'npm run build' terlebih dahulu.");
                }
            } catch (err) {
                console.warn("Gagal mengambil file react build: ", err);
            }
        }
        
        // Generate the README instructions
        const readmeXampp = `INSTALASI ESTUGA DIGITAL V7 DI XAMPP LOCALHOST
==============================================

1. Pastikan XAMPP telah terinstall dan modul Apache serta MySQL sudah berjalan (Start).

2. Buka phpMyAdmin di browser Anda: http://localhost/phpmyadmin/
3. Buat database baru bernama: estugadigital_v7
4. Pilih tab "Import", klik "Choose File", dan pilih file: database_schema/estugadigital_v7.sql
5. Klik "Go" / "Import" untuk menjalankan skema database.

6. Buka folder instalasi XAMPP Anda, masuk ke folder "htdocs" (biasanya C:/xampp/htdocs/)
7. Ekstrak (copy) folder "api" dan konten di dalamnya ke dalam folder project Anda di htdocs, misalnya C:/xampp/htdocs/estugadigital\api\
8. Seluruh file sistem aplikasi beserta file API (termasuk folder assets, index.html) SUDAH TERMASUK DALAM ZIP INI.

Aplikasi Anda sudah siap digunakan!
`;

        const readmeCpanel = `INSTALASI ESTUGA DIGITAL V7 DI CPANEL HOSTING
==============================================

1. Login ke akun cPanel Hosting Anda.

2. Buka MySQL Databases.
3. Buat database baru (misal: domain_estugadigital_v7).
4. Buat user database baru dan tambahkan user tersebut ke database dengan privileges "ALL PRIVILEGES".
5. Buka phpMyAdmin di cPanel.
6. Pilih database yang baru dibuat, klik tab "Import", dan upload file: database_schema/estugadigital_v7.sql
7. Buka folder "public_html/api" di paket ini, lalu edit file "db.php":
   Ubah DB_USER, DB_PASS, dan DB_NAME sesuai dengan yang Anda buat di langkah 3 & 4.

8. Buka File Manager di cPanel.
9. Masuk ke folder "public_html".
10. Upload seluruh isi dari paket zip ini ke dalam public_html di cPanel Anda (atau htdocs di XAMPP).
11. Pastikan file .htaccess (file tersembunyi) juga ikut ter-upload.
12. Seluruh file Front-End (index.html, assets, dll) SUDAH TERMASUK DALAM ZIP INI dan sudah otomatis di-unpack dalam folder public_html bersama file API. Tidak perlu upload hasil build React secara terpisah.

Aplikasi Anda sudah online dan siap digunakan!
`;
        zipFolder.file("README_INSTALL.txt", isCpanel ? readmeCpanel : readmeXampp);
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const element = document.createElement("a");
      element.href = URL.createObjectURL(content);
      element.download = `${rootFolderName}_package.zip`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error("Failed to generate zip", err);
      alert("Gagal membuat file ZIP.");
    }
  };

  const handleDownloadCode = () => {
    const filename = activeCodeTab === 'sql' ? 'estugadigital_v7.sql' :
                     activeCodeTab === 'db' ? 'db.php' :
                     activeCodeTab === 'absen' ? 'absen_scan.php' : 'wa_notif.php';
    
    const element = document.createElement("a");
    const file = new Blob([activeCodeBlock], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  const activeCodeBlock = 
    activeCodeTab === 'sql' ? sqlSchema :
    activeCodeTab === 'db' ? phpDb :
    activeCodeTab === 'absen' ? phpAbsen : phpWa;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-sans text-gray-800 dark:text-white">Ekspor PHP Native & MySQL Database</h1>
        <p className="text-sm text-gray-500 dark:text-[#a3a4cc]">
          Unduh atau salin kode backend server PHP Native dan database SQL MariaDB/MySQL lengkap untuk dipasang langsung di hosting CPanel/XAMPP Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INFO GUIDES PANEL (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
            <Server size={18} className="text-indigo-600 dark:text-indigo-400" />
            Panduan Deploy Hosting
          </h2>

          <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border rounded-lg">
              <h3 className="font-bold text-indigo-700 dark:text-indigo-400">1. Import SQL</h3>
              <p className="mt-1 leading-relaxed">Salin tab <span className="font-semibold font-mono">estugadigital_v7.sql</span> lalu impor di phpMyAdmin MySQL/MariaDB server Anda.</p>
            </div>

            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border rounded-lg">
              <h3 className="font-bold text-amber-700 dark:text-amber-400">2. Konfigurasi Koneksi</h3>
              <p className="mt-1 leading-relaxed">Ubah konstanta <span className="font-mono">DB_HOST, DB_USER, DB_PASS, DB_NAME</span> pada file <span className="font-mono font-semibold">db.php</span> sesuai hosting Anda.</p>
            </div>

            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border rounded-lg">
              <h3 className="font-bold text-emerald-700 dark:text-emerald-400">3. Setting WA Gateway</h3>
              <p className="mt-1 leading-relaxed">Buka <span className="font-mono">wa_notif.php</span>, ganti token Fonnte dengan akun token milik Anda untuk memulai kirim WA notifikasi gratis!</p>
            </div>
          </div>
        </div>

        {/* CODE PREVIEW VIEWER (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#2b2c40] rounded-xl border border-gray-100 dark:border-[#3e405b] shadow-sm overflow-hidden flex flex-col h-[550px]">
          
          {/* File tabs selector */}
          <div className="bg-gray-50 dark:bg-[#232333] border-b dark:border-[#3e405b] p-3 flex justify-between items-center">
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveCodeTab('sql')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5
                  ${activeCodeTab === 'sql' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
              >
                <Database size={12} />
                <span>estugadigital_v7.sql</span>
              </button>

              <button
                onClick={() => setActiveCodeTab('db')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5
                  ${activeCodeTab === 'db' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
              >
                <FileCode size={12} />
                <span>db.php</span>
              </button>

              <button
                onClick={() => setActiveCodeTab('absen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5
                  ${activeCodeTab === 'absen' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
              >
                <FileCode size={12} />
                <span>absen_scan.php</span>
              </button>

              <button
                onClick={() => setActiveCodeTab('wa')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5
                  ${activeCodeTab === 'wa' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
              >
                <FileCode size={12} />
                <span>wa_notif.php</span>
              </button>
            </div>

            
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadPackage('cpanel')}
                className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-sm"
              >
                <Server size={14} />
                <span>Unduh Paket cPanel</span>
              </button>
              <button
                onClick={() => handleDownloadPackage('xampp')}
                className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-sm"
              >
                <Download size={14} />
                <span>Unduh Paket XAMPP</span>
              </button>
              <button
                onClick={handleDownloadCode}

                className="p-1.5 bg-white dark:bg-[#2b2c40] border dark:border-[#3e405b] text-gray-500 rounded hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                <Download size={14} />
                <span>Unduh File</span>
              </button>
              <button
                onClick={() => handleCopyCode(activeCodeBlock)}
                className="p-1.5 bg-white dark:bg-[#2b2c40] border dark:border-[#3e405b] text-gray-500 rounded hover:text-gray-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Real syntax container */}
          <div className="flex-1 overflow-auto p-4 bg-gray-950 text-emerald-400 font-mono text-xs leading-relaxed select-text">
            <pre className="whitespace-pre-wrap">{activeCodeBlock}</pre>
          </div>
        </div>

      </div>
    </div>
  );
}
