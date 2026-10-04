const { query, getIsConnectedToMySQL, initDatabaseConnection } = require('../config/database');

class SyncController {
  static async getSyncData(req, res) {
    try {
      if (!getIsConnectedToMySQL()) {
        await initDatabaseConnection();
      }

      const exerciseRows = await query('SELECT * FROM cloud_synced_exercises ORDER BY updated_at DESC');
      const exercises = (exerciseRows || []).map(row => {
        try {
          return typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      const submissionRows = await query('SELECT * FROM cloud_synced_submissions ORDER BY created_at DESC LIMIT 200');
      const submissions = (submissionRows || []).map(row => {
        try {
          return typeof row.data_json === 'string' ? JSON.parse(row.data_json) : row.data_json;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      return res.json({
        success: true,
        cloud: 'Aiven MySQL',
        count_exercises: exercises.length,
        count_submissions: submissions.length,
        exercises,
        submissions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Sync error:', error.message);
      return res.status(500).json({ success: false, message: error.message, exercises: [], submissions: [] });
    }
  }

  static async saveExercise(req, res) {
    try {
      if (!getIsConnectedToMySQL()) {
        await initDatabaseConnection();
      }

      const { exercise } = req.body;
      if (!exercise || !exercise.id) {
        return res.status(400).json({ success: false, message: 'Dữ liệu bài tập không hợp lệ (thiếu ID)!' });
      }

      const exerciseId = parseInt(exercise.id, 10);
      const title = exercise.title || 'Bài tập tự luyện';
      const gradeLevel = parseInt(exercise.grade_level || 1, 10);
      const subjectId = parseInt(exercise.subject_id || 1, 10);
      const createdBy = exercise.created_by || 'Cô Hoàng Mai';
      const dataJson = JSON.stringify(exercise);

      await query(`
        INSERT INTO cloud_synced_exercises (id, title, grade_level, subject_id, data_json, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          title = VALUES(title),
          grade_level = VALUES(grade_level),
          subject_id = VALUES(subject_id),
          data_json = VALUES(data_json),
          updated_at = CURRENT_TIMESTAMP
      `, [exerciseId, title, gradeLevel, subjectId, dataJson, createdBy]);

      return res.json({
        success: true,
        message: 'Đã lưu và đồng bộ bài tập lên Cloud MySQL thành công!',
        exercise
      });
    } catch (error) {
      console.error('Save exercise error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteExercise(req, res) {
    try {
      if (!getIsConnectedToMySQL()) {
        await initDatabaseConnection();
      }

      const exerciseId = parseInt(req.params.id, 10);
      await query('DELETE FROM cloud_synced_exercises WHERE id = ?', [exerciseId]);

      return res.json({
        success: true,
        message: 'Đã xóa bài tập trên Cloud MySQL thành công!',
        deletedId: exerciseId
      });
    } catch (error) {
      console.error('Delete exercise error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveSubmission(req, res) {
    try {
      if (!getIsConnectedToMySQL()) {
        await initDatabaseConnection();
      }

      const { submission } = req.body;
      if (!submission || !submission.id) {
        return res.status(400).json({ success: false, message: 'Dữ liệu nộp bài không hợp lệ!' });
      }

      const subId = String(submission.id);
      const exerciseId = parseInt(submission.exercise_id || 0, 10);
      const studentName = submission.student_name || 'Học Sinh';
      const studentAvatar = submission.student_avatar || 'mascot-bear';
      const gradeLevel = parseInt(submission.grade_level || 1, 10);
      const score10 = parseFloat(submission.score10 !== undefined ? submission.score10 : 10);
      const correctCount = parseInt(submission.correct_count || 0, 10);
      const totalQuestions = parseInt(submission.total_questions || 10, 10);
      const dataJson = JSON.stringify(submission);

      await query(`
        INSERT INTO cloud_synced_submissions 
          (id, exercise_id, student_name, student_avatar, grade_level, score10, correct_count, total_questions, data_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          score10 = VALUES(score10),
          correct_count = VALUES(correct_count),
          data_json = VALUES(data_json)
      `, [subId, exerciseId, studentName, studentAvatar, gradeLevel, score10, correctCount, totalQuestions, dataJson]);

      return res.json({
        success: true,
        message: 'Đã đồng bộ kết quả nộp bài lên Cloud MySQL thành công!',
        submission
      });
    } catch (error) {
      console.error('Save submission error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async health(req, res) {
    return res.json({
      status: 'ok',
      cloud: 'Aiven Cloud MySQL',
      connected: getIsConnectedToMySQL(),
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = SyncController;
