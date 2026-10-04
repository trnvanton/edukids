// Client API Service with Complete Multi-Grade Curriculum & Intelligent Fallback
import { generate100QuestionsPool } from './randomPoolService';

const API_BASE = '/api';

// Curriculum Dataset - Exclusively for Teacher / Cloud Synced Exercises
const curriculumDatabase = {
  // Subjects
  subjects: [
    { id: 1, name: 'Toán Học', code: 'toan', icon: '📐', color: '#3B82F6', description: 'Số học, hình học, phép tính & tư duy logic' },
    { id: 2, name: 'Tiếng Việt', code: 'tieng-viet', icon: '📖', color: '#EF4444', description: 'Đọc hiểu, chính tả, luyện từ và câu, tập làm văn' },
    { id: 3, name: 'Khoa Học & Tự Nhiên', code: 'khoa-hoc', icon: '🔬', color: '#8B5CF6', description: 'Cơ thể người, động thực vật & thế giới tự nhiên' },
    { id: 4, name: 'Tiếng Anh', code: 'tieng-anh', icon: '🇬🇧', color: '#10B981', description: 'English Vocabulary, Phonics, Grammar & Daily Communication' }
  ],

  // Lessons Matrix: [grade_level][subject_id] - Exclusively populated by Teacher / Cloud Exercises
  lessonsByGradeAndSubject: {
    1: { 1: [], 2: [], 3: [], 4: [] },
    2: { 1: [], 2: [], 3: [], 4: [] },
    3: { 1: [], 2: [], 3: [], 4: [] },
    4: { 1: [], 2: [], 3: [], 4: [] },
    5: { 1: [], 2: [], 3: [], 4: [] }
  },

  // Question Bank - Exclusively populated by Teacher / Cloud Exercises
  exercises: {}
};

