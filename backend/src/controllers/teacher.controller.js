const { memoryStore } = require('../config/database');
const StatisticsService = require('../services/statistics.service');

class TeacherController {
  /**
   * Lấy dữ liệu Dashboard cho Giáo viên: Lớp học phụ trách, danh sách học sinh & điểm số
   */
  static async getDashboard(req, res) {
    try {
      const teacherId = req.user ? req.user.id : 10;
      const teacher = memoryStore.users.find(u => u.id === teacherId) || memoryStore.users.find(u => u.role === 'teacher');

      const myClasses = memoryStore.classes.filter(c => c.teacher_id === teacher.id || true); // fallback demo

      // Lấy toàn bộ học sinh trong các lớp
      const students = memoryStore.users.filter(u => u.role === 'student');
      const classAnalytics = myClasses.map(cls => {
        const clsStudents = students.filter(s => cls.student_ids && cls.student_ids.includes(s.id));
        const stats = StatisticsService.analyzeClassPerformance(clsStudents, memoryStore.submissions);

        return {
          classId: cls.id,
          className: cls.name,
          gradeLevel: cls.grade_level,
          schoolYear: cls.school_year,
          stats
        };
      });

      res.json({
        success: true,
        teacher: {
          id: teacher.id,
          full_name: teacher.full_name,
          role: teacher.role,
          avatar: teacher.avatar
        },
        classAnalytics
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Giao bài tập cho lớp
  static async assignExercise(req, res) {
    try {
      const { class_id, exercise_id, title, due_date } = req.body;
      const teacherId = req.user ? req.user.id : 10;

      const newAssignment = {
        id: Date.now(),
        class_id: parseInt(class_id, 10),
        exercise_id: parseInt(exercise_id, 10),
        title: title || 'Bài tập rèn luyện',
        due_date: due_date || new Date(Date.now() + 7 * 86400000),
        created_by: teacherId,
        created_at: new Date()
      };

      res.status(201).json({
        success: true,
        message: 'Đã giao bài tập thành công cho lớp!',
        assignment: newAssignment
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = TeacherController;
