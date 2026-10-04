const app = require('./src/app');
const { initDatabaseConnection, getIsConnectedToMySQL } = require('./src/config/database');
const dotenv = require('dotenv');

dotenv.config();

let PORT = parseInt(process.env.PORT, 10) || 5000;

async function bootstrap() {
  await initDatabaseConnection();

  const server = app.listen(PORT, () => {
    console.log(`
===========================================================
🚀 EDUKIDS - NỀN TẢNG HỌC TẬP & GAMIFICATION TIỂU HỌC
🌟 Backend REST API: http://localhost:${PORT}
💾 Cơ sở dữ liệu MySQL: ${getIsConnectedToMySQL() ? '✅ Đang kết nối MySQL (edukids_db)' : '⚠️ Đang dùng Bộ nhớ tạm'}
===========================================================
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Cổng ${PORT} đang bận, đang tự động chuyển sang cổng ${PORT + 1}...`);
      PORT += 1;
      app.listen(PORT, () => {
        console.log(`🚀 Server Backend đã chuyển sang chạy tại: http://localhost:${PORT}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

bootstrap();
