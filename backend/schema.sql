-- =========================================================================
-- EDUKIDS - CƠ SỞ DỮ LIỆU NỀN TẢNG HỌC TẬP & GAMIFICATION TIỂU HỌC
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `edukids_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `edukids_db`;

-- 1. BẢNG NGƯỜI DÙNG (Users: Học sinh, Giáo viên, Admin)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('student', 'teacher', 'admin') DEFAULT 'student',
  `grade_level` INT DEFAULT 1,
  `avatar` VARCHAR(100) DEFAULT 'mascot-bear',
  `xp` INT DEFAULT 0,
  `level` INT DEFAULT 1,
  `streak_days` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG LỚP HỌC (Classes)
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL, -- Ví dụ: "4A1", "3A2", "1B"
  `grade_level` INT NOT NULL,  -- 1, 2, 3, 4, 5
  `school_year` VARCHAR(20) DEFAULT '2025-2026',
  `teacher_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG HỌC SINH THUỘC LỚP (Class_Students)
CREATE TABLE IF NOT EXISTS `class_students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_class` (`class_id`, `student_id`),
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG MÔN HỌC (Subjects)
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL, -- Toán Học, Tiếng Việt, Khoa Học, Tiếng Anh
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `icon` VARCHAR(50) DEFAULT '📚',
  `color` VARCHAR(20) DEFAULT '#4F46E5',
  `description` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG BÀI HỌC / CHUYÊN ĐỀ (Lessons)
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `grade_level` INT NOT NULL, -- 1 đến 5
  `title` VARCHAR(200) NOT NULL,
  `topic_tag` VARCHAR(50) NOT NULL, -- 'phan-so', 'hinh-hoc', 'chinh-ta', 'doc-hieu', 'phep-cong'
  `description` TEXT,
  `icon` VARCHAR(50) DEFAULT '📖',
  `order_index` INT DEFAULT 0,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG BÀI TẬP / THỬ THÁCH (Exercises)
CREATE TABLE IF NOT EXISTS `exercises` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `difficulty` ENUM('basic', 'practice', 'advanced', 'challenge') DEFAULT 'practice',
  `time_limit_minutes` INT DEFAULT 15,
  `reward_xp` INT DEFAULT 20,
  `passing_score` FLOAT DEFAULT 5.0,
  `order_index` INT DEFAULT 0,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG CÂU HỎI (Questions)
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exercise_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('multiple_choice', 'fill_blank', 'true_false') DEFAULT 'multiple_choice',
  `points` INT DEFAULT 10,
  `explanation` TEXT NOT NULL,
  `hint` VARCHAR(255),
  `topic_tag` VARCHAR(50) NOT NULL, -- Nhãn chủ đề phục vụ phân tích lỗi & gợi ý
  `order_index` INT DEFAULT 0,
  FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG ĐÁP ÁN (Answers)
CREATE TABLE IF NOT EXISTS `answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT NOT NULL,
  `option_label` VARCHAR(5) NOT NULL, -- A, B, C, D
  `answer_text` TEXT NOT NULL,
  `is_correct` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG GIAO BÀI TẬP CỦA GIÁO VIÊN (Assignments)
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `exercise_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `due_date` DATETIME,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BẢNG NỘP BÀI & KẾT QUẢ (Submissions)
CREATE TABLE IF NOT EXISTS `submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `exercise_id` INT NOT NULL,
  `score` FLOAT NOT NULL, -- Thang điểm 10
  `total_questions` INT NOT NULL,
  `correct_count` INT NOT NULL,
  `wrong_count` INT NOT NULL,
  `xp_earned` INT DEFAULT 0,
  `combo_max` INT DEFAULT 0,
  `time_taken_seconds` INT DEFAULT 0,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BẢNG CHI TIẾT CÂU TRẢ LỜI TỪNG BÀI NỘP (Submission_Answers)
CREATE TABLE IF NOT EXISTS `submission_answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `submission_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `user_answer` VARCHAR(255) NOT NULL,
  `is_correct` BOOLEAN NOT NULL,
  FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. BẢNG HUY HIỆU (Badges)
CREATE TABLE IF NOT EXISTS `badges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255),
  `icon` VARCHAR(50) DEFAULT '🏆',
  `min_xp` INT DEFAULT 0,
  `badge_type` VARCHAR(50) DEFAULT 'general'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BẢNG HUY HIỆU ĐÃ MỞ KHÓA (User_Badges)
CREATE TABLE IF NOT EXISTS `user_badges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `badge_id` INT NOT NULL,
  `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_badge` (`user_id`, `badge_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. BẢNG LỊCH SỬ GIAO DỊCH ĐIỂM KINH NGHIỆM (Point_Transactions)
CREATE TABLE IF NOT EXISTS `point_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `xp_amount` INT NOT NULL,
  `reason` VARCHAR(255) NOT NULL, -- 'Hoàn thành bài tập', 'Combo 3 câu đúng', 'Chuỗi 7 ngày'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DỮ LIỆU BAN ĐẦU
-- =========================================================================

-- Môn học
INSERT INTO `subjects` (`id`, `name`, `code`, `icon`, `color`, `description`) VALUES
(1, 'Toán Học', 'toan', '📐', '#3B82F6', 'Con số diệu kỳ, phép tính thông minh, câu đố logic'),
(2, 'Tiếng Việt', 'tieng-viet', '📖', '#EF4444', 'Đọc hiểu, chính tả chuẩn xác, luyện từ và câu'),
(3, 'Khoa Học & Tự Nhiên', 'khoa-hoc', '🔬', '#8B5CF6', 'Khám phá thế giới, con người, động thực vật'),
(4, 'Tiếng Anh', 'tieng-anh', '🇬🇧', '#10B981', 'Vocabulary, Grammar, từ vựng sinh động qua hình ảnh')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Huy hiệu danh dự
INSERT INTO `badges` (`id`, `code`, `name`, `description`, `icon`, `min_xp`, `badge_type`) VALUES
(1, 'starter', 'Mầm Non Chăm Học', 'Bắt đầu hành trình học tập tại EduKids', '🥉', 20, 'streak'),
(2, 'math_star', 'Siêu Toán Học Nhí', 'Đạt 200 XP trong các bài tập môn Toán', '🥈', 200, 'subject'),
(3, 'vietnamese_king', 'Vua Tiếng Việt', 'Đạt 200 XP môn Tiếng Việt', '🥇', 200, 'subject'),
(4, 'streak_7', 'Lửa Chăm Chỉ 7 Ngày', 'Duy trì chuỗi học tập 7 ngày liên tiếp', '🔥', 500, 'streak'),
(5, 'super_scholar', 'Trạng Nguyên Toàn Năng', 'Tích lũy 1,000 XP vượt bậc', '👑', 1000, 'master')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
