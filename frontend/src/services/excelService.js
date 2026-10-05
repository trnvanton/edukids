import * as XLSX from 'xlsx';

/**
 * Tạo và tải xuống file Excel mẫu dành cho giáo viên soạn bài tập
 */
export function downloadExcelTemplate() {
  const sampleData = [
    {
      "Loại câu hỏi": "multiple_choice",
      "Nội dung câu hỏi": "Tính nhẩm: 25 x 4 = ?",
      "Link ảnh minh họa": "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400",
      "Đáp án A": "80",
      "Đáp án B": "100",
      "Đáp án C": "120",
      "Đáp án D": "150",
      "Đáp án đúng": "B",
      "Gợi ý cho bé": "Bé nhẩm 25 x 2 = 50 rồi nhân 2 lần nữa",
      "Lời giải thích chi tiết": "Giải: 25 x 4 = 100. Đáp án chính xác là B (100)."
    },
    {
      "Loại câu hỏi": "multiple_select",
      "Nội dung câu hỏi": "Những từ nào sau đây là từ chỉ hoạt động của học sinh? (Chọn tất cả các đáp án đúng)",
      "Link ảnh minh họa": "",
      "Đáp án A": "Đọc sách",
      "Đáp án B": "Cây thước kẻ",
      "Đáp án C": "Viết bài",
      "Đáp án D": "Chạy nhảy",
      "Đáp án đúng": "A, C, D",
      "Gợi ý cho bé": "Tìm các từ chỉ hành động, cử động của cơ thể",
      "Lời giải thích chi tiết": "Giải: Đọc sách, Viết bài, Chạy nhảy là các từ chỉ hoạt động. 'Cây thước kẻ' là từ chỉ đồ vật."
    },
    {
      "Loại câu hỏi": "fill_blank",
      "Nội dung câu hỏi": "Điền số thích hợp vào chỗ trống: 45 + ___ = 100",
      "Link ảnh minh họa": "",
      "Đáp án A": "",
      "Đáp án B": "",
      "Đáp án C": "",
      "Đáp án D": "",
      "Đáp án đúng": "55",
      "Gợi ý cho bé": "Lấy 100 trừ đi 45",
      "Lời giải thích chi tiết": "Giải: Muốn tìm số hạng chưa biết, ta lấy 100 - 45 = 55. Số cần điền là 55."
    },
    {
      "Loại câu hỏi": "fill_blank",
      "Nội dung câu hỏi": "Điền từ còn thiếu vào câu tục ngữ: 'Gần mực thì đen, gần đèn thì ___'",
      "Link ảnh minh họa": "",
      "Đáp án A": "",
      "Đáp án B": "",
      "Đáp án C": "",
      "Đáp án D": "",
      "Đáp án đúng": "sáng",
      "Gợi ý cho bé": "Từ này có nghĩa là phát ra ánh sáng, sáng sủa",
      "Lời giải thích chi tiết": "Câu tục ngữ hoàn chỉnh là: 'Gần mực thì đen, gần đèn thì rạng' hoặc 'gần đèn thì sáng'."
    },
    {
      "Loại câu hỏi": "true_false",
      "Nội dung câu hỏi": "Hình vuông có 4 cạnh dài bằng nhau và 4 góc vuông. Đúng hay Sai?",
      "Link ảnh minh họa": "",
      "Đáp án A": "Đúng",
      "Đáp án B": "Sai",
      "Đáp án C": "",
      "Đáp án D": "",
      "Đáp án đúng": "Đúng",
      "Gợi ý cho bé": "Nhớ lại đặc điểm hình học của hình vuông",
      "Lời giải thích chi tiết": "Khẳng định trên là ĐÚNG. Hình vuông có cả 4 cạnh bằng nhau và 4 góc vuông."
    },
    {
      "Loại câu hỏi": "matching",
      "Nội dung câu hỏi": "Nối phép nhân ở cột trái với kết quả đúng ở cột phải",
      "Link ảnh minh họa": "",
      "Đáp án A": "3 x 5 || 15",
      "Đáp án B": "4 x 6 || 24",
      "Đáp án C": "9 x 2 || 18",
      "Đáp án D": "8 x 5 || 40",
      "Đáp án đúng": "1-A, 2-B, 3-C, 4-D",
      "Gợi ý cho bé": "Áp dụng bảng cửu chương nhân 3, 4, 8, 9",
      "Lời giải thích chi tiết": "3 x 5 = 15; 4 x 6 = 24; 9 x 2 = 18; 8 x 5 = 40."
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  // Set column widths for nice appearance
  ws['!cols'] = [
    { wch: 20 }, // Loại câu hỏi
    { wch: 55 }, // Nội dung
    { wch: 35 }, // Link ảnh
    { wch: 20 }, // A
    { wch: 20 }, // B
    { wch: 20 }, // C
    { wch: 20 }, // D
    { wch: 20 }, // Đáp án đúng
    { wch: 35 }, // Gợi ý
    { wch: 50 }  // Lời giải thích
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Mau_Cau_Hoi_EduKids");
  XLSX.writeFile(wb, "EduKids_Mau_Nhap_Bai_Tap.xlsx");
}

/**
 * Đọc và chuẩn hóa dữ liệu từ file Excel / CSV tải lên
 */
export async function parseExcelFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          return resolve({ success: false, message: 'File Excel không có dữ liệu câu hỏi!' });
        }

        const parsedQuestions = rawJson.map((row, idx) => {
          // Normalize column names
          const typeRaw = (row['Loại câu hỏi'] || row['Type'] || row['loai_cau_hoi'] || '').toString().toLowerCase().trim();
          const rawCorrect = (row['Đáp án đúng'] || row['Correct'] || row['Đáp án'] || 'A').toString().trim();

          let type = 'multiple_choice';
          if (
            typeRaw.includes('select') ||
            typeRaw.includes('nhiều') ||
            typeRaw.includes('nhieu') ||
            typeRaw.includes('checkbox') ||
            typeRaw.includes('multi_select') ||
            typeRaw.includes('multiple_select')
          ) {
            type = 'multiple_select';
          } else if (typeRaw.includes('fill') || typeRaw.includes('điền') || typeRaw.includes('dien')) {
            type = 'fill_blank';
          } else if (typeRaw.includes('match') || typeRaw.includes('nối') || typeRaw.includes('noi')) {
            type = 'matching';
          } else if (typeRaw.includes('true') || typeRaw.includes('đúng') || typeRaw.includes('dung') || typeRaw.includes('tf')) {
            type = 'true_false';
          } else {
            // Intelligent Auto-detect: if correct answer has multiple choices e.g. "A, B", "A,C,D", "A; B", "A B"
            const cleanedLetters = rawCorrect.toUpperCase().match(/[A-D]/g);
            if (cleanedLetters && cleanedLetters.length > 1 && (rawCorrect.includes(',') || rawCorrect.includes(';') || rawCorrect.includes(' ') || rawCorrect.includes('+') || rawCorrect.length > 1)) {
              type = 'multiple_select';
            }
          }

          const qText = row['Nội dung câu hỏi'] || row['Câu hỏi'] || row['Question'] || `Câu hỏi ${idx + 1}`;
          const imgUrl = row['Link ảnh minh họa'] || row['Ảnh'] || row['Image'] || '';
          const hint = row['Gợi ý cho bé'] || row['Gợi ý'] || row['Hint'] || '';
          const explanation = row['Lời giải thích chi tiết'] || row['Giải thích'] || row['Explanation'] || 'Xem lại kiến thức bài học.';

          let options = [];
          let matchingData = null;

          if (type === 'multiple_choice' || type === 'multiple_select') {
            const optA = (row['Đáp án A'] || row['A'] || 'Đáp án A').toString().trim();
            const optB = (row['Đáp án B'] || row['B'] || 'Đáp án B').toString().trim();
            const optC = (row['Đáp án C'] || row['C'] || 'Đáp án C').toString().trim();
            const optD = (row['Đáp án D'] || row['D'] || 'Đáp án D').toString().trim();

            options = [
              { option_label: 'A', answer_text: optA },
              { option_label: 'B', answer_text: optB },
              { option_label: 'C', answer_text: optC },
              { option_label: 'D', answer_text: optD }
            ];
          } else if (type === 'true_false') {
            options = [
              { option_label: 'Đúng', answer_text: 'Đúng 👍' },
              { option_label: 'Sai', answer_text: 'Sai 👎' }
            ];
          } else if (type === 'matching') {
            const rawPairs = [
              row['Đáp án A'] || row['A'],
              row['Đáp án B'] || row['B'],
              row['Đáp án C'] || row['C'],
              row['Đáp án D'] || row['D']
            ].filter(Boolean);

            const left = [];
            const right = [];
            const correctPairs = {};

            let questionItems = [];
            if (qText.includes(':')) {
              const afterColon = qText.split(':')[1] || '';
              if (afterColon.includes(';') || afterColon.includes(',')) {
                questionItems = afterColon.split(/[;,]/).map(s => s.trim()).filter(Boolean);
              }
            }

            rawPairs.forEach((p, pIdx) => {
              const str = p.toString().trim();
              let leftText = '';
              let rightText = '';

              if (str.includes('||')) {
                const parts = str.split('||');
                leftText = (parts[0] || '').trim();
                rightText = (parts[1] || '').trim();
              } else if (str.includes('➔') || str.includes('->') || str.includes('=>')) {
                const parts = str.split(/[➔\->=>]/);
                leftText = (parts[0] || '').trim();
                rightText = (parts[parts.length - 1] || '').trim();
              } else if (str.includes(' - ') || (str.includes('-') && !str.startsWith('-'))) {
                const parts = str.includes(' - ') ? str.split(' - ') : str.split('-');
                leftText = (parts[0] || '').trim();
                rightText = (parts[1] || '').trim();
              } else if (str.includes(':')) {
                const parts = str.split(':');
                leftText = (parts[0] || '').trim();
                rightText = (parts[1] || '').trim();
              } else if (questionItems[pIdx]) {
                leftText = questionItems[pIdx];
                rightText = str;
              } else {
                leftText = `Mục ${pIdx + 1}`;
                rightText = str;
              }

              const leftId = `${pIdx + 1}`;
              const rightId = String.fromCharCode(65 + pIdx); // 'A', 'B', 'C', 'D'

              left.push({ id: leftId, text: leftText || `Mục ${leftId}` });
              right.push({ id: rightId, text: rightText || `Đáp án ${rightId}` });
              correctPairs[leftId] = rightId;
            });

            const shuffledRight = [...right].sort(() => Math.random() - 0.5);

            matchingData = {
              left,
              leftItems: left,
              right: shuffledRight,
              rightItems: shuffledRight,
              correctPairs
            };
          }

          return {
            id: Date.now() + idx + Math.floor(Math.random() * 1000),
            question_type: type,
            question_text: qText,
            image_url: imgUrl,
            options,
            matching_data: matchingData,
            correct_answer: rawCorrect,
            hint,
            explanation,
            points: 10
          };
        });

        resolve({
          success: true,
          questions: parsedQuestions,
          count: parsedQuestions.length
        });
      } catch (err) {
        console.error('Lỗi khi đọc file Excel:', err);
        resolve({ success: false, message: 'Định dạng file không hợp lệ hoặc bị hỏng: ' + err.message });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: 'Không thể đọc nội dung file từ trình duyệt!' });
    };

    reader.readAsArrayBuffer(file);
  });
}