// Hydrate saved custom exercises from localStorage
try {
  const storedCustom = JSON.parse(localStorage.getItem('edukids_custom_exercises') || '[]');
  if (Array.isArray(storedCustom)) {
    storedCustom.forEach(ex => {
      if (ex && ex.id && Array.isArray(ex.questions) && ex.questions.length > 0) {
        curriculumDatabase.exercises[ex.id] = ex;
        const g = ex.grade_level || 4;
        const s = ex.subject_id || 1;
        if (!curriculumDatabase.lessonsByGradeAndSubject[g]) {
          curriculumDatabase.lessonsByGradeAndSubject[g] = { 1: [], 2: [], 3: [], 4: [] };
        }
        if (!curriculumDatabase.lessonsByGradeAndSubject[g][s]) {
          curriculumDatabase.lessonsByGradeAndSubject[g][s] = [];
        }
        curriculumDatabase.lessonsByGradeAndSubject[g][s].unshift({
          id: ex.id + 50000,
          subject_id: s,
          grade_level: g,
          title: ex.title,
          topic_tag: `custom-${ex.id}`,
          description: ex.is_random_pool ? `Ngân hàng ${ex.questions.length} câu (Random ${ex.random_count || 10} câu)` : `Bài tập gồm ${ex.questions.length} câu hỏi`,
          icon: ex.is_random_pool ? '🎲' : (s === 1 ? '📐' : (s === 2 ? '📖' : (s === 3 ? '🔬' : '🇬🇧'))),
          exercise_id: ex.id
        });
      }
    });
  }

  // Filter out any deleted exercises and remove any lesson that lacks real questions
  const deletedIds = JSON.parse(localStorage.getItem('edukids_deleted_exercises') || '[]');
  const deletedSet = new Set(Array.isArray(deletedIds) ? deletedIds.map(d => parseInt(d, 10)) : []);

  deletedSet.forEach(numericId => {
    delete curriculumDatabase.exercises[numericId];
  });

  for (const g of Object.keys(curriculumDatabase.lessonsByGradeAndSubject)) {
    for (const s of Object.keys(curriculumDatabase.lessonsByGradeAndSubject[g])) {
      curriculumDatabase.lessonsByGradeAndSubject[g][s] = curriculumDatabase.lessonsByGradeAndSubject[g][s].filter(l => {
        const numId = parseInt(l.exercise_id, 10);
        if (deletedSet.has(numId)) return false;
        const ex = curriculumDatabase.exercises[numId];
        return ex && Array.isArray(ex.questions) && ex.questions.length > 0;
      });
    }
  }
} catch (e) {
  console.warn('Hydration error:', e);
}

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
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

  async initCloudSync() {
    try {
      const res = await this.request('/sync');
      if (res && res.success) {
        if (Array.isArray(res.exercises)) {
          const deletedIds = JSON.parse(localStorage.getItem('edukids_deleted_exercises') || '[]');
          const deletedSet = new Set(Array.isArray(deletedIds) ? deletedIds.map(d => parseInt(d, 10)) : []);

          res.exercises.forEach(ex => {
            if (ex && ex.id && !deletedSet.has(parseInt(ex.id, 10)) && Array.isArray(ex.questions) && ex.questions.length > 0) {
              const numericId = parseInt(ex.id, 10);
              curriculumDatabase.exercises[numericId] = ex;
              const g = ex.grade_level || 4;
              const s = ex.subject_id || 1;
              if (!curriculumDatabase.lessonsByGradeAndSubject[g]) {
                curriculumDatabase.lessonsByGradeAndSubject[g] = { 1: [], 2: [], 3: [], 4: [] };
              }
              if (!curriculumDatabase.lessonsByGradeAndSubject[g][s]) {
                curriculumDatabase.lessonsByGradeAndSubject[g][s] = [];
              }
              const exists = curriculumDatabase.lessonsByGradeAndSubject[g][s].some(l => l.exercise_id === numericId);
              if (!exists) {
                curriculumDatabase.lessonsByGradeAndSubject[g][s].unshift({
                  id: numericId + 50000,
                  subject_id: s,
                  grade_level: g,
                  title: ex.title,
                  topic_tag: `custom-${numericId}`,
                  description: ex.is_random_pool ? `Ngân hàng ${ex.questions.length} câu (Random ${ex.random_count || 10} câu)` : `Bài tập gồm ${ex.questions.length} câu hỏi`,
                  icon: ex.is_random_pool ? '🎲' : (s === 1 ? '📐' : (s === 2 ? '📖' : (s === 3 ? '🔬' : '🇬🇧'))),
                  exercise_id: numericId
                });
              }
            }
          });

          try {
            const localCustom = JSON.parse(localStorage.getItem('edukids_custom_exercises') || '[]');
            const map = new Map();
            localCustom.forEach(ex => map.set(parseInt(ex.id, 10), ex));
            res.exercises.forEach(ex => map.set(parseInt(ex.id, 10), ex));
            const mergedList = Array.from(map.values()).filter(ex => !deletedSet.has(parseInt(ex.id, 10)));
            localStorage.setItem('edukids_custom_exercises', JSON.stringify(mergedList));
          } catch (e) {}
        }

        if (Array.isArray(res.submissions)) {
          try {
            const localSubs = JSON.parse(localStorage.getItem('edukids_submissions') || '[]');
            const subMap = new Map();
            localSubs.forEach(s => subMap.set(String(s.id), s));
            res.submissions.forEach(s => subMap.set(String(s.id), s));
            localStorage.setItem('edukids_submissions', JSON.stringify(Array.from(subMap.values())));
          } catch (e) {}
        }

        return { success: true, count: res.exercises?.length || 0 };
      }
    } catch (e) {
      console.warn('Cloud sync error:', e);
    }
    return { success: false };
  }

  // Auth
  async login(username, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.success && res.user) return res;

    // Fallback demo logins
    if (username === 'student_lop2') {
      return {
        success: true,
        token: 'demo-token-lop2',
        user: {
          id: 2,
          username: 'student_lop2',
          full_name: 'Bé Bảo Ngọc',
          role: 'student',
          grade_level: 2,
          avatar: 'mascot-rabbit',
          xp: 320,
          level: 2,
          streak_days: 4,
          levelInfo: { level: 2, title: 'Học Sinh Chăm Chỉ', icon: '🥈', progress: 50 }
        }
      };
    }
    if (username === 'teacher1') {
      return {
        success: true,
        token: 'demo-token-teacher',
        user: {
          id: 10,
          username: 'teacher1',
          full_name: 'Cô Hoàng Mai',
          role: 'teacher',
          avatar: 'mascot-panda',
          xp: 0,
          streak_days: 10
        }
      };
    }
    if (username === 'admin') {
      return {
        success: true,
        token: 'demo-token-admin',
        user: {
          id: 99,
          username: 'admin',
          full_name: 'Quản Trị Viên EduKids',
          role: 'admin',
          avatar: 'mascot-fox',
          xp: 9999,
          streak_days: 30
        }
      };
    }
    if (username === 'student1') {
      return {
        success: true,
        token: 'demo-token-student1',
        user: {
          id: 1,
          username: 'student1',
          full_name: 'Nguyễn Minh Anh',
          role: 'student',
          grade_level: 4,
          avatar: 'mascot-bear',
          xp: 1250,
          level: 5,
          streak_days: 7,
          levelInfo: { level: 5, title: 'Siêu Học Sinh', icon: '👑', progress: 100 }
        }
      };
    }

    // Dynamic fallback for custom username
    return {
      success: true,
      token: 'demo-token-custom',
      user: {
        id: Date.now(),
        username: username || 'hocsinh',
        full_name: username ? `${username}` : 'Học Sinh Mới',
        role: 'student',
        grade_level: 2,
        avatar: 'mascot-lion',
        xp: 50,
        level: 1,
        streak_days: 1,
        levelInfo: { level: 1, title: 'Tân Thủ Chăm Học', icon: '🌱', progress: 10 }
      }
    };
  }

  async register(payload) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success && res.user) return res;

    const chosenGrade = payload.grade_level ? parseInt(payload.grade_level, 10) : 2;
    return {
      success: true,
      token: 'demo-token-reg',
      user: {
        id: Date.now(),
        username: payload.username || 'newuser',
        full_name: payload.full_name || 'Học Sinh Mới',
        role: payload.role || 'student',
        grade_level: chosenGrade,
        avatar: payload.avatar || 'mascot-bear',
        xp: 50,
        level: 1,
        streak_days: 1,
        levelInfo: { level: 1, title: 'Tân Thủ Chăm Học', icon: '🌱', progress: 10 }
      }
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
      user: {
        id: 2,
        username: 'student_lop2',
        full_name: 'Bé Bảo Ngọc',
        role: 'student',
        grade_level: 2,
        avatar: 'mascot-rabbit',
        xp: 320,
        level: 2,
        streak_days: 4,
        levelInfo: { level: 2, title: 'Học Sinh Chăm Chỉ', icon: '🥈', progress: 50 }
      }
    };
  }

  // Student Dashboard
  async getStudentDashboard(userContext) {
    const res = await this.request('/students/dashboard');
    if (res.success && res.dashboard) return res;

    // Generate dynamic dashboard accurately for student's grade
    const grade = userContext?.grade_level || 2;
    const gradeLessons = curriculumDatabase.lessonsByGradeAndSubject[grade] || curriculumDatabase.lessonsByGradeAndSubject[2];
    const starterMath = gradeLessons[1]?.[0] || { id: 101, title: `Khởi Động Toán Lớp ${grade}`, exercise_id: 1021 };
    const starterViet = gradeLessons[2]?.[0] || { id: 102, title: `Khởi Động Tiếng Việt Lớp ${grade}`, exercise_id: 1024 };
    const starterEng = gradeLessons[4]?.[0] || { id: 104, title: `English Fun Lớp ${grade}`, exercise_id: 1028 };

    return {
      success: true,
      dashboard: {
        student: userContext || {
          id: 1,
          full_name: 'Học Sinh Mới',
          avatar: 'mascot-bear',
          grade_level: grade,
          xp: 50,
          streak_days: 1,
          levelInfo: { level: 1, title: 'Tân Thủ Chăm Học', icon: '🌱', progress: 10 }
        },
        // Real-time recommendations matching student's exact grade
        recommendations: [
          {
            topicTag: starterMath.topic_tag,
            topicName: `Toán Học Lớp ${grade}`,
            currentPercentage: 0,
            recommendationTitle: `🎯 Thử thách ${starterMath.title}`,
            advice: `Bắt đầu rèn luyện kiến thức trọng tâm của Lớp ${grade} để tích lũy điểm thưởng XP!`,
            targetDifficulty: 'starter',
            exercises: [
              { id: starterMath.exercise_id, title: starterMath.title, reward_xp: 40, difficulty: 'practice' }
            ]
          },
          {
            topicTag: starterEng.topic_tag,
            topicName: `Tiếng Anh Lớp ${grade}`,
            currentPercentage: 0,
            recommendationTitle: `🇬🇧 Học Tiếng Anh: ${starterEng.title}`,
            advice: `Mở rộng từ vựng & phản xạ Tiếng Anh chuẩn quốc tế cho học sinh Lớp ${grade}!`,
            targetDifficulty: 'starter',
            exercises: [
              { id: starterEng.exercise_id, title: starterEng.title, reward_xp: 40, difficulty: 'practice' }
            ]
          }
        ],
        weaknessBreakdown: [
          { tag: 'toan-hoc', name: `Toán Học (Lớp ${grade})`, totalQuestions: 0, correctCount: 0, percentage: 0, status: 'new' },
          { tag: 'tieng-viet', name: `Tiếng Việt (Lớp ${grade})`, totalQuestions: 0, correctCount: 0, percentage: 0, status: 'new' },
          { tag: 'tieng-anh', name: `Tiếng Anh (Lớp ${grade})`, totalQuestions: 0, correctCount: 0, percentage: 0, status: 'new' },
          { tag: 'khoa-hoc', name: `Khoa Học (Lớp ${grade})`, totalQuestions: 0, correctCount: 0, percentage: 0, status: 'new' }
        ],
        badges: [
          { id: 1, code: 'starter', name: 'Mầm Non Chăm Học', icon: '🥉', description: 'Hoàn thành bài tập đầu tiên', min_xp: 20, unlocked: (userContext?.xp || 50) >= 20 },
          { id: 2, code: 'math_star', name: 'Siêu Toán Học', icon: '🥈', description: 'Đạt từ 150 XP môn học', min_xp: 150, unlocked: (userContext?.xp || 50) >= 150 },
          { id: 3, code: 'vietnamese_king', name: 'Vua Tiếng Việt & Anh', icon: '🥇', description: 'Đạt từ 300 XP tổng hợp', min_xp: 300, unlocked: (userContext?.xp || 50) >= 300 },
          { id: 4, code: 'streak_7', name: 'Lửa Chăm Chỉ 7 Ngày', icon: '🔥', description: 'Học tập kiên trì liên tục', min_xp: 500, unlocked: (userContext?.xp || 50) >= 500 },
          { id: 5, code: 'super_scholar', name: 'Trạng Nguyên Toàn Năng', icon: '👑', description: 'Tích lũy 1,000 XP xuất sắc', min_xp: 1000, unlocked: (userContext?.xp || 50) >= 1000 }
        ],
        recentSubmissions: []
      }
    };
  }

  // Real Submissions Storage & Analysis
  getRealSubmissions() {
    try {
      const stored = JSON.parse(localStorage.getItem('edukids_submissions'));
      if (Array.isArray(stored)) return stored;
      return [];
    } catch (e) {
      return [];
    }
  }

  // Teacher Dashboard - Calculated with 100% REAL student submissions
  async getTeacherDashboard() {
    const res = await this.request('/teachers/dashboard');
    if (res.success && res.classAnalytics) return res;

    const allSubmissions = this.getRealSubmissions();
    const students = [
      { id: 1, full_name: 'Nguyễn Minh Anh', avatar: 'mascot-bear', grade_level: 4, xp: 1250 },
      { id: 2, full_name: 'Trần Bình', avatar: 'mascot-lion', grade_level: 4, xp: 850 },
      { id: 3, full_name: 'Lê Minh', avatar: 'mascot-rabbit', grade_level: 4, xp: 420 }
    ];

    const studentSummary = students.map(st => {
      const userSubs = allSubmissions.filter(s => s.user_id === st.id || s.user_name === st.full_name);
      let avg = null;
      if (userSubs.length > 0) {
        const total = userSubs.reduce((acc, c) => acc + (c.score10 !== undefined ? c.score10 : 0), 0);
        avg = (total / userSubs.length).toFixed(1);
      }
      return {
        ...st,
        submissionsCount: userSubs.length,
        averageScore: avg,
        isStruggling: avg !== null && parseFloat(avg) < 7.0
      };
    });

    const studentsWithScore = studentSummary.filter(s => s.averageScore !== null);
    let classAvg = null;
    if (studentsWithScore.length > 0) {
      const sum = studentsWithScore.reduce((acc, c) => acc + parseFloat(c.averageScore), 0);
      classAvg = (sum / studentsWithScore.length).toFixed(1);
    }

    const struggling = studentSummary.filter(s => s.isStruggling);

    return {
      success: true,
      teacher: { id: 10, full_name: 'Cô Hoàng Mai', role: 'teacher', avatar: 'mascot-panda' },
      classAnalytics: [
        {
          classId: 1,
          className: '4A1',
          gradeLevel: 4,
          schoolYear: '2025-2026',
          stats: {
            totalStudents: students.length,
            totalSubmissionsCount: allSubmissions.length,
            classAverageScore: classAvg,
            strugglingStudents: struggling,
            studentSummary
          }
        }
      ]
    };
  }

  // Subjects & Lessons
  async getSubjects() {
    const res = await this.request('/subjects');
    if (res.success && res.subjects) return res;
    return { success: true, subjects: curriculumDatabase.subjects };
  }

  async getLessons(subjectId, grade) {
    const query = grade ? `?grade=${grade}` : '';
    const res = await this.request(`/subjects/${subjectId}/lessons${query}`);
    const deletedIds = JSON.parse(localStorage.getItem('edukids_deleted_exercises') || '[]');
    const deletedSet = new Set(Array.isArray(deletedIds) ? deletedIds.map(d => parseInt(d, 10)) : []);

    if (res.success && res.lessons && res.lessons.length > 0) {
      const valid = res.lessons.filter(l => {
        const numId = parseInt(l.exercise_id, 10);
        if (deletedSet.has(numId)) return false;
        const ex = curriculumDatabase.exercises[numId];
        return ex && Array.isArray(ex.questions) && ex.questions.length > 0;
      });
      return { success: true, lessons: valid };
    }

    // Filter strictly by Grade and Subject ID
    const targetGrade = parseInt(grade, 10) || 2;
    const targetSubj = parseInt(subjectId, 10) || 1;
    const gradeLessons = curriculumDatabase.lessonsByGradeAndSubject[targetGrade];
    const rawLessons = gradeLessons ? (gradeLessons[targetSubj] || []) : [];

    // ONLY return lessons that ACTUALLY exist in data (have valid questions) and are NOT deleted
    const validLessons = rawLessons.filter(l => {
      if (!l.exercise_id) return false;
      const numId = parseInt(l.exercise_id, 10);
      if (deletedSet.has(numId)) return false;
      const ex = curriculumDatabase.exercises[numId];
      return ex && Array.isArray(ex.questions) && ex.questions.length > 0;
    });

    return { success: true, lessons: validLessons };
  }

  // Exercise & Quiz
  async getExercise(id) {
    const res = await this.request(`/exercises/${id}`);
    if (res.success && res.exercise) return res;

    // Look up by ID with safe fallback
    const numericId = parseInt(id, 10);
    const ex = curriculumDatabase.exercises[numericId] || curriculumDatabase.exercises[1021] || curriculumDatabase.exercises[101];
    return { success: true, exercise: ex };
  }

  // Save new exercise created manually or imported from Excel by teacher
  saveCustomExercise(exercise) {
    const id = exercise.id || (Date.now() % 100000);
    const grade = parseInt(exercise.grade_level, 10) || 4;
    const subjectId = parseInt(exercise.subject_id, 10) || 1;

    const fullExercise = {
      id,
      title: exercise.title || 'Bài Tập Mới Của Cô Giáo',
      grade_level: grade,
      subject_id: subjectId,
      reward_xp: exercise.reward_xp || 50,
      questions: exercise.questions || [],
      assigned_to: exercise.assigned_to || `Lớp ${grade}A1`,
      due_date: exercise.due_date || 'Chủ nhật tuần này (23:59)',
      is_random_pool: !!exercise.is_random_pool,
      random_mode: exercise.random_mode || (exercise.is_random_pool ? 'fixed_10' : 'all'),
      random_count: exercise.random_count || (exercise.is_random_pool ? 10 : exercise.questions?.length || 0),
      total_pool_count: exercise.questions?.length || 0,
      shuffle_questions: exercise.shuffle_questions !== undefined ? exercise.shuffle_questions : true,
      shuffle_options: exercise.shuffle_options !== undefined ? exercise.shuffle_options : false
    };

    curriculumDatabase.exercises[id] = fullExercise;

    // Add to lesson list if not present
    if (!curriculumDatabase.lessonsByGradeAndSubject[grade]) {
      curriculumDatabase.lessonsByGradeAndSubject[grade] = { 1: [], 2: [], 3: [], 4: [] };
    }
    if (!curriculumDatabase.lessonsByGradeAndSubject[grade][subjectId]) {
      curriculumDatabase.lessonsByGradeAndSubject[grade][subjectId] = [];
    }

    const newLesson = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      subject_id: subjectId,
      grade_level: grade,
      title: fullExercise.title,
      topic_tag: `custom-${id}`,
      description: fullExercise.is_random_pool
        ? `Ngân hàng ${fullExercise.questions.length} câu (Random ${fullExercise.random_count || 10} câu)`
        : `Bài tập gồm ${fullExercise.questions.length} câu hỏi`,
      icon: fullExercise.is_random_pool ? '🎲' : (subjectId === 1 ? '📐' : (subjectId === 2 ? '📖' : (subjectId === 3 ? '🔬' : '🇬🇧'))),
      exercise_id: id
    };

    curriculumDatabase.lessonsByGradeAndSubject[grade][subjectId].unshift(newLesson);

    try {
      const stored = JSON.parse(localStorage.getItem('edukids_custom_exercises') || '[]');
      stored.push(fullExercise);
      localStorage.setItem('edukids_custom_exercises', JSON.stringify(stored));
      
      // Async Cloud sync to Aiven MySQL
      this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'save_exercise', exercise: fullExercise })
      }).catch(() => {});
    } catch (e) {
      console.warn('Cannot persist to localStorage:', e);
    }

    return { success: true, exercise: fullExercise, lesson: newLesson };
  }

  getTeacherExercises() {
    const list = [];
    const allSubmissions = this.getRealSubmissions();

    // Map exercise metadata
    const metaMap = {};
    for (const [gradeStr, subjects] of Object.entries(curriculumDatabase.lessonsByGradeAndSubject)) {
      const g = parseInt(gradeStr, 10);
      for (const [subjStr, lessons] of Object.entries(subjects)) {
        const s = parseInt(subjStr, 10);
        lessons.forEach(l => {
          if (l.exercise_id) {
            metaMap[l.exercise_id] = {
              grade_level: g,
              subject_id: s,
              assigned_to: `Lớp ${g}A1`
            };
          }
        });
      }
    }

    const deletedIds = JSON.parse(localStorage.getItem('edukids_deleted_exercises') || '[]');

    for (const [id, ex] of Object.entries(curriculumDatabase.exercises)) {
      if (!ex || !Array.isArray(ex.questions) || ex.questions.length === 0) continue;
      const numericId = parseInt(id, 10);
      if (deletedIds.includes(numericId)) continue;
      const meta = metaMap[numericId] || {};
      const gradeLevel = ex.grade_level || meta.grade_level || (numericId >= 1050 ? 5 : (numericId >= 1040 || numericId <= 110 ? 4 : (numericId >= 1030 ? 3 : (numericId >= 1020 ? 2 : 1))));
      const subjectId = ex.subject_id || meta.subject_id || 1;
      const subjectObj = curriculumDatabase.subjects.find(s => s.id === subjectId) || { name: 'Toán Học', icon: '📐' };

      // Filter 100% REAL submissions for this exercise
      const exSubs = allSubmissions.filter(s => s.exercise_id === numericId);
      const subCount = exSubs.length;

      let avgScore = null;
      if (subCount > 0) {
        const totalScore = exSubs.reduce((acc, curr) => acc + (curr.score10 !== undefined ? curr.score10 : 10), 0);
        avgScore = (totalScore / subCount).toFixed(1);
      }

      list.push({
        id: numericId,
        title: ex.title,
        grade_level: gradeLevel,
        subject_id: subjectId,
        subject_name: subjectObj.name,
        subject_icon: subjectObj.icon,
        reward_xp: ex.reward_xp || 50,
        questionsCount: ex.questions?.length || 0,
        questions: ex.questions || [],
        assigned_to: ex.assigned_to || meta.assigned_to || `Lớp ${gradeLevel}A1`,
        due_date: ex.due_date || 'Chủ nhật tuần này (23:59)',
        submissions_count: subCount,
        total_students: 3,
        average_score: avgScore,
        submissionsList: exSubs,
        is_random_pool: !!ex.is_random_pool,
        random_mode: ex.random_mode || 'all',
        random_count: ex.random_count || (ex.is_random_pool ? 10 : null),
        total_pool_count: ex.questions?.length || 0,
        shuffle_questions: ex.shuffle_questions,
        shuffle_options: ex.shuffle_options
      });
    }
    return { success: true, exercises: list };
  }

  updateExercise(id, updatedData) {
    const numericId = parseInt(id, 10);
    const existing = curriculumDatabase.exercises[numericId] || {};
    const merged = {
      ...existing,
      ...updatedData,
      id: numericId
    };
    curriculumDatabase.exercises[numericId] = merged;

    // Update in lessons
    const g = merged.grade_level || 4;
    const s = merged.subject_id || 1;
    if (curriculumDatabase.lessonsByGradeAndSubject[g]?.[s]) {
      const lesson = curriculumDatabase.lessonsByGradeAndSubject[g][s].find(l => l.exercise_id === numericId);
      if (lesson) {
        lesson.title = merged.title;
        lesson.description = merged.is_random_pool
          ? `Ngân hàng ${merged.questions?.length || 0} câu (Random ${merged.random_count || 10} câu)`
          : `Bài tập gồm ${merged.questions?.length || 0} câu hỏi`;
      }
    }

    try {
      let stored = JSON.parse(localStorage.getItem('edukids_custom_exercises') || '[]');
      stored = stored.map(ex => ex.id === numericId ? merged : ex);
      if (!stored.some(ex => ex.id === numericId)) {
        stored.push(merged);
      }
      localStorage.setItem('edukids_custom_exercises', JSON.stringify(stored));

      // Async Cloud sync to Aiven MySQL
      this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'save_exercise', exercise: merged })
      }).catch(() => {});
    } catch (e) {}

    return { success: true, exercise: merged };
  }

  deleteExercise(id) {
    const numericId = parseInt(id, 10);
    delete curriculumDatabase.exercises[numericId];

    // Remove from lessons
    for (const g of Object.keys(curriculumDatabase.lessonsByGradeAndSubject)) {
      for (const s of Object.keys(curriculumDatabase.lessonsByGradeAndSubject[g])) {
        curriculumDatabase.lessonsByGradeAndSubject[g][s] = curriculumDatabase.lessonsByGradeAndSubject[g][s].filter(
          l => l.exercise_id !== numericId
        );
      }
    }

    try {
      // 1. Remove from custom exercises if present
      let stored = JSON.parse(localStorage.getItem('edukids_custom_exercises') || '[]');
      stored = stored.filter(ex => ex.id !== numericId);
      localStorage.setItem('edukids_custom_exercises', JSON.stringify(stored));

      // 2. Add to deleted exercises blacklist so it NEVER comes back on F5 reload!
      let deletedList = JSON.parse(localStorage.getItem('edukids_deleted_exercises') || '[]');
      if (!deletedList.includes(numericId)) {
        deletedList.push(numericId);
      }
      localStorage.setItem('edukids_deleted_exercises', JSON.stringify(deletedList));

      // Async Cloud sync delete on Aiven MySQL
      this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete_exercise', deleteId: numericId })
      }).catch(() => {});
    } catch (e) {
      console.warn('Cannot persist deleted exercise:', e);
    }

    return { success: true };
  }

  async submitExercise(exerciseId, answers, timeTakenSeconds, sessionQuestions = null) {
    const res = await this.request('/exercises/submit', {
      method: 'POST',
      body: JSON.stringify({ exerciseId, answers, timeTakenSeconds })
    });
    if (res.success && res.result) return res;

    // Intelligent local grading supporting all question types (multiple_choice, fill_blank, matching, true_false)
    const ex = curriculumDatabase.exercises[exerciseId] || curriculumDatabase.exercises[1021] || curriculumDatabase.exercises[101];
    let totalScore = 0;
    let earnedXp = 0;
    const questions = (Array.isArray(sessionQuestions) && sessionQuestions.length > 0) ? sessionQuestions : (ex?.questions || []);

    const detailedFeedback = questions.map((q, idx) => {
      const qId = q.id !== undefined ? q.id : (idx + 1);
      const studentAns = (answers[qId] !== undefined && answers[qId] !== null)
        ? answers[qId]
        : (answers[String(qId)] !== undefined ? answers[String(qId)] : (answers[q.session_index] ?? answers[idx + 1] ?? answers[idx]));

      const qType = q.question_type || 'multiple_choice';
      let isCorrect = false;
      let formattedStudentAns = '';
      let formattedCorrectAns = '';

      if (qType === 'multiple_choice') {
        const studentChoice = (studentAns || '').toString().trim().toUpperCase();
        const correctChoice = (q.correct_answer || 'A').toString().trim().toUpperCase();
        isCorrect = (studentChoice === correctChoice && studentChoice !== '');

        const selectedOpt = (q.options || []).find(o => (o.option_label || '').toString().trim().toUpperCase() === studentChoice);
        const correctOpt = (q.options || []).find(o => (o.option_label || '').toString().trim().toUpperCase() === correctChoice);

        if (studentChoice) {
          formattedStudentAns = selectedOpt ? `${selectedOpt.option_label}. ${selectedOpt.answer_text}` : `${studentChoice}`;
        } else {
          formattedStudentAns = 'Chưa trả lời';
        }

        formattedCorrectAns = correctOpt ? `${correctOpt.option_label}. ${correctOpt.answer_text}` : `${correctChoice}`;
      } else if (qType === 'fill_blank') {
        const correctText = (q.correct_answer || '').toString().trim();
        const userText = (studentAns !== undefined && studentAns !== null) ? studentAns.toString().trim() : '';
        isCorrect = (userText.toLowerCase() === correctText.toLowerCase() && userText !== '');
        formattedStudentAns = userText !== '' ? userText : 'Chưa trả lời';
        formattedCorrectAns = correctText;
      } else if (qType === 'true_false') {
        const correctTf = (q.correct_answer || 'Đúng').toString().trim().toLowerCase();
        const userTf = (studentAns || '').toString().trim().toLowerCase();
        isCorrect = (userTf !== '' && (userTf === correctTf || (correctTf.includes('đúng') && userTf.includes('đúng')) || (correctTf.includes('sai') && userTf.includes('sai'))));
        formattedStudentAns = (studentAns !== undefined && studentAns !== null && String(studentAns).trim() !== '') ? String(studentAns).trim() : 'Chưa trả lời';
        formattedCorrectAns = q.correct_answer || 'Đúng';
      } else if (qType === 'matching') {
        if (q.matching_data?.correctPairs && studentAns && typeof studentAns === 'object') {
          const pairs = q.matching_data.correctPairs;
          const totalPairs = Object.keys(pairs).length;
          let matchedCount = 0;
          for (const [leftKey, rightVal] of Object.entries(pairs)) {
            if (studentAns[leftKey] === rightVal) {
              matchedCount++;
            }
          }
          isCorrect = (matchedCount === totalPairs && totalPairs > 0);
          formattedStudentAns = Object.keys(studentAns).length > 0
            ? Object.entries(studentAns).map(([l, r]) => `${l} ➔ ${r}`).join(', ')
            : 'Chưa nối cặp';
        } else {
          isCorrect = false;
          formattedStudentAns = 'Chưa nối cặp';
        }
        formattedCorrectAns = q.matching_data?.correctPairs
          ? Object.entries(q.matching_data.correctPairs).map(([l, r]) => `${l} ➔ ${r}`).join(', ')
          : (q.correct_answer || 'Xem lời giải chi tiết');
      } else {
        isCorrect = (studentAns !== undefined && studentAns !== null && studentAns === q.correct_answer);
        formattedStudentAns = studentAns ? String(studentAns) : 'Chưa trả lời';
        formattedCorrectAns = String(q.correct_answer || 'A');
      }

      const score = isCorrect ? (q.points || 10) : 0;
      totalScore += score;
      if (isCorrect) earnedXp += 25;

      return {
        questionId: qId,
        index: idx + 1,
        questionType: qType,
        questionText: q.question_text,
        imageUrl: q.image_url,
        studentAnswer: formattedStudentAns,
        userAnswer: formattedStudentAns,
        correctAnswer: formattedCorrectAns,
        isCorrect: isCorrect,
        pointsEarned: score,
        pointsPossible: q.points || 10,
        pedagogicalExplanation: q.explanation || (q.hint ? `💡 Gợi ý tư duy: ${q.hint}` : 'Bé hãy đối chiếu lại kiến thức trọng tâm của bài học nhé.')
      };
    });

    const totalQ = questions.length || 1;
    const maxScore = totalQ * 10;
    const score10 = Math.round((totalScore / maxScore) * 10);
    const scorePercentage = Math.round((totalScore / maxScore) * 100);

    // Record Real Submission Record & Sync to Cloud MySQL
    try {
      const userStored = JSON.parse(localStorage.getItem('edukids_user') || '{}');
      const newSubmission = {
        id: Date.now(),
        exercise_id: parseInt(exerciseId, 10),
        exercise_title: ex?.title || 'Bài tập',
        user_id: userStored.id || 1,
        user_name: userStored.full_name || 'Học sinh',
        user_avatar: userStored.avatar || 'mascot-bear',
        grade_level: userStored.grade_level || 4,
        score10,
        score: totalScore,
        totalQuestions: totalQ,
        correctCount: detailedFeedback.filter(f => f.isCorrect).length,
        wrongCount: detailedFeedback.filter(f => !f.isCorrect).length,
        percentage: scorePercentage,
        xpEarned: earnedXp || 30,
        timeTakenSeconds: timeTakenSeconds || 30,
        submittedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' Hôm nay'
      };

      const currentSubs = JSON.parse(localStorage.getItem('edukids_submissions') || '[]');
      currentSubs.unshift(newSubmission);
      localStorage.setItem('edukids_submissions', JSON.stringify(currentSubs));

      // Async Cloud sync submission to Aiven MySQL
      this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'save_submission', submission: newSubmission })
      }).catch(() => {});
    } catch (e) {
      console.warn('Cannot record submission:', e);
    }

    return {
      success: true,
      result: {
        score: totalScore,
        score10,
        totalPoints: maxScore,
        totalQuestions: totalQ,
        correctCount: detailedFeedback.filter(f => f.isCorrect).length,
        wrongCount: detailedFeedback.filter(f => !f.isCorrect).length,
        scorePercentage,
        percentage: scorePercentage,
        xpEarned: earnedXp || 30,
        earnedXp: earnedXp || 30,
        maxCombo: 1,
        timeTakenSeconds: timeTakenSeconds || 30,
        overallMessage: {
          title: scorePercentage >= 80 ? '🎉 Xuất Sắc! Bé Đạt Điểm Rất Cao!' : (scorePercentage >= 50 ? '👏 Khá Lắm! Bé Cố Gắng Lên Nhé!' : '💪 Đừng Nản Lòng, Hãy Thử Lại Nhé!'),
          sub: scorePercentage >= 80 ? 'Bé đã nắm rất vững bài học này. Hãy tiếp tục thử sức với các bài tiếp theo!' : 'Hãy xem lại các câu chưa chính xác và lời giải chi tiết của cô giáo bên dưới nhé!'
        },
        questionBreakdown: detailedFeedback,
        feedback: detailedFeedback,
        badgeUnlocked: null
      }
    };
  }

  async getLeaderboard() {
    const res = await this.request('/leaderboard');
    if (res.success && res.leaderboard) return res;
    return {
      success: true,
      leaderboard: [
        { id: 1, full_name: 'Nguyễn Minh Anh', avatar: 'mascot-bear', grade_level: 4, xp: 1250, streak_days: 7 },
        { id: 2, full_name: 'Trần Bình', avatar: 'mascot-lion', grade_level: 4, xp: 850, streak_days: 5 },
        { id: 3, full_name: 'Bé Bảo Ngọc', avatar: 'mascot-rabbit', grade_level: 2, xp: 320, streak_days: 4 },
        { id: 4, full_name: 'Lê Minh', avatar: 'mascot-panda', grade_level: 4, xp: 420, streak_days: 2 }
      ]
    };
  }
}

export const api = new ApiService();
