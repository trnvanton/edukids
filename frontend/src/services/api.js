// Client API Service with Complete Multi-Grade Curriculum & Intelligent Fallback
import { generate100QuestionsPool } from './randomPoolService';

const API_BASE = '/api';

// Curriculum Dataset - Built-in Standard Curriculum for Grades 1-5 + Teacher Custom Exercises
const STANDARD_EXERCISES = {
  // LỚP 1
  101: {
    id: 101,
    title: 'Làm Quen Các Số 1 Đến 10 & So Sánh Số Lượng',
    grade_level: 1,
    subject_id: 1,
    subject_code: 'toan',
    topic_tag: 'toan-1-co-ban',
    questions: [
      {
        id: 1011,
        question_type: 'multiple_choice',
        question_text: 'Số nào lớn hơn số 7 trong các số sau?',
        options: [
          { option_label: 'A', answer_text: '5' },
          { option_label: 'B', answer_text: '9' },
          { option_label: 'C', answer_text: '6' },
          { option_label: 'D', answer_text: '4' }
        ],
        correct_answer: 'B',
        explanation: 'Ta có thứ tự các số: 4 < 5 < 6 < 7 < 9. Vậy số 9 lớn hơn số 7.'
      },
      {
        id: 1012,
        question_type: 'multiple_select',
        question_text: 'Những số nào sau đây nhỏ hơn số 6? (Chọn tất cả các đáp án đúng)',
        options: [
          { option_label: 'A', answer_text: 'Số 2' },
          { option_label: 'B', answer_text: 'Số 8' },
          { option_label: 'C', answer_text: 'Số 4' },
          { option_label: 'D', answer_text: 'Số 5' }
        ],
        correct_answer: 'A, C, D',
        explanation: 'Các số 2, 4, 5 đều nhỏ hơn 6. Số 8 lớn hơn 6.'
      },
      {
        id: 1013,
        question_type: 'fill_blank',
        question_text: 'Kết quả của phép tính: 5 + 3 = ?',
        correct_answer: '8',
        explanation: '5 cộng thêm 3 bằng 8.'
      },
      {
        id: 1014,
        question_type: 'true_false',
        question_text: 'Phép tính 9 - 4 = 5 là Đúng hay Sai?',
        correct_answer: 'Đúng',
        explanation: '9 trừ đi 4 bằng 5 là phép tính chính xác.'
      }
    ]
  },
  102: {
    id: 102,
    title: 'Làm Quen Bảng Chữ Cái & Ghép Vần Cơ Bản',
    grade_level: 1,
    subject_id: 2,
    subject_code: 'tieng-viet',
    topic_tag: 'tv-1-chu-cai',
    questions: [
      {
        id: 1021,
        question_type: 'multiple_choice',
        question_text: 'Từ nào sau đây bắt đầu bằng chữ "B"?',
        options: [
          { option_label: 'A', answer_text: 'Bàn học' },
          { option_label: 'B', answer_text: 'Cây táo' },
          { option_label: 'C', answer_text: 'Dòng sông' },
          { option_label: 'D', answer_text: 'Mặt trời' }
        ],
        correct_answer: 'A',
        explanation: 'Từ "Bàn học" có tiếng "Bàn" bắt đầu bằng chữ cái "B".'
      },
      {
        id: 1022,
        question_type: 'multiple_select',
        question_text: 'Những từ nào sau đây là từ chỉ người trong gia đình? (Chọn tất cả đáp án đúng)',
        options: [
          { option_label: 'A', answer_text: 'Ông bà' },
          { option_label: 'B', answer_text: 'Cái bút' },
          { option_label: 'C', answer_text: 'Bố mẹ' },
          { option_label: 'D', answer_text: 'Anh chị' }
        ],
        correct_answer: 'A, C, D',
        explanation: 'Ông bà, Bố mẹ, Anh chị là những người thân trong gia đình.'
      }
    ]
  },
  103: {
    id: 103,
    title: 'Cơ Thể Em & Các Động Vật Quanh Em',
    grade_level: 1,
    subject_id: 3,
    subject_code: 'khoa-hoc',
    topic_tag: 'kh-1-co-the',
    questions: [
      {
        id: 1031,
        question_type: 'multiple_choice',
        question_text: 'Bộ phận nào trên cơ thể giúp chúng ta nhìn thấy mọi vật?',
        options: [
          { option_label: 'A', answer_text: 'Đôi tai' },
          { option_label: 'B', answer_text: 'Đôi mắt' },
          { option_label: 'C', answer_text: 'Cái mũi' },
          { option_label: 'D', answer_text: 'Bàn tay' }
        ],
        correct_answer: 'B',
        explanation: 'Đôi mắt là cơ quan thị giác giúp chúng ta nhìn ngắm thế giới xung quanh.'
      }
    ]
  },
  104: {
    id: 104,
    title: 'English Fun 1: Colors & Animals',
    grade_level: 1,
    subject_id: 4,
    subject_code: 'tieng-anh',
    topic_tag: 'en-1-colors',
    questions: [
      {
        id: 1041,
        question_type: 'multiple_choice',
        question_text: 'Từ "Cat" trong tiếng Anh có nghĩa là con gì?',
        options: [
          { option_label: 'A', answer_text: 'Con mèo' },
          { option_label: 'B', answer_text: 'Con chó' },
          { option_label: 'C', answer_text: 'Con chim' },
          { option_label: 'D', answer_text: 'Con cá' }
        ],
        correct_answer: 'A',
        explanation: 'Cat có nghĩa là Con mèo trong tiếng Anh.'
      }
    ]
  },

  // LỚP 2
  201: {
    id: 201,
    title: 'Phép Cộng Trừ Có Nhớ & Bảng Nhân 2, 5',
    grade_level: 2,
    subject_id: 1,
    subject_code: 'toan',
    topic_tag: 'toan-2-co-ban',
    questions: [
      {
        id: 2011,
        question_type: 'multiple_choice',
        question_text: 'Kết quả của phép tính: 48 + 27 = ?',
        options: [
          { option_label: 'A', answer_text: '65' },
          { option_label: 'B', answer_text: '75' },
          { option_label: 'C', answer_text: '73' },
          { option_label: 'D', answer_text: '85' }
        ],
        correct_answer: 'B',
        explanation: '8 + 7 = 15 viết 5 nhớ 1; 4 + 2 = 6 thêm 1 bằng 7. Vậy 48 + 27 = 75.'
      },
      {
        id: 2012,
        question_type: 'multiple_select',
        question_text: 'Những phép tính nào sau đây có kết quả bằng 20? (Chọn tất cả đáp án đúng)',
        options: [
          { option_label: 'A', answer_text: '5 × 4' },
          { option_label: 'B', answer_text: '2 × 10' },
          { option_label: 'C', answer_text: '15 + 6' },
          { option_label: 'D', answer_text: '10 + 10' }
        ],
        correct_answer: 'A, B, D',
        explanation: '5 × 4 = 20, 2 × 10 = 20, 10 + 10 = 20. Riêng 15 + 6 = 21.'
      }
    ]
  },
  202: {
    id: 202,
    title: 'Mở Rộng Vốn Từ: Gia Đình & Nhà Trường',
    grade_level: 2,
    subject_id: 2,
    subject_code: 'tieng-viet',
    topic_tag: 'tv-2-tu-vung',
    questions: [
      {
        id: 2021,
        question_type: 'multiple_choice',
        question_text: 'Từ nào sau đây là từ chỉ hoạt động của học sinh ở trường?',
        options: [
          { option_label: 'A', answer_text: 'Nghe giảng' },
          { option_label: 'B', answer_text: 'Bảng đen' },
          { option_label: 'C', answer_text: 'Cây phượng' },
          { option_label: 'D', answer_text: 'Phấn trắng' }
        ],
        correct_answer: 'A',
        explanation: '"Nghe giảng" là từ chỉ hoạt động học tập của học sinh.'
      }
    ]
  },

  // LỚP 3
  301: {
    id: 301,
    title: 'Bảng Cửu Chương Nhân Chia & Hình Học Lớp 3',
    grade_level: 3,
    subject_id: 1,
    subject_code: 'toan',
    topic_tag: 'toan-3-nhan-chia',
    questions: [
      {
        id: 3011,
        question_type: 'multiple_choice',
        question_text: 'Tính chu vi của hình vuông có độ dài cạnh là 8 cm:',
        options: [
          { option_label: 'A', answer_text: '24 cm' },
          { option_label: 'B', answer_text: '32 cm' },
          { option_label: 'C', answer_text: '64 cm' },
          { option_label: 'D', answer_text: '16 cm' }
        ],
        correct_answer: 'B',
        explanation: 'Chu vi hình vuông = Độ dài cạnh × 4 = 8 × 4 = 32 cm.'
      }
    ]
  },

  // LỚP 4
  401: {
    id: 401,
    title: 'Phân Số & Bốn Phép Tính Với Phân Số',
    grade_level: 4,
    subject_id: 1,
    subject_code: 'toan',
    topic_tag: 'toan-4-phan-so',
    questions: [
      {
        id: 4011,
        question_type: 'multiple_choice',
        question_text: 'Rút gọn phân số 18/24 về dạng tối giản được phân số nào?',
        options: [
          { option_label: 'A', answer_text: '3/4' },
          { option_label: 'B', answer_text: '9/12' },
          { option_label: 'C', answer_text: '2/3' },
          { option_label: 'D', answer_text: '6/8' }
        ],
        correct_answer: 'A',
        explanation: 'Chia cả tử số và mẫu số cho 6: 18:6 = 3, 24:6 = 4. Phân số tối giản là 3/4.'
      },
      {
        id: 4012,
        question_type: 'multiple_select',
        question_text: 'Những phân số nào sau đây lớn hơn 1? (Chọn tất cả các đáp án đúng)',
        options: [
          { option_label: 'A', answer_text: '5/4' },
          { option_label: 'B', answer_text: '3/7' },
          { option_label: 'C', answer_text: '8/3' },
          { option_label: 'D', answer_text: '9/2' }
        ],
        correct_answer: 'A, C, D',
        explanation: 'Phân số lớn hơn 1 khi tử số lớn hơn mẫu số (5/4, 8/3, 9/2).'
      }
    ]
  },

  // LỚP 5
  501: {
    id: 501,
    title: 'Số Thập Phân & Tỉ Số Phần Trăm',
    grade_level: 5,
    subject_id: 1,
    subject_code: 'toan',
    topic_tag: 'toan-5-thap-phan',
    questions: [
      {
        id: 5011,
        question_type: 'multiple_choice',
        question_text: 'Tìm 25% của 160:',
        options: [
          { option_label: 'A', answer_text: '30' },
          { option_label: 'B', answer_text: '40' },
          { option_label: 'C', answer_text: '50' },
          { option_label: 'D', answer_text: '80' }
        ],
        correct_answer: 'B',
        explanation: '25% của 160 = 160 × 25 / 100 = 40.'
      }
    ]
  }
};

