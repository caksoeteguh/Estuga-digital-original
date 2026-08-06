<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = file_get_contents("php://input");
$request = json_decode($input, true);

if (!$request || !isset($request['table']) || !isset($request['data'])) {
    echo json_encode(["status" => "error", "message" => "Payload tidak valid."]);
    exit;
}

$table = $request['table'];
$data = $request['data'];

// Tabel yang diizinkan untuk di-sync beserta mapping ke nama tabel di MySQL
$allowed_tables = [
    'students' => 'students', // Ganti 'students' menjadi 'siswa' jika nama tabel Anda 'siswa'
    'teachers' => 'teachers', // Ganti 'teachers' menjadi 'guru' 
    'attendance' => 'attendance', // Ganti menjadi 'absensi' jika perlu
    'prayer_attendance' => 'prayer_attendance', 
    'journals' => 'journals', 
    'exams' => 'exams', 
    'results' => 'results', 
    'events' => 'events', 
    'materials' => 'materials', 
    'assignments' => 'assignments', 
    'submissions' => 'submissions', 
    'student_grades' => 'student_grades'
];

if (!array_key_exists($table, $allowed_tables)) {
    echo json_encode(["status" => "error", "message" => "Tabel tidak diizinkan."]);
    exit;
}

$mysql_table = $allowed_tables[$table];

try {
    $db->beginTransaction();
    
    // Karena ini prototype auto-sync, kita akan menggunakan pendekatan:
    // Hapus semua data lama (TRUNCATE/DELETE) lalu masukkan data baru dari state React.
    // Ini memastikan sinkronisasi persis dengan state di frontend.
    $stmtDelete = $db->prepare("DELETE FROM " . $mysql_table);
    $stmtDelete->execute();
    
    if (count($data) > 0) {
        $columns = array_keys($data[0]);
        $colNames = implode(", ", $columns);
        $placeholders = implode(", ", array_map(function($c) { return ":".$c; }, $columns));
        
        $insertQuery = "INSERT INTO {$mysql_table} ({$colNames}) VALUES ({$placeholders})";
        $stmtInsert = $db->prepare($insertQuery);
        
        foreach ($data as $row) {
            $params = [];
            foreach ($columns as $col) {
                // Konversi array/object menjadi JSON string untuk disimpan di MySQL
                if (is_array($row[$col]) || is_object($row[$col])) {
                    $params[":".$col] = json_encode($row[$col]);
                } else {
                    $params[":".$col] = $row[$col];
                }
            }
            $stmtInsert->execute($params);
        }
    }
    
    $db->commit();
    echo json_encode(["status" => "success", "message" => "Data {$table} berhasil disinkronisasi."]);
} catch (PDOException $e) {
    $db->rollBack();
    echo json_encode(["status" => "error", "message" => "Gagal sinkronisasi: " . $e->getMessage()]);
}
?>
