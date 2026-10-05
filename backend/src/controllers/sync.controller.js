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

  static async saveClass(req, res) {
    try {
      const classObj = req.body.classObj || req.body;
      if (!classObj) {
        return res.status(400).json({ success: false, message: 'Dữ liệu lớp học không hợp lệ!' });
      }

      await d1.saveD1Class(classObj);

      return res.json({
        success: true,
        cloud: 'Cloudflare D1',
        message: 'Đã lưu lớp học lên Cloudflare D1 thành công!',
        classObj
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteClass(req, res) {
    try {
      const classId = req.params.id || req.body.deleteClassId || req.body.id;
      const classCode = req.body.class_code || req.query.class_code;
      await d1.deleteD1Class(classId, classCode);

      return res.json({
        success: true,
        cloud: 'Cloudflare D1',
        message: 'Đã xóa lớp học trên Cloudflare D1 thành công!',
        deletedClassId: classId || classCode
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveStudent(req, res) {
    try {
      const student = req.body.student || req.body;
      if (!student) {
        return res.status(400).json({ success: false, message: 'Dữ liệu học sinh không hợp lệ!' });
      }

      await d1.saveD1Student(student);

      return res.json({
        success: true,
        cloud: 'Cloudflare D1',
        message: 'Đã lưu học sinh lên Cloudflare D1 thành công!',
        student
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteStudent(req, res) {
    try {
      const studentId = req.params.id || req.body.deleteStudentId || req.body.id;
      const studentName = req.body.student_name || req.query.student_name;
      await d1.deleteD1Student(studentId, studentName);

      return res.json({
        success: true,
        cloud: 'Cloudflare D1',
        message: 'Đã xóa học sinh trên Cloudflare D1 thành công!',
        deletedStudentId: studentId || studentName
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
