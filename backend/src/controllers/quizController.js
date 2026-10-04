const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');
const sampleData = require('../utils/seedData');

// Chấm điểm bài tập & trả về kết quả chi tiết kèm lời giải thích đúng/sai
async function submitQuiz(req, res) {
  try {
    const userId = req.user ? req.user.id : (req.body.userId || 1);
    const { quizId, answers = {}, timeTakenSeconds = 0 } = req.body;

    if (!quizId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã bài tập (quizId)' });
    }

    let quizData = null;
    let originalQuestions = [];

    if (getIsConnectedToMySQL()) {
      const quizzes = await query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
      if (!quizzes || quizzes.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
      }
      quizData = quizzes[0];

      const questions = await query('SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index ASC', [quizId]);
      for (const q of questions) {
        const options = await query('SELECT * FROM question_options WHERE question_id = ?', [q.id]);
        q.options = options;
      }
      originalQuestions = questions;
    } else {
      // Find in memory store
      for (const t of memoryStore.topics) {
        if (t.quizzes) {
          const q = t.quizzes.find(item => item.id === parseInt(quizId, 10));
          if (q) {
            quizData = q;
            originalQuestions = q.questions;
            break;
          }
        }
      }
    }

    if (!quizData || originalQuestions.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu bài tập hoặc câu hỏi' });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let earnedPoints = 0;
    const totalQuestions = originalQuestions.length;
    const totalPossiblePoints = originalQuestions.reduce((sum, q) => sum + (q.points || 10), 0);

    const questionResults = originalQuestions.map((q, index) => {
      const userAnswer = answers[q.id] || answers[String(q.id)] || null;
      const correctOption = q.options.find(opt => opt.is_correct === true || opt.is_correct === 1);
      const isCorrect = correctOption && userAnswer === correctOption.option_label;

      if (isCorrect) {
        correctCount++;
        earnedPoints += (q.points || 10);
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        questionIndex: index + 1,
        questionText: q.question_text,
        userAnswer: userAnswer,
        correctAnswer: correctOption ? correctOption.option_label : null,
        correctAnswerText: correctOption ? correctOption.option_text : '',
        isCorrect: Boolean(isCorrect),
        points: isCorrect ? (q.points || 10) : 0,
        maxPoints: q.points || 10,
        explanation: q.explanation || 'Hãy đọc kỹ lại đề bài và xem gợi ý nhé!',
        options: q.options.map(opt => ({
          option_label: opt.option_label,
          option_text: opt.option_text,
          is_correct: Boolean(opt.is_correct)
        }))
      };
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const score10Scale = Math.round(((correctCount / totalQuestions) * 10) * 10) / 10;

    // Calculate stars reward
    let starsEarned = Math.round((correctCount / totalQuestions) * (quizData.reward_stars || 15));
    if (correctCount === totalQuestions) {
      starsEarned += 5; // Perfect score bonus star!
    }

    // Kid-friendly feedback messages & mascots
    let feedback = {
      title: 'Tuyệt đỉnh thông thái! 🌟',
      message: 'Bé đã làm đúng tất cả các câu hỏi! Quá xuất sắc!',
      badge: '🏆 Trạng Nguyên Nhí',
      mood: 'super_happy',
      sound: 'fanfare'
    };

    if (scorePercentage < 50) {
      feedback = {
        title: 'Cố gắng lên bé nhé! 💪',
        message: 'Bé chưa đạt điểm tối đa nhưng không sao cả, xem lại phần giải thích để hiểu bài hơn nhé!',
        badge: '🌱 Mầm Non Chăm Chỉ',
        mood: 'encourage',
        sound: 'try_again'
      };
    } else if (scorePercentage < 80) {
      feedback = {
        title: 'Làm tốt lắm bé ơi! 👏',
        message: 'Bé đã nắm vững đa số câu hỏi. Cùng xem lại một số câu chưa đúng nhé!',
        badge: '⭐ Học Sinh Tiên Tiến',
        mood: 'happy',
        sound: 'good_job'
      };
    }

    // Save submission to DB
    let submissionId = Date.now();

    if (getIsConnectedToMySQL()) {
      try {
        const subRes = await query(`
          INSERT INTO quiz_submissions (user_id, quiz_id, score, total_questions, correct_answers, wrong_answers, stars_earned, time_taken_seconds)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [userId, quizId, score10Scale, totalQuestions, correctCount, wrongCount, starsEarned, timeTakenSeconds]);

        submissionId = subRes.insertId;

        for (const resItem of questionResults) {
          await query(`
            INSERT INTO submission_answers (submission_id, question_id, user_answer, is_correct)
            VALUES (?, ?, ?, ?)
          `, [submissionId, resItem.questionId, resItem.userAnswer || '', resItem.isCorrect ? 1 : 0]);
        }

        // Update user's total stars
        await query('UPDATE users SET total_stars = total_stars + ? WHERE id = ?', [starsEarned, userId]);
      } catch (err) {
        console.error('Save submission DB error:', err.message);
      }
    } else {
      // Memory Store save
      const newSub = {
        id: submissionId,
        user_id: userId,
        quiz_id: quizId,
        score: score10Scale,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        stars_earned: starsEarned,
        time_taken_seconds: timeTakenSeconds,
        completed_at: new Date()
      };
      memoryStore.submissions.push(newSub);

      const student = memoryStore.users.find(u => u.id === userId);
      if (student) {
        student.total_stars = (student.total_stars || 0) + starsEarned;
      }
    }

    res.json({
      success: true,
      result: {
        submissionId,
        quizId,
        quizTitle: quizData.title,
        score10Scale,
        scorePercentage,
        totalQuestions,
        correctCount,
        wrongCount,
        earnedPoints,
        totalPossiblePoints,
        starsEarned,
        timeTakenSeconds,
        feedback,
        questionResults
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Lỗi chấm bài: ' + error.message });
  }
}

// Lấy lịch sử làm bài của học sinh
async function getHistory(req, res) {
  try {
    const userId = req.user ? req.user.id : (req.query.userId || 1);

    if (getIsConnectedToMySQL()) {
      const submissions = await query(`
        SELECT qs.*, q.title as quiz_title, t.title as topic_title
        FROM quiz_submissions qs
        JOIN quizzes q ON qs.quiz_id = q.id
        JOIN topics t ON q.topic_id = t.id
        WHERE qs.user_id = ?
        ORDER BY qs.completed_at DESC
        LIMIT 20
      `, [userId]);

      return res.json({ success: true, history: submissions });
    }

    const userSubs = memoryStore.submissions
      .filter(s => s.user_id === parseInt(userId, 10))
      .map(s => {
        let title = 'Bài tập';
        for (const t of memoryStore.topics) {
          const q = t.quizzes ? t.quizzes.find(item => item.id === s.quiz_id) : null;
          if (q) {
            title = q.title;
            break;
          }
        }
        return { ...s, quiz_title: title };
      });

    res.json({ success: true, history: userSubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  submitQuiz,
  getHistory
};
