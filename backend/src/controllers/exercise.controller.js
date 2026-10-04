const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');
const GradingService = require('../services/grading.service');

class ExerciseController {
  // Lấy chi tiết bài tập để học sinh làm (Ẩn đáp án đúng is_correct)
  static async getById(req, res) {
    try {
      const exerciseId = parseInt(req.params.id, 10);

      if (getIsConnectedToMySQL()) {
        const exercises = await query(`
          SELECT e.*, l.title as lesson_title, s.name as subject_name, s.color as subject_color
          FROM exercises e
          JOIN lessons l ON e.lesson_id = l.id
          JOIN subjects s ON l.subject_id = s.id
          WHERE e.id = ?
        `, [exerciseId]);

        if (!exercises || exercises.length === 0) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập trong MySQL!' });
        }

        const exercise = exercises[0];
        const questions = await query('SELECT * FROM questions WHERE exercise_id = ? ORDER BY order_index ASC', [exerciseId]);

        for (const q of questions) {
          const answers = await query('SELECT option_label, answer_text FROM answers WHERE question_id = ? ORDER BY option_label ASC', [q.id]);
          q.options = answers;
        }

        return res.json({
          success: true,
          exercise: {
            id: exercise.id,
            title: exercise.title,
            difficulty: exercise.difficulty,
            time_limit_minutes: exercise.time_limit_minutes,
            reward_xp: exercise.reward_xp,
            subject_name: exercise.subject_name,
            subject_color: exercise.subject_color,
            lesson_title: exercise.lesson_title,
            questions: questions.map((q, idx) => ({
              id: q.id,
              index: idx + 1,
              question_text: q.question_text,
              points: q.points || 10,
              hint: q.hint || '',
              topic_tag: q.topic_tag,
              options: q.options
            }))
          }
        });
      }

      // Memory Store Fallback
      const exercise = memoryStore.exercises.find(e => e.id === exerciseId);
      if (!exercise) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập!' });

      const lesson = memoryStore.lessons.find(l => l.id === exercise.lesson_id) || {};
      const subject = memoryStore.subjects.find(s => s.id === lesson.subject_id) || {};

      res.json({
        success: true,
        exercise: {
          id: exercise.id,
          title: exercise.title,
          difficulty: exercise.difficulty,
          time_limit_minutes: exercise.time_limit_minutes,
          reward_xp: exercise.reward_xp,
          subject_name: subject.name || 'Học Tập',
          subject_color: subject.color || '#3B82F6',
          lesson_title: lesson.title || '',
          questions: exercise.questions.map((q, idx) => ({
            id: q.id,
            index: idx + 1,
            question_text: q.question_text,
            points: q.points || 10,
            hint: q.hint || '',
            topic_tag: q.topic_tag,
            options: q.answers.map(a => ({
              option_label: a.option_label,
              answer_text: a.answer_text
            }))
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Nộp bài & Chấm điểm tức thì kèm giải thích
  static async submit(req, res) {
    try {
      const userId = req.user ? req.user.id : (req.body.userId || 1);
      const { exerciseId, answers = {}, timeTakenSeconds = 0 } = req.body;

      let exercise = null;
      let questionsWithAnswers = [];

      if (getIsConnectedToMySQL()) {
        const exRows = await query('SELECT * FROM exercises WHERE id = ?', [exerciseId]);
        if (exRows && exRows.length > 0) {
          exercise = exRows[0];
          const qRows = await query('SELECT * FROM questions WHERE exercise_id = ?', [exerciseId]);
          for (const q of qRows) {
            const ansRows = await query('SELECT * FROM answers WHERE question_id = ?', [q.id]);
            q.answers = ansRows;
          }
          questionsWithAnswers = qRows;
        }
      } else {
        exercise = memoryStore.exercises.find(e => e.id === parseInt(exerciseId, 10));
        if (exercise) questionsWithAnswers = exercise.questions;
      }

      if (!exercise || questionsWithAnswers.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập để chấm điểm!' });
      }

      // Grade via GradingService
      const gradingResult = GradingService.gradeExercise(questionsWithAnswers, answers, exercise);
      let submissionId = Date.now();

      if (getIsConnectedToMySQL()) {
        try {
          // Check if user exists before inserting
          const userExists = await query('SELECT id FROM users WHERE id = ?', [userId]);
          const actualUserId = (userExists && userExists.length > 0) ? userId : 1;

          const subRes = await query(`
            INSERT INTO submissions (user_id, exercise_id, score, total_questions, correct_count, wrong_count, xp_earned, combo_max, time_taken_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [actualUserId, exercise.id, gradingResult.score10, gradingResult.totalQuestions, gradingResult.correctCount, gradingResult.wrongCount, gradingResult.xpEarned, gradingResult.maxCombo, timeTakenSeconds]);

          submissionId = subRes.insertId;

          for (const qb of gradingResult.questionBreakdown) {
            await query(`
              INSERT INTO submission_answers (submission_id, question_id, user_answer, is_correct)
              VALUES (?, ?, ?, ?)
            `, [submissionId, qb.questionId, qb.userAnswer || '', qb.isCorrect ? 1 : 0]);
          }

          // Update user XP in MySQL
          await query('UPDATE users SET xp = xp + ? WHERE id = ?', [gradingResult.xpEarned, actualUserId]);
        } catch (dbErr) {
          console.warn('MySQL save submission error:', dbErr.message);
        }
      } else {
        const newSubmission = {
          id: submissionId,
          user_id: userId,
          exercise_id: exercise.id,
          score: gradingResult.score10,
          total_questions: gradingResult.totalQuestions,
          correct_count: gradingResult.correctCount,
          wrong_count: gradingResult.wrongCount,
          xp_earned: gradingResult.xpEarned,
          combo_max: gradingResult.maxCombo,
          time_taken_seconds: timeTakenSeconds,
          completed_at: new Date()
        };
        memoryStore.submissions.unshift(newSubmission);
      }

      res.json({
        success: true,
        result: {
          submissionId,
          exerciseId: exercise.id,
          exerciseTitle: exercise.title,
          timeTakenSeconds,
          ...gradingResult
        }
      });
    } catch (error) {
      console.error('Submission error:', error);
      res.status(500).json({ success: false, message: 'Lỗi chấm bài: ' + error.message });
    }
  }
}

module.exports = ExerciseController;
