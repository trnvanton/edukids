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

  // System hardcoded blacklist to guarantee permanently deleted items are never revived
  const SYSTEM_DELETED_EXERCISES = [35108];

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

    // Auto-create cloud tables if not exist
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
          username VARCHAR(100),
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

      await conn.execute(`
        CREATE TABLE IF NOT EXISTS cloud_synced_deleted (
          id VARCHAR(100) PRIMARY KEY,
          item_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Ensure blacklist is recorded in cloud database
      for (const delId of SYSTEM_DELETED_EXERCISES) {
        try {
          await conn.execute('DELETE FROM cloud_synced_exercises WHERE id = ?', [delId]);
          await conn.execute(
            'INSERT INTO cloud_synced_deleted (id, item_type) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id',
            [String(delId), 'exercise']
          );
        } catch (e) {}
      }

      try {
        await conn.execute('ALTER TABLE cloud_synced_students ADD COLUMN username VARCHAR(100)');
      } catch (colErr) {}
    } catch (tableErr) {
      console.warn('Table check:', tableErr);
    }

    // 1. GET: Fetch exercises, submissions, classes, students, deleted items
    if (req.method === 'GET') {
      let deletedExerciseIds = [...SYSTEM_DELETED_EXERCISES];
      let deletedClassIds = [];
      let deletedStudentIds = [];

      try {
        const [delRows] = await conn.execute('SELECT id, item_type FROM cloud_synced_deleted');
        (delRows || []).forEach(row => {
          if (row.item_type === 'exercise') {
            const num = parseInt(row.id, 10);
            if (!isNaN(num) && !deletedExerciseIds.includes(num)) deletedExerciseIds.push(num);
          } else if (row.item_type === 'class') {
            deletedClassIds.push(String(row.id));
          } else if (row.item_type === 'student') {
            deletedStudentIds.push(String(row.id));
          }
        });
      } catch (e) {}

      const deletedExSet = new Set(deletedExerciseIds.map(d => parseInt(d, 10)));

      const [exRows] = await conn.execute('SELECT * FROM cloud_synced_exercises ORDER BY updated_at DESC');
      const exercises = (exRows || []).map(row => {
        try {
          const ex = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
          if (ex && ex.id && deletedExSet.has(parseInt(ex.id, 10))) {
            return null;
          }
          return ex;
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
        const [stRows] = await conn.execute('SELECT * FROM cloud_synced_students ORDER BY updated_at DESC, created_at DESC');
        const rawStudents = (stRows || []).map(row => {
          try {
            const data = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : (row.data_json || {});
            const fullName = data.full_name || data.student_name || row.student_name || '';
            const uName = row.username || data.username || (fullName ? fullName : '');
            return {
              ...data,
              id: data.id || row.id,
              username: uName,
              full_name: fullName,
              student_name: fullName,
              parent_phone: row.parent_phone || data.parent_phone || '',
              student_avatar: row.student_avatar || data.avatar || 'mascot-bear',
              avatar: row.student_avatar || data.avatar || 'mascot-bear',
              grade_level: row.grade_level || data.grade_level || 2,
              class_code: row.class_code || data.class_code || '',
              class_name: data.class_name || (row.class_code ? row.class_code.split('-')[0] : ''),
              xp: data.xp !== undefined ? data.xp : (row.xp || 50)
            };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);

        const map = new Map();
        rawStudents.forEach(st => {
          const key = (st.username || st.id || st.full_name || '').toLowerCase().trim();
          if (key && !map.has(key)) {
            map.set(key, st);
          }
        });
        students = Array.from(map.values());
      } catch (e) {}

      await conn.end();

      return res.status(200).json({
        success: true,
        cloud: 'Aiven MySQL Serverless',
        exercises,
        submissions,
        classes,
        students,
        deleted_exercise_ids: deletedExerciseIds,
        deleted_class_ids: deletedClassIds,
        deleted_student_ids: deletedStudentIds,
        timestamp: new Date().toISOString()
      });
    }

    // 2. POST
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      // Delete Exercise Action
      if (body.action === 'delete_exercise' || body.deleteId) {
        const exerciseId = parseInt(body.deleteId || body.id, 10);
        await conn.execute('DELETE FROM cloud_synced_exercises WHERE id = ?', [exerciseId]);
        try {
          await conn.execute(
            'INSERT INTO cloud_synced_deleted (id, item_type) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id',
            [String(exerciseId), 'exercise']
          );
        } catch (e) {}
        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã xóa bài tập trên Cloud MySQL thành công!',
          deletedId: exerciseId
        });
      }

      // Save Exercise Action
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

        try {
          await conn.execute('DELETE FROM cloud_synced_deleted WHERE id = ? AND item_type = ?', [String(exerciseId), 'exercise']);
        } catch (e) {}

        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã lưu bài tập lên Cloud MySQL thành công!',
          exercise
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

        try {
          await conn.execute('DELETE FROM cloud_synced_deleted WHERE id = ? AND item_type = ?', [String(classId), 'class']);
        } catch (e) {}

        await conn.end();

        return res.status(200).json({
          success: true,
          message: 'Đã lưu lớp học & Mã lớp lên Cloud MySQL thành công!',
          classObj: { ...cls, id: classId, class_code: classCode }
        });
      }

      // Get Student Profile for Login
      if (body.action === 'get_student_profile') {
        const queryUser = (body.username || '').toLowerCase().trim();
        const [stRows] = await conn.execute(
          'SELECT * FROM cloud_synced_students ORDER BY updated_at DESC, created_at DESC'
        );
        if (stRows && stRows.length > 0) {
          const row = stRows.find(r => {
            const rUser = (r.username || '').toLowerCase().trim();
            const rName = (r.student_name || '').toLowerCase().trim();
            const rId = String(r.id || '').toLowerCase().trim();
            if (rUser === queryUser || rName === queryUser || rId === queryUser) return true;
            try {
              const d = typeof r.data_json === 'string' ? JSON.parse(r.data_json) : (r.data_json || {});
              if ((d.username || '').toLowerCase().trim() === queryUser) return true;
              if ((d.full_name || '').toLowerCase().trim() === queryUser) return true;
            } catch (e) {}
            return false;
          });

          if (row) {
            let data = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : (row.data_json || {});
            const fullName = data.full_name || data.student_name || row.student_name || body.username;
            const finalUser = {
              ...data,
              id: data.id || row.id,
              username: row.username || data.username || body.username,
              full_name: fullName,
              student_name: fullName,
              class_code: data.class_code || row.class_code || '',
              class_name: data.class_name || (data.class_code ? data.class_code.split('-')[0] : (row.class_code ? row.class_code.split('-')[0] : '')),
              grade_level: data.grade_level || row.grade_level || 2,
              xp: data.xp !== undefined ? data.xp : (row.xp || 50),
              avatar: data.avatar || data.student_avatar || row.student_avatar || 'mascot-bear',
              role: data.role || 'student'
            };
            await conn.end();
            return res.status(200).json({
              success: true,
              user: finalUser
            });
          }
        }
      }

      // Join Class / Save Real Student (with Parent Phone & Class Code)
      if (body.action === 'join_class' || body.action === 'save_student' || body.action === 'update_profile' || body.student) {
        const st = body.student || body;
        const studentId = String(st.id || Date.now());
        const username = (st.username || body.username || '').trim();
        const classCode = st.class_code ? st.class_code.toUpperCase().trim() : '';
        const studentName = st.full_name || st.student_name || username || 'Học Sinh';
        const parentPhone = st.parent_phone || '';
        const studentAvatar = st.avatar || st.student_avatar || 'mascot-bear';
        const gradeLevel = parseInt(st.grade_level || 2, 10);
        const xp = parseInt(st.xp !== undefined ? st.xp : 50, 10);
        const dataJson = JSON.stringify({
          ...st,
          id: studentId,
          username: username || st.username,
          full_name: studentName,
          student_name: studentName,
          class_code: classCode,
          parent_phone: parentPhone,
          avatar: studentAvatar,
          grade_level: gradeLevel,
          xp
        });

        await conn.execute(`
          INSERT INTO cloud_synced_students (id, username, class_code, student_name, parent_phone, student_avatar, grade_level, xp, data_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            class_code = VALUES(class_code),
            student_name = VALUES(student_name),
            parent_phone = VALUES(parent_phone),
            student_avatar = VALUES(student_avatar),
            grade_level = VALUES(grade_level),
            xp = VALUES(xp),
            data_json = VALUES(data_json)
        `, [studentId, username, classCode, studentName, parentPhone, studentAvatar, gradeLevel, xp, dataJson]);

        if (body.oldName && body.oldName !== studentName) {
          try {
            await conn.execute('DELETE FROM cloud_synced_students WHERE student_name = ? AND id != ?', [body.oldName, studentId]);
          } catch (e) {}
        }

        try {
          await conn.execute('DELETE FROM cloud_synced_deleted WHERE id = ? AND item_type = ?', [String(studentId), 'student']);
        } catch (e) {}

        await conn.end();

        return res.status(200).json({
          success: true,
          message: `Đã lưu hồ sơ học sinh "${studentName}" trên Cloud MySQL! 🎉`,
          student: { ...st, id: studentId, username, full_name: studentName, class_code: classCode }
        });
      }

      // Delete Student from Class
      if (body.action === 'delete_student' || body.deleteStudentId) {
        const stId = String(body.deleteStudentId || body.id);
        const stName = body.studentName || body.student_name || '';
        await conn.execute('DELETE FROM cloud_synced_students WHERE id = ? OR student_name = ?', [stId, stName || stId]);
        try {
          await conn.execute(
            'INSERT INTO cloud_synced_deleted (id, item_type) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id',
            [stId, 'student']
          );
        } catch (e) {}
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
        try {
          await conn.execute(
            'INSERT INTO cloud_synced_deleted (id, item_type) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id',
            [clsId, 'class']
          );
        } catch (e) {}
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
    console.error('Serverless MySQL Sync Error / Fallback Mode:', error);
    return res.status(200).json({
      success: true,
      fallback: true,
      exercises: [],
      submissions: [],
      classes: [],
      students: [],
      deleted_exercise_ids: SYSTEM_DELETED_EXERCISES,
      deleted_class_ids: [],
      deleted_student_ids: [],
      message: 'Đang chạy chế độ an toàn (Fallback): ' + error.message,
      error: error.message
    });
  }
}
