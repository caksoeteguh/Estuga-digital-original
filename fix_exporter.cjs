const fs = require('fs');

const phpCode = `<?php
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

$frontend_table = $request['table'];
$data = $request['data'];

// ==== KONFIGURASI MAPPING TABEL ====
$table_map = [
    'students' => 'siswa',
    'teachers' => 'guru',
    'attendance' => 'absensi',
    'journals' => 'jurnal_mengajar',
    'exams' => 'cbt_ujian',
    'results' => 'cbt_hasil'
];

// ==== KONFIGURASI MAPPING KOLOM ====
$column_map = [
    'siswa' => [
        'id' => 'nis',
        'name' => 'nama_lengkap',
        'pob' => 'tempat_lahir',
        'dob' => 'tanggal_lahir',
        'className' => 'kelas',
        'parentName' => 'nama_ortu',
        'parentPhone' => 'phone_ortu',
        'usernameCbt' => 'username_cbt',
        'passwordCbt' => 'password_cbt',
        'usernameParent' => 'username_parent',
        'passwordParent' => 'password_parent'
    ],
    'guru' => [
        'id' => 'nip',
        'name' => 'nama_lengkap',
        'subject' => 'mata_pelajaran',
        'username' => 'username',
        'password' => 'password'
    ],
    'absensi' => [
        'id' => 'id',
        'studentId' => 'student_id',
        'date' => 'tanggal',
        'timeIn' => 'jam_masuk',
        'timeOut' => 'jam_pulang',
        'status' => 'status',
        'notes' => 'keterangan_tertulis',
        'notifiedIn' => 'wa_notified_in',
        'notifiedOut' => 'wa_notified_out'
    ],
    'jurnal_mengajar' => [
        'id' => 'id',
        'date' => 'tanggal',
        'className' => 'kelas',
        'subject' => 'subject_name',
        'teacherName' => 'teacher_nip',
        'topic' => 'topik_belajar',
        'method' => 'metode_belajar',
        'notes' => 'catatan_kelas'
    ],
    'cbt_ujian' => [
        'id' => 'id',
        'title' => 'judul',
        'subject' => 'subject',
        'className' => 'kelas',
        'date' => 'tanggal',
        'durationMinutes' => 'durasi_menit',
        'isPublished' => 'is_published'
    ],
    'cbt_hasil' => [
        'id' => 'id',
        'examId' => 'ujian_id',
        'studentId' => 'student_id',
        'score' => 'nilai',
        'submittedAt' => 'submitted_at',
        'teacherFeedback' => 'catatan_guru'
    ]
];

$mysql_table = isset($table_map[$frontend_table]) ? $table_map[$frontend_table] : $frontend_table;

try {
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    
    // Auto create generic tables if not mapped
    if (!isset($table_map[$frontend_table]) && count($data) > 0) {
        $columns = array_keys($data[0]);
        $colDefs = [];
        foreach ($columns as $col) {
            $colDefs[] = "\`{$col}\` LONGTEXT";
        }
        $colDefString = implode(", ", $colDefs);
        $db->exec("CREATE TABLE IF NOT EXISTS \`{$mysql_table}\` ({$colDefString}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    $db->beginTransaction();
    
    if (isset($table_map[$frontend_table])) {
        $db->exec("DELETE FROM \`" . $mysql_table . "\`");
    } else {
        $db->exec("TRUNCATE TABLE \`" . $mysql_table . "\`");
    }
    
    if (count($data) > 0) {
        if (isset($column_map[$mysql_table])) {
            $current_map = $column_map[$mysql_table];
            $mysql_columns = [];
            foreach (array_keys($data[0]) as $frontend_col) {
                if (isset($current_map[$frontend_col])) {
                    $mysql_columns[] = $current_map[$frontend_col];
                }
            }
        } else {
            $mysql_columns = array_keys($data[0]);
        }
        
        if (count($mysql_columns) > 0) {
            $colNames = implode(", ", array_map(function($c) { return "\`{$c}\`"; }, $mysql_columns));
            $placeholders = implode(", ", array_map(function($c) { return ":".$c; }, $mysql_columns));
            
            $insertQuery = "INSERT INTO \`{$mysql_table}\` ({$colNames}) VALUES ({$placeholders})";
            $stmtInsert = $db->prepare($insertQuery);
            
            foreach ($data as $row) {
                $params = [];
                foreach ($row as $frontend_col => $value) {
                    $mysql_col = null;
                    if (isset($column_map[$mysql_table][$frontend_col])) {
                        $mysql_col = $column_map[$mysql_table][$frontend_col];
                    } else if (!isset($column_map[$mysql_table])) {
                        $mysql_col = $frontend_col;
                    }
                    
                    if ($mysql_col) {
                        if (is_array($value) || is_object($value)) {
                            $params[":".$mysql_col] = json_encode($value);
                        } else {
                            $params[":".$mysql_col] = $value;
                        }
                    }
                }
                if (count($params) > 0) {
                    $stmtInsert->execute($params);
                }
            }
        }
    }
    
    $db->commit();
    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo json_encode(["status" => "success", "message" => "Data {$frontend_table} berhasil disinkronisasi."]);
} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo json_encode(["status" => "error", "message" => "Gagal sinkronisasi {$frontend_table}: " . $e->getMessage()]);
}
?>`;

let exporterFile = fs.readFileSync('src/components/PhpExporter.tsx', 'utf8');

// Use proper JS string literal syntax instead of template literal to avoid interpolation bugs
const safeStringified = JSON.stringify(phpCode);

// We need to replace the badly injected block
// Find where apiFolder.file("save_relational.php" starts
const startIdx = exporterFile.indexOf('apiFolder.file("save_relational.php"');
if (startIdx !== -1) {
    // Find where apiFolder.file("sync.php" starts
    const endIdx = exporterFile.indexOf('apiFolder.file("sync.php"');
    
    const before = exporterFile.substring(0, startIdx);
    const after = exporterFile.substring(endIdx);
    
    exporterFile = before + 'apiFolder.file("save_relational.php", ' + safeStringified + ');\n            ' + after;
    fs.writeFileSync('src/components/PhpExporter.tsx', exporterFile);
    console.log("Fixed save_relational.php successfully!");
} else {
    console.log("Could not find start block.");
}
