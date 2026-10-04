import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SubjectsPage from './pages/SubjectsPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LeaderboardPage from './pages/LeaderboardPage';

import Footer from './components/Footer';
import { api } from './services/api';

export default function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedExerciseId, setSelectedExerciseId] = useState(101);
  const [quizResult, setQuizResult] = useState(null);

  // Background Cloud Sync on app boot & periodic auto-sync
  React.useEffect(() => {
    api.initCloudSync();
    const interval = setInterval(() => {
      api.initCloudSync();
    }, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Switch active tab automatically if role changes
  React.useEffect(() => {
    if (!user) {
      setActiveTab('dashboard');
      return;
    }
    if (user.role === 'teacher') {
      setActiveTab('teacher');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  }, [user?.role]);

  const handleStartExercise = (exId) => {
    setSelectedExerciseId(exId);
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizFinish = (result) => {
    setQuizResult(result);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <ProfileModal />
      <AuthModal />

      <main style={{ flex: 1 }}>
        {/* Unauthenticated View: Landing Page */}
        {!user && (
          <LandingPage />
        )}

        {/* Authenticated Student Views */}
        {user && user.role === 'student' && activeTab === 'dashboard' && (
          <Dashboard
            onStartExercise={handleStartExercise}
            onGoToSubjects={() => setActiveTab('subjects')}
          />
        )}

        {user && user.role === 'student' && activeTab === 'subjects' && (
          <SubjectsPage onStartExercise={handleStartExercise} />
        )}

        {user && user.role === 'student' && activeTab === 'quiz' && (
          <QuizPage
            exerciseId={selectedExerciseId}
            onFinish={handleQuizFinish}
            onBack={() => setActiveTab('subjects')}
          />
        )}

        {user && user.role === 'student' && activeTab === 'result' && (
          <ResultPage
            result={quizResult}
            onRetake={() => setActiveTab('quiz')}
            onGoToLeaderboard={() => setActiveTab('leaderboard')}
            onBackToSubjects={() => setActiveTab('subjects')}
          />
        )}

        {user && user.role === 'student' && activeTab === 'leaderboard' && (
          <LeaderboardPage />
        )}

        {/* Teacher Views */}
        {user && user.role === 'teacher' && activeTab === 'teacher' && (
          <TeacherDashboard />
        )}

        {/* Admin Views */}
        {user && user.role === 'admin' && activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      <Footer />
    </div>
  );
}
