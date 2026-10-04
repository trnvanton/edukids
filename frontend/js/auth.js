// Auth and User State Manager

const mascotIcons = {
  'mascot-bear': '🐻',
  'mascot-rabbit': '🐰',
  'mascot-lion': '🦁',
  'mascot-fox': '🦊',
  'mascot-panda': '🐼'
};

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.selectedAvatar = 'mascot-bear';
  }

  async init() {
    const savedUser = localStorage.getItem('tieu_hoc_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.updateHeaderUI();
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default initial guest session for immediate smooth testing
      this.currentUser = {
        id: 1,
        full_name: 'Bé Học Giỏi',
        grade_level: 1,
        avatar: 'mascot-bear',
        total_stars: 25,
        streak_days: 1
      };
      this.updateHeaderUI();
    }
  }

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem('tieu_hoc_user', JSON.stringify(user));
    this.updateHeaderUI();
  }

  getAvatarEmoji(avatarKey) {
    return mascotIcons[avatarKey] || '🐻';
  }

  updateHeaderUI() {
    const avatarEl = document.getElementById('header-user-avatar');
    const nameEl = document.getElementById('header-user-name');
    const starsEl = document.getElementById('header-star-count');
    const streakEl = document.getElementById('header-streak-count');

    if (this.currentUser) {
      if (avatarEl) avatarEl.textContent = this.getAvatarEmoji(this.currentUser.avatar);
      if (nameEl) nameEl.textContent = this.currentUser.full_name || 'Bé Khám Phá';
      if (starsEl) starsEl.textContent = this.currentUser.total_stars || 0;
      if (streakEl) streakEl.textContent = `${this.currentUser.streak_days || 1} ngày`;
    }
  }

  addStars(stars) {
    if (this.currentUser) {
      this.currentUser.total_stars = (this.currentUser.total_stars || 0) + stars;
      this.setUser(this.currentUser);
    }
  }
}

window.authManager = new AuthManager();
