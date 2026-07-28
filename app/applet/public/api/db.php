<?php
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
?>
