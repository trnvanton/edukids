const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const sampleData = require('./seedData');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedMySQL() {
  console.log('🚀 Đang kết nối và nạp toàn diện dữ liệu Lớp 1-5 EduKids vào MySQL...');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'defaultdb';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const isCloud = host.includes('aivencloud.com') || host.includes('tidbcloud.com') || process.env.DB_SSL === 'true';

  let conn;
  try {
    const connConfig = {
      host,
      user,
      password,
      port,
      database,
      multipleStatements: true
    };

    if (isCloud) {
      connConfig.ssl = { rejectUnauthorized: false };
    }

    conn = await mysql.createConnection(connConfig);
    console.log(`🔌 Đã kết nối thành công tới ${isCloud ? 'Aiven Cloud MySQL' : 'Local MySQL'}.`);

    const schemaPath = path.join(__dirname, '../../schema.sql');
    if (fs.existsSync(schemaPath)) {
      let sqlContent = fs.readFileSync(schemaPath, 'utf8');
      if (isCloud) {
        sqlContent = sqlContent.replace(/CREATE DATABASE IF NOT EXISTS.*?;/i, '');
        sqlContent = sqlContent.replace(/USE `edukids_db`;/i, '');
      }
      await conn.query(sqlContent);
      console.log('📑 Đã thực thi schema.sql thành công.');
    }

    // Insert sample users (Student, Teacher, Admin)
    const hashedPwd = await bcrypt.hash('123456', 10);
    const users = [
      { id: 1, username: 'student1', email: 'student1@edukids.vn', full_name: 'Nguyễn Minh Anh', role: 'student', grade_level: 4, avatar: 'mascot-bear', xp: 1250, level: 5, streak_days: 7 },
      { id: 2, username: 'student2', email: 'student2@edukids.vn', full_name: 'Trần Bình', role: 'student', grade_level: 4, avatar: 'mascot-lion', xp: 850, level: 4, streak_days: 5 },
      { id: 3, username: 'student3', email: 'student3@edukids.vn', full_name: 'Lê Minh', role: 'student', grade_level: 4, avatar: 'mascot-rabbit', xp: 420, level: 3, streak_days: 2 },
      { id: 4, username: 'student_lop2', email: 'lop2@edukids.vn', full_name: 'Bé Bảo Ngọc', role: 'student', grade_level: 2, avatar: 'mascot-panda', xp: 350, level: 3, streak_days: 3 },
      { id: 10, username: 'teacher1', email: 'teacher1@edukids.vn', full_name: 'Cô Hoàng Mai', role: 'teacher', grade_level: 4, avatar: 'mascot-panda', xp: 0, level: 1, streak_days: 10 },
      { id: 99, username: 'admin', email: 'admin@edukids.vn', full_name: 'Quản Trị Viên EduKids', role: 'admin', grade_level: 0, avatar: 'mascot-fox', xp: 9999, level: 5, streak_days: 30 }
    ];

    for (const u of users) {
      await conn.execute(`
        INSERT INTO users (id, username, email, password, full_name, role, grade_level, avatar, xp, level, streak_days)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), grade_level=VALUES(grade_level), xp=VALUES(xp), level=VALUES(level);
      `, [u.id, u.username, u.email, hashedPwd, u.full_name, u.role, u.grade_level, u.avatar, u.xp, u.level, u.streak_days]);
    }

    // Insert classes
    const classes = [
      { id: 1, name: '4A1', grade_level: 4, school_year: '2025-2026', teacher_id: 10, student_ids: [1, 2, 3] },
      { id: 2, name: '2A3', grade_level: 2, school_year: '2025-2026', teacher_id: 10, student_ids: [4] },
      { id: 3, name: '1B', grade_level: 1, school_year: '2025-2026', teacher_id: 10, student_ids: [] }
    ];

    for (const c of classes) {
      await conn.execute(`
        INSERT INTO classes (id, name, grade_level, school_year, teacher_id)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), grade_level=VALUES(grade_level);
      `, [c.id, c.name, c.grade_level, c.school_year, c.teacher_id]);

      if (c.student_ids) {
        for (const sId of c.student_ids) {
          await conn.execute(`
            INSERT IGNORE INTO class_students (class_id, student_id) VALUES (?, ?);
          `, [c.id, sId]);
        }
      }
    }

    // Insert lessons
    for (const l of sampleData.lessons) {
      await conn.execute(`
        INSERT INTO lessons (id, subject_id, grade_level, title, topic_tag, description, icon, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE title=VALUES(title), grade_level=VALUES(grade_level), topic_tag=VALUES(topic_tag);
      `, [l.id, l.subject_id, l.grade_level, l.title, l.topic_tag, l.description, l.icon, l.order_index]);
    }

    // Insert exercises & questions
    for (const ex of sampleData.exercises) {
      await conn.execute(`
        INSERT INTO exercises (id, lesson_id, title, difficulty, time_limit_minutes, reward_xp)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE title=VALUES(title), difficulty=VALUES(difficulty);
      `, [ex.id, ex.lesson_id, ex.title, ex.difficulty, ex.time_limit_minutes, ex.reward_xp]);

      if (ex.questions) {
        for (const q of ex.questions) {
          await conn.execute(`
            INSERT INTO questions (id, exercise_id, question_text, points, explanation, hint, topic_tag)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE question_text=VALUES(question_text), explanation=VALUES(explanation);
          `, [q.id, ex.id, q.question_text, q.points, q.explanation, q.hint || '', q.topic_tag]);

          await conn.execute('DELETE FROM answers WHERE question_id = ?', [q.id]);
          for (const a of q.answers) {
            await conn.execute(`
              INSERT INTO answers (question_id, option_label, answer_text, is_correct)
              VALUES (?, ?, ?, ?);
            `, [q.id, a.option_label, a.answer_text, a.is_correct ? 1 : 0]);
          }
        }
      }
    }

    console.log('🎉 Nạp dữ liệu toàn diện Khối Lớp 1 - 5 vào MySQL hoàn tất 100%!');
  } catch (error) {
    console.error('❌ Lỗi khi nạp dữ liệu MySQL:', error.message);
  } finally {
    if (conn) await conn.end();
  }
}

if (require.main === module) {
  seedMySQL();
}

module.exports = seedMySQL;
