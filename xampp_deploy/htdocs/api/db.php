<?php
// Pengaturan koneksi database untuk XAMPP
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "estugadigital_v5";

// Membuat koneksi
$conn = new mysqli($host, $user, $pass, $dbname);

// Memeriksa koneksi
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Mengatur charset utf8
$conn->set_charset("utf8mb4");

// Fungsi pembantu respons JSON
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>
