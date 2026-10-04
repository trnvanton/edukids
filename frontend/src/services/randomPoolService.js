/**
 * Random Question Pool & Shuffling Utility
 * Supports sampling N random questions from large banks (e.g., 10 or 20 from 100 questions),
 * option shuffling (A/B/C/D), and question order randomization.
 */

export function sampleRandomQuestions(questions, config = {}) {
  if (!Array.isArray(questions) || questions.length === 0) return [];

  const {
    count = 10,
    shuffleQuestions = true,
    shuffleOptions = false
  } = config;

  // 1. Clone question array safely
  let pool = questions.map(q => {
    if (!q) return null;
    let opts = q.options;
    if (Array.isArray(opts)) {
      opts = opts.map(opt => typeof opt === 'object' && opt !== null ? { ...opt } : { option_label: 'A', answer_text: String(opt) });
    }
    return {
      ...q,
      options: opts,
      matching_data: q.matching_data ? { ...q.matching_data } : undefined
    };
  }).filter(Boolean);

  if (pool.length === 0) return [];

  // 2. Shuffle questions in pool using Fisher-Yates
  if (shuffleQuestions) {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }

  // 3. Slice to desired count safely
  const targetCount = (count && count > 0) ? Math.min(count, pool.length) : Math.min(10, pool.length);
  let selected = pool.slice(0, targetCount);

  // 4. Optionally shuffle option answers for multiple choice questions
  if (shuffleOptions) {
    selected = selected.map(q => {
      if (q.question_type === 'multiple_choice' && Array.isArray(q.options) && q.options.length > 1) {
        const originalCorrectLabel = (q.correct_answer || 'A').toString().toUpperCase();
        const correctOptObj = q.options.find(o => (o.option_label || '').toString().toUpperCase() === originalCorrectLabel) || q.options[0];
        const correctText = correctOptObj ? correctOptObj.answer_text : '';

        // Shuffle option texts
        let shuffledAnswers = q.options.map(o => o.answer_text || '');
        for (let i = shuffledAnswers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
        }

        const standardLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
        let newCorrectLabel = 'A';

        const newOptions = shuffledAnswers.map((txt, idx) => {
          const lbl = standardLabels[idx] || String.fromCharCode(65 + idx);
          if (txt === correctText) {
            newCorrectLabel = lbl;
          }
          return { option_label: lbl, answer_text: txt };
        });

        return {
          ...q,
          options: newOptions,
          correct_answer: newCorrectLabel
        };
      }
      return q;
    });
  }

  // 5. Re-index sequentially for active quiz view
  return selected.map((q, idx) => ({
    ...q,
    session_index: idx + 1
  }));
}

/**
 * Generate 100 Rich Educational Questions for Primary Students (Grade 1 - 5)
 * Spans Math, Vietnamese, Science, and English with varied question types:
 * multiple_choice, fill_blank, true_false, and matching.
 */
