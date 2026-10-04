export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    let mysql;
    try {
      mysql = await import('mysql2/promise');
    } catch (e) {
      mysql = (await import('mysql2')).default.promise;
    }

    const password = process.env.DB_PASSWORD || Buffer.from('QVZOU19NTlViLUZNY0I3VDNFQWszVFo3', 'base64').toString('utf-8');
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'mysql-f67f396-edukids.c.aivencloud.com',
      port: parseInt(process.env.DB_PORT, 10) || 23951,
      user: process.env.DB_USER || 'avnadmin',
      password: password,
      database: process.env.DB_NAME || 'defaultdb',
      ssl: { rejectUnauthorized: false },
      connectTimeout: 10000
    });

    // Auto-create cloud tables for classes and students if not exist
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS cloud_synced_classes (
          id VARCHAR(50) PRIMARY KEY,
          class_code VARCHAR(50) UNIQUE,
          class_name VARCHAR(100),
          grade_level INT,
          teacher_name VARCHAR(100),
          data_json LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      await conn.execute(`
        CREATE TABLE IF NOT EXISTS cloud_synced_students (
          id VARCHAR(100) PRIMARY KEY,
          class_code VARCHAR(50),
          student_name VARCHAR(100),
          parent_phone VARCHAR(30),
          student_avatar VARCHAR(50),
          grade_level INT,
          xp INT DEFAULT 0,
          data_json LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    } catch (tableErr) {
      console.warn('Table check:', tableErr);
    }

    // 1. GET: Fetch exercises, submissions, classes, students
    if (req.method === 'GET') {
      const [exRows] = await conn.execute('SELECT * FROM cloud_synced_exercises ORDER BY updated_at DESC');
      const exercises = (exRows || []).map(row => {
        try {
          return typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      const [subRows] = await conn.execute('SELECT * FROM cloud_synced_submissions ORDER BY created_at DESC LIMIT 200');
      const submissions = (subRows || []).map(row => {
        try {
          return typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      let classes = [];
      try {
        const [clsRows] = await conn.execute('SELECT * FROM cloud_synced_classes ORDER BY created_at ASC');
        classes = (clsRows || []).map(row => {
          try {
            return typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      } catch (e) {}

      let students = [];
      try {
        const [stRows] = await conn.execute('SELECT * FROM cloud_synced_students ORDER BY created_at DESC');
        students = (stRows || []).map(row => {
          try {
            return typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      } catch (e) {}

      await conn.end();

      return res.status(200).json({
        success: true,
        cloud: 'Aiven MySQL Serverless',
        exercises,
        submissions,
        classes,
        students,
        timestamp: new Date().toISOString()
      });
    }

    // 2. POST
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      // Save Exercise
      if (body.action === 'save_exercise' || body.exercise) {
        const exercise = body.exercise || body;
        const exerciseId = parseInt(exercise.id, 10);
        const title = exercise.title || 'Bài tập tự luyện';
        const gradeLevel = parseInt(exercise.grade_level || 1, 10);
        const subjectId = parseInt(exercise.subject_id || 1, 10);
        const createdBy = exercise.created_by || 'Cô Hoàng Mai';
        const dataJson = JSON.stringify(exercise);

        await conn.execute(`
          INSERT INTO cloud_synced_exercises (id, title, grade_level, subject_id, data_json, created_by)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            title = VALUES(title),
            grade_level = VALUES(grade_level),
            subject_id = VALUES(subject_id),
            data_json = VALUES(data_json),
            updated_at = CURRENT_TIMESTAMP
        `, [exerciseId, title, gradeLevel, subjectId, dataJson, createdBy]);

        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã lưu bài tập lên Cloud MySQL thành công!',
          exercise
        });
      }

      // Delete Exercise
      if (body.action === 'delete_exercise' || body.deleteId) {
        const exerciseId = parseInt(body.deleteId || body.id, 10);
        await conn.execute('DELETE FROM cloud_synced_exercises WHERE id = ?', [exerciseId]);
        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã xóa bài tập trên Cloud MySQL thành công!',
          deletedId: exerciseId
        });
      }

      // Save Submission
      if (body.action === 'save_submission' || body.submission) {
        const submission = body.submission || body;
        const subId = String(submission.id || Date.now());
        const exerciseId = parseInt(submission.exercise_id || 0, 10);
        const studentName = submission.student_name || submission.user_name || 'Học Sinh';
        const studentAvatar = submission.student_avatar || submission.user_avatar || 'mascot-bear';
        const gradeLevel = parseInt(submission.grade_level || 1, 10);
        const score10 = parseFloat(submission.score10 !== undefined ? submission.score10 : 10);
        const correctCount = parseInt(submission.correctCount || submission.correct_count || 0, 10);
        const totalQuestions = parseInt(submission.totalQuestions || submission.total_questions || 10, 10);
        const dataJson = JSON.stringify(submission);

        await conn.execute(`
          INSERT INTO cloud_synced_submissions 
            (id, exercise_id, student_name, student_avatar, grade_level, score10, correct_count, total_questions, data_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            score10 = VALUES(score10),
            correct_count = VALUES(correct_count),
            data_json = VALUES(data_json)
        `, [subId, exerciseId, studentName, studentAvatar, gradeLevel, score10, correctCount, totalQuestions, dataJson]);

        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã lưu kết quả bài làm học sinh lên Cloud MySQL thành công!',
          submission
        });
      }

      // Save Class with Class Code
      if (body.action === 'save_class' || body.classObj) {
        const cls = body.classObj || body;
        const classId = String(cls.id || Date.now());
        const classCode = cls.class_code || `${cls.className || '2A1'}-${Math.floor(1000 + Math.random() * 9000)}`;
        const className = cls.className || '2A1';
        const gradeLevel = parseInt(cls.grade_level || 2, 10);
        const teacherName = cls.teacher_name || 'Cô Hoàng Mai';
        const dataJson = JSON.stringify({ ...cls, id: classId, class_code: classCode, className, grade_level: gradeLevel, teacher_name: teacherName });

        await conn.execute(`
          INSERT INTO cloud_synced_classes (id, class_code, class_name, grade_level, teacher_name, data_json)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            class_code = VALUES(class_code),
            class_name = VALUES(class_name),
            grade_level = VALUES(grade_level),
            teacher_name = VALUES(teacher_name),
            data_json = VALUES(data_json)
        `, [classId, classCode, className, gradeLevel, teacherName, dataJson]);

        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã lưu lớp học & Mã lớp lên Cloud MySQL thành công!',
          classObj: { ...cls, id: classId, class_code: classCode }
        });
      }

      // Join Class / Save Real Student (with Parent Phone & Class Code)
      if (body.action === 'join_class' || body.action === 'save_student' || body.action === 'update_profile' || body.student) {
        const st = body.student || body;
        const studentId = String(st.id || Date.now());
        const classCode = st.class_code ? st.class_code.toUpperCase().trim() : '';
        const studentName = st.student_name || st.full_name || 'Học Sinh';
        const parentPhone = st.parent_phone || '';
        const studentAvatar = st.avatar || st.student_avatar || 'mascot-bear';
        const gradeLevel = parseInt(st.grade_level || 2, 10);
        const xp = parseInt(st.xp || 0, 10);
        const dataJson = JSON.stringify({ ...st, id: studentId, class_code: classCode, full_name: studentName, parent_phone: parentPhone, avatar: studentAvatar, grade_level: gradeLevel, xp });

        await conn.execute(`
          INSERT INTO cloud_synced_students (id, class_code, student_name, parent_phone, student_avatar, grade_level, xp, data_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            class_code = VALUES(class_code),
            student_name = VALUES(student_name),
            parent_phone = VALUES(parent_phone),
            student_avatar = VALUES(student_avatar),
            grade_level = VALUES(grade_level),
            xp = VALUES(xp),
            data_json = VALUES(data_json)
        `, [studentId, classCode, studentName, parentPhone, studentAvatar, gradeLevel, xp, dataJson]);

        if (body.oldName && body.oldName !== studentName) {
          try {
            await conn.execute('DELETE FROM cloud_synced_students WHERE student_name = ? AND id != ?', [body.oldName, studentId]);
          } catch (e) {}
        }

        await conn.end();

        return res.status(200).json({
          success: true,
          message: `Đã lưu hồ sơ học sinh "${studentName}" trên Cloud MySQL! 🎉`,
          student: { ...st, id: studentId, class_code: classCode }
        });
      }

      // Delete Student from Class
      if (body.action === 'delete_student' || body.deleteStudentId) {
        const stId = String(body.deleteStudentId || body.id);
        const stName = body.studentName || body.student_name || '';
        await conn.execute('DELETE FROM cloud_synced_students WHERE id = ? OR student_name = ?', [stId, stName || stId]);
        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã xóa học sinh khỏi Cloud MySQL thành công!'
        });
      }

      // Delete Class
      if (body.action === 'delete_class' || body.deleteClassId) {
        const clsId = String(body.deleteClassId || body.id);
        const clsCode = body.class_code || clsId;
        await conn.execute('DELETE FROM cloud_synced_classes WHERE id = ? OR class_code = ?', [clsId, clsCode]);
        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã xóa lớp học khỏi Cloud MySQL thành công!'
        });
      }

      await conn.end();
      return res.status(400).json({ success: false, message: 'Action không hợp lệ' });
    }

    await conn.end();
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Serverless MySQL Sync Error:', error);
    return res.status(200).json({
      success: false,
      message: 'Lỗi kết nối MySQL: ' + error.message,
      error: error.message
    });
  }
}
