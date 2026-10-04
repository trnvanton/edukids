const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');
const sampleData = require('../utils/seedData');

// Lấy danh sách khối lớp (Lớp 1 - Lớp 5)
async function getGrades(req, res) {
  try {
    if (getIsConnectedToMySQL()) {
      const grades = await query('SELECT * FROM grades ORDER BY grade_number ASC');
      return res.json({ success: true, grades });
    }
    res.json({ success: true, grades: memoryStore.grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Lấy danh sách môn học
async function getSubjects(req, res) {
  try {
    if (getIsConnectedToMySQL()) {
      const subjects = await query('SELECT * FROM subjects ORDER BY id ASC');
      return res.json({ success: true, subjects });
    }
    res.json({ success: true, subjects: memoryStore.subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Lấy danh sách chủ đề theo khối lớp và môn học
async function getTopics(req, res) {
  try {
    const { gradeId, subjectId } = req.query;

    if (getIsConnectedToMySQL()) {
      let sql = `
        SELECT t.*, 
          (SELECT COUNT(*) FROM quizzes q WHERE q.topic_id = t.id) as quiz_count,
          (SELECT SUM(q.reward_stars) FROM quizzes q WHERE q.topic_id = t.id) as total_stars
        FROM topics t
        WHERE 1=1
      `;
      const params = [];

      if (gradeId) {
        sql += ' AND t.grade_id = ?';
        params.push(gradeId);
      }
      if (subjectId) {
        sql += ' AND t.subject_id = ?';
        params.push(subjectId);
      }

      sql += ' ORDER BY t.order_index ASC';
      const topics = await query(sql, params);
      return res.json({ success: true, topics });
    }

    // Memory Store filter
    let filtered = memoryStore.topics;
    if (gradeId) {
      filtered = filtered.filter(t => t.grade_id === parseInt(gradeId, 10));
    }
    if (subjectId) {
      filtered = filtered.filter(t => t.subject_id === parseInt(subjectId, 10));
    }

    const result = filtered.map(t => ({
      id: t.id,
      grade_id: t.grade_id,
      subject_id: t.subject_id,
      title: t.title,
      description: t.description,
      icon: t.icon,
      order_index: t.order_index,
      quiz_count: t.quizzes ? t.quizzes.length : 0,
      total_stars: t.quizzes ? t.quizzes.reduce((acc, q) => acc + (q.reward_stars || 10), 0) : 0,
      quizzes: t.quizzes ? t.quizzes.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        time_limit_minutes: q.time_limit_minutes,
        reward_stars: q.reward_stars,
        question_count: q.questions ? q.questions.length : 0
      })) : []
    }));

    res.json({ success: true, topics: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Lấy chi tiết đề bài tập / Quiz để làm bài (Ẩn đáp án đúng để học sinh tự làm)
async function getQuizById(req, res) {
  try {
    const quizId = parseInt(req.params.id, 10);

    if (getIsConnectedToMySQL()) {
      const quizzes = await query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
      if (!quizzes || quizzes.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập này!' });
      }

      const quiz = quizzes[0];
      const questions = await query(
        'SELECT id, quiz_id, question_text, question_type, points, hint, media_url, order_index FROM questions WHERE quiz_id = ? ORDER BY order_index ASC',
        [quizId]
      );

      for (const q of questions) {
        const options = await query(
          'SELECT id, option_label, option_text FROM question_options WHERE question_id = ? ORDER BY option_label ASC',
          [q.id]
        );
        q.options = options;
      }

      return res.json({
        success: true,
        quiz: {
          ...quiz,
          questions
        }
      });
    }

    // Memory Store lookup
    let foundQuiz = null;
    let foundTopic = null;

    for (const t of memoryStore.topics) {
      if (t.quizzes) {
        const q = t.quizzes.find(item => item.id === quizId);
        if (q) {
          foundQuiz = q;
          foundTopic = t;
          break;
        }
      }
    }

    if (!foundQuiz) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập này!' });
    }

    // Sanitized questions (hide is_correct and explanation until user submits)
    const sanitizedQuestions = foundQuiz.questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      points: q.points || 10,
      hint: q.hint || '',
      options: q.options.map(opt => ({
        option_label: opt.option_label,
        option_text: opt.option_text
      }))
    }));

    res.json({
      success: true,
      quiz: {
        id: foundQuiz.id,
        topic_id: foundTopic.id,
        topic_title: foundTopic.title,
        title: foundQuiz.title,
        description: foundQuiz.description,
        difficulty: foundQuiz.difficulty,
        time_limit_minutes: foundQuiz.time_limit_minutes,
        reward_stars: foundQuiz.reward_stars,
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getGrades,
  getSubjects,
  getTopics,
  getQuizById
};
