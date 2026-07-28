-- phpMyAdmin SQL Dump
-- Versi Database: estugadigital_v4
-- Waktu pembuatan: 2026-07-01
-- Server: 127.0.0.1 (XAMPP Localhost)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `estugadigital_v4`
--
CREATE DATABASE IF NOT EXISTS `estugadigital_v4` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `estugadigital_v4`;

-- --------------------------------------------------------

--
-- Struktur dari tabel `teachers`
--

CREATE TABLE `teachers` (
  `id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `classes_taught` text NOT NULL,
  `is_homeroom` tinyint(1) DEFAULT 0,
  `homeroom_class` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `students`
--

CREATE TABLE `students` (
  `id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `birth_date` date NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `parent_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `religion` varchar(50) DEFAULT 'Islam',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance`
--

CREATE TABLE `attendance` (
  `id` varchar(50) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('hadir','izin','sakit','alpa') NOT NULL,
  `notified_in` tinyint(1) DEFAULT 0,
  `notified_out` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prayer_attendance`
--

CREATE TABLE `prayer_attendance` (
  `id` varchar(50) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `type` varchar(20) DEFAULT 'sholat_dhuhur',
  `status` enum('hadir','tidak_hadir') NOT NULL,
  `reason` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `journals`
--

CREATE TABLE `journals` (
  `id` varchar(50) NOT NULL,
  `teacher_id` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `topic` text NOT NULL,
  `method` varchar(100) NOT NULL,
  `notes` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_id` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `exams`
--

CREATE TABLE `exams` (
  `id` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `total_questions` int(11) NOT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `is_randomized` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `materials`
--

CREATE TABLE `materials` (
  `id` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `teacher_name` varchar(100) NOT NULL,
  `type` varchar(20) NOT NULL,
  `content` text NOT NULL,
  `created_at` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for dumped tables
--

ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

ALTER TABLE `prayer_attendance`
  ADD CONSTRAINT `fk_prayer_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

ALTER TABLE `journals`
  ADD CONSTRAINT `fk_journals_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
