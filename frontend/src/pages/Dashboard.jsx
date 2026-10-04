import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { sound } from '../services/audio';
import WeaknessAnalysisCard from '../components/WeaknessAnalysisCard';
import BadgeList from '../components/BadgeList';

export default function Dashboard({ onStartExercise, onGoToSubjects }) {
  const { user, getAvatarEmoji } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    const res = await api.getStudentDashboard(user);
    if (res.success && res.dashboard) {
      setData(res.dashboard);
    }
    setLoading(false);
  };

  if (loading || !data) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>⏳ Đang tải thế giới học tập của bé...</h2>
      </div>
    );
  }

  const { student, weaknessBreakdown, recommendations, badges } = data;

  const currentName = user?.full_name || student.full_name;
  const currentAvatar = user?.avatar || student.avatar;
  const currentStreak = user?.streak_days || student.streak_days || 1;
  const currentGrade = user?.grade_level || student.grade_level || 4;
  const currentXp = user?.xp !== undefined ? user.xp : (student.xp || 50);

  // Accurate level mapping based on real XP
  const getLevelDetails = (xp) => {
    if (xp >= 1000) return { level: 5, title: 'Trạng Nguyên Toàn Năng', icon: '👑' };
    if (xp >= 600) return { level: 4, title: 'Siêu Học Sinh', icon: '⭐' };
    if (xp >= 300) return { level: 3, title: 'Học Sinh Giỏi', icon: '🚀' };
    if (xp >= 100) return { level: 2, title: 'Học Sinh Chăm Chỉ', icon: '🐥' };
    return { level: 1, title: 'Tân Thủ Chăm Học', icon: '🌱' };
  };

  const levelDetails = getLevelDetails(currentXp);

  return (
    <div className="container" style={{ paddingBottom: '50px' }}>
      {/* Hero Welcome Banner */}
      <div className="hero-banner">
        <div>
          <h2 className="hero-title">
            Chào Mừng {currentName}! {getAvatarEmoji(currentAvatar)}
          </h2>
          <p className="hero-desc">
            Hôm nay bé có <strong>{currentStreak} ngày học liên tiếp 🔥</strong> (Khối Lớp {currentGrade}). Hoàn thành thử thách hôm nay để nhận thêm <strong>+50 XP</strong> và mở khóa huy hiệu <strong>Trạng Nguyên</strong> nhé!
          </p>
          <div style={{ marginTop: '18px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => { sound.pop(); onGoToSubjects(); }}>
              <span>🚀 Bắt Đầu Học Lớp {currentGrade} Ngay</span>
            </button>
            <div className="chip chip-level" style={{ fontSize: '1rem' }}>
              <span>{levelDetails.icon}</span>
              <span>Level {levelDetails.level} – {levelDetails.title}</span>
            </div>
            {user?.class_code && (
              <div className="chip" style={{
                background: '#EEF2FF',
                color: '#3730A3',
                border: '1.5px solid #C7D2FE',
                fontSize: '0.95rem',
                fontWeight: 900
              }}>
                <span>🏫 Lớp {user.class_name || user.class_code.split('-')[0]} (Mã: {user.class_code})</span>
              </div>
            )}
          </div>
        </div>
        <div className="hero-mascot">{getAvatarEmoji(currentAvatar)}</div>
      </div>

      {/* Grid 2 Columns: Adaptive Recommendations & Weakness Analytics */}
      <div className="grid-2">
        {/* Left Column: Adaptive Recommendations */}
        <div className="card">
          <div className="card-title">
            <span>🎯</span>
            <span>Gợi Ý Bài Tập Thích Ứng Dành Riêng Cho Bé</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Dựa trên kết quả làm bài gần đây, EduKids đề xuất các nội dung rèn luyện phù hợp nhất:
          </p>

          {recommendations.map((rec, idx) => (
            <div key={idx} className="recommend-card">
              <div className="recommend-title">{rec.recommendationTitle}</div>
              <div className="recommend-advice">{rec.advice}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {rec.exercises && rec.exercises.length > 0 ? (
                  rec.exercises.map(ex => (
                    <button
                      key={ex.id}
                      className="btn-recommend"
                      onClick={() => { sound.pop(); onStartExercise(ex.id); }}
                    >
                      ▶️ Làm Bài: {ex.title} (+{ex.reward_xp || 40} XP)
                    </button>
                  ))
                ) : (
                  <button
                    className="btn-recommend"
                    onClick={() => {
                      sound.pop();
                      onGoToSubjects();
                    }}
                  >
                    📚 Mở Danh Sách Bài Tập Môn Học
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Weakness Analytics & Mastery Bar */}
        <WeaknessAnalysisCard weaknessList={weaknessBreakdown} />
      </div>

      {/* Badges Collection */}
      <div style={{ marginTop: '24px' }}>
        <BadgeList badges={badges} />
      </div>
    </div>
  );
}
