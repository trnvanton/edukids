const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { memoryStore } = require('../config/database');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedMySQL() {
  console.log('🚀 Đang kết nối và nạp dữ liệu EduKids vào MySQL...');

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
      // If cloud, remove CREATE DATABASE line to avoid permission issues
      if (isCloud) {
        sqlContent = sqlContent.replace(/CREATE DATABASE IF NOT EXISTS.*?;/i, '');
        sqlContent = sqlContent.replace(/USE `edukids_db`;/i, '');
      }
      await conn.query(sqlContent);
      console.log('📑 Đã thực thi schema.sql thành công.');
    }

    // Insert sample users (Student, Teacher, Admin)
    const hashedPwd = await bcrypt.hash('123456', 10);
    for (const u of memoryStore.users) {
      await conn.execute(`
        INSERT INTO users (id, username, email, password, full_name, role, grade_level, avatar, xp, level, streak_days)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), xp=VALUES(xp), level=VALUES(level);
      `, [u.id, u.username, u.email || '', hashedPwd, u.full_name, u.role, u.grade_level, u.avatar, u.xp, u.level, u.streak_days]);
    }

    // Insert classes
    for (const c of memoryStore.classes) {
      await conn.execute(`
        INSERT INTO classes (id, name, grade_level, school_year, teacher_id)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name);
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
    for (const l of memoryStore.lessons) {
      await conn.execute(`
        INSERT INTO lessons (id, subject_id, grade_level, title, topic_tag, description, icon, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE title=VALUES(title);
      `, [l.id, l.subject_id, l.grade_level, l.title, l.topic_tag, l.description, l.icon, l.order_index]);
    }

    // Insert exercises & questions
    for (const ex of memoryStore.exercises) {
      await conn.execute(`
        INSERT INTO exercises (id, lesson_id, title, difficulty, time_limit_minutes, reward_xp)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE title=VALUES(title);
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

    console.log('🎉 Nạp dữ liệu EduKids vào MySQL hoàn tất 100%!');
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
