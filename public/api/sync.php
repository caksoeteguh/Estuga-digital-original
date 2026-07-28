<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'db.php';

try {
    // Auto-create table app_data if it doesn't exist
    $db->exec("CREATE TABLE IF NOT EXISTS app_data (
        doc_id VARCHAR(100) PRIMARY KEY,
        doc_data LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $db->query("SELECT doc_id, doc_data FROM app_data");
        $all_data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $all_data[$row['doc_id']] = json_decode($row['doc_data'], true) ?? $row['doc_data'];
        }
        echo json_encode(['status' => 'success', 'data' => $all_data]);
    } 
    elseif ($method === 'POST') {
        $json = file_get_contents('php://input');
        $input = json_decode($json, true);

        if (!isset($input['doc_id']) || !isset($input['doc_data'])) {
            echo json_encode(['status' => 'error', 'message' => 'Missing doc_id or doc_data']);
            exit;
        }

        $doc_id = $input['doc_id'];
        // Ensure data is saved as string
        $doc_data = is_string($input['doc_data']) ? $input['doc_data'] : json_encode($input['doc_data']);

        $stmt = $db->prepare("INSERT INTO app_data (doc_id, doc_data) VALUES (:id, :data) 
                               ON DUPLICATE KEY UPDATE doc_data = :data2");
        $stmt->execute([
            ':id' => $doc_id, 
            ':data' => $doc_data,
            ':data2' => $doc_data
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Data synced']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid method']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'DB_ERROR: ' . $e->getMessage()]);
}
?>