const curriculumDatabase = {
  // Subjects
  subjects: [
    { id: 1, name: 'Toán Học', code: 'toan', icon: '📐', color: '#3B82F6', description: 'Số học, hình học, phép tính & tư duy logic' },
    { id: 2, name: 'Tiếng Việt', code: 'tieng-viet', icon: '📖', color: '#EF4444', description: 'Đọc hiểu, chính tả, luyện từ và câu, tập làm văn' },
    { id: 3, name: 'Khoa Học & Tự Nhiên', code: 'khoa-hoc', icon: '🔬', color: '#8B5CF6', description: 'Cơ thể người, động thực vật & thế giới tự nhiên' },
    { id: 4, name: 'Tiếng Anh', code: 'tieng-anh', icon: '🇬🇧', color: '#10B981', description: 'English Vocabulary, Phonics, Grammar & Daily Communication' }
  ],

  // Lessons Matrix: [grade_level][subject_id]
  lessonsByGradeAndSubject: {
    1: { 1: [], 2: [], 3: [], 4: [] },
    2: { 1: [], 2: [], 3: [], 4: [] },
    3: { 1: [], 2: [], 3: [], 4: [] },
    4: { 1: [], 2: [], 3: [], 4: [] },
    5: { 1: [], 2: [], 3: [], 4: [] }
  },

  // Question Bank
  exercises: { ...STANDARD_EXERCISES }
};

// Populate default lessons matrix
Object.values(STANDARD_EXERCISES).forEach(ex => {
  const g = ex.grade_level || 1;
  const s = ex.subject_id || 1;
  if (!curriculumDatabase.lessonsByGradeAndSubject[g]) {
    curriculumDatabase.lessonsByGradeAndSubject[g] = { 1: [], 2: [], 3: [], 4: [] };
  }
  if (!curriculumDatabase.lessonsByGradeAndSubject[g][s]) {
    curriculumDatabase.lessonsByGradeAndSubject[g][s] = [];
  }
  curriculumDatabase.lessonsByGradeAndSubject[g][s].push({
    id: ex.id + 50000,
    subject_id: s,
    grade_level: g,
    title: ex.title,
    topic_tag: ex.topic_tag || `grade-${g}-${s}`,
    description: `Bài học rèn luyện gồm ${ex.questions.length} câu hỏi tương tác`,
    icon: s === 1 ? '📐' : (s === 2 ? '📖' : (s === 3 ? '🔬' : '🇬🇧')),
    exercise_id: ex.id
  });
});

// System blacklist of deleted exercises to ensure they never reappear across any device/session
const SYSTEM_DELETED_EXERCISES = [35108];

