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

    // 1. GET
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

      await conn.end();

      return res.status(200).json({
        success: true,
        cloud: 'Aiven MySQL Serverless',
        exercises,
        submissions,
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
