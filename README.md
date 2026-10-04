# 🎒 EduKids – Nền Tảng Học Tập Trực Tuyến & Gamification Dành Cho Học Sinh Tiểu Học

> Hệ thống giáo dục trực tuyến thông minh dành cho học sinh tiểu học (Lớp 1 - Lớp 5), kết hợp **Trò chơi hóa (Gamification)**, **Chấm điểm & Giải thích sư phạm từng bước**, **Phân tích điểm mạnh/yếu**, và **Đề xuất bài tập thích ứng (Adaptive Learning)**.

---

## 🌟 TÍNH NĂNG ĐỘC ĐÁO & NỔI BẬT

### 👦 1. Dành cho Học Sinh (Gamified Student Experience)
- **Hệ thống Điểm kinh nghiệm (XP) & Cấp độ**:
  - `Level 1` (Mầm non 🌱) ➔ `Level 2` (Người mới 🐥) ➔ `Level 3` (Bé chăm học 🐱) ➔ `Level 4` (Học sinh giỏi 🚀) ➔ `Level 5` (Siêu học sinh 👑).
  - Tích lũy XP: Hoàn thành bài (+20 XP), trả lời đúng (+5 XP), hoàn thành 100% (+30 XP), chuỗi Combo liên tiếp (🔥 maxCombo x 3 XP).
  - Duy trì **Chuỗi ngày học liên tục (Streak 🔥)**.
- **Bộ sưu tập Huy hiệu (Badges)**:
  - 🥉 *Mầm Non Chăm Học*, 🥈 *Siêu Toán Học*, 🥇 *Vua Tiếng Việt*, 🔥 *7 Ngày Học Liên Tiếp*, 👑 *Trạng Nguyên Nhí*.
- **Phân tích Lỗi & Điểm mạnh/yếu (Smart Analytics)**:
  - Đánh giá trực quan mức độ thông thạo theo chuyên đề: *Phân số (60% - Cần rèn)*, *Hình học (92% - Vững)*, *Đọc hiểu (80%)*.
- **Đề xuất Bài tập Thích ứng (Rule-based Adaptive Recommendation)**:
  - Điểm < 50% ➔ Đề xuất bài học & luyện tập cơ bản.
  - 50% - 70% ➔ Đề xuất 10 câu luyện tập bổ sung.
  - 70% - 90% ➔ Đề xuất bài tập nâng cao.
  - \> 90% ➔ Thử thách Trạng Nguyên.
- **Giao diện Làm bài tập Thân thiện & Phản hồi Sư phạm**:
  - Nút bấm to rõ, hỗ trợ phím tắt `1, 2, 3, 4` hoặc `A, B, C, D`.
  - Nút xem gợi ý từ cô giáo 💡.
  - **Mục "Xem lại bài làm"**: Đối chiếu câu trả lời của bé với đáp án đúng và **Khung Lời Giải Thích Chi Tiết Từng Bước** (Ví dụ: `125 - 48 = 77 (quả táo)`).
  - Pháo hoa Confetti 🎉 & Âm thanh Web Audio sinh động khi hoàn thành bài.

---

### 👩‍🏫 2. Dành cho Giáo Viên (Teacher Class Management)
- Xem danh sách các lớp học phụ trách (Ví dụ: **Lớp 4A1**).
- Thống kê điểm trung bình của lớp và điểm số từng học sinh (*Nguyễn An: 8.5đ, Trần Bình: 9.0đ, Lê Minh: 6.5đ*).
- **Cảnh báo học sinh yếu kém**: Tự động đánh dấu học sinh có điểm < 6.5đ để giáo viên giao bài tập phụ đạo.
- **Giao bài tập mới** cho lớp học với hạn nộp và chủ đề chỉ định.

---

### 👨‍💼 3. Dành cho Quản Trị Viên (Admin Management)
- Thống kê tổng quan: Số lượng học sinh, giáo viên, lớp học, ngân hàng câu hỏi.
- Quản lý người dùng, phân quyền, cấu hình môn học & chuyên đề.

