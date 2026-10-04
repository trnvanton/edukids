// Centralized API Client

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('tieu_hoc_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('tieu_hoc_token', token);
    } else {
      localStorage.removeItem('tieu_hoc_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });

      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      return { success: false, message: 'Lỗi kết nối máy chủ backend!' };
    }
  }

  // Auth endpoints
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async register(username, password, full_name, grade_level, avatar) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, full_name, grade_level, avatar })
    });
  }

  async guestLogin(name, grade_level, avatar) {
    return this.request('/auth/guest-login', {
      method: 'POST',
      body: JSON.stringify({ name, grade_level, avatar })
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Study endpoints
  async getGrades() {
    return this.request('/study/grades');
  }

  async getSubjects() {
    return this.request('/study/subjects');
  }

  async getTopics(gradeId, subjectId) {
    let query = '';
    const params = [];
    if (gradeId) params.push(`gradeId=${gradeId}`);
    if (subjectId) params.push(`subjectId=${subjectId}`);
    if (params.length > 0) query = '?' + params.join('&');

    return this.request(`/study/topics${query}`);
  }

  async getQuiz(id) {
    return this.request(`/study/quiz/${id}`);
  }

  // Quiz endpoints
  async submitQuiz(quizId, answers, timeTakenSeconds) {
    return this.request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers, timeTakenSeconds })
    });
  }

  async getHistory() {
    return this.request('/quiz/history');
  }

  // Leaderboard & Badges
  async getLeaderboard() {
    return this.request('/leaderboard');
  }

  async getBadges() {
    return this.request('/leaderboard/badges');
  }
}

window.apiClient = new ApiClient();
