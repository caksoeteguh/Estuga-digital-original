<?php
/**
 * AdminGuruku - Scanner Absensi Barcode API
 */
require_once 'db.php';
require_once 'wa_notif.php';

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Metode request tidak valid']);
    exit;
}

$nis = isset($_POST['nis']) ? trim($_POST['nis']) : '';
$mode = isset($_POST['mode']) ? trim($_POST['mode']) : 'masuk'; 
$tanggal_hari_ini = date('Y-m-d');
$jam_sekarang = date('H:i:s');

if (empty($nis)) {
    echo json_encode(['status' => 'error', 'message' => 'Nomor Induk Siswa (NIS) kosong']);
    exit;
}

// Cek keberadaan siswa
$stmt = $db->prepare("SELECT * FROM siswa WHERE nis = ?");
$stmt->execute([$nis]);
$siswa = $stmt->fetch();

if (!$siswa) {
    echo json_encode(['status' => 'error', 'message' => 'Siswa dengan NIS tersebut tidak ditemukan!']);
    exit;
}

if ($mode === 'masuk') {
    $check_stmt = $db->prepare("SELECT * FROM absensi WHERE student_id = ? AND tanggal = ?");
    $check_stmt->execute([$nis, $tanggal_hari_ini]);
    $absensi_hari_ini = $check_stmt->fetch();

    if ($absensi_hari_ini) {
        echo json_encode(['status' => 'duplicate', 'message' => 'Siswa ' . $siswa['nama_lengkap'] . ' sudah melakukan presensi masuk hari ini.']);
        exit;
    }

    $insert_stmt = $db->prepare("INSERT INTO absensi (student_id, tanggal, jam_masuk, status, wa_notified_in) VALUES (?, ?, ?, 'hadir', 1)");
    $insert_stmt->execute([$nis, $tanggal_hari_ini, $jam_sekarang]);

    $pesan_wa = "Presensi Masuk: Yth. Bapak/Ibu " . $siswa['nama_ortu'] . ", putra/putri Anda *" . $siswa['nama_lengkap'] . "* telah melakukan presensi MASUK pada pukul *" . date('H:i') . "* WIB. Terima kasih.";
    kirim_notifikasi_wa($siswa['phone_ortu'], $pesan_wa);

    echo json_encode(['status' => 'success', 'message' => 'Absensi masuk tercatat untuk ' . $siswa['nama_lengkap'], 'time' => $jam_sekarang, 'wa_sent' => true]);

} else {
    // PRESENSI PULANG
    $check_stmt = $db->prepare("SELECT * FROM absensi WHERE student_id = ? AND tanggal = ?");
    $check_stmt->execute([$nis, $tanggal_hari_ini]);
    $absensi_hari_ini = $check_stmt->fetch();

    if (!$absensi_hari_ini) {
        echo json_encode(['status' => 'error', 'message' => 'Siswa ' . $siswa['nama_lengkap'] . ' belum presensi masuk!']);
        exit;
    }

    if (!empty($absensi_hari_ini['jam_pulang'])) {
        echo json_encode(['status' => 'duplicate', 'message' => 'Siswa sudah presensi pulang.']);
        exit;
    }

    $update_stmt = $db->prepare("UPDATE absensi SET jam_pulang = ?, wa_notified_out = 1 WHERE student_id = ? AND tanggal = ?");
    $update_stmt->execute([$jam_sekarang, $nis, $tanggal_hari_ini]);

    $pesan_wa = "Presensi Pulang: Yth. Bapak/Ibu " . $siswa['nama_ortu'] . ", putra/putri Anda *" . $siswa['nama_lengkap'] . "* telah PULANG pada pukul *" . date('H:i') . "* WIB. Hati-hati di jalan. Terima kasih.";
    kirim_notifikasi_wa($siswa['phone_ortu'], $pesan_wa);

    echo json_encode(['status' => 'success', 'message' => 'Absensi pulang tercatat untuk ' . $siswa['nama_lengkap'], 'time' => $jam_sekarang, 'wa_sent' => true]);
}
?>