---

## 📁 CẤU TRÚC DỰ ÁN CHUẨN MỰC

```
d:/HOC_TIEUHOC/
├── backend/                            # Node.js + Express + MySQL
│   ├── .env                            # Cấu hình cổng PORT, MySQL, JWT
│   ├── schema.sql                      # Schema cơ sở dữ liệu MySQL đầy đủ
│   ├── server.js                       # Điểm khởi chạy máy chủ Express
│   ├── src/
│   │   ├── app.js                      # Cấu hình Express, CORS, Helmet, Routes
│   │   ├── config/database.js          # Kết nối MySQL Pool + Smart Hybrid Fallback
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js      # Xác thực JWT Token
│   │   │   └── role.middleware.js      # Phân quyền Student, Teacher, Admin
│   │   ├── services/
│   │   │   ├── grading.service.js      # Chấm điểm, tính XP, Combo, Lời giải thích
│   │   │   ├── statistics.service.js   # Phân tích lỗi theo chuyên đề & lớp học
│   │   │   └── recommendation.service.js # Đề xuất bài tập thích ứng (Adaptive Learning)
│   │   ├── controllers/                # auth, student, teacher, class, subject, exercise, result
│   │   ├── routes/                     # auth, students, teachers, classes, subjects, exercises, results
│   │   └── utils/seedDatabase.js       # Script tự động khởi tạo & nạp dữ liệu MySQL
│   └── package.json
│
├── frontend/                           # React 18 + Vite
│   ├── vite.config.js                  # Cấu hình Vite & Proxy API về backend
│   ├── src/
│   │   ├── main.jsx                    # React Root
│   │   ├── App.jsx                     # Điều phối ứng dụng & phân quyền giao diện
│   │   ├── index.css                   # Design System hiện đại, màu sắc tươi sáng cho trẻ em
│   │   ├── context/AuthContext.jsx     # Quản lý User, vai trò, XP, Level, Avatar
│   │   ├── services/
│   │   │   ├── api.js                  # Client gọi REST API Backend
│   │   │   └── audio.js                # Bộ giả lập âm thanh vui nhộn (Web Audio API)
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Thanh điều hướng, đổi nhanh tài khoản Demo, XP, Streak
│   │   │   ├── WeaknessAnalysisCard.jsx# Biểu đồ phân tích điểm mạnh / yếu
│   │   │   └── BadgeList.jsx           # Bảng danh hiệu huy hiệu
│   │   └── pages/
│   │       ├── Dashboard.jsx           # Trang chủ học sinh với Gamification & Bài tập gợi ý
│   │       ├── SubjectsPage.jsx        # Chọn khối lớp 1-5, Môn học, Chuyên đề
│   │       ├── QuizPage.jsx            # Giao diện làm bài tập tương tác, đếm giờ, gợi ý
│   │       ├── ResultPage.jsx          # Màn hình kết quả, pháo hoa, giải thích từng câu
│   │       ├── TeacherDashboard.jsx    # Bảng quản lý lớp học của giáo viên
│   │       ├── AdminDashboard.jsx      # Bảng điều khiển quản trị viên
│   │       └── LeaderboardPage.jsx     # Bảng vàng vinh danh Trạng Nguyên Nhí
│   └── package.json
│
└── README.md
```

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### 1. Khởi động Backend (Express API)

Mở Terminal 1:
```bash
cd backend
npm install
npm run seed     # Nạp cấu trúc bảng & câu hỏi mẫu vào MySQL
npm start        # Khởi chạy server tại http://localhost:5000
```

### 2. Khởi động Frontend (React + Vite)

Mở Terminal 2:
```bash
cd frontend
npm install
npm run dev      # Khởi chạy giao diện React tại http://localhost:3000
```

Truy cập: **`http://localhost:3000`** (hoặc `http://localhost:5000` sau khi build) để trải nghiệm toàn diện hệ thống EduKids! 🎒🌟
