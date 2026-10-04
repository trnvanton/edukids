const { memoryStore } = require('../config/database');
const StatisticsService = require('../services/statistics.service');
const RecommendationService = require('../services/recommendation.service');
const GradingService = require('../services/grading.service');

class StudentController {
  /**
   * Lấy toàn bộ dữ liệu Dashboard của Học sinh: XP, Level, Streak, Điểm mạnh/yếu, Bài tập đề xuất, Huy hiệu
   */
  static async getDashboard(req, res) {
    try {
      const studentId = req.user ? req.user.id : 1;
      const student = memoryStore.users.find(u => u.id === studentId) || memoryStore.users[0];

      // 1. Level & XP
      const levelInfo = GradingService.calculateLevel(student.xp || 0);

      // 2. Weakness Analytics (Phân tích lỗi & điểm mạnh/yếu)
      const userAnswers = memoryStore.submission_answers || [];
      const weaknessBreakdown = StatisticsService.analyzeStudentWeaknesses(userAnswers);

      // 3. Adaptive Recommendations (Đề xuất bài tập theo điểm số)
      const availableExercises = memoryStore.exercises.map(ex => ({
        id: ex.id,
        title: ex.title,
        difficulty: ex.difficulty,
        reward_xp: ex.reward_xp,
        topic_tag: ex.topic_tag,
        time_limit_minutes: ex.time_limit_minutes
      }));
      const recommendations = RecommendationService.getRecommendations(weaknessBreakdown, availableExercises);

      // 4. Badges (Huy hiệu mở khóa)
      const badges = memoryStore.badges.map(b => ({
        ...b,
        unlocked: (student.xp || 0) >= b.min_xp
      }));

      // 5. Recent Submissions
      const recentSubs = memoryStore.submissions
        .filter(s => s.user_id === student.id)
        .slice(0, 5);

      res.json({
        success: true,
        dashboard: {
          student: {
            id: student.id,
            full_name: student.full_name,
            avatar: student.avatar,
            grade_level: student.grade_level,
            xp: student.xp || 0,
            streak_days: student.streak_days || 1,
            levelInfo
          },
          weaknessBreakdown,
          recommendations,
          badges,
          recentSubmissions: recentSubs
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
