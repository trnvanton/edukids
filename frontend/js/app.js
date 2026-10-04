// Main Application Coordinator & UI Logic

class App {
  constructor() {
    this.selectedGrade = 1;
    this.selectedSubject = null; // null means all
    this.grades = [];
    this.subjects = [];
    this.topics = [];
  }

  async init() {
    await window.authManager.init();
    this.setupEventListeners();
    await this.loadInitialData();
  }

  setupEventListeners() {
    // Sound toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = window.audioManager.toggleMute();
        soundBtn.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // Logo click to return home
    const logoBtn = document.getElementById('btn-logo-home');
    if (logoBtn) {
      logoBtn.addEventListener('click', () => {
        window.quizPlayer.backToHome();
      });
    }

    // Profile click to open modal
    const profileBtn = document.getElementById('user-profile-badge');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        this.openModal('auth-modal');
      });
    }

    // Leaderboard button in Result screen or floating
    const lbBtn = document.getElementById('btn-view-leaderboard');
    if (lbBtn) {
      lbBtn.addEventListener('click', () => {
        this.loadLeaderboard();
        this.openModal('leaderboard-modal');
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });

    // Avatar selector in Auth Modal
    document.querySelectorAll('.avatar-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        window.authManager.selectedAvatar = opt.getAttribute('data-avatar');
      });
    });

    // Quick Guest / Name Form in Auth modal
    const guestForm = document.getElementById('guest-form');
    if (guestForm) {
      guestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('guest-name-input').value.trim();
        const gradeInput = document.getElementById('guest-grade-select').value;
        const avatar = window.authManager.selectedAvatar || 'mascot-bear';

        const res = await window.apiClient.guestLogin(nameInput || 'Bé Khám Phá', gradeInput, avatar);
        if (res.success && res.user) {
          window.apiClient.setToken(res.token);
          window.authManager.setUser(res.user);
          this.selectedGrade = parseInt(gradeInput, 10);
          this.highlightGradeTab(this.selectedGrade);
          this.closeModal('auth-modal');
          this.loadTopics();
        }
      });
    }

    // Quiz Navigation Buttons
    document.getElementById('btn-prev-question').addEventListener('click', () => window.quizPlayer.prevQuestion());
    document.getElementById('btn-next-question').addEventListener('click', () => window.quizPlayer.nextQuestion());
    document.getElementById('btn-submit-quiz').addEventListener('click', () => window.quizPlayer.submitQuiz());
    document.getElementById('btn-toggle-hint').addEventListener('click', () => window.quizPlayer.toggleHint());
    document.getElementById('btn-back-to-home').addEventListener('click', () => window.quizPlayer.backToHome());

    // Result screen buttons
    document.getElementById('btn-retake-quiz').addEventListener('click', () => window.quizPlayer.retakeQuiz());
    document.getElementById('btn-result-home').addEventListener('click', () => window.quizPlayer.backToHome());

    // Keyboard shortcuts (A, B, C, D, 1, 2, 3, 4, Enter)
    window.addEventListener('keydown', (e) => {
      const quizView = document.getElementById('quiz-view');
      if (!quizView || quizView.style.display !== 'block') return;

      const key = e.key.toUpperCase();
      const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      const targetLabel = numMap[key] || (['A', 'B', 'C', 'D'].includes(key) ? key : null);

      if (targetLabel) {
        const q = window.quizPlayer.currentQuiz?.questions[window.quizPlayer.currentQuestionIdx];
        if (q) window.quizPlayer.selectOption(q.id, targetLabel);
      } else if (e.key === 'ArrowRight') {
        window.quizPlayer.nextQuestion();
      } else if (e.key === 'ArrowLeft') {
        window.quizPlayer.prevQuestion();
      }
    });
  }

  async loadInitialData() {
    // Load Grades
    const gradeRes = await window.apiClient.getGrades();
    if (gradeRes.success && gradeRes.grades) {
      this.grades = gradeRes.grades;
      this.renderGradeTabs();
    }

    // Load Subjects
    const subjectRes = await window.apiClient.getSubjects();
    if (subjectRes.success && subjectRes.subjects) {
      this.subjects = subjectRes.subjects;
      this.renderSubjectPills();
    }

    // Load Topics
    await this.loadTopics();
  }

  renderGradeTabs() {
    const container = document.getElementById('grade-tabs-container');
    if (!container) return;
    container.innerHTML = '';

    this.grades.forEach(g => {
      const btn = document.createElement('button');
      btn.className = `grade-btn ${g.grade_number === this.selectedGrade ? 'active' : ''}`;
      btn.setAttribute('data-grade', g.grade_number);

      btn.innerHTML = `
        <span class="grade-emoji">${g.icon || '🌱'}</span>
        <span class="grade-title">${g.name}</span>
        <span class="grade-sub">${g.grade_number === 1 ? 'Làm quen' : (g.grade_number === 5 ? 'Chuyển cấp' : 'Luyện tập')}</span>
      `;

      btn.addEventListener('click', () => {
        window.audioManager.playPop();
        this.selectedGrade = g.grade_number;
        this.highlightGradeTab(g.grade_number);
        this.loadTopics();
      });

      container.appendChild(btn);
    });
  }

  highlightGradeTab(gradeNum) {
    document.querySelectorAll('.grade-btn').forEach(btn => {
      if (parseInt(btn.getAttribute('data-grade'), 10) === gradeNum) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  renderSubjectPills() {
    const container = document.getElementById('subject-pills-container');
    if (!container) return;
    container.innerHTML = '';

    // "Tất cả môn" Pill
    const allPill = document.createElement('button');
    allPill.className = `subject-pill ${this.selectedSubject === null ? 'active' : ''}`;
    allPill.setAttribute('data-subject', 'all');
    allPill.innerHTML = `<span>🌈</span><span>Tất Cả Các Môn</span>`;
    allPill.addEventListener('click', () => {
      window.audioManager.playPop();
      this.selectedSubject = null;
      this.highlightSubjectPill('all');
      this.loadTopics();
    });
    container.appendChild(allPill);

    this.subjects.forEach(s => {
      const pill = document.createElement('button');
      pill.className = `subject-pill ${this.selectedSubject === s.id ? 'active' : ''}`;
      pill.setAttribute('data-subject', s.code);

      pill.innerHTML = `
        <span>${s.icon || '📚'}</span>
        <span>${s.name}</span>
      `;

      pill.addEventListener('click', () => {
        window.audioManager.playPop();
        this.selectedSubject = s.id;
        this.highlightSubjectPill(s.code);
        this.loadTopics();
      });

      container.appendChild(pill);
    });
  }

  highlightSubjectPill(code) {
    document.querySelectorAll('.subject-pill').forEach(p => {
      if (p.getAttribute('data-subject') === code) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  async loadTopics() {
    const grid = document.getElementById('topics-content-grid');
    grid.innerHTML = '<div class="empty-state"><h3>⏳ Đang tải bài học diệu kỳ...</h3></div>';

    const res = await window.apiClient.getTopics(this.selectedGrade, this.selectedSubject);
    if (!res.success || !res.topics || res.topics.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎒</div>
          <h3>Chưa có bài tập cho môn này ở Lớp ${this.selectedGrade}</h3>
          <p style="color: var(--text-muted); margin-top: 6px;">Bé hãy chọn môn học khác hoặc chọn khối lớp khác nhé!</p>
        </div>
      `;
      return;
    }

    this.topics = res.topics;
    grid.innerHTML = '';

    this.topics.forEach(topic => {
      const card = document.createElement('div');
      card.className = 'topic-card';

      const quizList = topic.quizzes || [];
      const firstQuiz = quizList[0];

      card.innerHTML = `
        <div>
          <div class="topic-card-header">
            <div class="topic-icon-badge">${topic.icon || '📖'}</div>
            <div>
              <div class="topic-title">${topic.title}</div>
            </div>
          </div>
          <div class="topic-desc">${topic.description || 'Cùng luyện tập và khám phá các câu đố bổ ích!'}</div>
        </div>
        <div>
          <div class="topic-meta">
            <div class="meta-chip">
              <span>📝</span>
              <span>${firstQuiz ? `${firstQuiz.question_count} câu hỏi` : 'Đề luyện'}</span>
            </div>
            <div class="meta-chip reward">
              <span>⭐</span>
              <span>+${firstQuiz ? firstQuiz.reward_stars : 15} sao</span>
            </div>
          </div>
          <button class="quiz-action-btn" data-quiz-id="${firstQuiz ? firstQuiz.id : 101}">
            <span>Bắt Đầu Luyện Tập</span>
            <span>🚀</span>
          </button>
        </div>
      `;

      card.querySelector('.quiz-action-btn').addEventListener('click', (e) => {
        const quizId = e.currentTarget.getAttribute('data-quiz-id');
        window.quizPlayer.startQuiz(quizId);
      });

      grid.appendChild(card);
    });
  }

  async loadLeaderboard() {
    const list = document.getElementById('leaderboard-modal-list');
    list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Đang tải bảng vàng...</p>';

    const res = await window.apiClient.getLeaderboard();
    if (res.success && res.leaderboard) {
      list.innerHTML = '';
      res.leaderboard.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-item';

        const rankDisplay = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));
        const avatarEmoji = window.authManager.getAvatarEmoji(item.avatar);

        row.innerHTML = `
          <div class="leaderboard-rank rank-${idx + 1}">${rankDisplay}</div>
          <div class="leaderboard-user">
            <span class="leaderboard-avatar">${avatarEmoji}</span>
            <div>
              <div class="leaderboard-name">${item.full_name}</div>
              <div class="leaderboard-grade">Học sinh Lớp ${item.grade_level || 1}</div>
            </div>
          </div>
          <div class="leaderboard-stars">${item.total_stars || 0} ⭐</div>
        `;
        list.appendChild(row);
      });
    }
  }

  openModal(id) {
    window.audioManager.playPop();
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  }

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  }
}

// Confetti Cannon Animation
window.triggerConfetti = function() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.5) * 18 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      gravity: 0.25,
      life: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
      if (p.life > 0) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.life -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
};

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
