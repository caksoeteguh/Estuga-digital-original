-- ==========================================
-- AdminGuruku - MySQL / MariaDB Schema
-- Kompatibel dengan semua versi MySQL & MariaDB (XAMPP)
-- ==========================================

CREATE DATABASE IF NOT EXISTS adminguruku_db;
USE adminguruku_db;

-- 1. Tabel Siswa (Kredensial Siswa & Orang Tua)
CREATE TABLE IF NOT EXISTS siswa (
    nis VARCHAR(20) NOT NULL PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    kelas VARCHAR(20) NOT NULL,
    nama_ortu VARCHAR(150) NOT NULL,
    phone_ortu VARCHAR(30) NOT NULL,
    username_cbt VARCHAR(50) NOT NULL UNIQUE,
    password_cbt VARCHAR(100) NOT NULL,
    username_parent VARCHAR(50) NOT NULL UNIQUE,
    password_parent VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Guru Mata Pelajaran
CREATE TABLE IF NOT EXISTS guru (
    nip VARCHAR(30) NOT NULL PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    mata_pelajaran VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Absensi (Presensi Kartu Barcode)
CREATE TABLE IF NOT EXISTS absensi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    tanggal DATE NOT NULL,
    jam_masuk TIME NULL,
    jam_pulang TIME NULL,
    status ENUM('hadir', 'sakit', 'izin', 'alfa') DEFAULT 'hadir',
    keterangan_tertulis TEXT,
    wa_notified_in TINYINT(1) DEFAULT 0,
    wa_notified_out TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES siswa(nis) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_attendance (student_id, tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Jurnal Harian Mengajar Guru
CREATE TABLE IF NOT EXISTS jurnal_mengajar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    teacher_nip VARCHAR(30) NOT NULL,
    topik_belajar VARCHAR(255) NOT NULL,
    metode_belajar VARCHAR(255) NOT NULL,
    catatan_kelas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_nip) REFERENCES guru(nip) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel CBT Ujian / Penilaian
CREATE TABLE IF NOT EXISTS cbt_ujian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    kelas VARCHAR(20) NOT NULL,
    tanggal DATE NOT NULL,
    durasi_menit INT DEFAULT 45,
    is_published TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel Soal CBT (Mendukung 6 tipe soal)
CREATE TABLE IF NOT EXISTS cbt_soal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ujian_id INT NOT NULL,
    tipe_soal ENUM('pg_sederhana', 'pg_kompleks', 'benar_salah', 'menjodohkan', 'isian_singkat', 'uraian') NOT NULL,
    teks_soal TEXT NOT NULL,
    opsi_jawaban_json JSON NULL, -- Untuk opsi pilihan ganda
    kunci_jawaban TEXT NULL,       -- Untuk kunci PG, B/S, Isian
    bobot_nilai INT DEFAULT 10,
    FOREIGN KEY (ujian_id) REFERENCES cbt_ujian(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel Hasil Nilai CBT Siswa
CREATE TABLE IF NOT EXISTS cbt_hasil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ujian_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    nilai INT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    catatan_guru TEXT,
    FOREIGN KEY (ujian_id) REFERENCES cbt_ujian(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES siswa(nis) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data Dummy
INSERT INTO guru (nip, nama_lengkap, mata_pelajaran, username, password) VALUES 
('198001012005011001', 'Ahmad Dahlan, S.Pd', 'Matematika', 'ahmad', 'password123'),
('198502022010012002', 'Siti Aminah, M.Pd', 'IPA (Sains)', 'siti', 'password123');
