// =========================================================================
// STATISTICS SERVICE - PHÂN TÍCH TIẾN ĐỘ, ĐIỂM MẠNH & ĐIỂM YẾU
// =========================================================================

class StatisticsService {
  /**
   * Phân tích tỷ lệ phần trăm chính xác theo từng Topic Tag cho học sinh
   */
  static analyzeStudentWeaknesses(submissionAnswers = []) {
    const topicStats = {};

    submissionAnswers.forEach(ans => {
      const tag = ans.topic_tag || 'chung';
      if (!topicStats[tag]) {
        topicStats[tag] = { total: 0, correct: 0, name: this.getTopicName(tag) };
      }
      topicStats[tag].total += 1;
      if (ans.is_correct) {
        topicStats[tag].correct += 1;
      }
    });

    const breakdown = Object.keys(topicStats).map(tag => {
      const st = topicStats[tag];
      const percentage = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
      return {
        tag,
        name: st.name,
        totalQuestions: st.total,
        correctCount: st.correct,
        percentage,
        status: percentage >= 80 ? 'strong' : (percentage >= 60 ? 'average' : 'weak')
      };
    });

    // Sắp xếp các phần yếu nhất lên đầu để gợi ý ôn tập
    breakdown.sort((a, b) => a.percentage - b.percentage);

    return breakdown;
  }

  /**
   * Đọc tên hiển thị thân thiện từ topic_tag
   */
  static getTopicName(tag) {
    const map = {
      'phan-so': 'Phân Số',
      'hinh-hoc': 'Hình Học',
      'phep-cong': 'Phép Cộng & Trừ',
      'phep-nhan': 'Phép Nhân & Chia',
      'so-thap-phan': 'Số Thập Phân',
      'doc-hieu': 'Đọc Hiểu',
      'chinh-ta': 'Chính Tả',
      'luyen-tu-cau': 'Luyện Từ Và Câu',
      'tu-vung-anh': 'Từ Vựng Tiếng Anh',
      'khoa-hoc-tn': 'Khoa Học & Đời Sống'
    };
    return map[tag] || tag;
  }

  /**
   * Thống kê dành cho Giáo viên quản lý lớp học
   */
  static analyzeClassPerformance(students = [], submissions = []) {
    const totalStudents = students.length;
    let totalScoreSum = 0;
    let totalSubmissionsCount = submissions.length;

    const studentSummary = students.map(st => {
      const userSubs = submissions.filter(s => s.user_id === st.id);
      const studentScoreSum = userSubs.reduce((sum, s) => sum + s.score, 0);
      const avgScore = userSubs.length > 0 ? Math.round((studentScoreSum / userSubs.length) * 10) / 10 : 0;

      totalScoreSum += avgScore;

      return {
        id: st.id,
        full_name: st.full_name,
        avatar: st.avatar,
        grade_level: st.grade_level,
        xp: st.xp || 0,
        submissionsCount: userSubs.length,
        averageScore: avgScore,
        isStruggling: avgScore > 0 && avgScore < 6.5
      };
    });

    const classAverageScore = totalStudents > 0 ? Math.round((totalScoreSum / totalStudents) * 10) / 10 : 0;
    const strugglingStudents = studentSummary.filter(s => s.isStruggling);

    return {
      totalStudents,
      totalSubmissionsCount,
      classAverageScore,
      studentSummary,
      strugglingStudents
    };
  }
}

module.exports = StatisticsService;
