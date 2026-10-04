const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');

class SubjectController {
  static async getAll(req, res) {
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

  static async getLessonsBySubject(req, res) {
    try {
      const { subjectId } = req.params;
      const { grade } = req.query;

      if (getIsConnectedToMySQL()) {
        let sql = 'SELECT * FROM lessons WHERE subject_id = ?';
        const params = [subjectId];
        if (grade) {
          sql += ' AND grade_level = ?';
          params.push(grade);
        }
        sql += ' ORDER BY order_index ASC';
        const lessons = await query(sql, params);
        return res.json({ success: true, lessons });
      }

      let lessons = memoryStore.lessons.filter(l => l.subject_id === parseInt(subjectId, 10));
      if (grade) {
        lessons = lessons.filter(l => l.grade_level === parseInt(grade, 10));
      }

      res.json({ success: true, lessons });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = SubjectController;
