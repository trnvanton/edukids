// =========================================================================
// RECOMMENDATION SERVICE - ĐỀ XUẤT BÀI TẬP THÍCH ỨNG THEO ĐIỂM SỐ (ADAPTIVE LEARNING)
// =========================================================================

class RecommendationService {
  /**
   * Tạo danh sách đề xuất bài học / bài tập dựa trên điểm số và điểm yếu của học sinh
   */
  static getRecommendations(weaknessAnalysis = [], availableExercises = []) {
    const recommendations = [];

    weaknessAnalysis.forEach(topic => {
      let targetDifficulty = 'practice';
      let title = '';
      let advice = '';
      let badgeType = '';

      if (topic.percentage < 50) {
        targetDifficulty = 'basic';
        title = `📚 Ôn lại ${topic.name} cơ bản`;
        advice = `Bé đang đạt ${topic.percentage}% ở phần này. Hãy làm các bài tập nền tảng để nắm chắc kiến thức nhé!`;
        badgeType = 'basic';
      } else if (topic.percentage < 70) {
        targetDifficulty = 'practice';
        title = `✏️ Luyện tập bổ sung ${topic.name}`;
        advice = `Bé đạt ${topic.percentage}%. Chỉ cần luyện tập thêm một chút là sẽ thành thạo ngay!`;
        badgeType = 'practice';
      } else if (topic.percentage <= 90) {
        targetDifficulty = 'advanced';
        title = `🚀 Bài tập nâng cao ${topic.name}`;
        advice = `Bé làm rất tốt (${topic.percentage}%)! Cùng thử sức với các bài toán mở rộng tư duy nhé!`;
        badgeType = 'advanced';
      } else {
        targetDifficulty = 'challenge';
        title = `🎯 Thử thách Trạng Nguyên ${topic.name}`;
        advice = `Xuất sắc (${topic.percentage}%)! Bé đã sẵn sàng nhận huy hiệu Siêu Học Sinh chưa?`;
        badgeType = 'challenge';
      }

      // Match available exercises with topic_tag and difficulty
      const matchedEx = availableExercises.filter(ex => 
        (ex.topic_tag === topic.tag || !ex.topic_tag) && 
        (ex.difficulty === targetDifficulty || ex.difficulty === 'practice')
      );

      recommendations.push({
        topicTag: topic.tag,
        topicName: topic.name,
        currentPercentage: topic.percentage,
        recommendationTitle: title,
        advice,
        targetDifficulty,
        badgeType,
        exercises: matchedEx.slice(0, 3)
      });
    });

    // Fallback recommendation if student has no history yet
    if (recommendations.length === 0) {
      recommendations.push({
        topicTag: 'khoi-dau',
        topicName: 'Làm Quen Khởi Động',
        currentPercentage: 100,
        recommendationTitle: '⭐ Khởi động cùng bài tập đầu tiên!',
        advice: 'Hãy chọn môn Toán hoặc Tiếng Việt để tích lũy 50 XP đầu tiên nhé!',
        targetDifficulty: 'basic',
        badgeType: 'basic',
        exercises: availableExercises.slice(0, 2)
      });
    }

    return recommendations;
  }
}

module.exports = RecommendationService;
