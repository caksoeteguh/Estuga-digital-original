<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

try {
    $stmt = $db->prepare("SELECT * FROM journals"); // Sesuaikan nama tabel jika beda
    $stmt->execute();
    $data = $stmt->fetchAll();
    
    echo json_encode([
        'status' => 'success',
        'data' => $data
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal mengambil data jurnal: ' . $e->getMessage()
    ]);
}
?>