// Hydrate saved custom exercises from localStorage
try {
  // 1. Gather all deleted IDs
  const localDeleted = JSON.parse(localStorage.getItem('edukids_deleted_exercises') || '[]');
  const deletedSet = new Set(Array.isArray(localDeleted) ? localDeleted.map(d => parseInt(d, 10)) : []);
  SYSTEM_DELETED_EXERCISES.forEach(id => deletedSet.add(id));
  localStorage.setItem('edukids_deleted_exercises', JSON.stringify(Array.from(deletedSet)));

  // 2. Hydrate only valid non-deleted custom exercises
  const storedCustom = JSON.parse(localStorage.getItem('edukids_custom_exercises') || '[]');
  const cleanCustom = [];
  if (Array.isArray(storedCustom)) {
    storedCustom.forEach(ex => {
      const numId = ex && ex.id ? parseInt(ex.id, 10) : null;
      if (numId && !deletedSet.has(numId) && Array.isArray(ex.questions) && ex.questions.length > 0) {
        cleanCustom.push(ex);
        curriculumDatabase.exercises[numId] = ex;
        const g = ex.grade_level || 4;
        const s = ex.subject_id || 1;
        if (!curriculumDatabase.lessonsByGradeAndSubject[g]) {
          curriculumDatabase.lessonsByGradeAndSubject[g] = { 1: [], 2: [], 3: [], 4: [] };
        }
        if (!curriculumDatabase.lessonsByGradeAndSubject[g][s]) {
          curriculumDatabase.lessonsByGradeAndSubject[g][s] = [];
        }
        curriculumDatabase.lessonsByGradeAndSubject[g][s].unshift({
          id: numId + 50000,
          subject_id: s,
          grade_level: g,
          title: ex.title,
          topic_tag: `custom-${numId}`,
          description: ex.is_random_pool ? `Ngân hàng ${ex.questions.length} câu (Random ${ex.random_count || 10} câu)` : `Bài tập gồm ${ex.questions.length} câu hỏi`,
          icon: ex.is_random_pool ? '🎲' : (s === 1 ? '📐' : (s === 2 ? '📖' : (s === 3 ? '🔬' : '🇬🇧'))),
          exercise_id: numId
        });
      }
    });
  }
  localStorage.setItem('edukids_custom_exercises', JSON.stringify(cleanCustom));

  // Purge any accidental deleted items from database and lessons
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
        const deletedIds = JSON.parse(localStorage.getItem('edukids_deleted_exercises') || '[]');
        const deletedSet = new Set(Array.isArray(deletedIds) ? deletedIds.map(d => parseInt(d, 10)) : []);
        SYSTEM_DELETED_EXERCISES.forEach(id => deletedSet.add(id));

        if (Array.isArray(res.deleted_exercise_ids)) {
          res.deleted_exercise_ids.forEach(id => {
            const num = parseInt(id, 10);
            if (!isNaN(num)) deletedSet.add(num);
          });
        }
        localStorage.setItem('edukids_deleted_exercises', JSON.stringify(Array.from(deletedSet)));

        const deletedClasses = JSON.parse(localStorage.getItem('edukids_deleted_classes') || '[]');
        const deletedClassSet = new Set(Array.isArray(deletedClasses) ? deletedClasses.map(String) : []);
        if (Array.isArray(res.deleted_class_ids)) {
          res.deleted_class_ids.forEach(id => deletedClassSet.add(String(id)));
          localStorage.setItem('edukids_deleted_classes', JSON.stringify(Array.from(deletedClassSet)));
        }

        const deletedStudents = JSON.parse(localStorage.getItem('edukids_deleted_students') || '[]');
        const deletedStudentSet = new Set(Array.isArray(deletedStudents) ? deletedStudents.map(s => String(s).toLowerCase()) : []);
        if (Array.isArray(res.deleted_student_ids)) {
          res.deleted_student_ids.forEach(id => deletedStudentSet.add(String(id).toLowerCase()));
          localStorage.setItem('edukids_deleted_students', JSON.stringify(Array.from(deletedStudentSet)));
        }

        // Purge deleted exercises from local cache & curriculumDatabase
        deletedSet.forEach(numId => {
          delete curriculumDatabase.exercises[numId];
        });

        for (const g of Object.keys(curriculumDatabase.lessonsByGradeAndSubject)) {
          for (const s of Object.keys(curriculumDatabase.lessonsByGradeAndSubject[g])) {
            curriculumDatabase.lessonsByGradeAndSubject[g][s] = curriculumDatabase.lessonsByGradeAndSubject[g][s].filter(
              l => !deletedSet.has(parseInt(l.exercise_id, 10))
            );
          }
        }

        if (Array.isArray(res.exercises)) {
          res.exercises.forEach(ex => {
            const numericId = ex && ex.id ? parseInt(ex.id, 10) : null;
            if (numericId && !deletedSet.has(numericId) && Array.isArray(ex.questions) && ex.questions.length > 0) {
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
            localCustom.forEach(ex => {
              const numId = parseInt(ex.id, 10);
              if (numId && !deletedSet.has(numId)) map.set(numId, ex);
            });
            res.exercises.forEach(ex => {
              const numId = parseInt(ex.id, 10);
              if (numId && !deletedSet.has(numId)) map.set(numId, ex);
            });
            const mergedList = Array.from(map.values());
            localStorage.setItem('edukids_custom_exercises', JSON.stringify(mergedList));
          } catch (e) {}
        }

        if (Array.isArray(res.classes)) {
          try {
            const localCls = JSON.parse(localStorage.getItem('edukids_custom_classes') || '[]');
            const clsMap = new Map();
            localCls.forEach(c => {
              const code = String(c.class_code || c.id);
              if (!deletedClassSet.has(code) && !deletedClassSet.has(String(c.id))) {
                clsMap.set(code, c);
              }
            });
            res.classes.forEach(c => {
              const code = String(c.class_code || c.id);
              if (!deletedClassSet.has(code) && !deletedClassSet.has(String(c.id))) {
                clsMap.set(code, c);
              }
            });
            localStorage.setItem('edukids_custom_classes', JSON.stringify(Array.from(clsMap.values())));
          } catch (e) {}
        }

        if (Array.isArray(res.submissions)) {
          try {
            const localSubs = JSON.parse(localStorage.getItem('edukids_submissions') || '[]');
            const subMap = new Map();
            localSubs.forEach(s => subMap.set(String(s.id), s));
            res.submissions.forEach(s => subMap.set(String(s.id), s));
            const mergedSubs = Array.from(subMap.values()).sort((a, b) => (b.id || 0) - (a.id || 0));
            localStorage.setItem('edukids_submissions', JSON.stringify(mergedSubs));
          } catch (e) {}
        }

        if (Array.isArray(res.students)) {
          try {
            const localSt = JSON.parse(localStorage.getItem('edukids_custom_students') || '[]');
            const stMap = new Map();
            localSt.forEach(s => {
              const name = String(s.full_name || s.student_name || '').toLowerCase();
              const uName = String(s.username || '').toLowerCase();
              const id = String(s.id);
              if (!deletedStudentSet.has(name) && !deletedStudentSet.has(uName) && !deletedStudentSet.has(id)) {
                stMap.set(uName || id, s);
              }
            });
            res.students.forEach(s => {
              const name = String(s.full_name || s.student_name || '').toLowerCase();
              const uName = String(s.username || '').toLowerCase();
              const id = String(s.id);
              if (!deletedStudentSet.has(name) && !deletedStudentSet.has(uName) && !deletedStudentSet.has(id)) {
                const key = uName || id;
                const existing = stMap.get(key);
                if (existing) {
                  stMap.set(key, {
                    ...s,
                    ...existing,
                    full_name: (existing.full_name && existing.full_name !== existing.username) ? existing.full_name : (s.full_name || existing.full_name),
                    xp: Math.max(existing.xp || 0, s.xp || 0)
                  });
                } else {
                  stMap.set(key, s);
                }
              }
            });

            const mergedStList = Array.from(stMap.values());
            localStorage.setItem('edukids_custom_students', JSON.stringify(mergedStList));

            // Cross-device sync: If current logged-in user exists on this device (phone/laptop), update XP & class from cloud
            const currentUser = JSON.parse(localStorage.getItem('edukids_v2_user') || localStorage.getItem('edukids_user') || '{}');
            if (currentUser && (currentUser.full_name || currentUser.username)) {
              const curName = (currentUser.full_name || currentUser.username || '').toLowerCase();
              const curUser = (currentUser.username || '').toLowerCase();
              const cloudMatch = res.students.find(s => {
                const sName = (s.full_name || s.student_name || '').toLowerCase();
                const sUser = (s.username || '').toLowerCase();
                return (sUser && curUser && sUser === curUser) ||
                       (sName && (sName === curName || sName === curUser)) ||
                       (currentUser.parent_phone && s.parent_phone === currentUser.parent_phone) ||
                       String(s.id) === String(currentUser.id);
              });
              if (cloudMatch) {
                const mergedXp = Math.max(currentUser.xp || 0, cloudMatch.xp || 0);
                const syncedClassCode = cloudMatch.class_code || currentUser.class_code || '';
                const syncedClassName = cloudMatch.class_name || currentUser.class_name || (syncedClassCode ? syncedClassCode.split('-')[0] : '');
                const syncedFullName = (cloudMatch.full_name && cloudMatch.full_name !== cloudMatch.username) ? cloudMatch.full_name : currentUser.full_name;
                const syncedUser = {
                  ...currentUser,
                  full_name: syncedFullName || currentUser.full_name,
                  xp: mergedXp,
                  class_code: syncedClassCode,
                  class_name: syncedClassName
                };
                localStorage.setItem('edukids_v2_user', JSON.stringify(syncedUser));
                localStorage.setItem('edukids_user', JSON.stringify(syncedUser));
              }
            }
          } catch (e) {}
        }

        return { success: true, count: res.exercises?.length || 0 };
      }
    } catch (e) {
      console.warn('Cloud sync error:', e);
    }
    return { success: false };
  }

  async joinClass({ class_code, student_name, parent_phone, avatar, grade_level }) {
    const code = (class_code || '').toUpperCase().trim();
    let className = code ? (code.split('-')[0] || `Lớp ${grade_level || 2}A1`) : '';
    try {
      const customClasses = JSON.parse(localStorage.getItem('edukids_custom_classes') || '[]');
      const found = customClasses.find(c => c.class_code === code || c.className === className);
      if (found) className = found.className;
    } catch (e) {}

    const currentUser = JSON.parse(localStorage.getItem('edukids_v2_user') || localStorage.getItem('edukids_user') || '{}');
    const existingXp = Math.max(currentUser.xp || 0, 50);

    const student = {
      ...currentUser,
      id: currentUser.id || Date.now(),
      full_name: student_name.trim(),
      student_name: student_name.trim(),
      class_code: code,
      class_name: className,
      parent_phone: parent_phone ? parent_phone.trim() : (currentUser.parent_phone || ''),
      avatar: avatar || currentUser.avatar || 'mascot-bear',
      grade_level: parseInt(grade_level || currentUser.grade_level || 2, 10),
      xp: existingXp,
      role: 'student'
    };

    // Save to local custom students
    this.saveCustomStudent(student);

    // Save as active session
    try {
      localStorage.setItem('edukids_v2_user', JSON.stringify(student));
      localStorage.setItem('edukids_user', JSON.stringify(student));
    } catch (e) {}

    // Async Cloud MySQL sync
    this.request('/sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'join_class', student })
    }).catch(() => {});

    return { success: true, student };
  }

  // Auth
  async login(username, password) {
    const cleanUsername = (username || '').trim();
    const cleanLower = cleanUsername.toLowerCase();

    // 1. Try Cloud MySQL lookup first
    try {
      const syncRes = await this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'get_student_profile', username: cleanUsername })
      });
      if (syncRes && syncRes.success && syncRes.user) {
        return {
          success: true,
          token: `token-${cleanUsername}`,
          user: syncRes.user
        };
      }
    } catch (e) {}

    // 2. Check local saved custom students
    try {
      const customStudents = JSON.parse(localStorage.getItem('edukids_custom_students') || '[]');
      const found = customStudents.find(s => 
        (s.username && s.username.toLowerCase() === cleanLower) ||
        (s.id && String(s.id).toLowerCase() === cleanLower) ||
        (s.full_name && s.full_name.toLowerCase() === cleanLower) ||
        (s.student_name && s.student_name.toLowerCase() === cleanLower)
      );
      if (found) {
        const fName = found.full_name || found.student_name || cleanUsername;
        return {
          success: true,
          token: `token-${cleanUsername}`,
          user: {
            ...found,
            username: found.username || cleanUsername,
            full_name: fName,
            student_name: fName
          }
        };
      }
    } catch (e) {}

    // 3. Fallback demo logins
    if (cleanLower === 'student_lop2') {
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
    if (cleanLower === 'teacher1') {
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
    if (cleanLower === 'admin') {
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
    if (cleanLower === 'student1') {
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

    // 4. Dynamic fallback for brand new username (check submissions for remembered metadata)
    let rememberedFullName = cleanLower === 'toan2004' ? 'Trịnh Văn Toàn' : (cleanUsername || 'Học Sinh Mới');
    let rememberedAvatar = 'mascot-lion';
    let rememberedGrade = 2;
    let rememberedClass = '';
    let rememberedXp = 50;

    try {
      const subs = JSON.parse(localStorage.getItem('edukids_submissions') || '[]');
      const matchedSub = subs.find(s => 
        (s.username && s.username.toLowerCase() === cleanLower) ||
        (s.user_name && s.user_name.toLowerCase() === cleanLower) ||
        (s.student_name && s.student_name.toLowerCase() === cleanLower)
      );
      if (matchedSub) {
        rememberedFullName = matchedSub.student_name || matchedSub.user_name || rememberedFullName;
        rememberedAvatar = matchedSub.student_avatar || matchedSub.user_avatar || rememberedAvatar;
        rememberedGrade = matchedSub.grade_level || rememberedGrade;
        rememberedClass = matchedSub.class_code || rememberedClass;
        rememberedXp = 75;
      }
    } catch (e) {}

    const newUser = {
      id: Date.now(),
      username: cleanUsername || 'hocsinh',
      full_name: rememberedFullName,
      student_name: rememberedFullName,
      class_code: rememberedClass,
      class_name: rememberedClass ? rememberedClass.split('-')[0] : '',
      role: 'student',
      grade_level: rememberedGrade,
      avatar: rememberedAvatar,
      xp: rememberedXp,
      level: 1,
      streak_days: 1,
      levelInfo: { level: 1, title: 'Tân Thủ Chăm Học', icon: '🌱', progress: 10 }
    };

    this.saveCustomStudent(newUser);

    return {
      success: true,
      token: `demo-token-${cleanUsername}`,
      user: newUser
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
          { id: 4, code: 'streak_7', name: 'Lửa Chăm Chỉ 7 Ngày', icon: '🔥', description: 'Duy trì chuỗi học tập 7 ngày', type: 'streak', min_streak: 7, unlocked: (userContext?.streak_days || 1) >= 7 },
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

  // Real Students Aggregator from Cloud/Local Submissions & Registered accounts
  getRealStudents() {
    try {
      const customStudents = JSON.parse(localStorage.getItem('edukids_custom_students') || '[]');
      const allSubmissions = this.getRealSubmissions();
      const currentUser = JSON.parse(localStorage.getItem('edukids_v2_user') || localStorage.getItem('edukids_user') || '{}');
      const deletedStudents = JSON.parse(localStorage.getItem('edukids_deleted_students') || '[]');
      const deletedSet = new Set(Array.isArray(deletedStudents) ? deletedStudents.map(s => String(s).toLowerCase()) : []);

      const studentMap = new Map();

      // 1. Add students from custom teacher list
      if (Array.isArray(customStudents)) {
        customStudents.forEach(st => {
          if (st && (st.full_name || st.name || st.student_name || st.username)) {
            const fullName = st.full_name || st.student_name || st.name || st.username;
            const uName = st.username || (fullName !== st.id ? fullName : '');
            const id = String(st.id || uName || fullName);
            const key = String(uName || id || fullName).toLowerCase();

            if (!deletedSet.has(fullName.toLowerCase()) && !deletedSet.has(key) && !deletedSet.has(id)) {
              const code = st.class_code || '';
              const cName = st.class_name || (code ? code.split('-')[0] : '');
              studentMap.set(key, {
                id: st.id || Date.now(),
                full_name: fullName,
                student_name: fullName,
                username: uName,
                parent_phone: (st.parent_phone || '').trim(),
                class_code: code,
                class_name: cName,
                avatar: st.avatar || 'mascot-bear',
                grade_level: parseInt(st.grade_level || 2, 10),
                class_id: cName || (code ? `Lớp ${code}` : ''),
                xp: st.xp || 0
              });
            }
          }
        });
      }

      // 2. Add current active student if student role
      if (currentUser && currentUser.role === 'student') {
        const uName = currentUser.username || currentUser.full_name || 'hocsinh';
        const fullName = currentUser.full_name || currentUser.student_name || uName;
        const curUserKey = uName.toLowerCase();
        const idKey = String(currentUser.id);
        const curPhone = (currentUser.parent_phone || '').trim();

        // Remove any old entry that had the same phone or ID or username
        for (const [key, student] of Array.from(studentMap.entries())) {
          if (
            key === curUserKey ||
            String(student.id) === idKey ||
            (curPhone && student.parent_phone && student.parent_phone === curPhone)
          ) {
            studentMap.delete(key);
          }
        }

        const code = currentUser.class_code || '';
        const cName = currentUser.class_name || (code ? code.split('-')[0] : '');
        studentMap.set(curUserKey, {
          id: currentUser.id || Date.now(),
          full_name: fullName,
          student_name: fullName,
          username: uName,
          parent_phone: curPhone,
          class_code: code,
          class_name: cName,
          avatar: currentUser.avatar || 'mascot-bear',
          grade_level: parseInt(currentUser.grade_level || 2, 10),
          class_id: cName || (code ? `Lớp ${code}` : ''),
          xp: currentUser.xp || 50
        });
      }

      // 3. Add any student from real submissions
      allSubmissions.forEach(sub => {
        const name = sub.student_name || sub.user_name || sub.username;
        if (name && name !== 'Cô Hoàng Mai' && name !== 'Quản Trị Viên EduKids') {
          const subUser = sub.username || name;
          const subKey = String(subUser).toLowerCase();
          const idKey = String(sub.user_id);

          if (!deletedSet.has(name.toLowerCase()) && !deletedSet.has(subKey) && !deletedSet.has(idKey)) {
            const code = sub.class_code || '';
            const cName = sub.class_name || (code ? code.split('-')[0] : '');
            const existing = studentMap.get(subKey);
            if (!existing) {
              studentMap.set(subKey, {
                id: sub.user_id || Date.now(),
                full_name: name,
                student_name: name,
                username: sub.username || '',
                parent_phone: (sub.parent_phone || '').trim(),
                class_code: code,
                class_name: cName,
                avatar: sub.student_avatar || sub.user_avatar || 'mascot-bear',
                grade_level: parseInt(sub.grade_level || 2, 10),
                class_id: cName || (code ? `Lớp ${code}` : ''),
                xp: sub.xpEarned || 30
              });
            } else if (existing.full_name === existing.username && name !== existing.username) {
              existing.full_name = name;
              existing.student_name = name;
            }
          }
        }
      });

      // 4. Compute true cumulative XP from all submissions for each student
      for (const [key, student] of studentMap.entries()) {
        const stFullName = (student.full_name || '').toLowerCase();
        const stUserName = (student.username || '').toLowerCase();
        const stId = String(student.id);

        const studentSubs = allSubmissions.filter(s => {
          const subName = (s.student_name || s.user_name || s.username || '').toLowerCase();
          const subId = String(s.user_id);
          return subId === stId || subName === key || subName === stFullName || subName === stUserName;
        });

        const totalSubsXp = studentSubs.reduce((acc, curr) => acc + (curr.xpEarned || curr.earnedXp || 30), 0);
        const isCurUser = currentUser && (
          (currentUser.username && currentUser.username.toLowerCase() === key) ||
          (currentUser.full_name && currentUser.full_name.toLowerCase() === stFullName) ||
          String(currentUser.id) === stId
        );
        const userXp = isCurUser ? (currentUser.xp || 0) : 0;
        student.xp = Math.max(student.xp || 0, totalSubsXp, userXp);
      }

      // 5. If fresh device with few students, seed standard classmates so leaderboard is always lively
      const defaultClassmates = [
        { id: 901, full_name: 'Nguyễn Minh Anh', student_name: 'Nguyễn Minh Anh', username: 'minhanh', class_name: '1A1', class_code: '1A1-8429', avatar: 'mascot-bear', grade_level: 1, xp: 480 },
        { id: 902, full_name: 'Trần Bảo Ngọc', student_name: 'Trần Bảo Ngọc', username: 'baongoc', class_name: '1A1', class_code: '1A1-8429', avatar: 'mascot-rabbit', grade_level: 1, xp: 420 },
        { id: 903, full_name: 'Lê Hoàng Long', student_name: 'Lê Hoàng Long', username: 'hoanglong', class_name: '1A1', class_code: '1A1-8429', avatar: 'mascot-lion', grade_level: 1, xp: 360 },
        { id: 904, full_name: 'Phạm Quỳnh Chi', student_name: 'Phạm Quỳnh Chi', username: 'quynhchi', class_name: '2A1', class_code: '2A1-8429', avatar: 'mascot-fox', grade_level: 2, xp: 520 },
        { id: 905, full_name: 'Đỗ Gia Hưng', student_name: 'Đỗ Gia Hưng', username: 'giahung', class_name: '4A1', class_code: '4A1-8429', avatar: 'mascot-panda', grade_level: 4, xp: 750 }
      ];

      defaultClassmates.forEach(dm => {
        const k = dm.username.toLowerCase();
        if (!studentMap.has(k) && !deletedSet.has(dm.full_name.toLowerCase())) {
          studentMap.set(k, dm);
        }
      });

      return Array.from(studentMap.values());
    } catch (e) {
      return [];
    }
  }

  saveCustomClass(newClass) {
    try {
      let stored = JSON.parse(localStorage.getItem('edukids_custom_classes') || '[]');
      const code = newClass.class_code || `${(newClass.className || '2A1').toUpperCase().replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const classObj = {
        ...newClass,
        id: newClass.id || Date.now(),
        class_code: code,
        teacher_name: newClass.teacher_name || 'Cô Hoàng Mai'
      };
      stored = stored.filter(c => c.id !== classObj.id);
      stored.push(classObj);
      localStorage.setItem('edukids_custom_classes', JSON.stringify(stored));

      // Async Cloud sync
      this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'save_class', classObj })
      }).catch(() => {});

      return { success: true, classes: stored, classObj };
    } catch (e) {
      return { success: false };
    }
  }

  updateCustomClass(classId, updatedData) {
    try {
      let stored = JSON.parse(localStorage.getItem('edukids_custom_classes') || '[]');
      stored = stored.map(c => {
        if (String(c.id) === String(classId) || c.class_code === classId) {
          return { ...c, ...updatedData };
        }
        return c;
      });
      localStorage.setItem('edukids_custom_classes', JSON.stringify(stored));

      const updatedObj = stored.find(c => String(c.id) === String(classId) || c.class_code === classId);
      if (updatedObj) {
        this.request('/sync', {
          method: 'POST',
          body: JSON.stringify({ action: 'save_class', classObj: updatedObj })
        }).catch(() => {});
      }
      return { success: true, classes: stored, classObj: updatedObj };
    } catch (e) {
      return { success: false };
    }
  }

  deleteCustomClass(classId) {
    try {
      let stored = JSON.parse(localStorage.getItem('edukids_custom_classes') || '[]');
      const target = stored.find(c => String(c.id) === String(classId) || c.class_code === classId);
      stored = stored.filter(c => String(c.id) !== String(classId) && c.class_code !== classId);
      localStorage.setItem('edukids_custom_classes', JSON.stringify(stored));

      // Track deleted class id so sync doesn't restore it
      let deletedClasses = JSON.parse(localStorage.getItem('edukids_deleted_classes') || '[]');
      if (classId && !deletedClasses.includes(String(classId))) deletedClasses.push(String(classId));
      if (target?.class_code && !deletedClasses.includes(target.class_code)) deletedClasses.push(target.class_code);
      localStorage.setItem('edukids_deleted_classes', JSON.stringify(deletedClasses));

      // Async Cloud sync delete
      this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete_class', deleteClassId: classId, class_code: target?.class_code || classId })
      }).catch(() => {});

      return { success: true, classes: stored };
    } catch (e) {
      return { success: false };
    }
  }

  saveCustomStudent(newStudent) {
    try {
      let stored = JSON.parse(localStorage.getItem('edukids_custom_students') || '[]');
      const studentObj = {
        ...newStudent,
        id: newStudent.id || Date.now(),
        class_code: newStudent.class_code ? newStudent.class_code.toUpperCase() : ''
      };
      stored = stored.filter(s => s.id !== studentObj.id && s.full_name !== studentObj.full_name);
      stored.push(studentObj);
      localStorage.setItem('edukids_custom_students', JSON.stringify(stored));

      // Async Cloud sync
      this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'save_student', student: studentObj })
      }).catch(() => {});

      return { success: true, students: stored, student: studentObj };
    } catch (e) {
      return { success: false };
    }
  }

  deleteCustomStudent(studentId, studentName = '') {
    try {
      let stored = JSON.parse(localStorage.getItem('edukids_custom_students') || '[]');
      const target = stored.find(s => String(s.id) === String(studentId) || s.full_name === studentName);
      const nameToDelete = studentName || target?.full_name || '';

      stored = stored.filter(s => String(s.id) !== String(studentId) && (!nameToDelete || s.full_name?.toLowerCase() !== nameToDelete.toLowerCase()));
      localStorage.setItem('edukids_custom_students', JSON.stringify(stored));

      // Track deleted student so getRealStudents and sync never restore them
      let deletedList = JSON.parse(localStorage.getItem('edukids_deleted_students') || '[]');
      if (studentId && !deletedList.includes(String(studentId))) deletedList.push(String(studentId));
      if (nameToDelete && !deletedList.includes(nameToDelete.toLowerCase())) deletedList.push(nameToDelete.toLowerCase());
      localStorage.setItem('edukids_deleted_students', JSON.stringify(deletedList));

      // Also filter out any local submissions from this deleted student
      try {
        let subs = JSON.parse(localStorage.getItem('edukids_submissions') || '[]');
        subs = subs.filter(sub => {
          const subName = sub.student_name || sub.user_name || '';
          return String(sub.user_id) !== String(studentId) && (!nameToDelete || subName.toLowerCase() !== nameToDelete.toLowerCase());
        });
        localStorage.setItem('edukids_submissions', JSON.stringify(subs));
      } catch (e) {}

      // Async Cloud sync delete
      this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete_student', deleteStudentId: studentId, studentName: nameToDelete })
      }).catch(() => {});

      return { success: true, students: stored };
    } catch (e) {
      return { success: false };
    }
  }

  // Teacher Dashboard - Calculated with 100% REAL student submissions & classes
  async getTeacherDashboard() {
    const res = await this.request('/teachers/dashboard');
    if (res.success && res.classAnalytics && res.classAnalytics.length > 0) return res;

    const allSubmissions = this.getRealSubmissions();
    const students = this.getRealStudents();

    let customClasses = [];
    try {
      customClasses = JSON.parse(localStorage.getItem('edukids_custom_classes') || '[]');
    } catch (e) {}

    const gradesSet = new Set([2]);
    students.forEach(st => gradesSet.add(st.grade_level || 2));
    customClasses.forEach(cls => gradesSet.add(parseInt(cls.grade_level || 2, 10)));

    const teacherExs = this.getTeacherExercises();
    if (teacherExs.success && teacherExs.exercises) {
      teacherExs.exercises.forEach(ex => gradesSet.add(ex.grade_level || 2));
    }

    const classAnalytics = [];

    if (customClasses.length > 0) {
      customClasses.forEach(cls => {
        const targetCode = (cls.class_code || `${cls.className}-8429`).toUpperCase();
        const classStudents = students.filter(st => {
          const stCode = (st.class_code || '').toUpperCase();
          return (
            (stCode && stCode === targetCode) ||
            st.class_id === cls.id ||
            st.class_id === cls.className ||
            st.class_name === cls.className ||
            (st.grade_level === parseInt(cls.grade_level, 10) && (!st.class_code || st.class_code === targetCode))
          );
        });

        const studentSummary = classStudents.map(st => {
          const stName = (st.full_name || st.student_name || '').toLowerCase();
          const stUser = (st.username || '').toLowerCase();
          const stId = String(st.id);

          const userSubs = allSubmissions.filter(s => {
            const subName = (s.student_name || s.user_name || '').toLowerCase();
            const subId = String(s.user_id);
            return (
              (subId && subId === stId) ||
              (stName && subName === stName) ||
              (stUser && subName === stUser) ||
              (stUser === 'toan2004' && (subName === 'toan2004' || subName === 'trịnh văn toàn' || subName === 'andrew'))
            );
          });

          let avg = null;
          let totalXpEarned = 0;
          if (userSubs.length > 0) {
            const total = userSubs.reduce((acc, c) => acc + (c.score10 !== undefined ? c.score10 : (c.score || 0)), 0);
            avg = (total / userSubs.length).toFixed(1);
            totalXpEarned = userSubs.reduce((acc, c) => acc + (c.xpEarned || c.earnedXp || 30), 0);
          }

          const finalXp = Math.max(st.xp || 0, totalXpEarned, userSubs.length > 0 ? 75 : 50);

          return {
            ...st,
            xp: finalXp,
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

        const classSubmissions = allSubmissions.filter(s =>
          classStudents.some(st => String(st.id) === String(s.user_id) || st.full_name === s.user_name || st.full_name === s.student_name || st.username === s.user_name) ||
          s.grade_level === parseInt(cls.grade_level, 10)
        );

        classAnalytics.push({
          classId: cls.id || 1,
          className: cls.className || `${cls.grade_level}A1`,
          class_code: cls.class_code || `${cls.className}-8429`,
          gradeLevel: parseInt(cls.grade_level || 2, 10),
          schoolYear: '2025-2026',
          stats: {
            totalStudents: classStudents.length,
            totalSubmissionsCount: classSubmissions.length,
            classAverageScore: classAvg,
            strugglingStudents: studentSummary.filter(s => s.isStruggling),
            studentSummary
          }
        });
      });
    } else {
      Array.from(gradesSet).sort().forEach(g => {
        const classStudents = students.filter(st => st.grade_level === g);

        const studentSummary = classStudents.map(st => {
          const stName = (st.full_name || st.student_name || '').toLowerCase();
          const stUser = (st.username || '').toLowerCase();
          const stId = String(st.id);

          const userSubs = allSubmissions.filter(s => {
            const subName = (s.student_name || s.user_name || '').toLowerCase();
            const subId = String(s.user_id);
            return (
              (subId && subId === stId) ||
              (stName && subName === stName) ||
              (stUser && subName === stUser) ||
              (stUser === 'toan2004' && (subName === 'toan2004' || subName === 'trịnh văn toàn' || subName === 'andrew'))
            );
          });

          let avg = null;
          let totalXpEarned = 0;
          if (userSubs.length > 0) {
            const total = userSubs.reduce((acc, c) => acc + (c.score10 !== undefined ? c.score10 : (c.score || 0)), 0);
            avg = (total / userSubs.length).toFixed(1);
            totalXpEarned = userSubs.reduce((acc, c) => acc + (c.xpEarned || c.earnedXp || 30), 0);
          }

          const finalXp = Math.max(st.xp || 0, totalXpEarned, userSubs.length > 0 ? 75 : 50);

          return {
            ...st,
            xp: finalXp,
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

        const classSubmissions = allSubmissions.filter(s => s.grade_level === g);

        classAnalytics.push({
          classId: g,
          className: `${g}A1`,
          gradeLevel: g,
          schoolYear: '2025-2026',
          stats: {
            totalStudents: classStudents.length,
            totalSubmissionsCount: classSubmissions.length,
            classAverageScore: classAvg,
            strugglingStudents: studentSummary.filter(s => s.isStruggling),
            studentSummary
          }
        });
      });
    }

    return {
      success: true,
      teacher: { id: 10, full_name: 'Cô Hoàng Mai', role: 'teacher', avatar: 'mascot-panda' },
      classAnalytics
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
    SYSTEM_DELETED_EXERCISES.forEach(id => deletedSet.add(id));

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
    if (id === 'mistake_review' || id === 'mistakes') {
      const curUser = JSON.parse(localStorage.getItem('edukids_v2_user') || localStorage.getItem('edukids_user') || '{}');
      const mistakes = this.getStudentMistakes(curUser).filter(m => !m.resolved);

      if (mistakes.length === 0) {
        return {
          success: true,
          exercise: {
            id: 'mistake_review',
            title: '🎯 Ôn Luyện Lỗi Sai: Sai Ở Đâu - Học Lại Ở Đó',
            grade_level: curUser.grade_level || 1,
            questions: (curriculumDatabase.exercises[101] || STANDARD_EXERCISES[101]).questions
          }
        };
      }

      const questions = mistakes.map((m, idx) => ({
        id: m.question_id || (idx + 1),
        question_type: m.question_type || 'multiple_choice',
        question_text: m.question_text || m.questionText,
        image_url: m.image_url || m.imageUrl,
        options: m.options || [
          { option_label: 'A', answer_text: m.correct_answer || 'Đáp án A' },
          { option_label: 'B', answer_text: 'Phương án lựa chọn B' },
          { option_label: 'C', answer_text: 'Phương án lựa chọn C' },
          { option_label: 'D', answer_text: 'Phương án lựa chọn D' }
        ],
        correct_answer: m.correct_answer || m.correctAnswer || 'A',
        explanation: m.explanation || m.pedagogicalExplanation || 'Hãy đối chiếu lại phương pháp giải của cô giáo nhé!',
        hint: m.hint || 'Đọc kỹ đề bài và suy nghĩ trước khi chọn đáp án.'
      }));

      return {
        success: true,
        exercise: {
          id: 'mistake_review',
          title: `🎯 Ôn Luyện ${questions.length} Câu Sai – Sổ Tay Lỗi Sai EduKids`,
          grade_level: curUser.grade_level || 1,
          subject_id: 1,
          is_mistake_review: true,
          questions
        }
      };
    }

    const res = await this.request(`/exercises/${id}`);
    if (res.success && res.exercise) return res;

    // Look up by ID with safe fallback
    const numericId = parseInt(id, 10);
    const ex = curriculumDatabase.exercises[numericId] || STANDARD_EXERCISES[numericId] || curriculumDatabase.exercises[101] || STANDARD_EXERCISES[101];
    return { success: true, exercise: ex };
  }

  // Mistake Notebook: "Sai ở đâu – Học lại ở đó" API
  getStudentMistakes(userContext) {
    try {
      const stored = JSON.parse(localStorage.getItem('edukids_mistakes') || '[]');
      if (!Array.isArray(stored)) return [];
      const curName = (userContext?.full_name || userContext?.username || '').toLowerCase();
      const curId = String(userContext?.id || '');

      return stored.filter(m => {
        if (!userContext || !userContext.full_name) return true;
        const mName = (m.student_name || m.user_name || '').toLowerCase();
        const mId = String(m.user_id || '');
        return mId === curId || mName === curName || !m.user_name;
      });
    } catch (e) {
      return [];
    }
  }

  saveStudentMistake(item, userContext, exerciseObj) {
    try {
      const stored = JSON.parse(localStorage.getItem('edukids_mistakes') || '[]');
      const qText = (item.questionText || item.question_text || '').trim();
      if (!qText) return;

      const curName = userContext?.full_name || 'Học sinh';
      const curId = userContext?.id || 1;

      // Check if already exists in active mistakes
      const existingIdx = stored.findIndex(m => 
        (m.question_text || '').trim() === qText &&
        (String(m.user_id) === String(curId) || (m.student_name || '').toLowerCase() === curName.toLowerCase())
      );

      const mistakeRecord = {
        id: existingIdx >= 0 ? stored[existingIdx].id : `mistake_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        user_id: curId,
        user_name: curName,
        student_name: curName,
        exercise_id: exerciseObj?.id,
        exercise_title: exerciseObj?.title || 'Bài luyện tập',
        question_id: item.questionId || item.id,
        question_type: item.questionType || item.question_type || 'multiple_choice',
        question_text: qText,
        image_url: item.imageUrl || item.image_url,
        options: item.options,
        matching_data: item.matching_data,
        student_answer: item.studentAnswer || item.userAnswer || 'Chưa chọn',
        correct_answer: item.correctAnswer || item.correct_answer,
        explanation: item.pedagogicalExplanation || item.explanation,
        hint: item.hint,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      if (existingIdx >= 0) {
        stored[existingIdx] = { ...stored[existingIdx], ...mistakeRecord, resolved: false };
      } else {
        stored.unshift(mistakeRecord);
      }

      localStorage.setItem('edukids_mistakes', JSON.stringify(stored));
    } catch (e) {}
  }

  resolveStudentMistake(mistakeId, userContext) {
    try {
      const stored = JSON.parse(localStorage.getItem('edukids_mistakes') || '[]');
      const updated = stored.map(m => m.id === mistakeId ? { ...m, resolved: true, resolvedAt: new Date().toISOString() } : m);
      localStorage.setItem('edukids_mistakes', JSON.stringify(updated));
    } catch (e) {}
  }

  resolveStudentMistakeByQuestionText(qText, userContext) {
    try {
      if (!qText) return;
      const clean = qText.trim();
      const stored = JSON.parse(localStorage.getItem('edukids_mistakes') || '[]');
      const updated = stored.map(m => (m.question_text || '').trim() === clean ? { ...m, resolved: true, resolvedAt: new Date().toISOString() } : m);
      localStorage.setItem('edukids_mistakes', JSON.stringify(updated));
    } catch (e) {}
  }

  clearResolvedMistakes(userContext) {
    try {
      const stored = JSON.parse(localStorage.getItem('edukids_mistakes') || '[]');
      const remaining = stored.filter(m => !m.resolved);
      localStorage.setItem('edukids_mistakes', JSON.stringify(remaining));
    } catch (e) {}
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

  async deleteExercise(id) {
    const numericId = parseInt(id, 10);
    delete curriculumDatabase.exercises[numericId];

    // Remove from lessons matrix
    for (const g of Object.keys(curriculumDatabase.lessonsByGradeAndSubject)) {
      for (const s of Object.keys(curriculumDatabase.lessonsByGradeAndSubject[g])) {
        curriculumDatabase.lessonsByGradeAndSubject[g][s] = curriculumDatabase.lessonsByGradeAndSubject[g][s].filter(
          l => parseInt(l.exercise_id, 10) !== numericId
        );
      }
    }

    try {
      // 1. Remove from custom exercises if present
      let stored = JSON.parse(localStorage.getItem('edukids_custom_exercises') || '[]');
      stored = stored.filter(ex => parseInt(ex.id, 10) !== numericId);
      localStorage.setItem('edukids_custom_exercises', JSON.stringify(stored));

      // 2. Add to deleted exercises blacklist so it NEVER comes back on F5 reload or sync!
      let deletedList = JSON.parse(localStorage.getItem('edukids_deleted_exercises') || '[]');
      if (!deletedList.includes(numericId)) {
        deletedList.push(numericId);
      }
      localStorage.setItem('edukids_deleted_exercises', JSON.stringify(deletedList));

      // Async Cloud sync delete on Cloud MySQL
      await this.request('/sync', {
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
      } else if (qType === 'multiple_select') {
        // Helper to extract option letters ['A', 'C', 'D']
        const extractOptionLetters = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) {
            return val.map(v => String(v).trim().toUpperCase()).filter(Boolean);
          }
          const str = String(val).toUpperCase();
          const matches = str.match(/[A-D]/g);
          if (matches && matches.length > 0) {
            return Array.from(new Set(matches));
          }
          return str.split(/[,;+\s]+/).map(s => s.trim()).filter(Boolean);
        };

        const correctLetters = extractOptionLetters(q.correct_answer);
        const studentLetters = extractOptionLetters(studentAns);

        const correctSet = new Set(correctLetters);
        const studentSet = new Set(studentLetters);

        // Strict Check: Student must choose ALL correct answers and NO extra/wrong answers
        isCorrect = (
          studentSet.size === correctSet.size &&
          studentSet.size > 0 &&
          [...studentSet].every(item => correctSet.has(item))
        );

        if (studentSet.size > 0) {
          const sortedStudent = [...studentSet].sort();
          formattedStudentAns = sortedStudent.map(lbl => {
            const opt = (q.options || []).find(o => (o.option_label || '').toUpperCase() === lbl);
            return opt ? `${lbl}. ${opt.answer_text}` : lbl;
          }).join(' | ');
        } else {
          formattedStudentAns = 'Chưa chọn đáp án';
        }

        const sortedCorrect = [...correctSet].sort();
        formattedCorrectAns = sortedCorrect.map(lbl => {
          const opt = (q.options || []).find(o => (o.option_label || '').toUpperCase() === lbl);
          return opt ? `${lbl}. ${opt.answer_text}` : lbl;
        }).join(' | ');
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
      const userStored = JSON.parse(localStorage.getItem('edukids_v2_user') || localStorage.getItem('edukids_user') || '{}');
      const newSubmission = {
        id: Date.now(),
        exercise_id: parseInt(exerciseId, 10) || (exerciseId === 'mistake_review' ? 'mistake_review' : 101),
        exercise_title: ex?.title || 'Bài tập',
        user_id: userStored.id || 1,
        user_name: userStored.full_name || 'Học sinh',
        student_name: userStored.full_name || 'Học sinh',
        user_avatar: userStored.avatar || 'mascot-bear',
        student_avatar: userStored.avatar || 'mascot-bear',
        grade_level: userStored.grade_level || 2,
        class_code: userStored.class_code || '',
        class_name: userStored.class_name || (userStored.class_code ? userStored.class_code.split('-')[0] : ''),
        score10,
        score: totalScore,
        totalQuestions: totalQ,
        correctCount: detailedFeedback.filter(f => f.isCorrect).length,
        wrongCount: detailedFeedback.filter(f => !f.isCorrect).length,
        percentage: scorePercentage,
        xpEarned: earnedXp || 30,
        timeTakenSeconds: timeTakenSeconds || 30,
        submittedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' Hôm nay',
        questions: detailedFeedback,
        questionBreakdown: detailedFeedback,
        feedback: detailedFeedback
      };

      const currentSubs = JSON.parse(localStorage.getItem('edukids_submissions') || '[]');
      currentSubs.unshift(newSubmission);
      localStorage.setItem('edukids_submissions', JSON.stringify(currentSubs));

      // Update Mistake Notebook: "Sai ở đâu - Học lại ở đó"
      detailedFeedback.forEach(item => {
        if (!item.isCorrect) {
          this.saveStudentMistake(item, userStored, ex);
        } else {
          this.resolveStudentMistakeByQuestionText(item.questionText, userStored);
        }
      });

      // Update student's cumulative XP and sync to Cloud MySQL
      if (userStored && userStored.full_name) {
        const newCumulativeXp = (userStored.xp || 50) + (earnedXp || 30);
        const updatedUser = { ...userStored, xp: newCumulativeXp };
        localStorage.setItem('edukids_v2_user', JSON.stringify(updatedUser));
        localStorage.setItem('edukids_user', JSON.stringify(updatedUser));

        // Update custom students
        try {
          let customSt = JSON.parse(localStorage.getItem('edukids_custom_students') || '[]');
          customSt = customSt.map(s => (s.full_name === updatedUser.full_name || String(s.id) === String(updatedUser.id) ? { ...s, xp: newCumulativeXp } : s));
          localStorage.setItem('edukids_custom_students', JSON.stringify(customSt));
        } catch (e) {}

        // Async Cloud sync updated student and submission to Aiven MySQL
        this.request('/sync', {
          method: 'POST',
          body: JSON.stringify({ action: 'save_student', student: updatedUser })
        }).catch(() => {});
      }

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

    const realStudents = this.getRealStudents();
    const sorted = [...realStudents].sort((a, b) => (b.xp || 0) - (a.xp || 0));
    return {
      success: true,
      leaderboard: sorted
    };
  }
}

export const api = new ApiService();
