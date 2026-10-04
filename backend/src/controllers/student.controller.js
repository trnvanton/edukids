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
      const studentId = req.user ? req.user.id : 1;

      if (getIsConnectedToMySQL()) {
        // 1. Lấy thông tin học sinh
        const studentRows = await query('SELECT id, username, full_name, role, grade_level, avatar, xp, level, streak_days FROM users WHERE id = ?', [studentId]);
        const student = (studentRows && studentRows.length > 0) ? studentRows[0] : (await query('SELECT * FROM users WHERE role = "student" LIMIT 1'))[0];

        const levelInfo = GradingService.calculateLevel(student ? (student.xp || 0) : 0);

        // 2. Lấy câu trả lời bài nộp để phân tích điểm yếu (Weakness Analytics)
        const subAnswerRows = await query(`
          SELECT sa.question_id, sa.is_correct, q.topic_tag
          FROM submission_answers sa
          JOIN submissions s ON sa.submission_id = s.id
          JOIN questions q ON sa.question_id = q.id
          WHERE s.user_id = ?
        `, [student ? student.id : 1]);

        let weaknessBreakdown = StatisticsService.analyzeStudentWeaknesses(subAnswerRows);
        if (weaknessBreakdown.length === 0) {
          // Default initial breakdown if student hasn't completed many tests yet
          weaknessBreakdown = [
            { tag: 'hinh-hoc', name: 'Hình Học', totalQuestions: 12, correctCount: 11, percentage: 92, status: 'strong' },
            { tag: 'doc-hieu', name: 'Đọc Hiểu', totalQuestions: 10, correctCount: 8, percentage: 80, status: 'strong' },
            { tag: 'phep-nhan', name: 'Phép Nhân & Chia', totalQuestions: 15, correctCount: 11, percentage: 73, status: 'average' },
            { tag: 'phan-so', name: 'Phân Số', totalQuestions: 15, correctCount: 9, percentage: 60, status: 'average' }
          ];
        }

        // 3. Lấy danh sách bài tập từ MySQL để tạo đề xuất thích ứng (Adaptive Recommendations)
        const exRows = await query(`
          SELECT e.id, e.title, e.difficulty, e.reward_xp, e.time_limit_minutes, l.topic_tag
          FROM exercises e
          JOIN lessons l ON e.lesson_id = l.id
        `);
        const recommendations = RecommendationService.getRecommendations(weaknessBreakdown, exRows);

        // 4. Lấy huy hiệu từ MySQL
        const badgeRows = await query('SELECT * FROM badges ORDER BY min_xp ASC');
        const badges = badgeRows.map(b => ({
          ...b,
          unlocked: (student ? student.xp : 0) >= b.min_xp
        }));

        // 5. Lịch sử bài làm gần đây
        const recentSubs = await query(`
          SELECT s.*, e.title as exerciseTitle
          FROM submissions s
          JOIN exercises e ON s.exercise_id = e.id
          WHERE s.user_id = ?
          ORDER BY s.completed_at DESC
          LIMIT 5
        `, [student ? student.id : 1]);

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

      // Memory Store fallback
      const student = memoryStore.users.find(u => u.id === studentId) || memoryStore.users[0];
      const levelInfo = GradingService.calculateLevel(student.xp || 0);
      const userAnswers = memoryStore.submission_answers || [];
      const weaknessBreakdown = StatisticsService.analyzeStudentWeaknesses(userAnswers);
      const recommendations = RecommendationService.getRecommendations(weaknessBreakdown, memoryStore.exercises);
      const badges = memoryStore.badges.map(b => ({ ...b, unlocked: (student.xp || 0) >= b.min_xp }));

      res.json({
        success: true,
        dashboard: {
          student: { ...student, levelInfo },
          weaknessBreakdown,
          recommendations,
          badges,
          recentSubmissions: memoryStore.submissions.filter(s => s.user_id === student.id)
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
