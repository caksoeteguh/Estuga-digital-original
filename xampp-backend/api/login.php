<?php
/**
 * AdminGuruku - Endpoint Login API
 */
require_once 'db.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid method']);
    exit;
}

$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($username) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Username/Password kosong']);
    exit;
}

$stmt = $db->prepare("SELECT * FROM guru WHERE username = ? AND password = ?");
$stmt->execute([$username, $password]);
$guru = $stmt->fetch();

if ($guru) {
    echo json_encode(['status' => 'success', 'role' => 'guru', 'data' => $guru]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Username atau password salah']);
?>