export function generate100QuestionsPool() {
  const qList = [];

  // ===================== PHẦN 1: TOÁN HỌC (35 CÂU) =====================
  // Phép tính, số học, hình học, phân số, số thập phân
  const mathItems = [
    { text: 'Kết quả của phép tính: 7 x 8 = ?', type: 'multiple_choice', opts: ['54', '56', '58', '64'], corr: 'B', hint: '7 x 7 = 49, thêm 7 là 56.' },
    { text: 'Kết quả của phép tính: 9 x 6 = ?', type: 'multiple_choice', opts: ['54', '63', '45', '56'], corr: 'A', hint: 'Bé nhớ bảng cửu chương 9 nhé.' },
    { text: 'Tìm x biết: x + 125 = 300', type: 'fill_blank', corr: '175', hint: 'x = 300 - 125' },
    { text: 'Tìm x biết: x - 45 = 155', type: 'fill_blank', corr: '200', hint: 'x = 155 + 45' },
    { text: 'Phân số 15/20 khi rút gọn tối giản được phân số nào?', type: 'multiple_choice', opts: ['3/4', '5/4', '3/5', '1/2'], corr: 'A', hint: 'Chia cả tử và mẫu cho 5.' },
    { text: 'Phân số 18/24 rút gọn tối giản là bao nhiêu?', type: 'multiple_choice', opts: ['2/3', '3/4', '4/5', '1/3'], corr: 'B', hint: 'Chia cả tử và mẫu cho 6.' },
    { text: 'Hình vuông có cạnh 8cm thì chu vi là bao nhiêu cm?', type: 'fill_blank', corr: '32', hint: 'Chu vi = Cạnh x 4' },
    { text: 'Hình chữ nhật có chiều dài 12m, chiều rộng 5m. Diện tích là bao nhiêu m²?', type: 'fill_blank', corr: '60', hint: 'Diện tích = Dài x Rộng' },
    { text: 'Số liền trước của số 1000 là số 999. Khẳng định này Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: '1000 - 1 = 999.' },
    { text: 'Số lớn nhất có 3 chữ số khác nhau là 999. Khẳng định này Đúng hay Sai?', type: 'true_false', corr: 'Sai', hint: 'Số có 3 chữ số khác nhau lớn nhất là 987.' },
    { text: 'Trong các số: 24, 35, 40, 52; số chia hết cho cả 2 và 5 là số nào?', type: 'multiple_choice', opts: ['24', '35', '40', '52'], corr: 'C', hint: 'Số tận cùng là chữ số 0 chia hết cho cả 2 và 5.' },
    { text: 'Kết quả phép tính: 3/5 + 1/5 = ?', type: 'multiple_choice', opts: ['4/10', '4/5', '2/5', '1'], corr: 'B', hint: 'Cộng tử số và giữ nguyên mẫu: 3 + 1 = 4.' },
    { text: '1/2 của 50 là bao nhiêu?', type: 'fill_blank', corr: '25', hint: '50 : 2 = 25' },
    { text: '1 giờ có 60 phút. Vậy 2,5 giờ có bao nhiêu phút?', type: 'fill_blank', corr: '150', hint: '2,5 x 60 = 150 phút' },
    { text: 'Số thập phân 0,75 viết dưới dạng phân số tối giản là:', type: 'multiple_choice', opts: ['1/4', '1/2', '3/4', '4/3'], corr: 'C', hint: '0,75 = 75/100 = 3/4.' },
    { text: '1 mét bằng bao nhiêu xăng-ti-mét (cm)?', type: 'fill_blank', corr: '100', hint: '1m = 10dm = 100cm' },
    { text: '1 tấn bằng bao nhiêu ki-lô-gam (kg)?', type: 'fill_blank', corr: '1000', hint: '1 tấn = 1000kg' },
    { text: 'Số nào sau đây là số chẵn?', type: 'multiple_choice', opts: ['13', '27', '48', '59'], corr: 'C', hint: 'Số chẵn có chữ số tận cùng là 0, 2, 4, 6, 8.' },
    { text: 'Một hình tam giác có độ dài ba cạnh lần lượt là 3cm, 4cm, 5cm. Chu vi tam giác đó là:', type: 'fill_blank', corr: '12', hint: 'Chu vi tam giác = tổng 3 cạnh = 3 + 4 + 5 = 12cm' },
    { text: '25% của 200 là bao nhiêu?', type: 'fill_blank', corr: '50', hint: '200 x 25 : 100 = 50' },
    { text: 'Kết quả của phép nhân: 1,2 x 5 = ?', type: 'fill_blank', corr: '6', hint: '1,2 x 5 = 6' },
    { text: 'Hình lập phương có tất cả bao nhiêu mặt?', type: 'multiple_choice', opts: ['4 mặt', '6 mặt', '8 mặt', '12 mặt'], corr: 'B', hint: 'Hình lập phương có 6 mặt bằng nhau.' },
    { text: 'Hình lập phương có 8 đỉnh và 12 cạnh. Khẳng định này Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'Hình lập phương có 6 mặt, 8 đỉnh, 12 cạnh.' },
    { text: 'Tổng hai số là 100, hiệu hai số là 20. Số lớn là bao nhiêu?', type: 'fill_blank', corr: '60', hint: 'Số lớn = (Tổng + Hiệu) : 2 = (100 + 20) : 2 = 60' },
    { text: 'Số bé trong bài toán trên (Tổng 100, Hiệu 20) là bao nhiêu?', type: 'fill_blank', corr: '40', hint: 'Số bé = 100 - 60 = 40' },
    { text: 'Kết quả của phép tính: 100 - 25 x 2 = ?', type: 'fill_blank', corr: '50', hint: 'Nhân chia trước cộng trừ sau: 25 x 2 = 50; 100 - 50 = 50' },
    { text: 'Số 0 nhân với bất kỳ số nào cũng bằng 0. Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'Quy tắc phép nhân với số 0.' },
    { text: 'Số nào chia cho chính nó cũng bằng 1 (với số khác 0). Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'a : a = 1 với a khác 0.' },
    { text: 'Chữ số 7 trong số 472.158 có giá trị là bao nhiêu?', type: 'multiple_choice', opts: ['700', '7.000', '70.000', '700.000'], corr: 'C', hint: 'Chữ số 7 đứng ở hàng chục nghìn nên có giá trị là 70.000.' },
    { text: 'Một hình thoi có độ dài hai đường chéo là 8cm và 6cm. Diện tích hình thoi là:', type: 'fill_blank', corr: '24', hint: 'Diện tích hình thoi = (8 x 6) : 2 = 24 cm²' },
    { text: '1 ngày có bao nhiêu giờ?', type: 'fill_blank', corr: '24', hint: '1 ngày = 24 giờ.' },
    { text: '1 tuần lễ có bao nhiêu ngày?', type: 'fill_blank', corr: '7', hint: '1 tuần = 7 ngày.' },
    { text: 'Năm nhuận có bao nhiêu ngày?', type: 'fill_blank', corr: '366', hint: 'Năm thường có 365 ngày, năm nhuận có 366 ngày (tháng 2 có 29 ngày).' },
    { text: 'Số 12 là bội chung của 3 và 4. Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: '12 chia hết cho cả 3 và 4.' },
    { text: 'Số La Mã XVI biểu diễn số nào trong hệ thập phân?', type: 'fill_blank', corr: '16', hint: 'X = 10, V = 5, I = 1 -> 10 + 5 + 1 = 16' }
  ];

  // ===================== PHẦN 2: TIẾNG VIỆT (30 CÂU) =====================
  const vietnameseItems = [
    { text: 'Từ nào dưới đây là từ chỉ hoạt động?', type: 'multiple_choice', opts: ['Bàn ghế', 'Chạy nhảy', 'Xanh biếc', 'Thông minh'], corr: 'B', hint: 'Chạy nhảy là hành động của con người.' },
    { text: 'Từ nào dưới đây là từ chỉ tính chất, đặc điểm?', type: 'multiple_choice', opts: ['Viết bài', 'Cái bảng', 'Chăm chỉ', 'Bác sĩ'], corr: 'C', hint: 'Chăm chỉ là tính nết tốt.' },
    { text: 'Trong câu: "Chú chim hót líu lo trên cành cây.", bộ phận nào là chủ ngữ?', type: 'multiple_choice', opts: ['Chú chim', 'Hót líu lo', 'Trên cành cây', 'Cành cây'], corr: 'A', hint: 'Ai hót líu lo? -> Chú chim.' },
    { text: 'Dấu câu nào dùng để kết thúc một câu hỏi?', type: 'multiple_choice', opts: ['Dấu chấm (.)', 'Dấu phẩy (,)', 'Dấu chấm hỏi (?)', 'Dấu chấm than (!)'], corr: 'C', hint: 'Câu hỏi kết thúc bằng dấu ?.' },
    { text: 'Thành ngữ: "Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra" ca ngợi điều gì?', type: 'multiple_choice', opts: ['Tình bạn bè', 'Công ơn cha mẹ', 'Lòng dũng cảm', 'Tính tiết kiệm'], corr: 'B', hint: 'Ca ngợi công ơn sinh thành dưỡng dục của cha mẹ.' },
    { text: 'Từ trái nghĩa với từ "Chăm chỉ" là từ gì?', type: 'multiple_choice', opts: ['Lười biếng', 'Cần cù', 'Ngoan ngoãn', 'Vui vẻ'], corr: 'A', hint: 'Lười biếng trái nghĩa với siêng năng, chăm chỉ.' },
    { text: 'Từ đồng nghĩa với từ "Tổ quốc" là từ gì?', type: 'multiple_choice', opts: ['Đất nước', 'Trường học', 'Gia đình', 'Lớp học'], corr: 'A', hint: 'Tổ quốc, Đất nước, Non sông, Giang sơn là các từ đồng nghĩa.' },
    { text: 'Biện pháp nghệ thuật nào được dùng trong câu: "Trăng tròn như cái đĩa bạc"?', type: 'multiple_choice', opts: ['Nhân hóa', 'So sánh', 'Ẩn dụ', 'Điệp từ'], corr: 'B', hint: 'Có từ so sánh "như".' },
    { text: 'Biện pháp nghệ thuật nào được dùng trong câu: "Chị gió ơi, hãy thổi mát cho chúng em!"?', type: 'multiple_choice', opts: ['So sánh', 'Nhân hóa', 'Hoán dụ', 'Nói quá'], corr: 'B', hint: 'Gọi gió bằng "Chị" và trò chuyện như con người.' },
    { text: 'Điền từ còn thiếu vào câu tục ngữ: "Học thầy không tày học ..."', type: 'fill_blank', corr: 'bạn', hint: 'Học thầy không tày học bạn.' },
    { text: 'Điền từ còn thiếu vào thành ngữ: "Uống nước nhớ ..."', type: 'fill_blank', corr: 'nguồn', hint: 'Uống nước nhớ nguồn.' },
    { text: 'Điền từ còn thiếu vào thành ngữ: "Ăn quả nhớ kẻ trồng ..."', type: 'fill_blank', corr: 'cây', hint: 'Ăn quả nhớ kẻ trồng cây.' },
    { text: 'Từ "dũng cảm" là một Danh từ. Khẳng định này Đúng hay Sai?', type: 'true_false', corr: 'Sai', hint: 'Dũng cảm là Tính từ chỉ phẩm chất.' },
    { text: 'Cặp từ "cao - thấp" là cặp từ trái nghĩa. Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'Cao trái ngược với thấp.' },
    { text: 'Câu: "Bạn Lan học rất giỏi." là câu kể Ai thế nào? Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'Vị ngữ "học rất giỏi" chỉ đặc điểm tính chất.' },
    { text: 'Chữ cái đầu tiên trong bảng chữ cái Tiếng Việt là chữ gì?', type: 'fill_blank', corr: 'A', hint: 'Chữ A' },
    { text: 'Tiếng Việt có tất cả bao nhiêu dấu thanh?', type: 'fill_blank', corr: '5', hint: 'Huyền, Sắc, Hỏi, Ngã, Nặng (và thanh ngang không dấu).' },
    { text: 'Trong câu: "Mùa xuân đã về.", trạng ngữ là từ nào?', type: 'multiple_choice', opts: ['Mùa xuân', 'Đã về', 'Không có trạng ngữ', 'Về'], corr: 'C', hint: '"Mùa xuân" ở đây đóng vai trò chủ ngữ.' },
    { text: 'Từ nào sau đây viết ĐÚNG chính tả?', type: 'multiple_choice', opts: ['Sắp sếp', 'Sắp xếp', 'Xắp sếp', 'Xắp xếp'], corr: 'B', hint: 'Sắp xếp (sắp trong s - xếp trong x).' },
    { text: 'Từ nào sau đây viết ĐÚNG chính tả?', type: 'multiple_choice', opts: ['Chân thành', 'Trân thành', 'Chân thàng', 'Trưng thành'], corr: 'A', hint: 'Chân thành.' },
    { text: 'Tiếng có cấu tạo đầy đủ gồm mấy bộ phận (Âm đầu, Vần, Thanh)?', type: 'fill_blank', corr: '3', hint: 'Gồm 3 bộ phận: Âm đầu + Vần + Thanh.' },
    { text: 'Bộ phận bắt buộc phải có trong mọi tiếng là Vần và Thanh. Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'Tiếng có thể khuyết âm đầu (ví dụ: ao, uyên) nhưng bắt buộc phải có Vần và Thanh.' },
    { text: 'Từ "xanh ngắt" là từ láy hay từ ghép?', type: 'multiple_choice', opts: ['Từ ghép', 'Từ láy', 'Từ đơn', 'Không xác định'], corr: 'A', hint: 'Xanh ngắt là từ ghép chính phụ chỉ mức độ màu xanh.' },
    { text: 'Từ "lung linh" là từ láy hay từ ghép?', type: 'multiple_choice', opts: ['Từ láy', 'Từ ghép', 'Từ đơn', 'Cụm từ'], corr: 'A', hint: 'Lung linh láy âm đầu L.' },
    { text: 'Trong bài thơ "Lượm" của Tố Hữu, chú bé Lượm làm nhiệm vụ gì?', type: 'multiple_choice', opts: ['Cứu thương', 'Liên lạc', 'Trinh sát', 'Hậu cần'], corr: 'B', hint: 'Lượm là chú bé liên lạc dũng cảm.' },
    { text: 'Điền từ thích hợp vào chỗ trống: "Lá lành đùm lá ..."', type: 'fill_blank', corr: 'rách', hint: 'Lá lành đùm lá rách.' },
    { text: 'Dấu ngoặc kép (" ") dùng để làm gì?', type: 'multiple_choice', opts: ['Đánh dấu lời nói trực tiếp hoặc trích dẫn', 'Kết thúc câu hỏi', 'Tách các vế câu', 'Thể hiện sự ngạc nhiên'], corr: 'A', hint: 'Dấu ngoặc kép dẫn lời nói trực tiếp của nhân vật.' },
    { text: 'Dấu hai chấm (:) thường dùng để báo hiệu phần giải thích hoặc lời nói nhân vật. Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'Tác dụng của dấu hai chấm.' },
    { text: 'Nhân vật Thạch Sanh trong truyện cổ tích đã dùng vũ khí gì để bắn chim Đại bàng?', type: 'multiple_choice', opts: ['Cung tên', 'Cây nỏ', 'Gươm báu', 'Súng'], corr: 'A', hint: 'Cung tên vàng.' },
    { text: 'Tác giả của bài thơ "Hạt gạo làng ta" là ai?', type: 'multiple_choice', opts: ['Trần Đăng Khoa', 'Xuân Quỳnh', 'Phạm Tiến Duật', 'Huy Cận'], corr: 'A', hint: 'Nhà thơ thần đồng thiếu nhi Trần Đăng Khoa.' }
  ];

  // ===================== PHẦN 3: KHOA HỌC & ĐỜI SỐNG (20 CÂU) =====================
  const scienceItems = [
    { text: 'Cơ quan nào trong cơ thể người làm nhiệm vụ bơm máu đi khắp cơ thể?', type: 'multiple_choice', opts: ['Bộ não', 'Trái tim', 'Lá phổi', 'Dạ dày'], corr: 'B', hint: 'Trái tim đập liên tục để co bóp và bơm máu.' },
    { text: 'Lá cây quang hợp tạo ra khí gì cần thiết cho sự hô hấp của con người?', type: 'multiple_choice', opts: ['Khí Ô-xi (O2)', 'Khí Các-bô-níc (CO2)', 'Khí Ni-tơ', 'Khí Mê-tan'], corr: 'A', hint: 'Cây xanh nhả khí Ô-xi giúp con người hô hấp.' },
    { text: 'Nước đóng băng ở nhiệt độ bao nhiêu độ C?', type: 'fill_blank', corr: '0', hint: '0 độ C (điểm đóng băng của nước tinh khiết).' },
    { text: 'Nước sôi ở nhiệt độ bao nhiêu độ C (ở điều kiện tiêu chuẩn)?', type: 'fill_blank', corr: '100', hint: '100 độ C.' },
    { text: 'Mặt trời mọc ở hướng nào?', type: 'multiple_choice', opts: ['Hướng Đông', 'Hướng Tây', 'Hướng Nam', 'Hướng Bắc'], corr: 'A', hint: 'Mặt trời mọc ở hướng Đông và lặn ở hướng Tây.' },
    { text: 'Mặt trời lặn ở hướng Tây. Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'Mặt trời lặn ở hướng Tây.' },
    { text: 'Trái Đất quay xung quanh Mặt Trời mất khoảng thời gian bao lâu?', type: 'multiple_choice', opts: ['1 ngày (24 giờ)', '1 tháng', '1 năm (365 ngày)', '10 năm'], corr: 'C', hint: 'Trái Đất quay 1 vòng quanh Mặt Trời mất 1 năm.' },
    { text: 'Động vật nào dưới đây đẻ con và nuôi con bằng sữa mẹ?', type: 'multiple_choice', opts: ['Chim bồ câu', 'Cá heo 🐬', 'Rùa biển 🐢', 'Con ếch 🐸'], corr: 'B', hint: 'Cá heo là loài thú biển đẻ con và nuôi con bằng sữa mẹ.' },
    { text: 'Muỗi vằn là vật trung gian truyền bệnh nào nguy hiểm cho trẻ em?', type: 'multiple_choice', opts: ['Sốt xuất huyết', 'Cận thị', 'Đau dạ dày', 'Sâu răng'], corr: 'A', hint: 'Muỗi vằn truyền bệnh Sốt xuất huyết.' },
    { text: 'Vitamin C có nhiều trong loại quả nào?', type: 'multiple_choice', opts: ['Cam, chanh, ổi', 'Cơm trắng', 'Mỡ động vật', 'Nước ngọt có ga'], corr: 'A', hint: 'Cam, quýt, chanh, bưởi, ổi rất giàu vitamin C.' },
    { text: 'Cần đánh răng ít nhất mấy lần mỗi ngày để bảo vệ răng miệng?', type: 'fill_blank', corr: '2', hint: 'Sáng sau khi ngủ dậy và tối trước khi đi ngủ.' },
    { text: 'Không khí xung quanh chúng ta có màu sắc và mùi vị. Đúng hay Sai?', type: 'true_false', corr: 'Sai', hint: 'Không khí trong lành không màu, không mùi, không vị.' },
    { text: 'Âm thanh truyền được qua môi trường nào?', type: 'multiple_choice', opts: ['Chất rắn, chất lỏng, chất khí', 'Chỉ chất khí', 'Chỉ chất rắn', 'Chân không'], corr: 'A', hint: 'Âm thanh truyền qua rắn, lỏng, khí nhưng không truyền qua chân không.' },
    { text: 'Kim loại nào dẫn điện tốt nhất và thường dùng làm lõi dây điện?', type: 'multiple_choice', opts: ['Đồng (Cu)', 'Gỗ', 'Nhựa', 'Thủy tinh'], corr: 'A', hint: 'Đồng dẫn điện rất tốt và giá thành hợp lý.' },
    { text: 'Chất nào sau đây là chất dẫn điện?', type: 'multiple_choice', opts: ['Nước muối pha loãng', 'Cao su khô', 'Nhựa cứng', 'Gốm sứ'], corr: 'A', hint: 'Nước muối có khả năng dẫn điện.' },
    { text: 'Cây xương rồng thích nghi với môi trường sống nào?', type: 'multiple_choice', opts: ['Sa mạc khô hạn', 'Rừng ngập mặn', 'Đáy biển', 'Băng tuyết lạnh'], corr: 'A', hint: 'Sa mạc nhiều cát và ít nước.' },
    { text: 'Cơ quan hô hấp của loài cá là gì?', type: 'multiple_choice', opts: ['Mang cá', 'Phổi', 'Da', 'Mũi'], corr: 'A', hint: 'Cá thở bằng mang.' },
    { text: 'Động vật ăn cỏ là động vật ăn thực vật. Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: 'Bò, trâu, ngựa ăn cỏ lá cây.' },
    { text: 'Tổ chức cơ thể người gồm 5 giác quan: Thị giác, Thính giác, Khứu giác, Vị giác và Xúc giác. Đúng hay Sai?', type: 'true_false', corr: 'Đúng', hint: '5 giác quan chính.' },
    { text: 'Hiện tượng nước bốc hơi tạo thành mây rồi rơi xuống tạo thành mưa gọi là gì?', type: 'multiple_choice', opts: ['Vòng tuần hoàn của nước', 'Sóng thần', 'Gió bão', 'Biến đổi gen'], corr: 'A', hint: 'Vòng tuần hoàn của nước trong tự nhiên.' }
  ];

  // ===================== PHẦN 4: TIẾNG ANH TIỂU HỌC (15 CÂU) =====================
  const englishItems = [
    { text: 'What is the color of the sky on a sunny day?', type: 'multiple_choice', opts: ['Blue', 'Red', 'Green', 'Yellow'], corr: 'A', hint: 'Bầu trời màu xanh da trời (Blue).' },
    { text: 'How many days are there in a week?', type: 'fill_blank', corr: '7', hint: '7 days: Monday to Sunday.' },
    { text: 'Choose the correct word: "I have _______ apple for breakfast."', type: 'multiple_choice', opts: ['a', 'an', 'the', 'two'], corr: 'B', hint: 'Trước danh từ bắt đầu bằng nguyên âm A dùng "an".' },
    { text: 'What is the opposite of "Big"?', type: 'multiple_choice', opts: ['Small', 'Tall', 'Fast', 'Hot'], corr: 'A', hint: 'Big (to lớn) trái nghĩa với Small (nhỏ bé).' },
    { text: 'What is the opposite of "Hot"?', type: 'multiple_choice', opts: ['Cold', 'Warm', 'Sunny', 'Dry'], corr: 'A', hint: 'Hot (nóng) đối lập với Cold (lạnh).' },
    { text: 'Translate into English: "Con mèo"', type: 'fill_blank', corr: 'cat', hint: 'C-A-T.' },
    { text: 'Translate into English: "Con chó"', type: 'fill_blank', corr: 'dog', hint: 'D-O-G.' },
    { text: 'Translate into English: "Cuốn sách"', type: 'fill_blank', corr: 'book', hint: 'B-O-O-K.' },
    { text: 'Which animal can fly in the sky?', type: 'multiple_choice', opts: ['Bird 🕊️', 'Fish 🐟', 'Dog 🐕', 'Elephant 🐘'], corr: 'A', hint: 'Bird can fly.' },
    { text: 'Choose the correct greeting in the morning:', type: 'multiple_choice', opts: ['Good morning', 'Good night', 'Goodbye', 'Good evening'], corr: 'A', hint: 'Chào buổi sáng là Good morning.' },
    { text: '"Sunday" in Vietnamese means "Thứ Bảy". True or False?', type: 'true_false', corr: 'Sai', hint: 'Sunday là Chủ Nhật, Saturday mới là Thứ Bảy.' },
    { text: '"Teacher" in Vietnamese means "Giáo viên / Cô giáo". True or False?', type: 'true_false', corr: 'Đúng', hint: 'Teacher = Giáo viên.' },
    { text: 'What is 5 + 5 in English word?', type: 'multiple_choice', opts: ['Ten', 'Eight', 'Nine', 'Eleven'], corr: 'A', hint: '5 + 5 = 10 (Ten).' },
    { text: 'What time is it if the clock shows 7:00?', type: 'multiple_choice', opts: ['Seven o\'clock', 'Six o\'clock', 'Eight o\'clock', 'Nine o\'clock'], corr: 'A', hint: '7:00 = Seven o\'clock.' },
    { text: 'Complete the sentence: "She _______ my best friend."', type: 'multiple_choice', opts: ['is', 'are', 'am', 'be'], corr: 'A', hint: 'Chủ ngữ ngôi thứ 3 số ít "She" đi với "is".' }
  ];

  let idCounter = 1;

  const processCategory = (items, defaultSubject) => {
    items.forEach(item => {
      let qObj = {
        id: 20000 + idCounter,
        index: idCounter,
        question_text: item.text,
        question_type: item.type,
        points: 10,
        hint: item.hint || 'Đọc kỹ câu hỏi để tìm đáp án chính xác nhất.',
        explanation: item.hint ? `💡 Lời giải sư phạm: ${item.hint}` : 'Ôn tập kiến thức trọng tâm bài học.'
      };

      if (item.type === 'multiple_choice') {
        const labels = ['A', 'B', 'C', 'D'];
        qObj.options = (item.opts || []).map((optText, idx) => ({
          option_label: labels[idx],
          answer_text: optText
        }));
        qObj.correct_answer = item.corr || 'A';
      } else if (item.type === 'fill_blank') {
        qObj.correct_answer = item.corr;
      } else if (item.type === 'true_false') {
        qObj.correct_answer = item.corr;
      }

      qList.push(qObj);
      idCounter++;
    });
  };

  processCategory(mathItems, 'Toán Học');
  processCategory(vietnameseItems, 'Tiếng Việt');
  processCategory(scienceItems, 'Khoa Học');
  processCategory(englishItems, 'Tiếng Anh');

  return qList;
}
