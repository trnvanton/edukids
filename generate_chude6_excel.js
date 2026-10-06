import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use xlsx from frontend node_modules
import * as XLSX from './frontend/node_modules/xlsx/xlsx.mjs';

const questions = [
  // =========================================================================
  // BÀI 29: NGÀY – GIỜ, GIỜ – PHÚT (30 câu)
  // =========================================================================
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Một ngày có bao nhiêu giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "12 giờ",
    "Đáp án B": "24 giờ",
    "Đáp án C": "60 giờ",
    "Đáp án D": "30 giờ",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Một ngày bắt đầu từ 12 giờ đêm hôm trước đến 12 giờ đêm hôm sau.",
    "Lời giải thích chi tiết": "Một ngày có 24 giờ. Bắt đầu từ 12 giờ đêm hôm trước đến 12 giờ đêm hôm sau."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Một giờ có bao nhiêu phút?",
    "Link ảnh minh họa": "",
    "Đáp án A": "24 phút",
    "Đáp án B": "30 phút",
    "Đáp án C": "60 phút",
    "Đáp án D": "100 phút",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Kim phút quay trọn một vòng đồng hồ từ số 12 đến số 12.",
    "Lời giải thích chi tiết": "Quy ước thời gian: 1 giờ = 60 phút."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "13 giờ còn được gọi là mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "1 giờ trưa",
    "Đáp án B": "1 giờ chiều",
    "Đáp án C": "3 giờ chiều",
    "Đáp án D": "1 giờ sáng",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Lấy 13 trừ đi 12 để ra giờ buổi chiều.",
    "Lời giải thích chi tiết": "13 giờ - 12 giờ = 1 giờ chiều."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "8 giờ tối còn có cách gọi khác là gì?",
    "Link ảnh minh họa": "",
    "Đáp án A": "18 giờ",
    "Đáp án B": "19 giờ",
    "Đáp án C": "20 giờ",
    "Đáp án D": "21 giờ",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Lấy 8 cộng thêm 12 giờ.",
    "Lời giải thích chi tiết": "8 giờ tối tương ứng với 8 + 12 = 20 giờ."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Khoảng thời gian từ 13 giờ đến 17 giờ thuộc buổi nào trong ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Buổi sáng",
    "Đáp án B": "Buổi trưa",
    "Đáp án C": "Buổi chiều",
    "Đáp án D": "Buổi tối",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Buổi chiều bắt đầu từ 1 giờ chiều (13 giờ) đến 5 giờ chiều (17 giờ).",
    "Lời giải thích chi tiết": "Buổi chiều tính từ 13 giờ (1 giờ chiều) đến 17 giờ (5 giờ chiều)."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "15 giờ chiều tương ứng với mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "3 giờ chiều",
    "Đáp án B": "5 giờ chiều",
    "Đáp án C": "4 giờ chiều",
    "Đáp án D": "2 giờ chiều",
    "Đáp án đúng": "A",
    "Gợi ý cho bé": "Lấy 15 trừ đi 12.",
    "Lời giải thích chi tiết": "15 giờ = 15 - 12 = 3 giờ chiều."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Nửa giờ bằng bao nhiêu phút?",
    "Link ảnh minh họa": "",
    "Đáp án A": "15 phút",
    "Đáp án B": "20 phút",
    "Đáp án C": "30 phút",
    "Đáp án D": "45 phút",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Một giờ có 60 phút, một nửa của 60 là bao nhiêu?",
    "Lời giải thích chi tiết": "1 giờ = 60 phút, vậy nửa giờ = 60 : 2 = 30 phút (hay còn gọi là rưỡi)."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Buổi sáng trong ngày được tính từ mấy giờ đến mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Từ 1 giờ sáng đến 10 giờ sáng",
    "Đáp án B": "Từ 6 giờ sáng đến 12 giờ trưa",
    "Đáp án C": "Từ 12 giờ đêm đến 6 giờ sáng",
    "Đáp án D": "Từ 11 giờ đến 14 giờ",
    "Đáp án đúng": "A",
    "Gợi ý cho bé": "Theo chương trình Toán lớp 2, buổi sáng tính từ 1 giờ sáng đến 10 giờ sáng.",
    "Lời giải thích chi tiết": "Theo phân chia các buổi trong ngày môn Toán tiểu học: Buổi sáng tính từ 1 giờ đến 10 giờ."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "22 giờ đêm tương ứng với mấy giờ đêm?",
    "Link ảnh minh họa": "",
    "Đáp án A": "9 giờ đêm",
    "Đáp án B": "10 giờ đêm",
    "Đáp án C": "11 giờ đêm",
    "Đáp án D": "12 giờ đêm",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Lấy 22 trừ 12.",
    "Lời giải thích chi tiết": "22 giờ = 22 - 12 = 10 giờ đêm."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "17 giờ còn gọi là mấy giờ chiều?",
    "Link ảnh minh họa": "",
    "Đáp án A": "4 giờ chiều",
    "Đáp án B": "5 giờ chiều",
    "Đáp án C": "6 giờ chiều",
    "Đáp án D": "7 giờ chiều",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Lấy 17 trừ đi 12.",
    "Lời giải thích chi tiết": "17 - 12 = 5 giờ chiều."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Những mốc thời gian nào dưới đây thuộc BUỔI CHIỀU? (Chọn các đáp án đúng)",
    "Link ảnh minh họa": "",
    "Đáp án A": "14 giờ",
    "Đáp án B": "16 giờ",
    "Đáp án C": "19 giờ",
    "Đáp án D": "17 giờ",
    "Đáp án đúng": "A, B, D",
    "Gợi ý cho bé": "Buổi chiều là từ 13 giờ đến 17 giờ (1 giờ chiều đến 5 giờ chiều).",
    "Lời giải thích chi tiết": "Buổi chiều gồm 13h, 14h, 15h, 16h, 17h. Còn 19 giờ thuộc buổi tối."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Những cách nói nào sau đây chỉ CÙNG MỘT MỐC THỜI GIAN? (Chọn các đáp án đúng)",
    "Link ảnh minh họa": "",
    "Đáp án A": "18 giờ",
    "Đáp án B": "6 giờ tối",
    "Đáp án C": "6 giờ sáng",
    "Đáp án D": "18 giờ tối",
    "Đáp án đúng": "A, B",
    "Gợi ý cho bé": "18 giờ chính là 6 giờ tối.",
    "Lời giải thích chi tiết": "18 giờ và 6 giờ tối là cùng một thời điểm. (18 giờ tối là cách nói trùng lặp sai)."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Các mốc thời gian nào sau đây thuộc BUỔI TỐI? (Chọn các đáp án đúng)",
    "Link ảnh minh họa": "",
    "Đáp án A": "18 giờ (6 giờ tối)",
    "Đáp án B": "20 giờ (8 giờ tối)",
    "Đáp án C": "21 giờ (9 giờ tối)",
    "Đáp án D": "23 giờ (11 giờ đêm)",
    "Đáp án đúng": "A, B, C",
    "Gợi ý cho bé": "Buổi tối tính từ 18 giờ đến 21 giờ.",
    "Lời giải thích chi tiết": "Buổi tối tính từ 18h đến 21h (6h tối đến 9h tối). 23 giờ thuộc buổi đêm."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Chọn những khẳng định ĐÚNG về đơn vị đo thời gian:",
    "Link ảnh minh họa": "",
    "Đáp án A": "1 ngày có 24 giờ",
    "Đáp án B": "1 giờ có 60 phút",
    "Đáp án C": "1 giờ có 100 phút",
    "Đáp án D": "12 giờ đêm còn gọi là 24 giờ",
    "Đáp án đúng": "A, B, D",
    "Gợi ý cho bé": "Nhớ lại các quy ước cơ bản giữa ngày, giờ và phút.",
    "Lời giải thích chi tiết": "1 ngày = 24 giờ; 1 giờ = 60 phút; 12 giờ đêm kết thúc một ngày gọi là 24 giờ."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số thích hợp vào chỗ trống: 1 ngày = ___ giờ",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "24",
    "Gợi ý cho bé": "Số giờ trong một ngày đêm.",
    "Lời giải thích chi tiết": "1 ngày có 24 giờ. Số cần điền là 24."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số thích hợp vào chỗ trống: 1 giờ = ___ phút",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "60",
    "Gợi ý cho bé": "Số phút trong 1 giờ đồng hồ.",
    "Lời giải thích chi tiết": "1 giờ = 60 phút. Số cần điền là 60."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "14 giờ tương ứng với ___ giờ chiều.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "2",
    "Gợi ý cho bé": "Lấy 14 trừ đi 12.",
    "Lời giải thích chi tiết": "14 - 12 = 2. Vậy 14 giờ là 2 giờ chiều."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "7 giờ tối còn được gọi là ___ giờ.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "19",
    "Gợi ý cho bé": "Lấy 7 cộng thêm 12.",
    "Lời giải thích chi tiết": "7 + 12 = 19. Vậy 7 giờ tối là 19 giờ."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số: 2 giờ = ___ phút",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "120",
    "Gợi ý cho bé": "Lấy 60 cộng với 60.",
    "Lời giải thích chi tiết": "1 giờ = 60 phút, vậy 2 giờ = 60 x 2 = 120 phút."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền từ thích hợp (sáng, trưa, chiều hay tối): 15 giờ thuộc buổi ___",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "chiều",
    "Gợi ý cho bé": "15 giờ là 3 giờ chiều.",
    "Lời giải thích chi tiết": "15 giờ = 3 giờ chiều, do đó thuộc buổi chiều."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "19 giờ là 8 giờ tối. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Sai",
    "Gợi ý cho bé": "Lấy 19 trừ đi 12 xem ra mấy giờ tối.",
    "Lời giải thích chi tiết": "19 - 12 = 7 giờ tối. Khẳng định trên nói là 8 giờ tối là SAI."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Một ngày bắt đầu từ 12 giờ đêm hôm trước đến 12 giờ đêm hôm sau. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "Khái niệm trọn vẹn một ngày đêm trong 24 giờ.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. Một ngày được tính đủ 24 giờ từ 12 giờ đêm hôm trước đến 12 giờ đêm hôm sau."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "16 giờ chiều và 4 giờ chiều chỉ cùng một thời điểm. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "16 - 12 = 4.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. 16 giờ chính là 4 giờ chiều."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Nửa ngày có 12 giờ. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "Lấy 24 chia cho 2.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. Một ngày có 24 giờ nên nửa ngày là 24 : 2 = 12 giờ."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "90 phút bằng 1 giờ 30 phút. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "1 giờ = 60 phút, 60 phút + 30 phút = 90 phút.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. 1 giờ 30 phút = 60 + 30 = 90 phút."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối giờ theo hệ 24 giờ với cách gọi buổi tương ứng:",
    "Link ảnh minh họa": "",
    "Đáp án A": "13 giờ || 1 giờ chiều",
    "Đáp án B": "16 giờ || 4 giờ chiều",
    "Đáp án C": "20 giờ || 8 giờ tối",
    "Đáp án D": "23 giờ || 11 giờ đêm",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Lấy số giờ trừ đi 12 để tìm giờ theo buổi chiều, tối, đêm.",
    "Lời giải thích chi tiết": "13h = 1h chiều; 16h = 4h chiều; 20h = 8h tối; 23h = 11h đêm."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối các mốc giờ 24h với cách đọc thông thường:",
    "Link ảnh minh họa": "",
    "Đáp án A": "14 giờ || 2 giờ chiều",
    "Đáp án B": "18 giờ || 6 giờ tối",
    "Đáp án C": "21 giờ || 9 giờ tối",
    "Đáp án D": "22 giờ || 10 giờ đêm",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Thực hiện phép trừ với 12.",
    "Lời giải thích chi tiết": "14h - 12 = 2h chiều; 18h - 12 = 6h tối; 21h - 12 = 9h tối; 22h - 12 = 10h đêm."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối khoảng thời gian tương ứng:",
    "Link ảnh minh họa": "",
    "Đáp án A": "1 ngày || 24 giờ",
    "Đáp án B": "1 giờ || 60 phút",
    "Đáp án C": "Nửa giờ || 30 phút",
    "Đáp án D": "Nửa ngày || 12 giờ",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Dựa vào bảng quy đổi đơn vị thời gian chuẩn.",
    "Lời giải thích chi tiết": "1 ngày = 24 giờ; 1 giờ = 60 phút; nửa giờ = 30 phút; nửa ngày = 12 giờ."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối các mốc giờ với buổi trong ngày phù hợp nhất:",
    "Link ảnh minh họa": "",
    "Đáp án A": "8 giờ || Buổi sáng",
    "Đáp án B": "12 giờ || Buổi trưa",
    "Đáp án C": "15 giờ || Buổi chiều",
    "Đáp án D": "20 giờ || Buổi tối",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Xác định buổi sáng, trưa, chiều, tối.",
    "Lời giải thích chi tiết": "8h thuộc sáng; 12h thuộc trưa; 15h thuộc chiều; 20h thuộc tối."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Bé Mai đi ngủ lúc 21 giờ. Lúc đó là mấy giờ tối?",
    "Link ảnh minh họa": "",
    "Đáp án A": "8 giờ tối",
    "Đáp án B": "9 giờ tối",
    "Đáp án C": "10 giờ tối",
    "Đáp án D": "7 giờ tối",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Lấy 21 trừ đi 12.",
    "Lời giải thích chi tiết": "21 - 12 = 9 giờ tối. Vậy bé Mai đi ngủ lúc 9 giờ tối."
  },

  // =========================================================================
  // BÀI 30: NGÀY – THÁNG (30 câu)
  // =========================================================================
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Một năm có bao nhiêu tháng?",
    "Link ảnh minh họa": "",
    "Đáp án A": "10 tháng",
    "Đáp án B": "11 tháng",
    "Đáp án C": "12 tháng",
    "Đáp án D": "14 tháng",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Kể tên các tháng từ tháng 1 đến tháng 12.",
    "Lời giải thích chi tiết": "Một năm có 12 tháng, từ tháng 1 (tháng Giêng) đến tháng 12 (tháng Chạp)."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Một tuần lễ có bao nhiêu ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "5 ngày",
    "Đáp án B": "6 ngày",
    "Đáp án C": "7 ngày",
    "Đáp án D": "8 ngày",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Đếm từ Thứ Hai đến Chủ Nhật.",
    "Lời giải thích chi tiết": "Một tuần lễ có 7 ngày: Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ Nhật."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Tháng nào dưới đây có 31 ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 4",
    "Đáp án B": "Tháng 6",
    "Đáp án C": "Tháng 7",
    "Đáp án D": "Tháng 9",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Dùng quy tắc nắm bàn tay hoặc nhớ các tháng: 1, 3, 5, 7, 8, 10, 12.",
    "Lời giải thích chi tiết": "Tháng 7 có 31 ngày. Các tháng 4, 6, 9 có 30 ngày."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Tháng nào dưới đây chỉ có 30 ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 1",
    "Đáp án B": "Tháng 3",
    "Đáp án C": "Tháng 5",
    "Đáp án D": "Tháng 4",
    "Đáp án đúng": "D",
    "Gợi ý cho bé": "Các tháng có 30 ngày là: 4, 6, 9, 11.",
    "Lời giải thích chi tiết": "Tháng 4 có 30 ngày. Các tháng 1, 3, 5 đều có 31 ngày."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Tháng 2 thường có bao nhiêu ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "28 hoặc 29 ngày",
    "Đáp án B": "30 ngày",
    "Đáp án C": "31 ngày",
    "Đáp án D": "27 ngày",
    "Đáp án đúng": "A",
    "Gợi ý cho bé": "Tháng 2 là tháng đặc biệt nhất trong năm.",
    "Lời giải thích chi tiết": "Tháng 2 có 28 ngày (ở năm thường) hoặc 29 ngày (ở năm nhuận)."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Nếu ngày 8 tháng 3 là thứ Tư thì ngày 15 tháng 3 cùng năm đó là thứ mấy?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Thứ Ba",
    "Đáp án B": "Thứ Tư",
    "Đáp án C": "Thứ Năm",
    "Đáp án D": "Thứ Sáu",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "8 + 7 = 15, tức là đúng 1 tuần sau.",
    "Lời giải thích chi tiết": "Khoảng cách giữa ngày 8 và ngày 15 là 15 - 8 = 7 ngày (tròn 1 tuần lễ). Do đó ngày 15 tháng 3 vẫn là thứ Tư."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Hôm nay là thứ Sáu ngày 10. Thứ Sáu tuần trước là ngày bao nhiêu?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Ngày 2",
    "Đáp án B": "Ngày 3",
    "Đáp án C": "Ngày 4",
    "Đáp án D": "Ngày 17",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Tuần trước thì lấy ngày hôm nay trừ đi 7 ngày.",
    "Lời giải thích chi tiết": "10 - 7 = 3. Vậy thứ Sáu tuần trước là ngày 3."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Ngày Quốc tế Thiếu nhi 1 tháng 6 thuộc về tháng có bao nhiêu ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "28 ngày",
    "Đáp án B": "29 ngày",
    "Đáp án C": "30 ngày",
    "Đáp án D": "31 ngày",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Tháng 6 có bao nhiêu ngày?",
    "Lời giải thích chi tiết": "Tháng 6 là tháng có 30 ngày."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Ngày liền sau của ngày 31 tháng 12 là ngày nào?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Ngày 1 tháng 12",
    "Đáp án B": "Ngày 1 tháng 1 năm sau",
    "Đáp án C": "Ngày 32 tháng 12",
    "Đáp án D": "Ngày 30 tháng 12",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Ngày 31 tháng 12 là ngày cuối cùng của năm.",
    "Lời giải thích chi tiết": "Ngày 31 tháng 12 là ngày cuối năm, ngày tiếp theo sẽ là ngày 1 tháng 1 (Tết Dương lịch) của năm mới."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Có bao nhiêu tháng trong năm có 31 ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "5 tháng",
    "Đáp án B": "6 tháng",
    "Đáp án C": "7 tháng",
    "Đáp án D": "8 tháng",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Các tháng 1, 3, 5, 7, 8, 10, 12.",
    "Lời giải thích chi tiết": "Có tất cả 7 tháng có 31 ngày: Tháng 1, Tháng 3, Tháng 5, Tháng 7, Tháng 8, Tháng 10, Tháng 12."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Những tháng nào dưới đây CÓ 31 NGÀY? (Chọn tất cả các đáp án đúng)",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 1",
    "Đáp án B": "Tháng 3",
    "Đáp án C": "Tháng 4",
    "Đáp án D": "Tháng 8",
    "Đáp án đúng": "A, B, D",
    "Gợi ý cho bé": "Tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày.",
    "Lời giải thích chi tiết": "Tháng 1, tháng 3 và tháng 8 có 31 ngày. Tháng 4 có 30 ngày."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Những tháng nào dưới đây CÓ 30 NGÀY? (Chọn tất cả các đáp án đúng)",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 4",
    "Đáp án B": "Tháng 6",
    "Đáp án C": "Tháng 9",
    "Đáp án D": "Tháng 11",
    "Đáp án đúng": "A, B, C, D",
    "Gợi ý cho bé": "Các tháng có 30 ngày là 4, 6, 9, 11.",
    "Lời giải thích chi tiết": "Cả 4 tháng trên (tháng 4, 6, 9, 11) đều có đúng 30 ngày."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Hai tháng liền kề nhau trong cùng một năm mà ĐỀU CÓ 31 NGÀY là:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 6 và Tháng 7",
    "Đáp án B": "Tháng 7 và Tháng 8",
    "Đáp án C": "Tháng 12 và Tháng 1 năm sau",
    "Đáp án D": "Tháng 8 và Tháng 9",
    "Đáp án đúng": "B, C",
    "Gợi ý cho bé": "Nhớ 2 tháng mùa hè liền nhau và tháng giao năm cũ - năm mới.",
    "Lời giải thích chi tiết": "Tháng 7 và tháng 8 đều có 31 ngày; Tháng 12 và Tháng 1 năm sau cũng đều có 31 ngày."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Các ngày nào dưới đây là ngày nghỉ cuối tuần thường lệ của học sinh?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Thứ Sáu",
    "Đáp án B": "Thứ Bảy",
    "Đáp án C": "Chủ Nhật",
    "Đáp án D": "Thứ Hai",
    "Đáp án đúng": "B, C",
    "Gợi ý cho bé": "Hai ngày cuối tuần mà các em được nghỉ ở nhà với bố mẹ.",
    "Lời giải thích chi tiết": "Hai ngày nghỉ cuối tuần thông thường là Thứ Bảy và Chủ Nhật."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số thích hợp: 1 tuần lễ = ___ ngày",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "7",
    "Gợi ý cho bé": "Số ngày từ thứ Hai đến Chủ Nhật.",
    "Lời giải thích chi tiết": "1 tuần lễ có 7 ngày. Số cần điền là 7."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số: Tháng 12 có ___ ngày.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "31",
    "Gợi ý cho bé": "Tháng cuối cùng trong năm có bao nhiêu ngày?",
    "Lời giải thích chi tiết": "Tháng 12 có 31 ngày. Số cần điền là 31."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số: Tháng 9 có ___ ngày.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "30",
    "Gợi ý cho bé": "Tháng tựu trường khai giảng có 30 ngày.",
    "Lời giải thích chi tiết": "Tháng 9 có 30 ngày. Số cần điền là 30."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Nếu ngày 2 tháng 10 là Chủ Nhật thì ngày Chủ Nhật tiếp theo là ngày ___ tháng 10.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "9",
    "Gợi ý cho bé": "Lấy 2 cộng thêm 7 ngày.",
    "Lời giải thích chi tiết": "2 + 7 = 9. Vậy Chủ Nhật tuần sau là ngày 9 tháng 10."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số: Một năm có ___ tháng.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "12",
    "Gợi ý cho bé": "Từ tháng 1 đến tháng 12.",
    "Lời giải thích chi tiết": "Một năm có 12 tháng. Số cần điền là 12."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền từ: Ngày liền sau của ngày Thứ Bảy là ___",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Chủ Nhật",
    "Gợi ý cho bé": "Ngày cuối cùng của tuần lễ.",
    "Lời giải thích chi tiết": "Ngày liền sau của Thứ Bảy là Chủ Nhật."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Tháng 8 có 30 ngày. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Sai",
    "Gợi ý cho bé": "Tháng 8 cùng với tháng 7 đều có 31 ngày.",
    "Lời giải thích chi tiết": "Tháng 8 có 31 ngày. Khẳng định nói 30 ngày là SAI."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Một năm có đúng 4 tháng có 30 ngày. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "Đó là các tháng 4, 6, 9, 11.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. Có 4 tháng có 30 ngày là tháng 4, 6, 9, 11."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Ngày 30 tháng 2 là ngày sinh nhật của bạn An. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Sai",
    "Gợi ý cho bé": "Tháng 2 chỉ có nhiều nhất là 29 ngày.",
    "Lời giải thích chi tiết": "Khẳng định SAI vì tháng 2 chỉ có tối đa 28 hoặc 29 ngày, không bao giờ có ngày 30."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Tháng 10 và tháng 11 đều có 31 ngày. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Sai",
    "Gợi ý cho bé": "Tháng 10 có 31 ngày nhưng tháng 11 có bao nhiêu ngày?",
    "Lời giải thích chi tiết": "Khẳng định SAI. Tháng 10 có 31 ngày nhưng tháng 11 có 30 ngày."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Nếu ngày 20 là Thứ Hai thì ngày 27 cùng tháng đó cũng là Thứ Hai. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "20 + 7 = 27 (cách đúng 1 tuần).",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG vì khoảng cách là 27 - 20 = 7 ngày (1 tuần lễ), cùng thứ."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối các tháng sau với số ngày chính xác của tháng đó:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 1 || 31 ngày",
    "Đáp án B": "Tháng 4 || 30 ngày",
    "Đáp án C": "Tháng 2 || 28 hoặc 29 ngày",
    "Đáp án D": "Tháng 12 || 31 ngày",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Nhớ số ngày của từng tháng trong năm.",
    "Lời giải thích chi tiết": "Tháng 1: 31 ngày; Tháng 4: 30 ngày; Tháng 2: 28/29 ngày; Tháng 12: 31 ngày."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối ngày lễ lớn với ngày tháng tương ứng:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tết Dương lịch || Ngày 1 tháng 1",
    "Đáp án B": "Ngày Quốc tế Thiếu nhi || Ngày 1 tháng 6",
    "Đáp án C": "Ngày Quốc khánh Việt Nam || Ngày 2 tháng 9",
    "Đáp án D": "Ngày Nhà giáo Việt Nam || Ngày 20 tháng 11",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Liên hệ các ngày kỷ niệm quen thuộc trong năm học.",
    "Lời giải thích chi tiết": "Tết Dương lịch: 1/1; Quốc tế Thiếu nhi: 1/6; Quốc khánh: 2/9; Nhà giáo VN: 20/11."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối thứ trong tuần với thứ liền kề sau đó:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Thứ Hai || Thứ Ba",
    "Đáp án B": "Thứ Tư || Thứ Năm",
    "Đáp án C": "Thứ Sáu || Thứ Bảy",
    "Đáp án D": "Chủ Nhật || Thứ Hai tuần sau",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Thứ tự tuần hoàn các ngày trong tuần lễ.",
    "Lời giải thích chi tiết": "Thứ Hai -> Thứ Ba; Thứ Tư -> Thứ Năm; Thứ Sáu -> Thứ Bảy; Chủ Nhật -> Thứ Hai tuần sau."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối các tháng theo số ngày trong tháng:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 3 || Có 31 ngày",
    "Đáp án B": "Tháng 6 || Có 30 ngày",
    "Đáp án C": "Tháng 11 || Có 30 ngày",
    "Đáp án D": "Tháng 10 || Có 31 ngày",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Xem tháng nào có 30 ngày, tháng nào có 31 ngày.",
    "Lời giải thích chi tiết": "Tháng 3: 31 ngày; Tháng 6: 30 ngày; Tháng 11: 30 ngày; Tháng 10: 31 ngày."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Nếu ngày 29 tháng 4 là thứ Năm thì ngày 1 tháng 5 cùng năm đó là thứ mấy?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Thứ Sáu",
    "Đáp án B": "Thứ Bảy",
    "Đáp án C": "Chủ Nhật",
    "Đáp án D": "Thứ Hai",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Tháng 4 có 30 ngày. Đếm tiếp: 29/4 (Thứ 5) -> 30/4 (Thứ 6) -> 1/5 (Thứ ?).",
    "Lời giải thích chi tiết": "Tháng 4 có 30 ngày. Ngày 29/4 là thứ Năm, ngày 30/4 là thứ Sáu, do đó ngày 1/5 là Thứ Bảy."
  },

  // =========================================================================
  // BÀI 31: THỰC HÀNH VÀ TRẢI NGHIỆM XEM ĐỒNG HỒ, XEM LỊCH (30 câu)
  // =========================================================================
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Đồng hồ có kim ngắn chỉ số 8, kim dài chỉ số 12. Đồng hồ chỉ mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "12 giờ 8 phút",
    "Đáp án B": "8 giờ đúng",
    "Đáp án C": "8 giờ 12 phút",
    "Đáp án D": "8 giờ 30 phút",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Kim dài chỉ số 12 là giờ đúng (00 phút).",
    "Lời giải thích chi tiết": "Kim ngắn chỉ số 8 (8 giờ), kim dài chỉ số 12 (00 phút). Vậy đồng hồ chỉ 8 giờ đúng."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Đồng hồ có kim ngắn chỉ qua số 9 một chút, kim dài chỉ số 3. Đồng hồ chỉ mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "9 giờ 3 phút",
    "Đáp án B": "9 giờ 15 phút",
    "Đáp án C": "3 giờ 45 phút",
    "Đáp án D": "9 giờ 30 phút",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Mỗi số trên mặt đồng hồ ứng với 5 phút (số 3 tương ứng 5 x 3 = 15 phút).",
    "Lời giải thích chi tiết": "Kim dài chỉ số 3 tương ứng với 15 phút. Vậy đồng hồ chỉ 9 giờ 15 phút."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Đồng hồ có kim ngắn ở giữa số 2 và số 3, kim dài chỉ số 6. Đồng hồ chỉ mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "2 giờ 6 phút",
    "Đáp án B": "2 giờ 30 phút (2 giờ rưỡi)",
    "Đáp án C": "3 giờ 30 phút",
    "Đáp án D": "6 giờ 15 phút",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Kim dài chỉ số 6 là 30 phút (giờ rưỡi).",
    "Lời giải thích chi tiết": "Kim dài chỉ số 6 là 30 phút. Kim ngắn qua số 2. Vậy là 2 giờ 30 phút (2 giờ rưỡi)."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Đồng hồ điện tử hiển thị '14 : 30'. Cách đọc nào sau đây đúng?",
    "Link ảnh minh họa": "",
    "Đáp án A": "14 giờ 30 phút (hay 2 giờ rưỡi chiều)",
    "Đáp án B": "2 giờ 30 phút sáng",
    "Đáp án C": "4 giờ 30 phút chiều",
    "Đáp án D": "14 giờ kém 30 phút",
    "Đáp án đúng": "A",
    "Gợi ý cho bé": "14 - 12 = 2 giờ chiều.",
    "Lời giải thích chi tiết": "14:30 đọc là 14 giờ 30 phút hay 2 giờ rưỡi chiều."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Một tiết học bắt đầu lúc 8 giờ và kết thúc lúc 8 giờ 35 phút. Tiết học đó kéo dài bao nhiêu phút?",
    "Link ảnh minh họa": "",
    "Đáp án A": "30 phút",
    "Đáp án B": "35 phút",
    "Đáp án C": "40 phút",
    "Đáp án D": "45 phút",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Lấy 8 giờ 35 phút trừ đi 8 giờ.",
    "Lời giải thích chi tiết": "Thời gian kéo dài: 8 giờ 35 phút - 8 giờ = 35 phút."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Bé Lan bắt đầu xem phim hoạt hình lúc 19 giờ 15 phút và xem xong lúc 19 giờ 45 phút. Bộ phim dài bao lâu?",
    "Link ảnh minh họa": "",
    "Đáp án A": "15 phút",
    "Đáp án B": "20 phút",
    "Đáp án C": "30 phút",
    "Đáp án D": "45 phút",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Lấy 45 phút trừ 15 phút.",
    "Lời giải thích chi tiết": "45 phút - 15 phút = 30 phút."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Xem tờ lịch block thấy ghi: Thứ Tư, Ngày 15, Tháng 10. Ngày mai sẽ là:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Thứ Ba, Ngày 14 Tháng 10",
    "Đáp án B": "Thứ Năm, Ngày 16 Tháng 10",
    "Đáp án C": "Thứ Năm, Ngày 15 Tháng 10",
    "Đáp án D": "Thứ Sáu, Ngày 16 Tháng 10",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Ngày mai thì thứ tăng lên 1 và ngày tăng lên 1.",
    "Lời giải thích chi tiết": "Thứ Tư tiếp theo là Thứ Năm; Ngày 15 tiếp theo là Ngày 16. Vậy là Thứ Năm, Ngày 16 Tháng 10."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Đồng hồ chỉ 7 giờ 15 phút. Khi kim phút quay đến số 6 thì đồng hồ chỉ mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "7 giờ 30 phút",
    "Đáp án B": "7 giờ 45 phút",
    "Đáp án C": "8 giờ đúng",
    "Đáp án D": "8 giờ 30 phút",
    "Đáp án đúng": "A",
    "Gợi ý cho bé": "Kim dài chỉ số 6 là 30 phút.",
    "Lời giải thích chi tiết": "Khi kim phút quay từ số 3 (15 phút) đến số 6 (30 phút), đồng hồ sẽ chỉ 7 giờ 30 phút."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Bạn Minh vào lớp học bơi lúc 16 giờ và bơi trong 1 giờ. Minh kết thúc buổi học lúc mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "16 giờ 30 phút",
    "Đáp án B": "17 giờ (5 giờ chiều)",
    "Đáp án C": "18 giờ",
    "Đáp án D": "15 giờ",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "16 + 1 = 17 giờ.",
    "Lời giải thích chi tiết": "16 giờ + 1 giờ = 17 giờ (tức 5 giờ chiều)."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Quan sát tờ lịch tháng 3, ngày 26 tháng 3 là ngày thành lập Đoàn TNCS Hồ Chí Minh rơi vào Thứ Bảy. Vậy ngày 19 tháng 3 là thứ mấy?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Thứ Sáu",
    "Đáp án B": "Thứ Bảy",
    "Đáp án C": "Chủ Nhật",
    "Đáp án D": "Thứ Năm",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "26 - 19 = 7 ngày (tròn 1 tuần trước).",
    "Lời giải thích chi tiết": "26 - 19 = 7 ngày. Cách nhau đúng 1 tuần lễ nên ngày 19 tháng 3 cũng là Thứ Bảy."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Những đồng hồ nào dưới đây đang chỉ thời gian BUỔI CHIỀU HOẶC TỐI? (Chọn tất cả các đáp án đúng)",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đồng hồ A: 15 : 00",
    "Đáp án B": "Đồng hồ B: 08 : 30",
    "Đáp án C": "Đồng hồ C: 20 : 15",
    "Đáp án D": "Đồng hồ D: 17 : 45",
    "Đáp án đúng": "A, C, D",
    "Gợi ý cho bé": "Các giờ từ 13:00 trở đi thuộc buổi chiều/tối/đêm.",
    "Lời giải thích chi tiết": "15:00 (3h chiều), 20:15 (8h15 tối), 17:45 (5h45 chiều) đều thuộc buổi chiều và tối. 08:30 thuộc buổi sáng."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Khi kim phút chỉ vào SỐ 6 trên mặt đồng hồ thì có những cách gọi nào đúng?",
    "Link ảnh minh họa": "",
    "Đáp án A": "30 phút",
    "Đáp án B": "Rưỡi",
    "Đáp án C": "15 phút",
    "Đáp án D": "Nửa giờ",
    "Đáp án đúng": "A, B, D",
    "Gợi ý cho bé": "Kim phút chỉ số 6 là nửa vòng đồng hồ.",
    "Lời giải thích chi tiết": "Số 6 tương ứng 30 phút, còn gọi là rưỡi hay nửa giờ."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Chọn các phát biểu ĐÚNG khi xem lịch và đồng hồ:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Kim ngắn chỉ giờ, kim dài chỉ phút",
    "Đáp án B": "Một ngày kim giờ quay trọn vẹn 2 vòng quanh mặt đồng hồ",
    "Đáp án C": "Khi kim dài chỉ số 3 là đúng 15 phút",
    "Đáp án D": "Khi kim dài chỉ số 12 là đúng 60 giờ",
    "Đáp án đúng": "A, B, C",
    "Gợi ý cho bé": "Mỗi vòng kim giờ là 12 giờ, 1 ngày 24 giờ là 2 vòng.",
    "Lời giải thích chi tiết": "A, B, C đúng. D sai vì kim dài chỉ số 12 là 00 phút (hoặc trọn 60 phút của 1 giờ, không phải 60 giờ)."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Trên tờ lịch ngày (lịch block), em có thể đọc được những thông tin nào?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Thứ trong tuần (Thứ Hai, Thứ Ba...)",
    "Đáp án B": "Ngày và tháng dương lịch",
    "Đáp án C": "Ngày và tháng âm lịch",
    "Đáp án D": "Dự báo thời tiết 10 ngày tới",
    "Đáp án đúng": "A, B, C",
    "Gợi ý cho bé": "Quan sát tờ lịch treo tường hàng ngày trong nhà.",
    "Lời giải thích chi tiết": "Tờ lịch block hàng ngày cho biết: Thứ, ngày tháng dương lịch, ngày tháng âm lịch."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Đồng hồ chỉ 10 giờ rưỡi tức là 10 giờ ___ phút.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "30",
    "Gợi ý cho bé": "'Rưỡi' tương ứng với bao nhiêu phút?",
    "Lời giải thích chi tiết": "10 giờ rưỡi = 10 giờ 30 phút. Số cần điền là 30."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Khi kim dài của đồng hồ chỉ vào số 3 thì chỉ ___ phút.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "15",
    "Gợi ý cho bé": "3 x 5 = 15 phút.",
    "Lời giải thích chi tiết": "Kim dài chỉ số 3 là 15 phút. Số cần điền là 15."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Đồng hồ điện tử hiển thị '21 : 00' tương ứng với ___ giờ tối.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "9",
    "Gợi ý cho bé": "21 - 12 = 9.",
    "Lời giải thích chi tiết": "21 - 12 = 9. Vậy 21:00 là 9 giờ tối."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Hôm nay là thứ Ba ngày 5. Thứ Ba tuần sau là ngày ___",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "12",
    "Gợi ý cho bé": "Lấy 5 + 7 ngày.",
    "Lời giải thích chi tiết": "5 + 7 = 12. Vậy thứ Ba tuần sau là ngày 12."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Kim ngắn chỉ giữa số 4 và số 5, kim dài chỉ số 6. Đồng hồ chỉ 4 giờ ___ phút.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "30",
    "Gợi ý cho bé": "Kim dài ở số 6 là bao nhiêu phút?",
    "Lời giải thích chi tiết": "Kim dài chỉ số 6 là 30 phút. Đồng hồ chỉ 4 giờ 30 phút."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Nếu hôm nay là Chủ Nhật ngày 14 thì hôm qua là thứ Bảy ngày ___",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "13",
    "Gợi ý cho bé": "Ngày hôm qua thì trừ đi 1 ngày.",
    "Lời giải thích chi tiết": "14 - 1 = 13. Vậy hôm qua là ngày 13."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Khi kim phút chỉ vào số 12 thì luôn là giờ đúng (00 phút). Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "Vị trí bắt đầu của vòng kim phút.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. Khi kim dài (kim phút) chỉ đúng số 12 tức là 00 phút (giờ đúng)."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Đồng hồ chỉ 11 giờ 15 phút nghĩa là kim dài đang chỉ vào số 3. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "15 phút tương ứng với số 3 trên mặt đồng hồ.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. Số 3 trên đồng hồ tương ứng với 15 phút."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Học sinh vào học lúc 7 giờ 30 phút và tan học lúc 11 giờ 30 phút nghĩa là học trong 5 giờ. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Sai",
    "Gợi ý cho bé": "Lấy 11 giờ 30 phút trừ đi 7 giờ 30 phút.",
    "Lời giải thích chi tiết": "11 giờ 30 - 7 giờ 30 = 4 giờ. Khẳng định nói 5 giờ là SAI."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Kim ngắn chạy nhanh hơn kim dài. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Sai",
    "Gợi ý cho bé": "Kim dài quay 1 vòng trong 1 giờ, kim ngắn mất 12 giờ mới quay 1 vòng.",
    "Lời giải thích chi tiết": "Khẳng định SAI. Kim dài (kim phút) chạy nhanh hơn kim ngắn (kim giờ)."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Đồng hồ hiển thị 12:00 ban ngày là 12 giờ trưa. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "Thời điểm giữa ngày.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. 12:00 ban ngày là 12 giờ trưa (chính ngọ)."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối vị trí kim dài (kim phút) với số phút tương ứng:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Kim dài chỉ số 12 || 00 phút (giờ đúng)",
    "Đáp án B": "Kim dài chỉ số 3 || 15 phút",
    "Đáp án C": "Kim dài chỉ số 6 || 30 phút (rưỡi)",
    "Đáp án D": "Kim dài chỉ số 9 || 45 phút",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Nhớ mỗi số cách nhau 5 phút.",
    "Lời giải thích chi tiết": "Số 12: 00 phút; Số 3: 15 phút; Số 6: 30 phút; Số 9: 45 phút."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối giờ điện tử với cách đọc quen thuộc:",
    "Link ảnh minh họa": "",
    "Đáp án A": "06 : 15 || Sáu giờ mười lăm phút sáng",
    "Đáp án B": "11 : 30 || Mười một giờ rưỡi trưa",
    "Đáp án C": "16 : 00 || Bốn giờ chiều",
    "Đáp án D": "20 : 30 || Tám giờ rưỡi tối",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Đọc giờ kèm theo buổi phù hợp.",
    "Lời giải thích chi tiết": "06:15 -> 6h15 sáng; 11:30 -> 11h30 trưa; 16:00 -> 4h chiều; 20:30 -> 8h30 tối."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối hoạt động trong ngày với thời gian hợp lý của học sinh:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tập thể dục buổi sáng || 6 giờ sáng",
    "Đáp án B": "Ăn cơm trưa ở trường || 11 giờ 30 phút trưa",
    "Đáp án C": "Tan học về nhà || 16 giờ 30 phút chiều",
    "Đáp án D": "Lên giường đi ngủ || 21 giờ tối",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Thời gian biểu sinh hoạt lành mạnh hàng ngày của em.",
    "Lời giải thích chi tiết": "6h sáng: tập thể dục; 11h30: ăn trưa; 16h30: tan học; 21h: đi ngủ."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối các ngày đặc biệt với thứ trong tuần nếu ngày 1 là Thứ Hai:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Ngày 1 || Thứ Hai",
    "Đáp án B": "Ngày 3 || Thứ Tư",
    "Đáp án C": "Ngày 6 || Thứ Bảy",
    "Đáp án D": "Ngày 7 || Chủ Nhật",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Đếm tịnh tiến từng ngày từ Thứ Hai.",
    "Lời giải thích chi tiết": "Ngày 1: Thứ Hai -> Ngày 3: Thứ Tư -> Ngày 6: Thứ Bảy -> Ngày 7: Chủ Nhật."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Bố Nam đi công tác từ sáng Thứ Hai đến chiều Thứ Sáu cùng tuần. Bố Nam đi công tác bao nhiêu ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "3 ngày",
    "Đáp án B": "4 ngày",
    "Đáp án C": "5 ngày",
    "Đáp án D": "6 ngày",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Đếm các ngày: Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu.",
    "Lời giải thích chi tiết": "Gồm 5 ngày: Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6."
  },

  // =========================================================================
  // BÀI 32: LUYỆN TẬP CHUNG (30 câu)
  // =========================================================================
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "So sánh: 1 giờ và 50 phút. Dấu thích hợp là:",
    "Link ảnh minh họa": "",
    "Đáp án A": ">",
    "Đáp án B": "<",
    "Đáp án C": "=",
    "Đáp án D": "Không so sánh được",
    "Đáp án đúng": "A",
    "Gợi ý cho bé": "Đổi 1 giờ = 60 phút rồi so sánh với 50 phút.",
    "Lời giải thích chi tiết": "1 giờ = 60 phút. Vì 60 phút > 50 phút nên 1 giờ > 50 phút."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "So sánh: 1 ngày và 20 giờ. Dấu thích hợp là:",
    "Link ảnh minh họa": "",
    "Đáp án A": "<",
    "Đáp án B": ">",
    "Đáp án C": "=",
    "Đáp án D": "Không có dấu",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "1 ngày = 24 giờ.",
    "Lời giải thích chi tiết": "1 ngày = 24 giờ. Vì 24 giờ > 20 giờ nên 1 ngày > 20 giờ."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "So sánh: 2 tuần lễ và 14 ngày. Dấu thích hợp là:",
    "Link ảnh minh họa": "",
    "Đáp án A": ">",
    "Đáp án B": "<",
    "Đáp án C": "=",
    "Đáp án D": "Khác nhau",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "1 tuần lễ có 7 ngày, vậy 2 tuần lễ có bao nhiêu ngày?",
    "Lời giải thích chi tiết": "1 tuần = 7 ngày -> 2 tuần = 7 x 2 = 14 ngày. Do đó 2 tuần = 14 ngày."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Hùng đi bộ từ nhà đến trường hết 15 phút. Hùng đến trường lúc 7 giờ 15 phút. Hùng bắt đầu đi từ nhà lúc mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "7 giờ đúng",
    "Đáp án B": "7 giờ 30 phút",
    "Đáp án C": "6 giờ 45 phút",
    "Đáp án D": "7 giờ 10 phút",
    "Đáp án đúng": "A",
    "Gợi ý cho bé": "Lấy giờ đến trường trừ đi thời gian đi đường: 7 giờ 15 phút - 15 phút.",
    "Lời giải thích chi tiết": "7 giờ 15 phút - 15 phút = 7 giờ đúng."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Mẹ đi chợ từ lúc 8 giờ sáng đến 8 giờ 45 phút sáng. Hỏi mẹ đi chợ hết bao nhiêu thời gian?",
    "Link ảnh minh họa": "",
    "Đáp án A": "30 phút",
    "Đáp án B": "40 phút",
    "Đáp án C": "45 phút",
    "Đáp án D": "1 giờ",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Lấy 8 giờ 45 phút trừ đi 8 giờ.",
    "Lời giải thích chi tiết": "8 giờ 45 phút - 8 giờ = 45 phút."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Trong các khoảng thời gian sau, khoảng thời gian nào DÀI NHẤT?",
    "Link ảnh minh họa": "",
    "Đáp án A": "30 phút",
    "Đáp án B": "1 giờ",
    "Đáp án C": "45 phút",
    "Đáp án D": "55 phút",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Đổi 1 giờ = 60 phút để so sánh.",
    "Lời giải thích chi tiết": "1 giờ = 60 phút. Vì 60 phút > 55 phút > 45 phút > 30 phút nên 1 giờ là dài nhất."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Nếu ngày 28 tháng 5 là thứ Sáu thì ngày 1 tháng 6 cùng năm đó là thứ mấy?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Chủ Nhật",
    "Đáp án B": "Thứ Hai",
    "Đáp án C": "Thứ Ba",
    "Đáp án D": "Thứ Tư",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Tháng 5 có 31 ngày: 28 (T6) -> 29 (T7) -> 30 (CN) -> 31 (T2) -> 1/6 (T3).",
    "Lời giải thích chi tiết": "Tháng 5 có 31 ngày. Ngày 28 (T6), 29 (T7), 30 (CN), 31 (T2). Vậy ngày 1 tháng 6 là Thứ Ba."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Đồng hồ chạy nhanh 15 phút. Hiện đồng hồ chỉ 9 giờ 15 phút. Giờ đúng thực tế là mấy giờ?",
    "Link ảnh minh họa": "",
    "Đáp án A": "9 giờ 30 phút",
    "Đáp án B": "9 giờ đúng",
    "Đáp án C": "8 giờ 45 phút",
    "Đáp án D": "10 giờ đúng",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Vì đồng hồ chạy nhanh nên phải trừ bớt 15 phút đi.",
    "Lời giải thích chi tiết": "Giờ thực tế = 9 giờ 15 phút - 15 phút = 9 giờ đúng."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Một trận bóng đá mini của học sinh bắt đầu lúc 15 giờ 30 phút và kết thúc lúc 16 giờ 15 phút. Trận đấu kéo dài bao nhiêu phút?",
    "Link ảnh minh họa": "",
    "Đáp án A": "30 phút",
    "Đáp án B": "40 phút",
    "Đáp án C": "45 phút",
    "Đáp án D": "50 phút",
    "Đáp án đúng": "C",
    "Gợi ý cho bé": "Từ 15h30 đến 16h00 là 30 phút, thêm 15 phút nữa là bao nhiêu?",
    "Lời giải thích chi tiết": "Từ 15h30 đến 16h00 là 30 phút; từ 16h00 đến 16h15 là 15 phút. Tổng thời gian = 30 + 15 = 45 phút."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Tháng nào sau đây có ít ngày nhất trong năm?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 1",
    "Đáp án B": "Tháng 2",
    "Đáp án C": "Tháng 4",
    "Đáp án D": "Tháng 11",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Tháng này chỉ có 28 hoặc 29 ngày.",
    "Lời giải thích chi tiết": "Tháng 2 chỉ có 28 hoặc 29 ngày, là tháng có ít ngày nhất trong năm."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Những phép so sánh nào dưới đây là ĐÚNG? (Chọn tất cả các đáp án đúng)",
    "Link ảnh minh họa": "",
    "Đáp án A": "1 giờ > 50 phút",
    "Đáp án B": "1 ngày = 24 giờ",
    "Đáp án C": "7 ngày < 1 tuần lễ",
    "Đáp án D": "65 phút > 1 giờ",
    "Đáp án đúng": "A, B, D",
    "Gợi ý cho bé": "Đổi về cùng đơn vị để so sánh.",
    "Lời giải thích chi tiết": "A đúng (60p > 50p); B đúng (24h = 24h); D đúng (65p > 60p). C sai vì 7 ngày = 1 tuần lễ."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Những tháng nào dưới đây đều có 31 ngày?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng 5",
    "Đáp án B": "Tháng 7",
    "Đáp án C": "Tháng 9",
    "Đáp án D": "Tháng 10",
    "Đáp án đúng": "A, B, D",
    "Gợi ý cho bé": "Tháng 5, 7, 10 có 31 ngày. Tháng 9 có bao nhiêu ngày?",
    "Lời giải thích chi tiết": "Tháng 5, tháng 7, tháng 10 có 31 ngày. Tháng 9 có 30 ngày."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Bé An học bài từ 19 giờ 30 phút đến 20 giờ 30 phút. Những nhận xét nào sau đây ĐÚNG?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Bé An học bài trong thời gian 1 giờ",
    "Đáp án B": "Bé An học bài trong thời gian 60 phút",
    "Đáp án C": "Bé An học bài vào buổi tối",
    "Đáp án D": "Bé An học bài vào buổi chiều",
    "Đáp án đúng": "A, B, C",
    "Gợi ý cho bé": "Khoảng cách từ 19h30 đến 20h30 là 1 giờ = 60 phút.",
    "Lời giải thích chi tiết": "Khoảng thời gian: 20h30 - 19h30 = 1 giờ = 60 phút. Mốc 19h30 - 20h30 thuộc buổi tối. A, B, C đều đúng."
  },
  {
    "Loại câu hỏi": "multiple_select",
    "Nội dung câu hỏi": "Các cách viết nào biểu thị cùng một thời điểm với '3 giờ chiều'?",
    "Link ảnh minh họa": "",
    "Đáp án A": "15 giờ",
    "Đáp án B": "15 : 00",
    "Đáp án C": "3 giờ tối",
    "Đáp án D": "15 giờ 00 phút",
    "Đáp án đúng": "A, B, D",
    "Gợi ý cho bé": "3 + 12 = 15 giờ.",
    "Lời giải thích chi tiết": "3 giờ chiều = 15 giờ = 15:00 = 15 giờ 00 phút."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số thích hợp: 1 giờ 15 phút = ___ phút.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "75",
    "Gợi ý cho bé": "Lấy 60 phút + 15 phút.",
    "Lời giải thích chi tiết": "1 giờ 15 phút = 60 + 15 = 75 phút."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số: 1 ngày 4 giờ = ___ giờ.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "28",
    "Gợi ý cho bé": "1 ngày = 24 giờ, 24 + 4 = ?",
    "Lời giải thích chi tiết": "24 + 4 = 28 giờ. Số cần điền là 28."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Bạn Hoa vẽ tranh từ 14 giờ đến 15 giờ 30 phút. Hoa đã vẽ tranh trong ___ phút.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "90",
    "Gợi ý cho bé": "1 giờ 30 phút đổi ra phút.",
    "Lời giải thích chi tiết": "15 giờ 30 - 14 giờ = 1 giờ 30 phút = 60 + 30 = 90 phút."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số: 3 tuần lễ = ___ ngày.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "21",
    "Gợi ý cho bé": "Lấy 7 nhân với 3.",
    "Lời giải thích chi tiết": "7 x 3 = 21 ngày. Số cần điền là 21."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Nếu hôm nay là thứ Sáu ngày 13 thì thứ Sáu tuần sau là ngày ___",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "20",
    "Gợi ý cho bé": "13 + 7 = ?",
    "Lời giải thích chi tiết": "13 + 7 = 20. Vậy thứ Sáu tuần sau là ngày 20."
  },
  {
    "Loại câu hỏi": "fill_blank",
    "Nội dung câu hỏi": "Điền số: 1 giờ rưỡi = ___ phút.",
    "Link ảnh minh họa": "",
    "Đáp án A": "",
    "Đáp án B": "",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "90",
    "Gợi ý cho bé": "1 giờ là 60 phút, rưỡi là 30 phút.",
    "Lời giải thích chi tiết": "60 + 30 = 90 phút. Số cần điền là 90."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "1 giờ 20 phút bằng 80 phút. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "60 + 20 = 80.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. 1 giờ = 60 phút, 60 + 20 = 80 phút."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Tháng 2 luôn luôn có 30 ngày. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Sai",
    "Gợi ý cho bé": "Tháng 2 chỉ có 28 hoặc 29 ngày.",
    "Lời giải thích chi tiết": "Khẳng định SAI. Tháng 2 chỉ có 28 hoặc 29 ngày, không bao giờ có 30 ngày."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "Khoảng cách từ 8 giờ sáng đến 10 giờ sáng cùng ngày là 2 giờ. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "10 - 8 = 2.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. 10 - 8 = 2 giờ."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "30 ngày nhiều hơn 4 tuần lễ. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Đúng",
    "Gợi ý cho bé": "4 tuần lễ = 7 x 4 = 28 ngày. 30 ngày > 28 ngày.",
    "Lời giải thích chi tiết": "Khẳng định ĐÚNG. 4 tuần lễ = 28 ngày. 30 ngày > 28 ngày."
  },
  {
    "Loại câu hỏi": "true_false",
    "Nội dung câu hỏi": "23 giờ là 10 giờ đêm. Đúng hay Sai?",
    "Link ảnh minh họa": "",
    "Đáp án A": "Đúng",
    "Đáp án B": "Sai",
    "Đáp án C": "",
    "Đáp án D": "",
    "Đáp án đúng": "Sai",
    "Gợi ý cho bé": "23 - 12 = 11.",
    "Lời giải thích chi tiết": "Khẳng định SAI. 23 - 12 = 11 giờ đêm (không phải 10 giờ đêm)."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối các khoảng thời gian bằng nhau:",
    "Link ảnh minh họa": "",
    "Đáp án A": "1 giờ 15 phút || 75 phút",
    "Đáp án B": "1 giờ 30 phút || 90 phút",
    "Đáp án C": "1 ngày || 24 giờ",
    "Đáp án D": "2 tuần lễ || 14 ngày",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Quy đổi về cùng một đơn vị đo thời gian.",
    "Lời giải thích chi tiết": "1h15p = 75p; 1h30p = 90p; 1 ngày = 24h; 2 tuần = 14 ngày."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối phép tính với kết quả thời gian tương ứng:",
    "Link ảnh minh họa": "",
    "Đáp án A": "2 giờ + 3 giờ || 5 giờ",
    "Đáp án B": "45 phút - 15 phút || 30 phút",
    "Đáp án C": "1 ngày - 12 giờ || 12 giờ",
    "Đáp án D": "1 tuần + 3 ngày || 10 ngày",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Thực hiện phép tính cộng trừ số đo thời gian.",
    "Lời giải thích chi tiết": "2h + 3h = 5h; 45p - 15p = 30p; 24h - 12h = 12h; 7 ngày + 3 ngày = 10 ngày."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối thời điểm bắt đầu và kết thúc với thời lượng tương ứng:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Từ 8:00 đến 8:45 || 45 phút",
    "Đáp án B": "Từ 9:00 đến 10:00 || 60 phút (1 giờ)",
    "Đáp án C": "Từ 14:15 đến 14:45 || 30 phút",
    "Đáp án D": "Từ 19:00 đến 19:15 || 15 phút",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Lấy thời điểm sau trừ đi thời điểm trước.",
    "Lời giải thích chi tiết": "8h45 - 8h = 45p; 10h - 9h = 1h (60p); 14h45 - 14h15 = 30p; 19h15 - 19h = 15p."
  },
  {
    "Loại câu hỏi": "matching",
    "Nội dung câu hỏi": "Nối các nhận định về tháng với giá trị đúng:",
    "Link ảnh minh họa": "",
    "Đáp án A": "Tháng có ít ngày nhất || Tháng 2",
    "Đáp án B": "Tháng đầu tiên trong năm || Tháng 1",
    "Đáp án C": "Tháng có ngày Quốc khánh 2/9 || Tháng 9",
    "Đáp án D": "Tháng có ngày Nhà giáo VN 20/11 || Tháng 11",
    "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
    "Gợi ý cho bé": "Dựa vào kiến thức về các tháng và ngày kỷ niệm.",
    "Lời giải thích chi tiết": "Ít ngày nhất: Tháng 2; Đầu tiên: Tháng 1; Quốc khánh: Tháng 9; Nhà giáo: Tháng 11."
  },
  {
    "Loại câu hỏi": "multiple_choice",
    "Nội dung câu hỏi": "Chuyến tàu hỏa khởi hành từ Hà Nội lúc 6 giờ sáng và đến Hải Phòng lúc 8 giờ 30 phút sáng cùng ngày. Chuyến đi hết bao nhiêu thời gian?",
    "Link ảnh minh họa": "",
    "Đáp án A": "1 giờ 30 phút",
    "Đáp án B": "2 giờ 30 phút",
    "Đáp án C": "2 giờ",
    "Đáp án D": "3 giờ 30 phút",
    "Đáp án đúng": "B",
    "Gợi ý cho bé": "Lấy 8 giờ 30 phút trừ đi 6 giờ.",
    "Lời giải thích chi tiết": "8 giờ 30 phút - 6 giờ = 2 giờ 30 phút."
  }
];

