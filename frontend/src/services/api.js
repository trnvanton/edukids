// Client API Service with Smart Cloud Fallback
const API_BASE = '/api';

// Fallback dataset for standalone Vercel Frontend hosting
const fallbackData = {
  studentDashboard: {
    student: {
      id: 1,
      full_name: 'Nguyễn Minh Anh',
      avatar: 'mascot-bear',
      grade_level: 4,
      xp: 1250,
      streak_days: 7,
      levelInfo: { level: 5, title: 'Siêu Học Sinh', icon: '👑', progress: 100 }
    },
    weaknessBreakdown: [
      { tag: 'hinh-hoc', name: 'Hình Học', totalQuestions: 12, correctCount: 11, percentage: 92, status: 'strong' },
      { tag: 'doc-hieu', name: 'Đọc Hiểu', totalQuestions: 10, correctCount: 8, percentage: 80, status: 'strong' },
      { tag: 'phep-nhan', name: 'Phép Nhân & Chia', totalQuestions: 15, correctCount: 11, percentage: 73, status: 'average' },
      { tag: 'phan-so', name: 'Phân Số', totalQuestions: 15, correctCount: 9, percentage: 60, status: 'average' }
    ],
    recommendations: [
      {
        topicTag: 'phan-so',
        topicName: 'Phân Số',
        currentPercentage: 60,
        recommendationTitle: '✏️ Luyện tập bổ sung Phân Số',
        advice: 'Bé đạt 60% ở phần này. Chỉ cần luyện tập thêm một chút là sẽ thành thạo ngay!',
        targetDifficulty: 'practice',
        exercises: [
          { id: 101, title: 'Thử Thách Phân Số Thông Minh', reward_xp: 50, difficulty: 'practice' }
        ]
      },
      {
        topicTag: 'hinh-hoc',
        topicName: 'Hình Học',
        currentPercentage: 92,
        recommendationTitle: '🎯 Thử thách Trạng Nguyên Hình Học',
        advice: 'Xuất sắc (92%)! Bé đã sẵn sàng nhận huy hiệu Siêu Học Sinh chưa?',
        targetDifficulty: 'challenge',
        exercises: [
          { id: 102, title: 'Khám Phá Hình Học & Chu Vi', reward_xp: 50, difficulty: 'practice' }
        ]
      }
    ],
    badges: [
      { id: 1, code: 'starter', name: 'Mầm Non Chăm Học', icon: '🥉', description: 'Hoàn thành bài tập đầu tiên', min_xp: 20, unlocked: true },
      { id: 2, code: 'math_star', name: 'Siêu Toán Học', icon: '🥈', description: 'Đạt từ 200 XP môn Toán', min_xp: 200, unlocked: true },
      { id: 3, code: 'vietnamese_king', name: 'Vua Tiếng Việt', icon: '🥇', description: 'Đạt từ 200 XP môn Tiếng Việt', min_xp: 200, unlocked: true },
      { id: 4, code: 'streak_7', name: '7 Ngày Học Liên Tiếp', icon: '🔥', description: 'Giữ chuỗi 7 ngày học liên tiếp', min_xp: 500, unlocked: true },
      { id: 5, code: 'super_scholar', name: 'Trạng Nguyên Nhí', icon: '👑', description: 'Tích lũy 1,000 XP toàn năng', min_xp: 1000, unlocked: true }
    ],
    recentSubmissions: []
  },

  subjects: [
    { id: 1, name: 'Toán Học', code: 'toan', icon: '📐', color: '#3B82F6', description: 'Số tự nhiên, phân số, hình học & tính toán nhanh' },
    { id: 2, name: 'Tiếng Việt', code: 'tieng-viet', icon: '📖', color: '#EF4444', description: 'Đọc hiểu, chính tả, luyện từ và câu, tập làm văn' },
    { id: 3, name: 'Khoa Học', code: 'khoa-hoc', icon: '🔬', color: '#8B5CF6', description: 'Con người, động vật, thực vật & thế giới tự nhiên' },
    { id: 4, name: 'Tiếng Anh', code: 'tieng-anh', icon: '🇬🇧', color: '#10B981', description: 'Vocabulary, Grammar, Reading & Listening vui nhộn' }
  ],

  lessons: {
    1: [ // Toan
      { id: 1, subject_id: 1, grade_level: 4, title: 'Phân Số & Các Phép Tính Phân Số', topic_tag: 'phan-so', description: 'Rút gọn phân số, quy đồng mẫu số, cộng trừ nhân chia phân số', icon: '🍰' },
      { id: 2, subject_id: 1, grade_level: 4, title: 'Hình Học: Góc, Chu Vi & Diện Tích', topic_tag: 'hinh-hoc', description: 'Góc nhọn, tù, bẹt, hình bình hành, hình thoi', icon: '📐' },
      { id: 3, subject_id: 1, grade_level: 4, title: 'Số Tự Nhiên & Các Phép Tính', topic_tag: 'phep-nhan', description: 'Nhân chia với số có nhiều chữ số, tính chất đại số', icon: '🔢' }
    ],
    2: [ // Tieng Viet
      { id: 4, subject_id: 2, grade_level: 4, title: 'Đọc Hiểu: Bài Học Cuộc Sống', topic_tag: 'doc-hieu', description: 'Tập đọc diễn cảm và nắm bắt thông điệp câu chuyện', icon: '📖' },
      { id: 5, subject_id: 2, grade_level: 4, title: 'Luyện Từ Và Câu: Danh Từ, Động Từ, Tính Từ', topic_tag: 'luyen-tu-cau', description: 'Phân biệt các từ loại và mở rộng vốn từ', icon: '✍️' }
    ]
  },

  exerciseData: {
    101: {
      id: 101,
      title: 'Thử Thách Phân Số Thông Minh (Toán 4)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 50,
      subject_name: 'Toán Học',
      questions: [
        {
          id: 1001,
          index: 1,
          question_text: 'Một cửa hàng có 125 quả táo. Cửa hàng đã bán 48 quả. Hỏi cửa hàng còn lại bao nhiêu quả táo?',
          points: 10,
          hint: 'Lấy tổng số táo ban đầu trừ đi số táo đã bán (125 - 48)',
          topic_tag: 'phan-so',
          options: [
            { option_label: 'A', answer_text: '67 quả' },
            { option_label: 'B', answer_text: '77 quả' },
            { option_label: 'C', answer_text: '87 quả' },
            { option_label: 'D', answer_text: '97 quả' }
          ]
        },
        {
          id: 1002,
          index: 2,
          question_text: 'Rút gọn phân số 15/25 về phân số tối giản ta được:',
          points: 10,
          hint: 'Chia cả tử số và mẫu số cho ước chung lớn nhất là 5.',
          topic_tag: 'phan-so',
          options: [
            { option_label: 'A', answer_text: '3/5' },
            { option_label: 'B', answer_text: '5/3' },
            { option_label: 'C', answer_text: '1/5' },
            { option_label: 'D', answer_text: '3/25' }
          ]
        },
        {
          id: 1003,
          index: 3,
          question_text: 'Kết quả của phép tính: 2/7 + 3/7 là:',
          points: 10,
          hint: 'Cùng mẫu số, ta cộng hai tử số và giữ nguyên mẫu số.',
          topic_tag: 'phan-so',
          options: [
            { option_label: 'A', answer_text: '5/14' },
            { option_label: 'B', answer_text: '5/7' },
            { option_label: 'C', answer_text: '6/7' },
            { option_label: 'D', answer_text: '1' }
          ]
        }
      ]
    },
    102: {
      id: 102,
      title: 'Khám Phá Hình Học & Chu Vi (Toán 4)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 50,
      subject_name: 'Toán Học',
      questions: [
        {
          id: 1004,
          index: 1,
          question_text: 'Một hình vuông có cạnh dài 8 cm. Chu vi của hình vuông đó là:',
          points: 10,
          hint: 'Chu vi hình vuông = Cạnh x 4',
          topic_tag: 'hinh-hoc',
          options: [
            { option_label: 'A', answer_text: '24 cm' },
            { option_label: 'B', answer_text: '32 cm' },
            { option_label: 'C', answer_text: '64 cm²' },
            { option_label: 'D', answer_text: '16 cm' }
          ]
        }
      ]
    },
    103: {
      id: 103,
      title: 'Đọc Hiểu & Luyện Từ Và Câu (Tiếng Việt 4)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 50,
      subject_name: 'Tiếng Việt',
      questions: [
        {
          id: 1005,
          index: 1,
          question_text: 'Từ nào dưới đây là Danh từ chỉ đồ dùng học tập của học sinh?',
          points: 10,
          hint: 'Danh từ chỉ sự vật em dùng để viết bài mỗi ngày.',
          topic_tag: 'luyen-tu-cau',
          options: [
            { option_label: 'A', answer_text: 'Bút chì' },
            { option_label: 'B', answer_text: 'Chăm chỉ' },
            { option_label: 'C', answer_text: 'Đọc sách' },
            { option_label: 'D', answer_text: 'Học giỏi' }
          ]
        }
      ]
    }
  },

  teacherDashboard: {
    teacher: { id: 10, full_name: 'Cô Hoàng Mai', role: 'teacher', avatar: 'mascot-panda' },
    classAnalytics: [
      {
        classId: 1,
        className: '4A1',
        gradeLevel: 4,
        schoolYear: '2025-2026',
        stats: {
          totalStudents: 3,
          totalSubmissionsCount: 3,
          classAverageScore: 8.0,
          strugglingStudents: [{ id: 3, full_name: 'Lê Minh', averageScore: 6.5 }],
          studentSummary: [
            { id: 2, full_name: 'Trần Bình', avatar: 'mascot-lion', grade_level: 4, xp: 850, submissionsCount: 3, averageScore: 9.0, isStruggling: false },
            { id: 1, full_name: 'Nguyễn Minh Anh', avatar: 'mascot-bear', grade_level: 4, xp: 1250, submissionsCount: 3, averageScore: 8.5, isStruggling: false },
            { id: 3, full_name: 'Lê Minh', avatar: 'mascot-rabbit', grade_level: 4, xp: 420, submissionsCount: 2, averageScore: 6.5, isStruggling: true }
          ]
        }
      }
    ]
  },

  leaderboard: [
    { id: 1, full_name: 'Nguyễn Minh Anh', avatar: 'mascot-bear', grade_level: 4, xp: 1250, streak_days: 7 },
    { id: 2, full_name: 'Trần Bình', avatar: 'mascot-lion', grade_level: 4, xp: 850, streak_days: 5 },
    { id: 3, full_name: 'Lê Minh', avatar: 'mascot-rabbit', grade_level: 4, xp: 420, streak_days: 2 }
  ]
};

