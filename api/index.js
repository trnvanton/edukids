const app = require('../backend/src/app');
const { initDatabaseConnection } = require('../backend/src/config/database');

// Lazy init database connection for Vercel Serverless
initDatabaseConnection();

module.exports = app;
