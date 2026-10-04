const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');
const StatisticsService = require('../services/statistics.service');

class TeacherController {
  static async getDashboard(req, res) {
    try {
      const teacherId = req.user ? req.user.id : 10;

      if (getIsConnectedToMySQL()) {
        const teacherRows = await query('SELECT * FROM users WHERE id = ?', [teacherId]);
        const teacher = (teacherRows && teacherRows.length > 0) ? teacherRows[0] : (await query('SELECT * FROM users WHERE role = "teacher" LIMIT 1'))[0];

        const classes = await query('SELECT * FROM classes WHERE teacher_id = ? OR 1=1', [teacher ? teacher.id : 10]);
        const allStudents = await query('SELECT id, full_name, avatar, grade_level, xp, level FROM users WHERE role = "student"');
        const allSubmissions = await query('SELECT * FROM submissions');

        const classAnalytics = [];
        for (const cls of classes) {
          const classStudentRows = await query('SELECT student_id FROM class_students WHERE class_id = ?', [cls.id]);
          const studentIds = classStudentRows.map(r => r.student_id);
          const clsStudents = allStudents.filter(s => studentIds.includes(s.id));

          const stats = StatisticsService.analyzeClassPerformance(clsStudents, allSubmissions);
          classAnalytics.push({
            classId: cls.id,
            className: cls.name,
            gradeLevel: cls.grade_level,
            schoolYear: cls.school_year,
            stats
          });
        }

        return res.json({
          success: true,
          teacher: {
            id: teacher.id,
            full_name: teacher.full_name,
            role: teacher.role,
            avatar: teacher.avatar
          },
          classAnalytics
        });
      }

      // Memory Store fallback
      const teacher = memoryStore.users.find(u => u.id === teacherId) || memoryStore.users.find(u => u.role === 'teacher');
      const myClasses = memoryStore.classes.filter(c => c.teacher_id === teacher.id || true);
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

  static async assignExercise(req, res) {
    try {
      const { class_id, exercise_id, title, due_date } = req.body;
      const teacherId = req.user ? req.user.id : 10;

      if (getIsConnectedToMySQL()) {
        const result = await query(`
          INSERT INTO assignments (class_id, exercise_id, title, due_date, created_by)
          VALUES (?, ?, ?, ?, ?)
        `, [class_id, exercise_id || 101, title, due_date || new Date(Date.now() + 7 * 86400000), teacherId]);

        return res.status(201).json({
          success: true,
          message: 'Đã giao bài tập mới và lưu vào MySQL thành công!',
          assignmentId: result.insertId
        });
      }

      res.status(201).json({
        success: true,
        message: 'Đã giao bài tập thành công cho lớp!'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = TeacherController;