class ApiService {
  constructor() {
    this.token = localStorage.getItem('edukids_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('edukids_token', token);
    } else {
      localStorage.removeItem('edukids_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, fallback: true };
    }
  }

  // Auth
  async login(username, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.success && res.user) return res;

    // Fallback demo login
    return {
      success: true,
      token: 'demo-token',
      user: fallbackData.studentDashboard.student
    };
  }

  async register(payload) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success && res.user) return res;
    return {
      success: true,
      token: 'demo-token',
      user: { ...fallbackData.studentDashboard.student, full_name: payload.full_name || 'Bé Mới' }
    };
  }

  async switchDemo(role) {
    const res = await this.request('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    if (res.success && res.user) return res;

    if (role === 'teacher') {
      return {
        success: true,
        user: { id: 10, username: 'teacher1', full_name: 'Cô Hoàng Mai', role: 'teacher', avatar: 'mascot-panda', xp: 0, streak_days: 10 }
      };
    }
    if (role === 'admin') {
      return {
        success: true,
        user: { id: 99, username: 'admin', full_name: 'Quản Trị Viên EduKids', role: 'admin', avatar: 'mascot-fox', xp: 9999, streak_days: 30 }
      };
    }
    return {
      success: true,
      user: fallbackData.studentDashboard.student
    };
  }

  // Student Dashboard
  async getStudentDashboard() {
    const res = await this.request('/students/dashboard');
    if (res.success && res.dashboard) return res;
    return { success: true, dashboard: fallbackData.studentDashboard };
  }

  // Teacher Dashboard
  async getTeacherDashboard() {
    const res = await this.request('/teachers/dashboard');
    if (res.success && res.classAnalytics) return res;
    return { success: true, ...fallbackData.teacherDashboard };
  }

  // Subjects & Lessons
  async getSubjects() {
    const res = await this.request('/subjects');
    if (res.success && res.subjects) return res;
    return { success: true, subjects: fallbackData.subjects };
  }

  async getLessons(subjectId, grade) {
    const query = grade ? `?grade=${grade}` : '';
    const res = await this.request(`/subjects/${subjectId}/lessons${query}`);
    if (res.success && res.lessons && res.lessons.length > 0) return res;
    return { success: true, lessons: fallbackData.lessons[subjectId] || fallbackData.lessons[1] };
  }

  // Exercise & Quiz
  async getExercise(id) {
    const res = await this.request(`/exercises/${id}`);
    if (res.success && res.exercise) return res;
    const ex = fallbackData.exerciseData[id] || fallbackData.exerciseData[101];
    return { success: true, exercise: ex };
  }

  async submitExercise(exerciseId, answers, timeTakenSeconds) {
    const res = await this.request('/exercises/submit', {
      method: 'POST',
      body: JSON.stringify({ exerciseId, answers, timeTakenSeconds })
    });
    if (res.success && res.result) return res;

    // Client-side instant grading fallback for seamless demonstration
    const ex = fallbackData.exerciseData[exerciseId] || fallbackData.exerciseData[101];
    const explanations = {
      1001: { correct: 'B', text: '77 quả', exp: 'Cửa hàng có 125 quả táo, đã bán 48 quả.\nTa thực hiện: 125 - 48 = 77 quả táo.\nVậy còn lại 77 quả táo.' },
      1002: { correct: 'A', text: '3/5', exp: 'Chia cả tử số và mẫu số cho 5:\n15 : 5 = 3\n25 : 5 = 5\nVậy phân số tối giản là 3/5.' },
      1003: { correct: 'B', text: '5/7', exp: 'Hai phân số cùng mẫu số 7, ta cộng tử số: 2 + 3 = 5.\nKết quả là 5/7.' },
      1004: { correct: 'B', text: '32 cm', exp: 'Chu vi hình vuông = Cạnh x 4 = 8 x 4 = 32 cm.' },
      1005: { correct: 'A', text: 'Bút chì', exp: '"Bút chì" là danh từ chỉ đồ dùng học tập của học sinh.' }
    };

    let correctCount = 0;
    const breakdown = ex.questions.map((q, idx) => {
      const userAns = answers[q.id];
      const info = explanations[q.id] || { correct: 'A', text: 'Đáp án A', exp: 'Lời giải chi tiết.' };
      const isCorrect = userAns === info.correct;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        questionIndex: idx + 1,
        questionText: q.question_text,
        userAnswer: userAns,
        correctAnswer: info.correct,
        correctAnswerText: info.text,
        isCorrect,
        explanation: info.exp
      };
    });

    const totalQuestions = ex.questions.length;
    const score10 = Math.round(((correctCount / totalQuestions) * 10) * 10) / 10;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const xpEarned = 20 + (correctCount * 5) + (scorePercentage === 100 ? 30 : 0);

    return {
      success: true,
      result: {
        score10,
        scorePercentage,
        totalQuestions,
        correctCount,
        wrongCount: totalQuestions - correctCount,
        xpEarned,
        maxCombo: correctCount,
        timeTakenSeconds,
        overallMessage: {
          title: scorePercentage >= 80 ? 'Tuyệt Đỉnh Thông Thái! 🌟' : 'Làm Tốt Lắm Bé Ơi! 👏',
          sub: 'Bé đã hoàn thành bài tập hôm nay!'
        },
        questionBreakdown: breakdown
      }
    };
  }

  // Leaderboard
  async getLeaderboard() {
    const res = await this.request('/results/leaderboard');
    if (res.success && res.leaderboard) return res;
    return { success: true, leaderboard: fallbackData.leaderboard };
  }
}

export const api = new ApiService();
