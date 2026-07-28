<?php
/**
 * AdminGuruku - Koneksi Database Universal PDO
 * Kompatibel dengan semua PHP 5.6, 7.x, 8.x, 9.x (XAMPP / CPanel)
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // default xampp username
define('DB_PASS', '');     // default xampp password is empty
define('DB_NAME', 'adminguruku_db');

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
    die(json_encode(['status' => 'error', 'message' => 'Koneksi Database Gagal: ' . $e->getMessage()]));
}
?>
