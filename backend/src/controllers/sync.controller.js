// Backend Cloud Sync Controller using Cloudflare D1
const d1 = require('../config/d1');

class SyncController {
  static async getSyncData(req, res) {
    try {
      const syncData = await d1.getD1SyncData();
      return res.json({
        success: true,
        cloud: 'Cloudflare D1 Serverless SQL',
        count_exercises: syncData.exercises.length,
        count_submissions: syncData.submissions.length,
        exercises: syncData.exercises,
        classes: syncData.classes,
        students: syncData.students,
        submissions: syncData.submissions,
        deleted_exercise_ids: syncData.deleted_exercise_ids,
        deleted_class_ids: syncData.deleted_class_ids,
        deleted_student_ids: syncData.deleted_student_ids,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message, exercises: [], submissions: [] });
    }
  }

  static async saveExercise(req, res) {
    try {
      const exercise = req.body.exercise || req.body;
      if (!exercise || !exercise.id) {
        return res.status(400).json({ success: false, message: 'Dữ liệu bài tập không hợp lệ (thiếu ID)!' });
      }

      await d1.saveD1Exercise(exercise);

      return res.json({
        success: true,
        cloud: 'Cloudflare D1',
        message: 'Đã lưu và đồng bộ bài tập lên Cloudflare D1 thành công!',
        exercise
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteExercise(req, res) {
    try {
      const exerciseId = parseInt(req.params.id || req.body.deleteId, 10);
      await d1.deleteD1Exercise(exerciseId);

      return res.json({
        success: true,
        cloud: 'Cloudflare D1',
        message: 'Đã xóa bài tập trên Cloudflare D1 thành công!',
        deletedId: exerciseId
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveSubmission(req, res) {
    try {
      const submission = req.body.submission || req.body;
      if (!submission || !submission.id) {
        return res.status(400).json({ success: false, message: 'Dữ liệu nộp bài không hợp lệ!' });
      }

      await d1.saveD1Submission(submission);

      return res.json({
        success: true,
        cloud: 'Cloudflare D1',
        message: 'Đã đồng bộ kết quả nộp bài lên Cloudflare D1 thành công!',
        submission
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async health(req, res) {
    return res.json({
      status: 'ok',
      cloud: 'Cloudflare D1 Serverless SQL',
      connected: true,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = SyncController;
