const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false // allow inline scripts for local testing / Vite
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend dist/build if present or static
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.use(express.static(path.join(__dirname, '../../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/students.routes'));
app.use('/api/teachers', require('./routes/teachers.routes'));
app.use('/api/classes', require('./routes/classes.routes'));
app.use('/api/subjects', require('./routes/subjects.routes'));
app.use('/api/exercises', require('./routes/exercises.routes'));
app.use('/api/results', require('./routes/results.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EduKids Platform API v2.0',
    timestamp: new Date()
  });
});

module.exports = app;
