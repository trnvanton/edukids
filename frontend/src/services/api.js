// Client API Service with Complete Multi-Grade Curriculum & Intelligent Fallback
import { generate100QuestionsPool } from './randomPoolService';

const API_BASE = '/api';

// Full 5-Grade x 4-Subject Curriculum Dataset
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
    // === LỚP 1 ===
    1: {
      1: [ // Toan 1
        { id: 11, subject_id: 1, grade_level: 1, title: 'Làm Quen Với Các Số Từ 0 Đến 10', topic_tag: 'so-hoc-1', description: 'Nhận biết, đọc, viết và đếm các đồ vật từ 0 đến 10', icon: '🔢', exercise_id: 1011 },
        { id: 12, subject_id: 1, grade_level: 1, title: 'Phép Cộng Trong Phạm Vi 10', topic_tag: 'phep-cong-1', description: 'Bé tập gộp các đồ vật và tính nhẩm phép cộng nhanh', icon: '➕', exercise_id: 1012 },
        { id: 13, subject_id: 1, grade_level: 1, title: 'Hình Vuông, Hình Tròn, Hình Tam Giác', topic_tag: 'hinh-hoc-1', description: 'Nhận diện các hình khối phẳng cơ bản xung quanh bé', icon: '🔺', exercise_id: 1013 }
      ],
      2: [ // Tieng Viet 1
        { id: 14, subject_id: 2, grade_level: 1, title: 'Bảng Chữ Cái A, Ă, Â & B, C, D', topic_tag: 'chu-cai-1', description: 'Nhận diện mặt chữ cái tiếng Việt và cách phát âm chuẩn', icon: '🔤', exercise_id: 1014 },
        { id: 15, subject_id: 2, grade_level: 1, title: 'Ghép Vần & Dấu Thanh (Huyền, Sắc, Hỏi, Ngã, Nặng)', topic_tag: 'dau-thanh-1', description: 'Tập đánh vần các tiếng đơn giản và đặt dấu thanh đúng vị trí', icon: '✍️', exercise_id: 1015 }
      ],
      3: [ // Khoa Hoc 1
        { id: 16, subject_id: 3, grade_level: 1, title: 'Cơ Thể Em & Các Giác Quan', topic_tag: 'co-the-1', description: 'Mắt, mũi, tai, lưỡi, tay và cách giữ gìn vệ sinh cơ thể', icon: '👀', exercise_id: 1016 },
        { id: 17, subject_id: 3, grade_level: 1, title: 'Các Con Vật Nuôi Thân Thuộc Quanh Bé', topic_tag: 'vat-nuoi-1', description: 'Tìm hiểu về chó, mèo, gà, vịt và thức ăn của chúng', icon: '🐶', exercise_id: 1017 }
      ],
      4: [ // Tieng Anh 1
        { id: 18, subject_id: 4, grade_level: 1, title: 'English Alphabet: Letters A, B, C, D', topic_tag: 'english-alphabet-1', description: 'Learn letter names, sounds and simple words (Apple, Ball, Cat, Dog)', icon: '🅰️', exercise_id: 1018 },
        { id: 19, subject_id: 4, grade_level: 1, title: 'Colors & Numbers (1 to 10)', topic_tag: 'english-colors-1', description: 'Red, Blue, Yellow, Green & Counting fingers', icon: '🎨', exercise_id: 1019 }
      ]
    },

    // === LỚP 2 ===
    2: {
      1: [ // Toan 2
        { id: 21, subject_id: 1, grade_level: 2, title: 'Bảng Nhân 2 Và Bảng Nhân 5', topic_tag: 'bang-nhan-2', description: 'Học thuộc bảng cửu chương nhân 2 và 5 ứng dụng thực tế', icon: '✖️', exercise_id: 1021 },
        { id: 22, subject_id: 1, grade_level: 2, title: 'Phép Cộng, Phép Trừ Có Nhớ Trong Phạm Vi 100', topic_tag: 'cong-tru-nho-2', description: 'Đặt tính rồi tính phép cộng trừ có nhớ chính xác', icon: '🧮', exercise_id: 1022 },
        { id: 23, subject_id: 1, grade_level: 2, title: 'Đo Độ Dài: Xăng-ti-mét (cm) & Đề-xi-mét (dm)', topic_tag: 'do-luong-2', description: 'Cách dùng thước kẻ đo độ dài đoạn thẳng và chuyển đổi đơn vị', icon: '📏', exercise_id: 1023 }
      ],
      2: [ // Tieng Viet 2
        { id: 24, subject_id: 2, grade_level: 2, title: 'Từ Chỉ Sự Vật, Hoạt Động & Trạng Thái', topic_tag: 'tu-su-vat-2', description: 'Nhận biết từ ngữ chỉ người, đồ vật, con vật và hành động', icon: '📖', exercise_id: 1024 },
        { id: 25, subject_id: 2, grade_level: 2, title: 'Dấu Chấm, Dấu Chấm Hỏi & Dấu Chấm Than', topic_tag: 'dau-cau-2', description: 'Quy tắc đặt dấu câu cuối câu kể, câu hỏi và câu cảm', icon: '❓', exercise_id: 1025 }
      ],
      3: [ // Khoa Hoc 2
        { id: 26, subject_id: 3, grade_level: 2, title: 'Các Loài Cây & Môi Trường Sống Của Thực Vật', topic_tag: 'thuc-vat-2', description: 'Cây sống trên cạn, dưới nước và lợi ích của cây xanh', icon: '🌳', exercise_id: 1026 },
        { id: 27, subject_id: 3, grade_level: 2, title: 'Thói Quen Giữ Vệ Sinh Cá Nhân & Chăm Sóc Răng Miệng', topic_tag: 've-sinh-2', description: 'Đánh răng đúng cách, rửa tay xà phòng và phòng ngừa sâu răng', icon: '🦷', exercise_id: 1027 }
      ],
      4: [ // Tieng Anh 2
        { id: 28, subject_id: 4, grade_level: 2, title: 'Animals & Pets (Dog, Cat, Duck, Elephant)', topic_tag: 'english-animals-2', description: 'Identify common animals and say "It is a big elephant!"', icon: '🦁', exercise_id: 1028 },
        { id: 29, subject_id: 4, grade_level: 2, title: 'My Family & Feelings (Happy, Sad, Hungry)', topic_tag: 'english-family-2', description: 'Talk about father, mother, sister & express emotions in English', icon: '👨‍👩‍👧', exercise_id: 1029 }
      ]
    },

    // === LỚP 3 ===
    3: {
      1: [ // Toan 3
        { id: 31, subject_id: 1, grade_level: 3, title: 'Bảng Cửu Chương Nhân & Chia (6, 7, 8, 9)', topic_tag: 'cuu-chuong-3', description: 'Thành thạo toàn bộ bảng cửu chương và tính nhẩm phép chia', icon: '✖️', exercise_id: 1031 },
        { id: 32, subject_id: 1, grade_level: 3, title: 'Chu Vi Hình Chữ Nhật & Chu Vi Hình Vuông', topic_tag: 'chu-vi-3', description: 'Công thức tính chu vi và giải bài toán có lời văn', icon: '📐', exercise_id: 1032 }
      ],
      2: [ // Tieng Viet 3
        { id: 33, subject_id: 2, grade_level: 3, title: 'Biện Pháp Tu Từ: Nghệ Thuật So Sánh', topic_tag: 'so-sanh-3', description: 'Nhận biết từ so sánh (như, là, tựa như) và hình ảnh so sánh', icon: '⭐', exercise_id: 1033 },
        { id: 34, subject_id: 2, grade_level: 3, title: 'Biện Pháp Tu Từ: Nhân Hóa Sinh Động', topic_tag: 'nhan-hoa-3', description: 'Gọi và tả sự vật như con người làm câu văn thêm sinh động', icon: '🌸', exercise_id: 1034 }
      ],
      3: [ // Khoa Hoc 3
        { id: 35, subject_id: 3, grade_level: 3, title: 'Cơ Quan Hô Hấp & Tuần Hoàn Của Con Người', topic_tag: 'co-quan-3', description: 'Phổi, tim, mạch máu và cách tập thể dục bảo vệ sức khỏe', icon: '🫀', exercise_id: 1035 }
      ],
      4: [ // Tieng Anh 3
        { id: 36, subject_id: 4, grade_level: 3, title: 'My School Things & Classroom Activities', topic_tag: 'english-school-3', description: 'Pen, notebook, eraser & "What do you have in your school bag?"', icon: '🎒', exercise_id: 1036 },
        { id: 37, subject_id: 4, grade_level: 3, title: 'Days of the Week & Favorite Hobbies', topic_tag: 'english-days-3', description: 'Monday to Sunday, swimming, reading books & playing chess', icon: '📅', exercise_id: 1037 }
      ]
    },

    // === LỚP 4 ===
    4: {
      1: [ // Toan 4
        { id: 41, subject_id: 1, grade_level: 4, title: 'Phân Số, Rút Gọn & Quy Đồng Mẫu Số', topic_tag: 'phan-so-4', description: 'Khái niệm tử số mẫu số, phân số tối giản và phép tính phân số', icon: '🍰', exercise_id: 101 },
        { id: 42, subject_id: 1, grade_level: 4, title: 'Hình Bình Hành, Hình Thoi & Diện Tích', topic_tag: 'hinh-hoc-4', description: 'Đặc điểm cạnh đối diện song song, tính diện tích hình học', icon: '📐', exercise_id: 102 }
      ],
      2: [ // Tieng Viet 4
        { id: 43, subject_id: 2, grade_level: 4, title: 'Luyện Từ Và Câu: Danh Từ, Động Từ, Tính Từ', topic_tag: 'tu-loai-4', description: 'Phân loại các từ loại trong câu và mở rộng vốn từ', icon: '✍️', exercise_id: 103 },
        { id: 44, subject_id: 2, grade_level: 4, title: 'Câu Kể: Ai Làm Gì? & Ai Thế Nào?', topic_tag: 'cau-ke-4', description: 'Xác định chủ ngữ vị ngữ trong các kiểu câu kể', icon: '📖', exercise_id: 1044 }
      ],
      3: [ // Khoa Hoc 4
        { id: 45, subject_id: 3, grade_level: 4, title: 'Vai Trò Của Nước & Không Khí Trong Đời Sống', topic_tag: 'nuoc-khong-khi-4', description: 'Vòng tuần hoàn của nước, thành phần không khí và bảo vệ môi trường', icon: '💧', exercise_id: 1045 }
      ],
      4: [ // Tieng Anh 4
        { id: 46, subject_id: 4, grade_level: 4, title: 'Daily Routine: What time do you get up?', topic_tag: 'english-routine-4', description: 'Telling the time, morning routine & daily habits in English', icon: '⏰', exercise_id: 1046 },
        { id: 47, subject_id: 4, grade_level: 4, title: 'Food & Drinks: What would you like to eat?', topic_tag: 'english-food-4', description: 'Noodles, bread, orange juice & polite ordering phrases', icon: '🍔', exercise_id: 1047 }
      ]
    },

    // === LỚP 5 ===
    5: {
      1: [ // Toan 5
        { id: 51, subject_id: 1, grade_level: 5, title: 'Số Thập Phân & Các Phép Tính Số Thập Phân', topic_tag: 'thap-phan-5', description: 'Hàng của số thập phân, cộng trừ nhân chia số thập phân', icon: '🔢', exercise_id: 1051 },
        { id: 52, subject_id: 1, grade_level: 5, title: 'Tỉ Số Phần Trăm (%) & Bài Toán Ứng Dụng', topic_tag: 'ti-so-phan-tram-5', description: 'Tìm tỉ số phần trăm của hai số, tính tiền lãi và giảm giá', icon: '📊', exercise_id: 1052 },
        { id: 53, subject_id: 1, grade_level: 5, title: 'Diện Tích Hình Tam Giác & Hình Thang', topic_tag: 'dien-tich-5', description: 'Công thức tính diện tích hình phẳng ôn thi chuyển cấp', icon: '📐', exercise_id: 1053 }
      ],
      2: [ // Tieng Viet 5
        { id: 54, subject_id: 2, grade_level: 5, title: 'Đại Từ & Quan Hệ Từ Trong Tiếng Việt', topic_tag: 'dai-tu-5', description: 'Cách dùng quan hệ từ nối các vế câu (vì... nên, tuy... nhưng)', icon: '🔗', exercise_id: 1054 },
        { id: 55, subject_id: 2, grade_level: 5, title: 'Câu Ghép & Các Cách Nối Vế Câu Ghép', topic_tag: 'cau-ghep-5', description: 'Phân tích cấu tạo ngữ pháp câu ghép nâng cao', icon: '📝', exercise_id: 1055 }
      ],
      3: [ // Khoa Hoc 5
        { id: 56, subject_id: 3, grade_level: 5, title: 'Sự Biến Đổi Hóa Học & Năng Lượng Điện', topic_tag: 'nang-luong-5', description: 'Nguồn điện, mạch điện kín và sử dụng điện an toàn, tiết kiệm', icon: '⚡', exercise_id: 1056 }
      ],
      4: [ // Tieng Anh 5
        { id: 57, subject_id: 4, grade_level: 5, title: 'Jobs & Occupations: What would you like to be?', topic_tag: 'english-jobs-5', description: 'Doctor, engineer, pilot, teacher & future dream jobs', icon: '🧑‍⚕️', exercise_id: 1057 },
        { id: 58, subject_id: 4, grade_level: 5, title: 'Past Simple Tense: Where were you yesterday?', topic_tag: 'english-past-5', description: 'Regular and irregular verbs in simple past tense (went, saw, played)', icon: '⏳', exercise_id: 1058 }
      ]
    }
  },

  // Comprehensive Question Bank per Exercise ID
  exercises: {
    // Grade 1 - Toan (1011)
    1011: {
      id: 1011,
      title: 'Làm Quen Với Các Số Từ 0 Đến 10 (Toán 1)',
      difficulty: 'practice',
      time_limit_minutes: 10,
      reward_xp: 30,
      subject_name: 'Toán Học',
      questions: [
        {
          id: 1,
          index: 1,
          question_text: 'Bé hãy đếm xem có bao nhiêu ngôi sao: ⭐ ⭐ ⭐ ⭐ ⭐',
          points: 10,
          hint: 'Bé đếm từng ngôi sao từ trái sang phải nhé: 1, 2, 3, 4, 5.',
          topic_tag: 'so-hoc-1',
          options: [
            { option_label: 'A', answer_text: '3 ngôi sao' },
            { option_label: 'B', answer_text: '4 ngôi sao' },
            { option_label: 'C', answer_text: '5 ngôi sao' },
            { option_label: 'D', answer_text: '6 ngôi sao' }
          ]
        },
        {
          id: 2,
          index: 2,
          question_text: 'Số liền sau của số 7 là số nào?',
          points: 10,
          hint: 'Số liền sau lớn hơn số đã cho 1 đơn vị: 7 + 1 = ?',
          topic_tag: 'so-hoc-1',
          options: [
            { option_label: 'A', answer_text: '6' },
            { option_label: 'B', answer_text: '8' },
            { option_label: 'C', answer_text: '9' },
            { option_label: 'D', answer_text: '10' }
          ]
        }
      ]
    },

    // Grade 2 - Toan (1021)
    1021: {
      id: 1021,
      title: 'Bảng Nhân 2 Và Bảng Nhân 5 (Toán 2)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 40,
      subject_name: 'Toán Học',
      questions: [
        {
          id: 21,
          index: 1,
          question_text: 'Kết quả của phép tính: 5 x 6 = ?',
          points: 10,
          hint: 'Trong bảng nhân 5: 5 x 5 = 25, vậy 5 x 6 = 25 + 5 = 30.',
          topic_tag: 'bang-nhan-2',
          options: [
            { option_label: 'A', answer_text: '25' },
            { option_label: 'B', answer_text: '30' },
            { option_label: 'C', answer_text: '35' },
            { option_label: 'D', answer_text: '40' }
          ]
        },
        {
          id: 22,
          index: 2,
          question_text: 'Mỗi con gà có 2 cái chân. Hỏi 7 con gà có tất cả bao nhiêu cái chân?',
          points: 10,
          hint: 'Bé lấy số chân của 1 con gà nhân với số con gà: 2 x 7 = 14.',
          topic_tag: 'bang-nhan-2',
          options: [
            { option_label: 'A', answer_text: '12 cái chân' },
            { option_label: 'B', answer_text: '14 cái chân' },
            { option_label: 'C', answer_text: '16 cái chân' },
            { option_label: 'D', answer_text: '18 cái chân' }
          ]
        }
      ]
    },

    // Grade 2 - Tieng Viet (1024)
    1024: {
      id: 1024,
      title: 'Từ Chỉ Sự Vật, Hoạt Động & Trạng Thái (Tiếng Việt 2)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 40,
      subject_name: 'Tiếng Việt',
      questions: [
        {
          id: 24,
          index: 1,
          question_text: 'Từ nào dưới đây là từ chỉ hoạt động của học sinh?',
          points: 10,
          hint: 'Từ chỉ hoạt động là từ nói về việc làm, cử động (ví dụ: chạy, viết, đọc...).',
          topic_tag: 'tu-su-vat-2',
          options: [
            { option_label: 'A', answer_text: 'Bàn học' },
            { option_label: 'B', answer_text: 'Quyển vở' },
            { option_label: 'C', answer_text: 'Đọc sách' },
            { option_label: 'D', answer_text: 'Bút mực' }
          ]
        },
        {
          id: 242,
          index: 2,
          question_text: 'Từ nào dưới đây là từ chỉ sự vật xung quanh em?',
          points: 10,
          hint: 'Từ chỉ sự vật là từ chỉ người, đồ vật, con vật, cây cối.',
          topic_tag: 'tu-su-vat-2',
          options: [
            { option_label: 'A', answer_text: 'Cây bàng 🌳' },
            { option_label: 'B', answer_text: 'Chăm chỉ' },
            { option_label: 'C', answer_text: 'Nhanh nhẹn' },
            { option_label: 'D', answer_text: 'Chạy nhanh' }
          ]
        }
      ]
    },

    // Grade 2 - Tieng Viet (1025)
    1025: {
      id: 1025,
      title: 'Dấu Chấm, Dấu Chấm Hỏi & Dấu Chấm Than (Tiếng Việt 2)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 40,
      subject_name: 'Tiếng Việt',
      questions: [
        {
          id: 251,
          index: 1,
          question_text: 'Cuối câu hỏi "Hôm nay bạn có đi học không" cần điền dấu câu nào?',
          points: 10,
          hint: 'Đây là câu dùng để hỏi người khác, cuối câu cần dùng dấu chấm hỏi (?).',
          topic_tag: 'dau-cau-2',
          options: [
            { option_label: 'A', answer_text: 'Dấu chấm hỏi (?)' },
            { option_label: 'B', answer_text: 'Dấu chấm (.)' },
            { option_label: 'C', answer_text: 'Dấu phẩy (,)' },
            { option_label: 'D', answer_text: 'Dấu chấm than (!)' }
          ]
        },
        {
          id: 252,
          index: 2,
          question_text: 'Câu nào dưới đây là câu bộc lộ cảm xúc, cần đặt dấu chấm than (!) ở cuối câu?',
          points: 10,
          hint: 'Câu cảm thường có từ: Ôi, chao ôi, đẹp quá, thích quá...',
          topic_tag: 'dau-cau-2',
          options: [
            { option_label: 'A', answer_text: 'Bông hoa hồng này đẹp quá!' },
            { option_label: 'B', answer_text: 'Em là học sinh lớp 2.' },
            { option_label: 'C', answer_text: 'Bé mấy tuổi rồi?' },
            { option_label: 'D', answer_text: 'Mẹ đang nấu cơm trong bếp.' }
          ]
        }
      ]
    },

    // Grade 2 - Tieng Anh (1028)
    1028: {
      id: 1028,
      title: 'Animals & Pets in English (Tiếng Anh 2)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 40,
      subject_name: 'Tiếng Anh',
      questions: [
        {
          id: 281,
          index: 1,
          question_text: 'Which animal says "Woof woof" and guards the house?',
          points: 10,
          hint: 'It is man\'s best friend: Dog, Cat or Bird?',
          topic_tag: 'english-animals-2',
          options: [
            { option_label: 'A', answer_text: 'A Dog 🐶' },
            { option_label: 'B', answer_text: 'A Cat 🐱' },
            { option_label: 'C', answer_text: 'A Duck 🦆' },
            { option_label: 'D', answer_text: 'A Fish 🐟' }
          ]
        },
        {
          id: 282,
          index: 2,
          question_text: 'Complete the sentence: "The elephant is very _______."',
          points: 10,
          hint: 'Con voi có kích thước to lớn: Big hay Small?',
          topic_tag: 'english-animals-2',
          options: [
            { option_label: 'A', answer_text: 'small' },
            { option_label: 'B', answer_text: 'big' },
            { option_label: 'C', answer_text: 'short' },
            { option_label: 'D', answer_text: 'tiny' }
          ]
        }
      ]
    },

    // Grade 3 - Toan (1031)
    1031: {
      id: 1031,
      title: 'Bảng Cửu Chương Nhân & Chia (Toán 3)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 45,
      subject_name: 'Toán Học',
      questions: [
        {
          id: 31,
          index: 1,
          question_text: 'Tính nhẩm: 7 x 8 = ?',
          points: 10,
          hint: 'Trong bảng nhân 7: 7 x 8 = 56.',
          topic_tag: 'cuu-chuong-3',
          options: [
            { option_label: 'A', answer_text: '54' },
            { option_label: 'B', answer_text: '56' },
            { option_label: 'C', answer_text: '63' },
            { option_label: 'D', answer_text: '64' }
          ]
        }
      ]
    },

    // Grade 3 - Tieng Anh (1036)
    1036: {
      id: 1036,
      title: 'My School Things (Tiếng Anh 3)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 45,
      subject_name: 'Tiếng Anh',
      questions: [
        {
          id: 361,
          index: 1,
          question_text: 'What do you use to write in your notebook?',
          points: 10,
          hint: 'Em dùng bút mực (Pen) hay thước kẻ (Ruler)?',
          topic_tag: 'english-school-3',
          options: [
            { option_label: 'A', answer_text: 'A pen 🖊️' },
            { option_label: 'B', answer_text: 'An eraser 🧼' },
            { option_label: 'C', answer_text: 'A ruler 📏' },
            { option_label: 'D', answer_text: 'A bag 🎒' }
          ]
        }
      ]
    },

    // Grade 4 - Toan (101)
    101: {
      id: 101,
      title: 'Phân Số & Rút Gọn Quy Đồng (Toán 4)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 50,
      subject_name: 'Toán Học',
      questions: [
        {
          id: 1001,
          index: 1,
          question_text: 'Rút gọn phân số 15/25 về phân số tối giản ta được:',
          points: 10,
          hint: 'Chia cả tử số và mẫu số cho ước chung lớn nhất là 5: (15:5) / (25:5) = 3/5.',
          topic_tag: 'phan-so-4',
          options: [
            { option_label: 'A', answer_text: '3/5' },
            { option_label: 'B', answer_text: '5/3' },
            { option_label: 'C', answer_text: '1/5' },
            { option_label: 'D', answer_text: '3/25' }
          ]
        },
        {
          id: 1002,
          index: 2,
          question_text: 'Kết quả của phép tính: 2/7 + 3/7 là:',
          points: 10,
          hint: 'Cùng mẫu số, ta cộng tử với tử (2+3)/7 = 5/7.',
          topic_tag: 'phan-so-4',
          options: [
            { option_label: 'A', answer_text: '5/14' },
            { option_label: 'B', answer_text: '5/7' },
            { option_label: 'C', answer_text: '6/7' },
            { option_label: 'D', answer_text: '1' }
          ]
        }
      ]
    },

    // Grade 4 - Tieng Viet (103)
    103: {
      id: 103,
      title: 'Luyện Từ Và Câu: Danh Từ, Động Từ, Tính Từ (Tiếng Việt 4)',
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
          topic_tag: 'tu-loai-4',
          options: [
            { option_label: 'A', answer_text: 'Bút chì' },
            { option_label: 'B', answer_text: 'Chăm chỉ' },
            { option_label: 'C', answer_text: 'Đọc sách' },
            { option_label: 'D', answer_text: 'Học giỏi' }
          ]
        }
      ]
    },

    // Grade 4 - Tieng Anh (1046)
    1046: {
      id: 1046,
      title: 'Daily Routine in English (Tiếng Anh 4)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 50,
      subject_name: 'Tiếng Anh',
      questions: [
        {
          id: 461,
          index: 1,
          question_text: 'What time do you usually have breakfast?',
          points: 10,
          hint: 'Bữa ăn sáng thường diễn ra vào buổi sáng (In the morning).',
          topic_tag: 'english-routine-4',
          options: [
            { option_label: 'A', answer_text: 'At 6:30 in the morning' },
            { option_label: 'B', answer_text: 'At 8:00 in the evening' },
            { option_label: 'C', answer_text: 'At midnight' },
            { option_label: 'D', answer_text: 'At 2:00 PM' }
          ]
        }
      ]
    },

    // Grade 5 - Toan (1051)
    1051: {
      id: 1051,
      title: 'Số Thập Phân & Các Phép Tính (Toán 5)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 60,
      subject_name: 'Toán Học',
      questions: [
        {
          id: 501,
          index: 1,
          question_text: 'Phân số 3/4 được viết dưới dạng số thập phân là:',
          points: 10,
          hint: 'Lấy tử số chia mẫu số: 3 : 4 = 0,75.',
          topic_tag: 'thap-phan-5',
          options: [
            { option_label: 'A', answer_text: '0,34' },
            { option_label: 'B', answer_text: '0,75' },
            { option_label: 'C', answer_text: '3,4' },
            { option_label: 'D', answer_text: '0,43' }
          ]
        }
      ]
    },

    // Grade 5 - Tieng Anh (1057)
    1057: {
      id: 1057,
      title: 'Jobs & Occupations in English (Tiếng Anh 5)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 60,
      subject_name: 'Tiếng Anh',
      questions: [
        {
          id: 571,
          index: 1,
          question_text: 'A person who flies an airplane is a _______:',
          points: 10,
          hint: 'Người lái máy bay trên bầu trời là Pilot.',
          topic_tag: 'english-jobs-5',
          options: [
            { option_label: 'A', answer_text: 'Pilot ✈️' },
            { option_label: 'B', answer_text: 'Doctor 🩺' },
            { option_label: 'C', answer_text: 'Teacher 👨‍🏫' },
            { option_label: 'D', answer_text: 'Farmer 🌾' }
          ]
        }
      ]
    },

    // 🏆 100-Question Comprehensive Bank with Random Sampling (Exercise 2001)
    2001: {
      id: 2001,
      title: '🏆 Ngân Hàng 100 Câu Hỏi Ôn Luyện Đấu Trường Tri Thức (Lấy Ngẫu Nhiên 10 / 20 Câu)',
      difficulty: 'challenge',
      time_limit_minutes: 20,
      reward_xp: 150,
      grade_level: 4,
      subject_id: 1,
      subject_name: 'Toán & Tổng Hợp',
      assigned_to: 'Lớp 4A1',
      due_date: 'Chủ nhật tuần này (23:59)',
      is_random_pool: true,
      random_mode: 'student_choice', // 'student_choice' | 'fixed_10' | 'fixed_20' | 'all'
      random_count: 10,
      total_pool_count: 100,
      shuffle_questions: true,
      shuffle_options: true,
      questions: generate100QuestionsPool()
    }
  }
};

// Also inject lesson into grade 4
if (curriculumDatabase.lessonsByGradeAndSubject[4]?.[1]) {
  curriculumDatabase.lessonsByGradeAndSubject[4][1].push({
    id: 992001,
    subject_id: 1,
    grade_level: 4,
    title: '🏆 Ngân Hàng 100 Câu Hỏi: Đấu Trường Tri Thức (Trộn 10 / 20 câu)',
    topic_tag: 'ngan-hang-100-cau',
    description: 'Kho 100 câu hỏi tổng hợp, tự động bốc ngẫu nhiên 10 hoặc 20 câu mỗi lần làm',
    icon: '🎲',
    exercise_id: 2001
  });
}

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

    // Record Real Submission Record
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
