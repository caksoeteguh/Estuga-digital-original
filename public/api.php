<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================
// KONFIGURASI DATABASE MYSQL HOSTINGER
// ==========================================
$host = 'localhost';
$db   = 'u263814864_kelas6'; // Ganti dengan nama database di Hostinger
$user = 'u263814864_user_kelas6'; // Ganti dengan user database di Hostinger
$pass = 'ilham@ERNA092420'; // Ganti dengan password database

$mysqli = new mysqli($host, $user, $pass, $db);

if ($mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $mysqli->connect_error]);
    exit();
}

// Buat tabel jika belum ada
$mysqli->query("CREATE TABLE IF NOT EXISTS app_data (
    id VARCHAR(255) PRIMARY KEY,
    data LONGTEXT
)");

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$key = isset($_GET['key']) ? $_GET['key'] : '';

if ($method === 'GET' && $action === 'get_all') {
    $result = $mysqli->query("SELECT id, data FROM app_data");
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = [
            "id" => $row['id'],
            "data" => json_decode($row['data'])
        ];
    }
    echo json_encode($items);
} elseif ($method === 'POST' && $action === 'save' && $key !== '') {
    $input = file_get_contents("php://input");
    $dataArray = json_decode($input, true);
    if (!isset($dataArray['data'])) {
        http_response_code(400);
        echo json_encode(["error" => "No data provided"]);
        exit();
    }
    
    // Simpan array sebagai JSON string
    $jsonData = json_encode($dataArray['data']);
    
    $stmt = $mysqli->prepare("INSERT INTO app_data (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = ?");
    $stmt->bind_param("sss", $key, $jsonData, $jsonData);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Gagal menyimpan data"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["error" => "Route not found"]);
}
