// Rich multi-grade curriculum dataset for EduKids (Grades 1 to 5)
const sampleData = {
  grades: [
    { id: 1, grade_number: 1, name: 'Lớp 1', icon: '🌱' },
    { id: 2, grade_number: 2, name: 'Lớp 2', icon: '🐥' },
    { id: 3, grade_number: 3, name: 'Lớp 3', icon: '🐱' },
    { id: 4, grade_number: 4, name: 'Lớp 4', icon: '🚀' },
    { id: 5, grade_number: 5, name: 'Lớp 5', icon: '👑' }
  ],

  subjects: [
    { id: 1, name: 'Toán Học', code: 'toan', icon: '📐', color: '#3B82F6', description: 'Số học, phép tính, hình học và bài toán tư duy' },
    { id: 2, name: 'Tiếng Việt', code: 'tieng-viet', icon: '📖', color: '#EF4444', description: 'Đọc hiểu, chính tả, luyện từ và câu' },
    { id: 3, name: 'Khoa Học & Tự Nhiên', code: 'khoa-hoc', icon: '🔬', color: '#8B5CF6', description: 'Khám phá thế giới, thực vật, động vật và môi trường' },
    { id: 4, name: 'Tiếng Anh', code: 'tieng-anh', icon: '🇬🇧', color: '#10B981', description: 'Từ vựng, ngữ pháp, bài tập qua hình ảnh vui nhộn' }
  ],

  lessons: [
    // LỚP 1
    { id: 10, subject_id: 1, grade_level: 1, title: 'Đếm Số & Phép Cộng Trừ Trong Phạm Vi 10', topic_tag: 'phep-cong', description: 'Cùng bé đếm quả táo, chú thỏ và tính nhẩm nhanh', icon: '🍎', order_index: 1 },
    { id: 11, subject_id: 2, grade_level: 1, title: 'Bảng Chữ Cái & Ghép Vần Cơ Bản', topic_tag: 'chinh-ta', description: 'Nhận biết chữ cái và ghép âm tiết đầu tiên', icon: '🔤', order_index: 1 },

    // LỚP 2
    { id: 20, subject_id: 1, grade_level: 2, title: 'Bảng Nhân 2, Bảng Nhân 5 & Cộng Trừ Có Nhớ', topic_tag: 'phep-nhan', description: 'Học bảng cửu chương 2, 5 và tính nhẩm trong phạm vi 100', icon: '✖️', order_index: 1 },
    { id: 21, subject_id: 2, grade_level: 2, title: 'Từ Chỉ Sự Vật, Hoạt Động & Dấu Câu', topic_tag: 'luyen-tu-cau', description: 'Phân biệt từ chỉ người, con vật và dùng dấu chấm, dấu phẩy', icon: '✍️', order_index: 1 },

    // LỚP 3
    { id: 30, subject_id: 1, grade_level: 3, title: 'Bảng Nhân Chia & Giải Toán Bằng 2 Phép Tính', topic_tag: 'phep-nhan', description: 'Bảng nhân chia 6, 7, 8, 9 và bài toán gấp/giảm một số lần', icon: '➗', order_index: 1 },
    { id: 31, subject_id: 4, grade_level: 3, title: 'English: Animals, Colors & School Objects', topic_tag: 'tu-vung-anh', description: 'Từ vựng con vật, đồ dùng học tập và màu sắc', icon: '🐶', order_index: 1 },

    // LỚP 4
    { id: 1, subject_id: 1, grade_level: 4, title: 'Phân Số & Các Phép Tính Phân Số', topic_tag: 'phan-so', description: 'Rút gọn phân số, quy đồng mẫu số, cộng trừ nhân chia phân số', icon: '🍰', order_index: 1 },
    { id: 2, subject_id: 1, grade_level: 4, title: 'Hình Học: Góc, Chu Vi & Diện Tích', topic_tag: 'hinh-hoc', description: 'Góc nhọn, tù, bẹt, hình bình hành, hình thoi', icon: '📐', order_index: 2 },
    { id: 3, subject_id: 1, grade_level: 4, title: 'Số Tự Nhiên & Dấu Hiệu Chia Hết', topic_tag: 'phep-nhan', description: 'Số có nhiều chữ số, dấu hiệu chia hết cho 2, 3, 5, 9', icon: '🔢', order_index: 3 },
    { id: 4, subject_id: 2, grade_level: 4, title: 'Đọc Hiểu: Bài Học Cuộc Sống', topic_tag: 'doc-hieu', description: 'Tập đọc diễn cảm và nắm bắt thông điệp câu chuyện', icon: '📖', order_index: 1 },
    { id: 5, subject_id: 2, grade_level: 4, title: 'Luyện Từ Và Câu: Danh Từ, Động Từ, Tính Từ', topic_tag: 'luyen-tu-cau', description: 'Phân biệt các từ loại và mở rộng vốn từ', icon: '✍️', order_index: 2 },

    // LỚP 5
    { id: 50, subject_id: 1, grade_level: 5, title: 'Số Thập Phân & Tỉ Số Phần Trăm', topic_tag: 'so-thap-phan', description: 'Cộng trừ nhân chia số thập phân, tính tỉ số phần trăm', icon: '🏆', order_index: 1 },
    { id: 51, subject_id: 3, grade_level: 5, title: 'Khoa Học: Con Người, Sức Khỏe & Môi Trường', topic_tag: 'khoa-hoc-tn', description: 'Tìm hiểu cơ thể người, chất dinh dưỡng và bảo vệ thiên nhiên', icon: '🧪', order_index: 1 }
  ],

  exercises: [
    // LỚP 1
    {
      id: 10,
      lesson_id: 10,
      grade_level: 1,
      title: 'Thử Thách Đếm Số & Cộng Trừ Vui Nhộn (Toán 1)',
      difficulty: 'basic',
      time_limit_minutes: 10,
      reward_xp: 30,
      questions: [
        {
          id: 1101,
          question_text: 'Bé có 3 quả táo đỏ 🍎, mẹ cho thêm 2 quả táo xanh 🍏. Hỏi bé có tất cả bao nhiêu quả táo?',
          points: 10,
          topic_tag: 'phep-cong',
          hint: 'Con lấy 3 cộng với 2 nhé (3 + 2 = ?)',
          explanation: 'Giải thích: Phép tính là 3 + 2 = 5 quả táo. Con đếm: 1, 2, 3, thêm 4, 5. Vậy có tất cả 5 quả táo!',
          answers: [
            { option_label: 'A', answer_text: '4 quả', is_correct: false },
            { option_label: 'B', answer_text: '5 quả', is_correct: true },
            { option_label: 'C', answer_text: '6 quả', is_correct: false },
            { option_label: 'D', answer_text: '3 quả', is_correct: false }
          ]
        },
        {
          id: 1102,
          question_text: 'Hình nào dưới đây có đúng 3 cạnh?',
          points: 10,
          topic_tag: 'hinh-hoc',
          hint: 'Hình có ba góc và ba cạnh nối lại với nhau.',
          explanation: 'Giải thích: Hình tam giác (tam là 3) có đúng 3 cạnh. Hình vuông có 4 cạnh, hình tròn không có cạnh thẳng.',
          answers: [
            { option_label: 'A', answer_text: 'Hình tròn', is_correct: false },
            { option_label: 'B', answer_text: 'Hình vuông', is_correct: false },
            { option_label: 'C', answer_text: 'Hình tam giác', is_correct: true },
            { option_label: 'D', answer_text: 'Hình chữ nhật', is_correct: false }
          ]
        }
      ]
    },

    // LỚP 2
    {
      id: 20,
      lesson_id: 20,
      grade_level: 2,
      title: 'Luyện Tập Bảng Nhân & Phép Tính Có Nhớ (Toán 2)',
      difficulty: 'practice',
      time_limit_minutes: 12,
      reward_xp: 40,
      questions: [
        {
          id: 2101,
          question_text: 'Mỗi bạn học sinh có 2 chiếc bút chì. Hỏi 5 bạn học sinh có tất cả bao nhiêu chiếc bút chì?',
          points: 10,
          topic_tag: 'phep-nhan',
          hint: 'Dùng phép nhân: 2 được lấy 5 lần (2 x 5 = ?)',
          explanation: 'Giải thích: Phép tính là 2 x 5 = 10 chiếc bút chì. Đáp án đúng là 10 chiếc.',
          answers: [
            { option_label: 'A', answer_text: '7 chiếc', is_correct: false },
            { option_label: 'B', answer_text: '10 chiếc', is_correct: true },
            { option_label: 'C', answer_text: '12 chiếc', is_correct: false },
            { option_label: 'D', answer_text: '8 chiếc', is_correct: false }
          ]
        },
        {
          id: 2102,
          question_text: 'Một ngày có bao nhiêu giờ?',
          points: 10,
          topic_tag: 'phep-cong',
          hint: 'Kim giờ quay 2 vòng mặt đồng hồ (12 + 12 = ?)',
          explanation: 'Giải thích: Theo quy ước thời gian, một ngày đêm trọn vẹn có đúng 24 giờ.',
          answers: [
            { option_label: 'A', answer_text: '12 giờ', is_correct: false },
            { option_label: 'B', answer_text: '24 giờ', is_correct: true },
            { option_label: 'C', answer_text: '60 giờ', is_correct: false },
            { option_label: 'D', answer_text: '48 giờ', is_correct: false }
          ]
        }
      ]
    },

    // LỚP 3
    {
      id: 30,
      lesson_id: 30,
      grade_level: 3,
      title: 'Chiến Binh Nhân Chia & Tìm X (Toán 3)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 45,
      questions: [
        {
          id: 3101,
          question_text: 'Tìm X biết: X x 7 = 56',
          points: 10,
          topic_tag: 'phep-nhan',
          hint: 'Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số đã biết (56 : 7)',
          explanation: 'Giải thích: X = 56 : 7 => X = 8 (vì 8 x 7 = 56). Đáp án đúng là X = 8.',
          answers: [
            { option_label: 'A', answer_text: 'X = 6', is_correct: false },
            { option_label: 'B', answer_text: 'X = 7', is_correct: false },
            { option_label: 'C', answer_text: 'X = 8', is_correct: true },
            { option_label: 'D', answer_text: 'X = 9', is_correct: false }
          ]
        },
        {
          id: 3102,
          question_text: 'Một hình vuông có cạnh dài 6 cm. Chu vi của hình vuông đó là:',
          points: 10,
          topic_tag: 'hinh-hoc',
          hint: 'Chu vi hình vuông = Cạnh x 4',
          explanation: 'Giải thích: Chu vi = 6 x 4 = 24 cm.',
          answers: [
            { option_label: 'A', answer_text: '24 cm', is_correct: true },
            { option_label: 'B', answer_text: '36 cm', is_correct: false },
            { option_label: 'C', answer_text: '12 cm', is_correct: false },
            { option_label: 'D', answer_text: '18 cm', is_correct: false }
          ]
        }
      ]
    },

    // LỚP 4
    {
      id: 101,
      lesson_id: 1,
      grade_level: 4,
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
      grade_level: 4,
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
    },
    {
      id: 103,
      lesson_id: 4,
      grade_level: 4,
      title: 'Đọc Hiểu & Luyện Từ Và Câu (Tiếng Việt 4)',
      difficulty: 'practice',
      time_limit_minutes: 15,
      reward_xp: 50,
      questions: [
        {
          id: 1005,
          question_text: 'Từ nào dưới đây là Danh từ chỉ đồ dùng học tập của học sinh?',
          points: 10,
          topic_tag: 'luyen-tu-cau',
          hint: 'Danh từ chỉ sự vật em dùng để viết bài mỗi ngày.',
          explanation: 'Danh từ là từ chỉ sự vật. "Bút chì" là đồ dùng học tập. "Chăm chỉ" là tính từ, "Đọc sách" là cụm động từ.',
          answers: [
            { option_label: 'A', answer_text: 'Bút chì', is_correct: true },
            { option_label: 'B', answer_text: 'Chăm chỉ', is_correct: false },
            { option_label: 'C', answer_text: 'Đọc sách', is_correct: false },
            { option_label: 'D', answer_text: 'Học giỏi', is_correct: false }
          ]
        }
      ]
    },

    // LỚP 5
    {
      id: 50,
      lesson_id: 50,
      grade_level: 5,
      title: 'Thử Thách Số Thập Phân & Tỉ Số Phần Trăm (Toán 5)',
      difficulty: 'advanced',
      time_limit_minutes: 20,
      reward_xp: 60,
      questions: [
        {
          id: 5101,
          question_text: 'Một người đi xe máy với vận tốc 40 km/h trong thời gian 2 giờ 30 phút. Quãng đường người đó đi được là:',
          points: 10,
          topic_tag: 'so-thap-phan',
          hint: 'Đổi 2 giờ 30 phút = 2,5 giờ. Dùng công thức Quãng đường = Vận tốc x Thời gian (s = v x t)',
          explanation: 'Giải thích: Đổi 2 giờ 30 phút = 2,5 giờ. Quãng đường s = 40 x 2,5 = 100 km. Đáp án đúng là 100 km.',
          answers: [
            { option_label: 'A', answer_text: '80 km', is_correct: false },
            { option_label: 'B', answer_text: '90 km', is_correct: false },
            { option_label: 'C', answer_text: '100 km', is_correct: true },
            { option_label: 'D', answer_text: '120 km', is_correct: false }
          ]
        },
        {
          id: 5102,
          question_text: '25% của 200 kg là bao nhiêu?',
          points: 10,
          topic_tag: 'so-thap-phan',
          hint: '25% tương đương 1/4. Lấy 200 chia 4.',
          explanation: 'Giải thích: 200 x 25 : 100 = 50 kg.',
          answers: [
            { option_label: 'A', answer_text: '40 kg', is_correct: false },
            { option_label: 'B', answer_text: '50 kg', is_correct: true },
            { option_label: 'C', answer_text: '75 kg', is_correct: false },
            { option_label: 'D', answer_text: '100 kg', is_correct: false }
          ]
        }
      ]
    }
  ]
};

module.exports = sampleData;
