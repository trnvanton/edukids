const API_BASE = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('edukids_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('edukids_token', token);
    } else {
      localStorage.removeItem('edukids_token');
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
      console.error('API Error:', err);
      return { success: false, message: 'Lỗi kết nối máy chủ backend!' };
    }
  }

  // Auth
  login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  register(payload) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  switchDemo(role) {
    return this.request('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  }

  // Student
  getStudentDashboard() {
    return this.request('/students/dashboard');
  }

  // Teacher
  getTeacherDashboard() {
    return this.request('/teachers/dashboard');
  }

  // Subjects & Lessons
  getSubjects() {
    return this.request('/subjects');
  }

  getLessons(subjectId, grade) {
    const query = grade ? `?grade=${grade}` : '';
    return this.request(`/subjects/${subjectId}/lessons${query}`);
  }

  // Exercise & Quiz
  getExercise(id) {
    return this.request(`/exercises/${id}`);
  }

  submitExercise(exerciseId, answers, timeTakenSeconds) {
    return this.request('/exercises/submit', {
      method: 'POST',
      body: JSON.stringify({ exerciseId, answers, timeTakenSeconds })
    });
  }

  // Results & Leaderboard
  getLeaderboard() {
    return this.request('/results/leaderboard');
  }

  getHistory() {
    return this.request('/results/history');
  }
}

export const api = new ApiService();
