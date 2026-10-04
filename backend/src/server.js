const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDatabaseConnection, getIsConnectedToMySQL } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const fs = require('fs');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const distPath = path.join(__dirname, '../../frontend/dist');
const staticPath = path.join(__dirname, '../../frontend');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.use(express.static(staticPath));

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
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  res.sendFile(path.join(staticPath, 'index.html'));
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
