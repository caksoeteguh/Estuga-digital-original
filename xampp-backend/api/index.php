<?php
/**
 * AdminGuruku - API Entry Point
 */
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

echo json_encode([
    'app' => 'AdminGuruku API Server',
    'status' => 'active',
    'version' => '1.0.0',
    'endpoints' => [
        '/absen_scan.php' => 'Absensi Barcode endpoint',
        '/login.php' => 'Login Endpoint',
        '/wa_notif.php' => 'WhatsApp Gateway Function'
    ]
]);
?>
