// =========================================================================
// GRADING SERVICE - CHẤM ĐIỂM, TÍNH XP, COMBO STREAK VÀ LỜI GIẢI THÍCH
// =========================================================================

class GradingService {
  /**
   * Tính level dựa trên tổng XP
   * Level 1 (0-100): Mầm non
   * Level 2 (100-300): Người mới
   * Level 3 (300-600): Bé chăm học
   * Level 4 (600-1000): Học sinh giỏi
   * Level 5 (1000+): Siêu học sinh
   */
  static calculateLevel(xp) {
    if (xp >= 1000) return { level: 5, title: 'Siêu Học Sinh', icon: '👑', nextLevelXp: null, progress: 100 };
    if (xp >= 600) return { level: 4, title: 'Học Sinh Giỏi', icon: '🚀', nextLevelXp: 1000, progress: Math.round(((xp - 600) / 400) * 100) };
    if (xp >= 300) return { level: 3, title: 'Bé Chăm Học', icon: '🐱', nextLevelXp: 600, progress: Math.round(((xp - 300) / 300) * 100) };
    if (xp >= 100) return { level: 2, title: 'Người Mới', icon: '🐥', nextLevelXp: 300, progress: Math.round(((xp - 100) / 200) * 100) };
    return { level: 1, title: 'Mầm Non', icon: '🌱', nextLevelXp: 100, progress: Math.round((xp / 100) * 100) };
  }

  /**
   * Chấm điểm bài tập, tính XP, Combo và tạo phản hồi sư phạm
   */
  static gradeExercise(questions, userAnswers, exerciseMeta = {}) {
    let correctCount = 0;
    let wrongCount = 0;
    let currentCombo = 0;
    let maxCombo = 0;

    const totalQuestions = questions.length;
    const baseRewardXp = exerciseMeta.reward_xp || 20;

    const questionBreakdown = questions.map((q, index) => {
      const userAnswer = userAnswers[q.id] || userAnswers[String(q.id)] || null;
      const correctOption = q.answers.find(a => a.is_correct === true || a.is_correct === 1);
      const isCorrect = correctOption && (userAnswer === correctOption.option_label || userAnswer === correctOption.answer_text);

      if (isCorrect) {
        correctCount++;
        currentCombo++;
        if (currentCombo > maxCombo) maxCombo = currentCombo;
      } else {
        wrongCount++;
        currentCombo = 0; // reset combo on wrong answer
      }

      // Kid-friendly pedagogical feedback message
      let questionFeedback = '';
      if (isCorrect) {
        questionFeedback = `🎉 Chính xác! Bạn đã trả lời đúng! (+5 XP)`;
      } else {
        questionFeedback = `❌ Chưa chính xác! Đáp án đúng: ${correctOption ? correctOption.option_label : ''}. ${correctOption ? correctOption.answer_text : ''}\n💡 Giải thích: ${q.explanation}\n⭐ Đừng lo! Hãy thử câu tiếp theo nhé!`;
      }

      return {
        questionId: q.id,
        questionIndex: index + 1,
        questionText: q.question_text,
        topicTag: q.topic_tag || 'chung',
        userAnswer: userAnswer,
        correctAnswer: correctOption ? correctOption.option_label : '',
        correctAnswerText: correctOption ? correctOption.answer_text : '',
        isCorrect: Boolean(isCorrect),
        explanation: q.explanation || 'Hãy đọc kỹ đề bài và xem lại các bước giải nhé!',
        hint: q.hint || '',
        feedbackMessage: questionFeedback,
        options: q.answers.map(a => ({
          option_label: a.option_label,
          answer_text: a.answer_text,
          is_correct: Boolean(a.is_correct)
        }))
      };
    });

    // Thang điểm 10
    const score10 = totalQuestions > 0 ? Math.round(((correctCount / totalQuestions) * 10) * 10) / 10 : 0;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // XP Gamification Calculation:
    // + Base XP for completion
    // + 5 XP per correct answer
    // + 30 bonus XP for 100% score
    // + 50 bonus XP for score >= 90%
    // + Combo bonus: maxCombo * 3 XP
    let xpEarned = baseRewardXp + (correctCount * 5);
    if (scorePercentage === 100) {
      xpEarned += 30; // Perfect score bonus
    } else if (scorePercentage >= 90) {
      xpEarned += 20; // Near perfect bonus
    }
    if (maxCombo >= 3) {
      xpEarned += (maxCombo * 3); // Combo fire bonus
    }

    // Overall mood & congratulation badge
    let overallMessage = {
      title: 'Tuyệt Đỉnh Thông Thái! 🌟',
      sub: 'Bé đã hoàn thành xuất sắc bài tập hôm nay!',
      badge: '🏆 Siêu Học Sinh',
      mood: 'super_happy'
    };

    if (scorePercentage < 50) {
      overallMessage = {
        title: 'Cố Gắng Lên Bé Nhé! 💪',
        sub: 'Bé chưa đạt điểm cao nhưng đừng nản lòng, xem lại lời giải bên dưới để hiểu bài hơn nhé!',
        badge: '🌱 Mầm Non Chăm Chỉ',
        mood: 'encourage'
      };
    } else if (scorePercentage < 80) {
      overallMessage = {
        title: 'Làm Tốt Lắm Bé Ơi! 👏',
        sub: 'Bé đã nắm vững đa số câu hỏi. Cùng ôn lại các câu chưa đúng nhé!',
        badge: '⭐ Bé Chăm Học',
        mood: 'happy'
      };
    }

    return {
      score10,
      scorePercentage,
      totalQuestions,
      correctCount,
      wrongCount,
      xpEarned,
      maxCombo,
      overallMessage,
      questionBreakdown
    };
  }
}

module.exports = GradingService;
