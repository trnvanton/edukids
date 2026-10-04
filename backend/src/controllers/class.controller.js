const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');

class ClassController {
  static async getAll(req, res) {
    try {
      if (getIsConnectedToMySQL()) {
        const classes = await query(`
          SELECT c.*, u.full_name as teacherName,
            (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as studentCount
          FROM classes c
          LEFT JOIN users u ON c.teacher_id = u.id
          ORDER BY c.grade_level ASC
        `);
        return res.json({ success: true, classes });
      }

      const classes = memoryStore.classes.map(c => {
        const teacher = memoryStore.users.find(u => u.id === c.teacher_id);
        const studentCount = c.student_ids ? c.student_ids.length : 0;
        return {
          ...c,
          teacherName: teacher ? teacher.full_name : 'Chưa phân công',
          studentCount
        };
      });
      res.json({ success: true, classes });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const classId = parseInt(req.params.id, 10);

      if (getIsConnectedToMySQL()) {
        const clsRows = await query('SELECT * FROM classes WHERE id = ?', [classId]);
        if (!clsRows || clsRows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học!' });

        const students = await query(`
          SELECT u.id, u.full_name, u.avatar, u.xp, u.level, u.grade_level
          FROM class_students cs
          JOIN users u ON cs.student_id = u.id
          WHERE cs.class_id = ?
        `, [classId]);

        return res.json({ success: true, classInfo: clsRows[0], students });
      }

      const cls = memoryStore.classes.find(c => c.id === classId);
      if (!cls) return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học!' });

      const students = memoryStore.users.filter(u => cls.student_ids && cls.student_ids.includes(u.id));
      res.json({ success: true, classInfo: cls, students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ClassController;
