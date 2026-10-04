const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isConnectedToMySQL = false;

// Hybrid in-memory store for instant demonstration & zero-setup testing
const memoryStore = {
  users: [
    {
      id: 1,
      username: 'student1',
      email: 'student1@edukids.vn',
      password: '$2a$10$wT8hL2cvyyqDqJc2gq5F6e4y8Fj4Qp2C7H5kR1w7u6M8K3l1N9e3G', // 123456
      full_name: 'Nguyễn Minh Anh',
      role: 'student',
      grade_level: 4,
      avatar: 'mascot-bear',
      xp: 1250,
      level: 5,
      streak_days: 7,
      created_at: new Date()
    },
    {
      id: 2,
      username: 'student2',
      email: 'student2@edukids.vn',
      password: '$2a$10$wT8hL2cvyyqDqJc2gq5F6e4y8Fj4Qp2C7H5kR1w7u6M8K3l1N9e3G',
      full_name: 'Trần Bình',
      role: 'student',
      grade_level: 4,
      avatar: 'mascot-lion',
      xp: 850,
      level: 4,
      streak_days: 5,
      created_at: new Date()
    },
    {
      id: 3,
      username: 'student3',
      email: 'student3@edukids.vn',
      password: '$2a$10$wT8hL2cvyyqDqJc2gq5F6e4y8Fj4Qp2C7H5kR1w7u6M8K3l1N9e3G',
      full_name: 'Lê Minh',
      role: 'student',
      grade_level: 4,
      avatar: 'mascot-rabbit',
      xp: 420,
      level: 3,
      streak_days: 2,
      created_at: new Date()
    },
    {
      id: 10,
      username: 'teacher1',
      email: 'teacher1@edukids.vn',
      password: '$2a$10$wT8hL2cvyyqDqJc2gq5F6e4y8Fj4Qp2C7H5kR1w7u6M8K3l1N9e3G',
      full_name: 'Cô Hoàng Mai',
      role: 'teacher',
      grade_level: 4,
      avatar: 'mascot-panda',
      xp: 0,
      level: 1,
      streak_days: 10,
      created_at: new Date()
    },
    {
      id: 99,
      username: 'admin',
      email: 'admin@edukids.vn',
      password: '$2a$10$wT8hL2cvyyqDqJc2gq5F6e4y8Fj4Qp2C7H5kR1w7u6M8K3l1N9e3G',
      full_name: 'Quản Trị Viên EduKids',
      role: 'admin',
      grade_level: 0,
      avatar: 'mascot-fox',
      xp: 9999,
      level: 5,
      streak_days: 30,
      created_at: new Date()
    }
  ],

  classes: [
    { id: 1, name: '4A1', grade_level: 4, school_year: '2025-2026', teacher_id: 10, student_ids: [1, 2, 3] },
    { id: 2, name: '3A2', grade_level: 3, school_year: '2025-2026', teacher_id: 10, student_ids: [] },
    { id: 3, name: '1B', grade_level: 1, school_year: '2025-2026', teacher_id: 10, student_ids: [] }
  ],

  subjects: [
    { id: 1, name: 'Toán Học', code: 'toan', icon: '📐', color: '#3B82F6', description: 'Số tự nhiên, phân số, hình học & tính toán nhanh' },
    { id: 2, name: 'Tiếng Việt', code: 'tieng-viet', icon: '📖', color: '#EF4444', description: 'Đọc hiểu, chính tả, luyện từ và câu, tập làm văn' },
    { id: 3, name: 'Khoa Học', code: 'khoa-hoc', icon: '🔬', color: '#8B5CF6', description: 'Con người, động vật, thực vật & thế giới tự nhiên' },
    { id: 4, name: 'Tiếng Anh', code: 'tieng-anh', icon: '🇬🇧', color: '#10B981', description: 'Vocabulary, Grammar, Reading & Listening vui nhộn' }
  ],

  lessons: [
    { id: 1, subject_id: 1, grade_level: 4, title: 'Phân Số & Các Phép Tính Phân Số', topic_tag: 'phan-so', description: 'Rút gọn phân số, quy đồng mẫu số, cộng trừ nhân chia phân số', icon: '🍰', order_index: 1 },
    { id: 2, subject_id: 1, grade_level: 4, title: 'Hình Học: Góc, Chu Vi & Diện Tích', topic_tag: 'hinh-hoc', description: 'Góc nhọn, tù, bẹt, hình bình hành, hình thoi', icon: '📐', order_index: 2 },
    { id: 3, subject_id: 1, grade_level: 4, title: 'Số Tự Nhiên & Các Phép Tính', topic_tag: 'phep-nhan', description: 'Nhân chia với số có nhiều chữ số, tính chất đại số', icon: '🔢', order_index: 3 },
    { id: 4, subject_id: 2, grade_level: 4, title: 'Đọc Hiểu: Bài Học Cuộc Sống', topic_tag: 'doc-hieu', description: 'Tập đọc diễn cảm và nắm bắt thông điệp câu chuyện', icon: '📖', order_index: 1 },
    { id: 5, subject_id: 2, grade_level: 4, title: 'Luyện Từ Và Câu: Danh Từ, Động Từ, Tính Từ', topic_tag: 'luyen-tu-cau', description: 'Phân biệt các từ loại và mở rộng vốn từ', icon: '✍️', order_index: 2 },
    { id: 6, subject_id: 1, grade_level: 1, title: 'Đếm Số & Phép Cộng Trừ Trong Phạm Vi 10', topic_tag: 'phep-cong', description: 'Làm quen các con số từ 1 đến 10 và đếm quả', icon: '🍎', order_index: 1 },
    { id: 7, subject_id: 2, grade_level: 1, title: 'Bảng Chữ Cái & Dấu Thanh', topic_tag: 'chinh-ta', description: 'Làm quen bảng chữ cái tiếng Việt và ghép vần', icon: '🔤', order_index: 1 }
  ],

  exercises: [
    {
      id: 101,
      lesson_id: 1,
      topic_tag: 'phan-so',
      title: 'Thử Thách Phân Số Thông Minh (Toán 4)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 50,
      questions: [
        {
          id: 1001,
          question_text: 'Một cửa hàng có 125 quả táo. Cửa hàng đã bán 48 quả. Hỏi cửa hàng còn lại bao nhiêu quả táo?',
          points: 10,
          topic_tag: 'phan-so',
          hint: 'Lấy tổng số táo ban đầu trừ đi số táo đã bán (125 - 48)',
          explanation: 'Cửa hàng có 125 quả táo, đã bán 48 quả.\nTa thực hiện phép tính:\n125 - 48 = 77 (quả táo).\nVậy cửa hàng còn lại 77 quả.',
          answers: [
            { option_label: 'A', answer_text: '67 quả', is_correct: false },
            { option_label: 'B', answer_text: '77 quả', is_correct: true },
            { option_label: 'C', answer_text: '87 quả', is_correct: false },
            { option_label: 'D', answer_text: '97 quả', is_correct: false }
          ]
        },
        {
          id: 1002,
          question_text: 'Rút gọn phân số 15/25 về phân số tối giản ta được:',
          points: 10,
          topic_tag: 'phan-so',
          hint: 'Chia cả tử số và mẫu số cho ước chung lớn nhất là 5.',
          explanation: 'Chia cả tử số và mẫu số cho 5:\n15 : 5 = 3\n25 : 5 = 5\nVậy phân số tối giản là 3/5.',
          answers: [
            { option_label: 'A', answer_text: '3/5', is_correct: true },
            { option_label: 'B', answer_text: '5/3', is_correct: false },
            { option_label: 'C', answer_text: '1/5', is_correct: false },
            { option_label: 'D', answer_text: '3/25', is_correct: false }
          ]
        },
        {
          id: 1003,
          question_text: 'Kết quả của phép tính: 2/7 + 3/7 là:',
          points: 10,
          topic_tag: 'phan-so',
          hint: 'Cùng mẫu số, ta cộng hai tử số và giữ nguyên mẫu số.',
          explanation: 'Vì hai phân số cùng mẫu số là 7, ta cộng tử số: 2 + 3 = 5.\nKết quả là 5/7.',
          answers: [
            { option_label: 'A', answer_text: '5/14', is_correct: false },
            { option_label: 'B', answer_text: '5/7', is_correct: true },
            { option_label: 'C', answer_text: '6/7', is_correct: false },
            { option_label: 'D', answer_text: '1', is_correct: false }
          ]
        }
      ]
    },
    {
      id: 102,
      lesson_id: 2,
      topic_tag: 'hinh-hoc',
      title: 'Khám Phá Hình Học & Chu Vi (Toán 4)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 50,
      questions: [
        {
          id: 1004,
          question_text: 'Một hình vuông có cạnh dài 8 cm. Chu vi của hình vuông đó là:',
          points: 10,
          topic_tag: 'hinh-hoc',
          hint: 'Chu vi hình vuông = Cạnh x 4',
          explanation: 'Muốn tính chu vi hình vuông, ta lấy độ dài 1 cạnh nhân với 4:\n8 x 4 = 32 cm.',
          answers: [
            { option_label: 'A', answer_text: '24 cm', is_correct: false },
            { option_label: 'B', answer_text: '32 cm', is_correct: true },
            { option_label: 'C', answer_text: '64 cm²', is_correct: false },
            { option_label: 'D', answer_text: '16 cm', is_correct: false }
          ]
        }
      ]
    }
  ],

  submissions: [],
  submission_answers: [],
  badges: [
    { id: 1, code: 'starter', name: 'Mầm Non Chăm Học', icon: '🥉', description: 'Hoàn thành bài tập đầu tiên', min_xp: 20 },
    { id: 2, code: 'math_star', name: 'Siêu Toán Học', icon: '🥈', description: 'Đạt từ 200 XP môn Toán', min_xp: 200 },
    { id: 3, code: 'vietnamese_king', name: 'Vua Tiếng Việt', icon: '🥇', description: 'Đạt từ 200 XP môn Tiếng Việt', min_xp: 200 },
    { id: 4, code: 'streak_7', name: '7 Ngày Học Liên Tiếp', icon: '🔥', description: 'Giữ chuỗi 7 ngày học liên tiếp', min_xp: 500 },
    { id: 5, code: 'super_scholar', name: 'Trạng Nguyên Nhí', icon: '👑', description: 'Tích lũy 1,000 XP toàn năng', min_xp: 1000 }
  ]
};

async function initDatabaseConnection() {
  const host = process.env.DB_HOST || 'localhost';
  const isCloud = host.includes('aivencloud.com') || host.includes('tidbcloud.com') || process.env.DB_SSL === 'true';

  try {
    const config = {
      host: host,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'defaultdb',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    if (isCloud) {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = mysql.createPool(config);

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnectedToMySQL = true;
    console.log(`✅ [MySQL] Kết nối cơ sở dữ liệu ${isCloud ? 'Aiven Cloud' : 'Local'} thành công!`);
  } catch (err) {
    isConnectedToMySQL = false;
    console.warn('⚠️ [EduKids Notice]: Đang chạy ở chế độ Hybrid Memory (' + err.message + ').');
    console.log('💡 Dữ liệu mẫu EduKids đã nạp sẵn 100% cho Học sinh, Giáo viên & Admin.');
  }
}

async function query(sql, params = []) {
  if (isConnectedToMySQL && pool) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('MySQL Query Error:', error.message);
      throw error;
    }
  }
  return null;
}

module.exports = {
  initDatabaseConnection,
  query,
  getIsConnectedToMySQL: () => isConnectedToMySQL,
  getPool: () => pool,
  memoryStore
};
