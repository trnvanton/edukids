const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');
const StatisticsService = require('../services/statistics.service');
const RecommendationService = require('../services/recommendation.service');
const GradingService = require('../services/grading.service');

class StudentController {
  /**
   * Lấy toàn bộ dữ liệu Dashboard của Học sinh từ MySQL
   */
  static async getDashboard(req, res) {
    try {
      const studentId = req.user ? req.user.id : null;

      if (getIsConnectedToMySQL() && studentId) {
        // 1. Lấy thông tin học sinh
        const studentRows = await query('SELECT id, username, full_name, role, grade_level, avatar, xp, level, streak_days FROM users WHERE id = ?', [studentId]);
        const student = (studentRows && studentRows.length > 0) ? studentRows[0] : req.user;
        const currentGrade = student ? (student.grade_level || 2) : 2;
        const levelInfo = GradingService.calculateLevel(student ? (student.xp || 0) : 0);

        // 2. Lấy câu trả lời bài nộp của ĐÚNG học sinh này
        const subAnswerRows = await query(`
          SELECT sa.question_id, sa.is_correct, q.topic_tag
          FROM submission_answers sa
          JOIN submissions s ON sa.submission_id = s.id
          JOIN questions q ON sa.question_id = q.id
          WHERE s.user_id = ?
        `, [student.id]);

        let weaknessBreakdown = StatisticsService.analyzeStudentWeaknesses(subAnswerRows);

        // 3. Lấy bài tập của ĐÚNG khối lớp của học sinh
        const exRows = await query(`
          SELECT e.id, e.title, e.difficulty, e.reward_xp, e.time_limit_minutes, l.topic_tag
          FROM exercises e
          JOIN lessons l ON e.lesson_id = l.id
          WHERE l.grade_level = ?
        `, [currentGrade]);

        const recommendations = RecommendationService.getRecommendations(weaknessBreakdown, exRows);

        // 4. Lấy huy hiệu
        const badgeRows = await query('SELECT * FROM badges ORDER BY min_xp ASC');
        const badges = badgeRows.map(b => ({
          ...b,
          unlocked: (student ? student.xp : 0) >= b.min_xp
        }));

        // 5. Lịch sử bài làm
        const recentSubs = await query(`
          SELECT s.*, e.title as exerciseTitle
          FROM submissions s
          JOIN exercises e ON s.exercise_id = e.id
          WHERE s.user_id = ?
          ORDER BY s.completed_at DESC
          LIMIT 5
        `, [student.id]);

        return res.json({
          success: true,
          dashboard: {
            student: {
              ...student,
              levelInfo
            },
            weaknessBreakdown,
            recommendations,
            badges,
            recentSubmissions: recentSubs
          }
        });
      }

      // Memory Store or guest
      const student = (memoryStore.users.find(u => u.id === studentId)) || (req.user || memoryStore.users[0]);
      const currentGrade = student?.grade_level || 2;
      const levelInfo = GradingService.calculateLevel(student?.xp || 0);
      const userAnswers = (memoryStore.submission_answers || []).filter(sa => sa.user_id === student?.id);
      const weaknessBreakdown = StatisticsService.analyzeStudentWeaknesses(userAnswers);
      const gradeExercises = (memoryStore.exercises || []).filter(e => e.grade_level === currentGrade);
      const recommendations = RecommendationService.getRecommendations(weaknessBreakdown, gradeExercises);
      const badges = (memoryStore.badges || []).map(b => ({ ...b, unlocked: (student?.xp || 0) >= b.min_xp }));

      res.json({
        success: true,
        dashboard: {
          student: { ...student, levelInfo },
          weaknessBreakdown,
          recommendations,
          badges,
          recentSubmissions: (memoryStore.submissions || []).filter(s => s.user_id === student?.id)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Cập nhật Avatar hoặc Lớp học
  static async updateSettings(req, res) {
    try {
      const studentId = req.user.id;
      const { avatar, grade_level, full_name } = req.body;

      if (getIsConnectedToMySQL()) {
        await query(
          'UPDATE users SET avatar = COALESCE(?, avatar), grade_level = COALESCE(?, grade_level), full_name = COALESCE(?, full_name) WHERE id = ?',
          [avatar, grade_level, full_name, studentId]
        );
        return res.json({ success: true, message: 'Đã cập nhật thông tin trong MySQL thành công!' });
      }

      const student = memoryStore.users.find(u => u.id === studentId);
      if (student) {
        if (avatar) student.avatar = avatar;
        if (grade_level) student.grade_level = parseInt(grade_level, 10);
        if (full_name) student.full_name = full_name;
      }

      res.json({ success: true, message: 'Đã cập nhật thông tin thành công!' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = StudentController;
