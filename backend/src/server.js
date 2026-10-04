const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDatabaseConnection, getIsConnectedToMySQL } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets directly from backend for convenience as well
app.use(express.static(path.join(__dirname, '../../frontend')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Hệ Thống Học Tập Tiểu Học',
    mysqlConnected: getIsConnectedToMySQL(),
    timestamp: new Date()
  });
});

// Root route redirects / delivers frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Start Server
async function startServer() {
  await initDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`
=====================================================
🏫 HỆ THỐNG HỌC TẬP TIỂU HỌC (LỚP 1 - LỚP 5)
🚀 Server Backend đang chạy tại: http://localhost:${PORT}
🌐 Giao diện Web: http://localhost:${PORT}
💾 Chế độ cơ sở dữ liệu: ${getIsConnectedToMySQL() ? 'MySQL (Active)' : 'Hybrid In-Memory (Đang chờ MySQL kết nối)'}
=====================================================
    `);
  });
}

startServer();
