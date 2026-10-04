const { query, getIsConnectedToMySQL, memoryStore } = require('../config/database');

// Bảng vàng danh dự học sinh chăm chỉ (Leaderboard)
async function getLeaderboard(req, res) {
  try {
    if (getIsConnectedToMySQL()) {
      const topStudents = await query(`
        SELECT id, username, full_name, grade_level, avatar, total_stars, streak_days
        FROM users
        WHERE role = 'student'
        ORDER BY total_stars DESC, streak_days DESC
        LIMIT 10
      `);
      return res.json({ success: true, leaderboard: topStudents });
    }

    const mockTop = [
      { id: 1, full_name: 'Bé Minh Anh', grade_level: 1, avatar: 'mascot-bear', total_stars: 120, streak_days: 5 },
      { id: 2, full_name: 'Bé Tuấn Kiệt', grade_level: 3, avatar: 'mascot-lion', total_stars: 95, streak_days: 4 },
      { id: 3, full_name: 'Bé Bảo Ngọc', grade_level: 2, avatar: 'mascot-rabbit', total_stars: 80, streak_days: 3 },
      { id: 4, full_name: 'Bé Gia Huy', grade_level: 5, avatar: 'mascot-fox', total_stars: 75, streak_days: 3 },
      { id: 5, full_name: 'Bé Khánh Linh', grade_level: 4, avatar: 'mascot-panda', total_stars: 60, streak_days: 2 }
    ];

    // Merge registered memory users
    const allUsers = [...memoryStore.users].map(u => ({
      id: u.id,
      full_name: u.full_name,
      grade_level: u.grade_level,
      avatar: u.avatar,
      total_stars: u.total_stars || 10,
      streak_days: u.streak_days || 1
    }));

    const combined = [...mockTop];
    for (const u of allUsers) {
      if (!combined.some(c => c.id === u.id)) {
        combined.push(u);
      }
    }
    combined.sort((a, b) => b.total_stars - a.total_stars);

    res.json({ success: true, leaderboard: combined.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Danh sách huy hiệu thành tích
async function getBadges(req, res) {
  try {
    const badges = [
      { id: 1, name: 'Mầm Non Chăm Chỉ', icon: '🌟', description: 'Hoàn thành bài tập đầu tiên', required_stars: 10 },
      { id: 2, name: 'Thần Đồng Toán Học', icon: '🧮', description: 'Đạt từ 30 sao môn Toán', required_stars: 30 },
      { id: 3, name: 'Nhà Văn Nhí Xuất Sắc', icon: '📖', description: 'Đạt từ 30 sao môn Tiếng Việt', required_stars: 30 },
      { id: 4, name: 'Hiệp Sĩ Ngoại Ngữ', icon: '🗣️', description: 'Đạt từ 30 sao môn Tiếng Anh', required_stars: 30 },
      { id: 5, name: 'Trạng Nguyên Nhí', icon: '👑', description: 'Đạt 100 ngôi sao vinh quang', required_stars: 100 }
    ];

    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getLeaderboard,
  getBadges
};