// Build Workbook
const wb = XLSX.utils.book_new();

// Sheet 1: Câu hỏi
const wsQuestions = XLSX.utils.json_to_sheet(questions);
wsQuestions['!cols'] = [
  { wch: 18 }, // Loại câu hỏi
  { wch: 65 }, // Nội dung câu hỏi
  { wch: 25 }, // Link ảnh
  { wch: 22 }, // A
  { wch: 22 }, // B
  { wch: 22 }, // C
  { wch: 22 }, // D
  { wch: 18 }, // Đáp án đúng
  { wch: 45 }, // Gợi ý cho bé
  { wch: 65 }  // Lời giải thích chi tiết
];
XLSX.utils.book_append_sheet(wb, wsQuestions, "DanhSachCauHoi");

// Sheet 2: Hướng dẫn
const guideData = [
  {
    "Loại câu hỏi (Cột 1)": "multiple_choice",
    "Tên dạng bài": "Trắc nghiệm 1 đáp án đúng",
    "Quy cách điền Cột 'Đáp án A, B, C, D'": "Điền nội dung các lựa chọn vào cột A, B, C, D",
    "Quy cách điền Cột 'Đáp án đúng'": "Ghi 1 chữ cái đúng: A hoặc B hoặc C hoặc D",
    "Ghi chú & Quy tắc chấm điểm": "Học sinh chọn 1 đáp án đúng duy nhất."
  },
  {
    "Loại câu hỏi (Cột 1)": "multiple_select",
    "Tên dạng bài": "Trắc nghiệm NHIỀU đáp án đúng (Mới ⭐)",
    "Quy cách điền Cột 'Đáp án A, B, C, D'": "Điền nội dung các lựa chọn vào cột A, B, C, D",
    "Quy cách điền Cột 'Đáp án đúng'": "Ghi các chữ cái đúng cách nhau bằng dấu phẩy. Ví dụ: A, C, D hoặc A, B",
    "Ghi chú & Quy tắc chấm điểm": "Học sinh phải chọn ĐÚNG VÀ ĐỦ 100% tất cả các đáp án đúng."
  },
  {
    "Loại câu hỏi (Cột 1)": "fill_blank",
    "Tên dạng bài": "Điền từ / Điền số vào chỗ trống",
    "Quy cách điền Cột 'Đáp án A, B, C, D'": "Để trống các cột A, B, C, D",
    "Quy cách điền Cột 'Đáp án đúng'": "Ghi số hoặc từ cần điền (Ví dụ: 24, 60, 31, chiều)",
    "Ghi chú & Quy tắc chấm điểm": "Hệ thống tự động so khớp không phân biệt chữ hoa/thường."
  },
  {
    "Loại câu hỏi (Cột 1)": "true_false",
    "Tên dạng bài": "Đúng hay Sai",
    "Quy cách điền Cột 'Đáp án A, B, C, D'": "Cột A ghi 'Đúng', Cột B ghi 'Sai' (Cột C, D để trống)",
    "Quy cách điền Cột 'Đáp án đúng'": "Ghi chữ 'Đúng' hoặc 'Sai'",
    "Ghi chú & Quy tắc chấm điểm": "Học sinh bấm nút Đúng hoặc Sai."
  },
  {
    "Loại câu hỏi (Cột 1)": "matching",
    "Tên dạng bài": "Nối cặp tương ứng",
    "Quy cách điền Cột 'Đáp án A, B, C, D'": "Mỗi cột ghi dạng: Vế trái || Vế phải (Ví dụ: 13 giờ || 1 giờ chiều)",
    "Quy cách điền Cột 'Đáp án đúng'": "Ghi: 1-A, 2-B, 3-C, 4-D",
    "Ghi chú & Quy tắc chấm điểm": "Hệ thống tự động xáo trộn cột phải để học sinh nối cặp."
  }
];
const wsGuide = XLSX.utils.json_to_sheet(guideData);
wsGuide['!cols'] = [
  { wch: 22 },
  { wch: 35 },
  { wch: 45 },
  { wch: 35 },
  { wch: 50 }
];
XLSX.utils.book_append_sheet(wb, wsGuide, "HuongDanNhapLieu");

const outputPath = path.resolve('CHUDE_6_NGAY_GIO_THANG.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`Đã xuất thành công file Excel: ${outputPath} (${questions.length} câu hỏi)`);
