// Comprehensive primary school learning dataset with full questions & kid-friendly explanations

const sampleData = {
  grades: [
    { id: 1, grade_number: 1, name: 'Lớp 1', description: 'Bé làm quen với con số và bảng chữ cái', icon: '🌱', theme_color: '#FF6B6B' },
    { id: 2, grade_number: 2, name: 'Lớp 2', description: 'Phép cộng trừ có nhớ, bảng cửu chương nhân chia', icon: '🐥', theme_color: '#4ECDC4' },
    { id: 3, grade_number: 3, name: 'Lớp 3', description: 'Nhân chia số có 3 chữ số, hình học & đo lường', icon: '🐱', theme_color: '#FFD166' },
    { id: 4, grade_number: 4, name: 'Lớp 4', description: 'Phân số, tính chất hình học, ngữ pháp tiếng Việt nâng cao', icon: '🚀', theme_color: '#6C5CE7' },
    { id: 5, grade_number: 5, name: 'Lớp 5', description: 'Số thập phân, tính diện tích thể tích, ôn luyện vững vàng', icon: '👑', theme_color: '#FD79A8' }
  ],

  subjects: [
    { id: 1, name: 'Toán Học', code: 'toan', icon: '🔢', color: '#3B82F6', description: 'Con số diệu kỳ, tính nhẩm nhanh và câu đố thông minh' },
    { id: 2, name: 'Tiếng Việt', code: 'tieng-viet', icon: '📖', color: '#EF4444', description: 'Đọc diễn cảm, ghép vần, từ ngữ và câu văn hay' },
    { id: 3, name: 'Tiếng Anh', code: 'tieng-anh', icon: '🌍', color: '#10B981', description: 'Từ vựng sinh động, đố vui qua hình ảnh' },
    { id: 4, name: 'Tự Nhiên & Xã Hội', code: 'tn-xh', icon: '🌿', color: '#8B5CF6', description: 'Khám phá thiên nhiên, động vật và khoa học quanh ta' }
  ],

  topics: [
    // LỚP 1
    {
      id: 1,
      grade_id: 1,
      subject_id: 1,
      title: 'Đếm số và Phép cộng trừ trong phạm vi 10',
      description: 'Cùng bé đếm quả táo, chú thỏ và thực hiện các phép tính cộng trừ đơn giản nhất.',
      icon: '🍎',
      order_index: 1,
      quizzes: [
        {
          id: 101,
          title: 'Thử thách đếm số & cộng trừ siêu tốc (Lớp 1)',
          description: 'Bài kiểm tra 5 câu giúp bé nắm vững phép tính cơ bản từ 1 đến 10.',
          difficulty: 'easy',
          time_limit_minutes: 10,
          reward_stars: 15,
          questions: [
            {
              id: 1001,
              question_text: 'Bé có 3 quả táo đỏ 🍎, mẹ cho thêm bé 2 quả táo xanh 🍏. Hỏi bé có tất cả bao nhiêu quả táo?',
              points: 10,
              hint: 'Con lấy số táo bé có cộng với số táo mẹ cho nhé (3 + 2 = ?)',
              explanation: 'Giải thích: Phép tính là 3 + 2 = 5 quả táo. Con đếm: 1, 2, 3, thêm 4, 5. Vậy đáp án là 5 quả táo!',
              options: [
                { option_label: 'A', option_text: '4 quả táo', is_correct: false },
                { option_label: 'B', option_text: '5 quả táo', is_correct: true },
                { option_label: 'C', option_text: '6 quả táo', is_correct: false },
                { option_label: 'D', option_text: '3 quả táo', is_correct: false }
              ]
            },
            {
              id: 1002,
              question_text: 'Có 8 chú chim đậu trên cành cây 🐦, sau đó 3 chú chim bay đi. Còn lại bao nhiêu chú chim trên cành?',
              points: 10,
              hint: 'Chim bay đi là phép trừ (8 - 3 = ?)',
              explanation: 'Giải thích: Phép tính là 8 - 3 = 5. Có 8 chú chim bớt đi 3 chú chim thì còn lại đúng 5 chú chim trên cành!',
              options: [
                { option_label: 'A', option_text: '5 chú chim', is_correct: true },
                { option_label: 'B', option_text: '4 chú chim', is_correct: false },
                { option_label: 'C', option_text: '6 chú chim', is_correct: false },
                { option_label: 'D', option_text: '11 chú chim', is_correct: false }
              ]
            },
            {
              id: 1003,
              question_text: 'Số liền sau của số 7 là số nào?',
              points: 10,
              hint: 'Số liền sau là số tiếp theo khi con đếm: 1, 2, 3, 4, 5, 6, 7, ...',
              explanation: 'Giải thích: Khi đếm xuôi, ngay sau số 7 là số 8. Hoặc lấy 7 + 1 = 8. Vậy số liền sau của 7 là 8.',
              options: [
                { option_label: 'A', option_text: '6', is_correct: false },
                { option_label: 'B', option_text: '8', is_correct: true },
                { option_label: 'C', option_text: '9', is_correct: false },
                { option_label: 'D', option_text: '5', is_correct: false }
              ]
            },
            {
              id: 1004,
              question_text: 'Hình nào dưới đây có 3 cạnh?',
              points: 10,
              hint: 'Hình có ba đỉnh và ba cạnh nối lại với nhau.',
              explanation: 'Giải thích: Hình tam giác (tam nghĩa là 3) là hình gồm đúng 3 cạnh. Hình vuông và hình chữ nhật có 4 cạnh, hình tròn không có cạnh thẳng.',
              options: [
                { option_label: 'A', option_text: 'Hình tròn', is_correct: false },
                { option_label: 'B', option_text: 'Hình vuông', is_correct: false },
                { option_label: 'C', option_text: 'Hình tam giác', is_correct: true },
                { option_label: 'D', option_text: 'Hình chữ nhật', is_correct: false }
              ]
            },
            {
              id: 1005,
              question_text: 'Điền dấu thích hợp vào chỗ chấm: 6 + 3 ... 10',
              points: 10,
              hint: 'Tính xem 6 + 3 bằng bao nhiêu trước rồi so sánh với 10 nhé!',
              explanation: 'Giải thích: Ta tính vế trái 6 + 3 = 9. Vì 9 bé hơn 10 (9 < 10) nên dấu thích hợp cần điền là dấu bé (<).',
              options: [
                { option_label: 'A', option_text: '>', is_correct: false },
                { option_label: 'B', option_text: '<', is_correct: true },
                { option_label: 'C', option_text: '=', is_correct: false },
                { option_label: 'D', option_text: '+', is_correct: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      grade_id: 1,
      subject_id: 2,
      title: 'Bảng Chữ Cái & Ghép Âm Tiết Đầu Tiên',
      description: 'Làm quen các chữ cái a, b, c, dấu thanh sắc, huyền, hỏi, ngã, nặng.',
      icon: '🔤',
      order_index: 2,
      quizzes: [
        {
          id: 102,
          title: 'Bé vui học chữ và dấu thanh (Tiếng Việt 1)',
          description: 'Cùng chọn từ đúng và ghép thanh điệu chuẩn xác.',
          difficulty: 'easy',
          time_limit_minutes: 10,
          reward_stars: 15,
          questions: [
            {
              id: 1006,
              question_text: 'Chữ cái nào bắt đầu cho từ "Bút chì"?',
              points: 10,
              hint: 'Phát âm "Bút" bắt đầu bằng phụ âm gì nào?',
              explanation: 'Giải thích: Tiếng "Bút" bắt đầu bằng chữ "B" (bờ). Ghép b-u-t sắc bút.',
              options: [
                { option_label: 'A', option_text: 'Chữ B', is_correct: true },
                { option_label: 'B', option_text: 'Chữ C', is_correct: false },
                { option_label: 'C', option_text: 'Chữ D', is_correct: false },
                { option_label: 'D', option_text: 'Chữ M', is_correct: false }
              ]
            },
            {
              id: 1007,
              question_text: 'Từ nào dưới đây viết ĐÚNG chính tả con vật nuôi trong nhà?',
              points: 10,
              hint: 'Con mèo kêu meo meo.',
              explanation: 'Giải thích: Con mèo viết là m-e-o huyền mèo (Con mèo). Các cách viết khác bị sai dấu hoặc sai chữ.',
              options: [
                { option_label: 'A', option_text: 'Con mèo', is_correct: true },
                { option_label: 'B', option_text: 'Con mèn', is_correct: false },
                { option_label: 'C', option_text: 'Con méo', is_correct: false },
                { option_label: 'D', option_text: 'Con meo`', is_correct: false }
              ]
            },
            {
              id: 1008,
              question_text: 'Dấu thanh trong từ "Cá" là dấu gì?',
              points: 10,
              hint: 'Dấu có nét chéo từ trên phải xuống dưới trái.',
              explanation: 'Giải thích: Trong từ "Cá" (c-a-sắc-cá), dấu được dùng là dấu Sắc (´).',
              options: [
                { option_label: 'A', option_text: 'Dấu Huyền', is_correct: false },
                { option_label: 'B', option_text: 'Dấu Sắc', is_correct: true },
                { option_label: 'C', option_text: 'Dấu Hỏi', is_correct: false },
                { option_label: 'D', option_text: 'Dấu Nặng', is_correct: false }
              ]
            }
          ]
        }
      ]
    },

    // LỚP 2
    {
      id: 3,
      grade_id: 2,
      subject_id: 1,
      title: 'Bảng Nhân 2, Bảng Nhân 5 & Phép tính có nhớ',
      description: 'Bé làm quen phép nhân bảng 2, 5 và tính nhẩm thông minh trong phạm vi 100.',
      icon: '✖️',
      order_index: 1,
      quizzes: [
        {
          id: 201,
          title: 'Thử thách bảng nhân và cộng trừ có nhớ (Lớp 2)',
          description: 'Bài kiểm tra tư duy tính toán nhanh cho học sinh lớp 2.',
          difficulty: 'medium',
          time_limit_minutes: 12,
          reward_stars: 20,
          questions: [
            {
              id: 2001,
              question_text: 'Mỗi bạn học sinh có 2 chiếc bút chì. Hỏi 5 bạn học sinh có tất cả bao nhiêu chiếc bút chì?',
              points: 10,
              hint: 'Dùng phép nhân: 2 được lấy 5 lần (2 x 5)',
              explanation: 'Giải thích: 5 bạn, mỗi bạn có 2 chiếc bút chì. Ta có phép tính: 2 x 5 = 10 (chiếc bút chì).',
              options: [
                { option_label: 'A', option_text: '7 chiếc', is_correct: false },
                { option_label: 'B', option_text: '10 chiếc', is_correct: true },
                { option_label: 'C', option_text: '12 chiếc', is_correct: false },
                { option_label: 'D', option_text: '8 chiếc', is_correct: false }
              ]
            },
            {
              id: 2002,
              question_text: 'Kết quả của phép tính 47 + 28 là bao nhiêu?',
              points: 10,
              hint: 'Cộng hàng đơn vị trước: 7 + 8 = 15 (viết 5 nhớ 1). Rồi cộng hàng chục: 4 + 2 + 1 = 7.',
              explanation: 'Giải thích: 47 + 28 = 75. Đây là phép cộng có nhớ: 7 + 8 = 15 nhớ 1; 4 + 2 = 6 thêm 1 là 7. Kết quả = 75.',
              options: [
                { option_label: 'A', option_text: '65', is_correct: false },
                { option_label: 'B', option_text: '74', is_correct: false },
                { option_label: 'C', option_text: '75', is_correct: true },
                { option_label: 'D', option_text: '85', is_correct: false }
              ]
            },
            {
              id: 2003,
              question_text: 'Một ngày có bao nhiêu giờ?',
              points: 10,
              hint: 'Kim giờ quay 2 vòng quanh mặt đồng hồ (12 + 12 = ?)',
              explanation: 'Giải thích: Theo quy ước thời gian chuẩn, một ngày đêm trọn vẹn có đúng 24 giờ.',
              options: [
                { option_label: 'A', option_text: '12 giờ', is_correct: false },
                { option_label: 'B', option_text: '24 giờ', is_correct: true },
                { option_label: 'C', option_text: '60 giờ', is_correct: false },
                { option_label: 'D', option_text: '48 giờ', is_correct: false }
              ]
            },
            {
              id: 2004,
              question_text: 'Đoạn thẳng AB dài 15cm, đoạn thẳng CD dài hơn đoạn AB là 5cm. Hỏi đoạn CD dài bao nhiêu xăng-ti-mét?',
              points: 10,
              hint: 'Dài hơn là làm phép cộng: lấy chiều dài AB cộng thêm 5cm.',
              explanation: 'Giải thích: Độ dài đoạn thẳng CD là: 15 + 5 = 20 cm.',
              options: [
                { option_label: 'A', option_text: '10 cm', is_correct: false },
                { option_label: 'B', option_text: '20 cm', is_correct: true },
                { option_label: 'C', option_text: '25 cm', is_correct: false },
                { option_label: 'D', option_text: '18 cm', is_correct: false }
              ]
            }
          ]
        }
      ]
    },

    // LỚP 3
    {
      id: 4,
      grade_id: 3,
      subject_id: 1,
      title: 'Bảng Nhân Chia & Giải Toán Bằng Hai Phép Tính',
      description: 'Ôn tập bảng nhân 6, 7, 8, 9, tìm x và bài toán gấp/giảm một số lần.',
      icon: '➗',
      order_index: 1,
      quizzes: [
        {
          id: 301,
          title: 'Chiến Binh Toán Học Lớp 3',
          description: 'Bài kiểm tra tổng hợp phép tính và bài toán có lời văn.',
          difficulty: 'medium',
          time_limit_minutes: 15,
          reward_stars: 25,
          questions: [
            {
              id: 3001,
              question_text: 'Tìm X biết: X x 7 = 56',
              points: 10,
              hint: 'Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số đã biết (X = 56 : 7)',
              explanation: 'Giải thích: X = 56 : 7 => X = 8 (vì 8 x 7 = 56). Đáp án đúng là X = 8.',
              options: [
                { option_label: 'A', option_text: 'X = 6', is_correct: false },
                { option_label: 'B', option_text: 'X = 7', is_correct: false },
                { option_label: 'C', option_text: 'X = 8', is_correct: true },
                { option_label: 'D', option_text: 'X = 9', is_correct: false }
              ]
            },
            {
              id: 3002,
              question_text: 'Một hình vuông có cạnh dài 6 cm. Chu vi của hình vuông đó là:',
              points: 10,
              hint: 'Muốn tính chu vi hình vuông, ta lấy độ dài một cạnh nhân với 4.',
              explanation: 'Giải thích: Chu vi hình vuông = Cạnh x 4 = 6 x 4 = 24 cm.',
              options: [
                { option_label: 'A', option_text: '24 cm', is_correct: true },
                { option_label: 'B', option_text: '36 cm²', is_correct: false },
                { option_label: 'C', option_text: '12 cm', is_correct: false },
                { option_label: 'D', option_text: '18 cm', is_correct: false }
              ]
            },
            {
              id: 3003,
              question_text: 'Thùng thứ nhất có 30 lít dầu. Thùng thứ hai có số lít dầu giảm đi 3 lần so với thùng thứ nhất. Hỏi thùng thứ hai có bao nhiêu lít dầu?',
              points: 10,
              hint: 'Giảm đi 3 lần là lấy số đó chia cho 3 (30 : 3)',
              explanation: 'Giải thích: Giảm đi 3 lần tương ứng phép chia: 30 : 3 = 10 lít dầu.',
              options: [
                { option_label: 'A', option_text: '27 lít', is_correct: false },
                { option_label: 'B', option_text: '10 lít', is_correct: true },
                { option_label: 'C', option_text: '90 lít', is_correct: false },
                { option_label: 'D', option_text: '15 lít', is_correct: false }
              ]
            }
          ]
        }
      ]
    },

    // LỚP 3 - TIẾNG ANH
    {
      id: 5,
      grade_id: 3,
      subject_id: 3,
      title: 'English Fun: Colors, Animals & Greetings',
      description: 'Học từ vựng màu sắc, con vật và mẫu câu chào hỏi căn bản.',
      icon: '🐶',
      order_index: 2,
      quizzes: [
        {
          id: 302,
          title: 'Tiếng Anh Lớp 3: Everyday Vocabulary',
          description: 'Kiểm tra kiến thức từ vựng tiếng Anh vui nhộn.',
          difficulty: 'easy',
          time_limit_minutes: 10,
          reward_stars: 20,
          questions: [
            {
              id: 3004,
              question_text: 'Con vật nào trong tiếng Anh có tên là "Elephant"?',
              points: 10,
              hint: 'Con vật to lớn có chiếc vòi dài và đôi tai to.',
              explanation: 'Giải thích: "Elephant" trong tiếng Anh có nghĩa là "Con voi". Con hổ là "Tiger", Con khỉ là "Monkey", Con mèo là "Cat".',
              options: [
                { option_label: 'A', option_text: 'Con khỉ', is_correct: false },
                { option_label: 'B', option_text: 'Con hổ', is_correct: false },
                { option_label: 'C', option_text: 'Con voi', is_correct: true },
                { option_label: 'D', option_text: 'Con sư tử', is_correct: false }
              ]
            },
            {
              id: 3005,
              question_text: 'Khi bạn của em hỏi: "How are you?", câu trả lời lịch sự và đúng nhất là:',
              points: 10,
              hint: 'Trả lời tình trạng sức khỏe của mình kèm lời cảm ơn.',
              explanation: 'Giải thích: Khi được hỏi "How are you?" (Bạn có khỏe không?), câu trả lời chuẩn là "I am fine, thank you!" (Mình khỏe, cảm ơn bạn!).',
              options: [
                { option_label: 'A', option_text: 'I am fine, thank you!', is_correct: true },
                { option_label: 'B', option_text: 'I am 8 years old.', is_correct: false },
                { option_label: 'C', option_text: 'My name is Nam.', is_correct: false },
                { option_label: 'D', option_text: 'Good morning!', is_correct: false }
              ]
            }
          ]
        }
      ]
    },

    // LỚP 4
    {
      id: 6,
      grade_id: 4,
      subject_id: 1,
      title: 'Phân Số & Các Phép Tính Với Phân Số',
      description: 'Cộng, trừ, nhân, chia phân số, quy đồng mẫu số và rút gọn phân số.',
      icon: '🍰',
      order_index: 1,
      quizzes: [
        {
          id: 401,
          title: 'Chinh Phục Phân Số Thông Minh (Toán 4)',
          description: 'Bài toán tư duy phân số và giải toán đại số cơ bản.',
          difficulty: 'hard',
          time_limit_minutes: 15,
          reward_stars: 30,
          questions: [
            {
              id: 4001,
              question_text: 'Rút gọn phân số 15/25 về phân số tối giản ta được:',
              points: 10,
              hint: 'Chia cả tử số và mẫu số cho ước chung lớn nhất là 5.',
              explanation: 'Giải thích: Ta chia cả tử số và mẫu số cho 5: 15:5 = 3 và 25:5 = 5. Vậy phân số tối giản là 3/5.',
              options: [
                { option_label: 'A', option_text: '3/5', is_correct: true },
                { option_label: 'B', option_text: '5/3', is_correct: false },
                { option_label: 'C', option_text: '1/5', is_correct: false },
                { option_label: 'D', option_text: '3/25', is_correct: false }
              ]
            },
            {
              id: 4002,
              question_text: 'Tính kết quả: 2/7 + 3/7 = ?',
              points: 10,
              hint: 'Cộng hai phân số cùng mẫu số, ta cộng tử số với nhau và giữ nguyên mẫu số.',
              explanation: 'Giải thích: Vì cùng mẫu số 7, ta lấy (2 + 3)/7 = 5/7.',
              options: [
                { option_label: 'A', option_text: '5/14', is_correct: false },
                { option_label: 'B', option_text: '5/7', is_correct: true },
                { option_label: 'C', option_text: '6/7', is_correct: false },
                { option_label: 'D', option_text: '1', is_correct: false }
              ]
            },
            {
              id: 4003,
              question_text: 'Trung bình cộng của ba số: 12, 18, 30 là bao nhiêu?',
              points: 10,
              hint: 'Lấy tổng ba số chia cho 3: (12 + 18 + 30) : 3',
              explanation: 'Giải thích: Tổng 3 số = 12 + 18 + 30 = 60. Trung bình cộng = 60 : 3 = 20.',
              options: [
                { option_label: 'A', option_text: '15', is_correct: false },
                { option_label: 'B', option_text: '20', is_correct: true },
                { option_label: 'C', option_text: '25', is_correct: false },
                { option_label: 'D', option_text: '30', is_correct: false }
              ]
            }
          ]
        }
      ]
    },

    // LỚP 5
    {
      id: 7,
      grade_id: 5,
      subject_id: 1,
      title: 'Số Thập Phân, Tỉ Số Phần Trăm & Hình Học Chuyển Cấp',
      description: 'Toán nâng cao chuẩn bị chuyển cấp vào lớp 6: phần trăm, vận tốc quãng đường thời gian.',
      icon: '🏆',
      order_index: 1,
      quizzes: [
        {
          id: 501,
          title: 'Thử Thách Toán Học Toàn Diện Lớp 5',
          description: 'Bài toán ôn luyện nâng cao và tư duy logic cho học sinh cuối cấp tiểu học.',
          difficulty: 'hard',
          time_limit_minutes: 20,
          reward_stars: 35,
          questions: [
            {
              id: 5001,
              question_text: 'Một người đi xe máy với vận tốc 40 km/h trong thời gian 2 giờ 30 phút. Quãng đường người đó đi được là:',
              points: 10,
              hint: 'Đổi 2 giờ 30 phút = 2,5 giờ. Dùng công thức Quãng đường = Vận tốc x Thời gian (s = v x t)',
              explanation: 'Giải thích: Đổi 2 giờ 30 phút = 2,5 giờ. Quãng đường s = 40 x 2,5 = 100 km. Đáp án chính xác là 100 km.',
              options: [
                { option_label: 'A', option_text: '80 km', is_correct: false },
                { option_label: 'B', option_text: '90 km', is_correct: false },
                { option_label: 'C', option_text: '100 km', is_correct: true },
                { option_label: 'D', option_text: '120 km', is_correct: false }
              ]
            },
            {
              id: 5002,
              question_text: '25% của 200kg là bao nhiêu?',
              points: 10,
              hint: 'Lấy 200 nhân với 25 rồi chia cho 100 (hoặc 200 : 4)',
              explanation: 'Giải thích: 25% tương đương 1/4. Ta tính: 200 x 25 : 100 = 50 kg.',
              options: [
                { option_label: 'A', option_text: '40 kg', is_correct: false },
                { option_label: 'B', option_text: '50 kg', is_correct: true },
                { option_label: 'C', option_text: '75 kg', is_correct: false },
                { option_label: 'D', option_text: '100 kg', is_correct: false }
              ]
            },
            {
              id: 5003,
              question_text: 'Diện tích hình tròn có bán kính r = 5 cm là:',
              points: 10,
              hint: 'Công thức diện tích hình tròn: S = r x r x 3,14',
              explanation: 'Giải thích: S = 5 x 5 x 3,14 = 25 x 3,14 = 78,5 cm².',
              options: [
                { option_label: 'A', option_text: '31,4 cm²', is_correct: false },
                { option_label: 'B', option_text: '78,5 cm²', is_correct: true },
                { option_label: 'C', option_text: '15,7 cm²', is_correct: false },
                { option_label: 'D', option_text: '100 cm²', is_correct: false }
              ]
            }
          ]
        }
      ]
    },

    // LỚP 5 - TỰ NHIÊN & KHOA HỌC
    {
      id: 8,
      grade_id: 5,
      subject_id: 4,
      title: 'Khoa Học & Tự Nhiên: Cơ Thể Người và Môi Trường',
      description: 'Tìm hiểu về sức khỏe, các chất dinh dưỡng, sự biến đổi hóa học và bảo vệ môi trường.',
      icon: '🧪',
      order_index: 2,
      quizzes: [
        {
          id: 502,
          title: 'Nhà Bác Học Nhí - Khoa Học 5',
          description: 'Khám phá bí mật khoa học và tự nhiên kỳ thú.',
          difficulty: 'medium',
          time_limit_minutes: 15,
          reward_stars: 25,
          questions: [
            {
              id: 5004,
              question_text: 'Khí nào cần thiết cho sự sống và sự hô hấp của con người và động vật?',
              points: 10,
              hint: 'Khí này chiếm khoảng 21% thể tích không khí.',
              explanation: 'Giải thích: Khí Ô-xy (Oxy / Oxygen) là khí quan trọng nhất duy trì sự sống và quá trình hô hấp của con người, động vật.',
              options: [
                { option_label: 'A', option_text: 'Khí Các-bô-níc (CO₂)', is_correct: false },
                { option_label: 'B', option_text: 'Khí Ô-xy (O₂)', is_correct: true },
                { option_label: 'C', option_text: 'Khí Ni-tơ (N₂)', is_correct: false },
                { option_label: 'D', option_text: 'Khí Hi-đrô (H₂)', is_correct: false }
              ]
            },
            {
              id: 5005,
              question_text: 'Để phòng tránh bệnh sốt xuất huyết, biện pháp quan trọng nhất trong môi trường sống là:',
              points: 10,
              hint: 'Diệt muỗi vằn và bọ gậy, không để nước tù đọng.',
              explanation: 'Giải thích: Bệnh sốt xuất huyết lây truyền qua muỗi vằn. Do đó, việc đậy kín lu chứa nước, thả cá diệt bọ gậy, dọn dẹp vệ sinh xung quanh nhà là cách phòng bệnh hiệu quả nhất.',
              options: [
                { option_label: 'A', option_text: 'Uống nhiều nước đá', is_correct: false },
                { option_label: 'B', option_text: 'Diệt lăng quăng/bọ gậy và ngủ màn', is_correct: true },
                { option_label: 'C', option_text: 'Tập thể dục dưới mưa', is_correct: false },
                { option_label: 'D', option_text: 'Đóng kín mọi cửa sổ', is_correct: false }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = sampleData;
