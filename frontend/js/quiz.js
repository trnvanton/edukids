// Interactive Quiz Engine & Detailed Explanation Review System

class QuizPlayer {
  constructor() {
    this.currentQuiz = null;
    this.currentQuestionIdx = 0;
    this.userAnswers = {}; // { questionId: 'A' }
    this.timerInterval = null;
    this.secondsElapsed = 0;
    this.isSubmitting = false;
  }

  async startQuiz(quizId) {
    window.audioManager.playPop();
    const res = await window.apiClient.getQuiz(quizId);
    if (!res.success || !res.quiz) {
      alert('Không tải được bài tập: ' + (res.message || 'Lỗi'));
      return;
    }

    this.currentQuiz = res.quiz;
    this.currentQuestionIdx = 0;
    this.userAnswers = {};
    this.secondsElapsed = 0;

    // Switch views
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('result-view').classList.remove('active');
    document.getElementById('result-view').style.display = 'none';
    
    const quizView = document.getElementById('quiz-view');
    quizView.style.display = 'block';
    quizView.classList.add('active');

    // Setup Header info
    document.getElementById('quiz-topic-title').textContent = this.currentQuiz.title;
    document.getElementById('quiz-total-q').textContent = this.currentQuiz.questions.length;
    document.getElementById('quiz-reward-stars-badge').textContent = `+${this.currentQuiz.reward_stars || 15} ⭐`;

    // Start Timer
    this.startTimer();

    // Render first question
    this.renderQuestion();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    const timerDisplay = document.getElementById('quiz-timer-text');
    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      const mins = Math.floor(this.secondsElapsed / 60);
      const secs = this.secondsElapsed % 60;
      if (timerDisplay) {
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  renderQuestion() {
    if (!this.currentQuiz || !this.currentQuiz.questions.length) return;

    const q = this.currentQuiz.questions[this.currentQuestionIdx];
    const total = this.currentQuiz.questions.length;

    // Progress bar update
    document.getElementById('quiz-current-q').textContent = this.currentQuestionIdx + 1;
    const pct = ((this.currentQuestionIdx + 1) / total) * 100;
    document.getElementById('quiz-progress-bar').style.width = `${pct}%`;

    // Question statement
    document.getElementById('question-badge-text').textContent = `Câu hỏi ${this.currentQuestionIdx + 1} / ${total}`;
    document.getElementById('question-text-content').textContent = q.question_text;

    // Hint
    const hintBox = document.getElementById('question-hint-box');
    const hintBtn = document.getElementById('btn-toggle-hint');
    if (q.hint && q.hint.trim() !== '') {
      hintBtn.style.display = 'inline-flex';
      hintBox.textContent = `💡 Gợi ý của cô giáo: ${q.hint}`;
      hintBox.classList.remove('show');
    } else {
      hintBtn.style.display = 'none';
      hintBox.classList.remove('show');
    }

    // Render Options
    const optionsGrid = document.getElementById('question-options-grid');
    optionsGrid.innerHTML = '';

    const selectedOption = this.userAnswers[q.id];

    q.options.forEach(opt => {
      const card = document.createElement('div');
      card.className = `option-card ${selectedOption === opt.option_label ? 'selected' : ''}`;
      card.setAttribute('data-option', opt.option_label);

      card.innerHTML = `
        <div class="option-letter">${opt.option_label}</div>
        <div class="option-text">${opt.option_text}</div>
      `;

      card.addEventListener('click', () => {
        this.selectOption(q.id, opt.option_label);
      });

      optionsGrid.appendChild(card);
    });

    // Navigation buttons state
    const prevBtn = document.getElementById('btn-prev-question');
    const nextBtn = document.getElementById('btn-next-question');
    const submitBtn = document.getElementById('btn-submit-quiz');

    prevBtn.style.visibility = this.currentQuestionIdx > 0 ? 'visible' : 'hidden';

    if (this.currentQuestionIdx === total - 1) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }
  }

  selectOption(questionId, optionLabel) {
    window.audioManager.playPop();
    this.userAnswers[questionId] = optionLabel;

    // Highlight selected card visually
    const cards = document.querySelectorAll('#question-options-grid .option-card');
    cards.forEach(c => {
      if (c.getAttribute('data-option') === optionLabel) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });
  }

  toggleHint() {
    window.audioManager.playPop();
    const hintBox = document.getElementById('question-hint-box');
    hintBox.classList.toggle('show');
  }

  nextQuestion() {
    window.audioManager.playPop();
    if (this.currentQuestionIdx < this.currentQuiz.questions.length - 1) {
      this.currentQuestionIdx++;
      this.renderQuestion();
    }
  }

  prevQuestion() {
    window.audioManager.playPop();
    if (this.currentQuestionIdx > 0) {
      this.currentQuestionIdx--;
      this.renderQuestion();
    }
  }

  async submitQuiz() {
    if (this.isSubmitting) return;

    // Check unanswered
    const total = this.currentQuiz.questions.length;
    const answeredCount = Object.keys(this.userAnswers).length;
    if (answeredCount < total) {
      const confirmSubmit = confirm(`Bé còn ${total - answeredCount} câu chưa làm. Bé có chắc chắn muốn nộp bài luôn không?`);
      if (!confirmSubmit) return;
    }

    this.isSubmitting = true;
    this.stopTimer();

    const submitBtn = document.getElementById('btn-submit-quiz');
    submitBtn.textContent = '⏳ Đang chấm bài...';

    const res = await window.apiClient.submitQuiz(
      this.currentQuiz.id,
      this.userAnswers,
      this.secondsElapsed
    );

    this.isSubmitting = false;
    submitBtn.innerHTML = 'Nộp Bài Chấm Điểm 🎉';

    if (res.success && res.result) {
      this.showResultAndExplanation(res.result);
    } else {
      alert('Có lỗi khi chấm bài: ' + (res.message || 'Thử lại'));
    }
  }

  // Render Detailed Result & Explanations
  showResultAndExplanation(result) {
    // Hide Quiz view, show Result view
    document.getElementById('quiz-view').classList.remove('active');
    document.getElementById('quiz-view').style.display = 'none';

    const resultView = document.getElementById('result-view');
    resultView.style.display = 'block';
    resultView.classList.add('active');

    // Add stars to user state
    window.authManager.addStars(result.starsEarned || 0);

    // Audio cues & Confetti
    if (result.scorePercentage >= 80) {
      window.audioManager.playFanfare();
      window.triggerConfetti();
    } else if (result.scorePercentage >= 50) {
      window.audioManager.playCorrect();
    } else {
      window.audioManager.playIncorrect();
    }

    // Populate Hero Result Card
    document.getElementById('res-mascot').textContent = result.scorePercentage >= 80 ? '🥳' : (result.scorePercentage >= 50 ? '😊' : '🤗');
    document.getElementById('res-title').textContent = result.feedback.title;
    document.getElementById('res-message').textContent = result.feedback.message;
    document.getElementById('res-score-scale').textContent = `${result.score10Scale}/10`;
    document.getElementById('res-correct-count').textContent = `${result.correctCount}/${result.totalQuestions}`;
    document.getElementById('res-stars-earned').textContent = `+${result.starsEarned} ⭐`;

    const mins = Math.floor(result.timeTakenSeconds / 60);
    const secs = result.timeTakenSeconds % 60;
    document.getElementById('res-time-taken').textContent = `${mins}p ${secs}s`;

    // Populate Detailed Question Review Breakdown
    const reviewList = document.getElementById('result-explanation-list');
    reviewList.innerHTML = '';

    result.questionResults.forEach((qRes, idx) => {
      const card = document.createElement('div');
      card.className = `review-item-card ${qRes.isCorrect ? 'is-correct' : 'is-wrong'}`;

      const statusBadge = qRes.isCorrect
        ? `<span class="status-badge correct">✅ Bé trả lời đúng (+${qRes.points}đ)</span>`
        : `<span class="status-badge wrong">❌ Bé trả lời chưa đúng</span>`;

      let answerComparisonHTML = `
        <div class="review-answers-comparison">
          <div class="answer-row user-choice ${qRes.isCorrect ? '' : 'wrong'}">
            <span>👉 Lựa chọn của bé:</span>
            <strong>${qRes.userAnswer ? `Đáp án [${qRes.userAnswer}]` : 'Chưa chọn câu trả lời'}</strong>
          </div>
      `;

      if (!qRes.isCorrect) {
        answerComparisonHTML += `
          <div class="answer-row correct-choice">
            <span>🎯 Đáp án chính xác:</span>
            <strong>Đáp án [${qRes.correctAnswer}] - ${qRes.correctAnswerText}</strong>
          </div>
        `;
      }
      answerComparisonHTML += `</div>`;

      card.innerHTML = `
        <div class="review-card-header">
          <span style="font-weight: 800; color: var(--text-muted);">Câu hỏi ${idx + 1}</span>
          ${statusBadge}
        </div>
        <div class="review-question-text">${qRes.questionText}</div>
        ${answerComparisonHTML}
        <div class="explanation-callout">
          <div class="explanation-callout-header">
            <span>💡 Lời giải thích chi tiết:</span>
          </div>
          <div class="explanation-callout-text">${qRes.explanation}</div>
        </div>
      `;

      reviewList.appendChild(card);
    });

    // Scroll to top of result view smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToHome() {
    window.audioManager.playPop();
    this.stopTimer();
    document.getElementById('quiz-view').classList.remove('active');
    document.getElementById('quiz-view').style.display = 'none';
    document.getElementById('result-view').classList.remove('active');
    document.getElementById('result-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  retakeQuiz() {
    if (this.currentQuiz) {
      this.startQuiz(this.currentQuiz.id || this.currentQuiz.quizId);
    }
  }
}

window.quizPlayer = new QuizPlayer();
