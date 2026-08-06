<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

try {
    $stmt = $db->prepare("SELECT * FROM students"); // Sesuaikan nama tabel siswa jika beda
    $stmt->execute();
    $students = $stmt->fetchAll();
    
    echo json_encode([
        'status' => 'success',
        'data' => $students
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal mengambil data siswa: ' . $e->getMessage()
    ]);
}
?>
