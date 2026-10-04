const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');

class ResultController {
  static async getHistory(req, res) {
    try {
      const userId = req.user ? req.user.id : (req.query.userId || 1);

      if (getIsConnectedToMySQL()) {
        const history = await query(`
          SELECT s.*, e.title as exerciseTitle, e.difficulty
          FROM submissions s
          JOIN exercises e ON s.exercise_id = e.id
          WHERE s.user_id = ?
          ORDER BY s.completed_at DESC
          LIMIT 20
        `, [userId]);

        return res.json({ success: true, history });
      }

      const userSubs = memoryStore.submissions.filter(s => s.user_id === parseInt(userId, 10));
      const history = userSubs.map(s => {
        const ex = memoryStore.exercises.find(item => item.id === s.exercise_id) || {};
        return {
          ...s,
          exerciseTitle: ex.title || 'Bài tập rèn luyện',
          difficulty: ex.difficulty || 'practice'
        };
      });

      res.json({ success: true, history });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getLeaderboard(req, res) {
    try {
      if (getIsConnectedToMySQL()) {
        const students = await query(`
          SELECT id, full_name, avatar, grade_level, xp, level, streak_days
          FROM users
          WHERE role = 'student'
          ORDER BY xp DESC, streak_days DESC
          LIMIT 10
        `);

        return res.json({ success: true, leaderboard: students });
      }

      const students = memoryStore.users
        .filter(u => u.role === 'student')
        .map(u => ({
          id: u.id,
          full_name: u.full_name,
          avatar: u.avatar,
          grade_level: u.grade_level,
          xp: u.xp || 0,
          level: u.level || 1,
          streak_days: u.streak_days || 1
        }))
        .sort((a, b) => b.xp - a.xp);

      res.json({ success: true, leaderboard: students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ResultController;
