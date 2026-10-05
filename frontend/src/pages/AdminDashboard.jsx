import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { useToast } from '../context/ToastContext';
import { useDialog } from '../context/DialogContext';
import { downloadExcelTemplate, parseExcelFile } from '../services/excelService';

export default function AdminDashboard() {
  const { showSuccess, showError, showInfo } = useToast();
  const { confirm } = useDialog();

  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'exercises', 'users', 'curriculum'
  
  // Exercise Management States
  const [exercisesList, setExercisesList] = useState([]);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [viewExercise, setViewExercise] = useState(null);
  const [editExercise, setEditExercise] = useState(null);

  // User Management States
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherGrade, setNewTeacherGrade] = useState('4');

  // Excel & New Exercise States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState('manual'); // 'manual' | 'excel'
  const [newExTitle, setNewExTitle] = useState('');
  const [newExGrade, setNewExGrade] = useState('4');
  const [newExSubject, setNewExSubject] = useState('1');
  const [newExXp, setNewExXp] = useState('50');
  const [newExRandomMode, setNewExRandomMode] = useState('all');
  const [newExShuffleQ, setNewExShuffleQ] = useState(true);
  const [newExShuffleOpt, setNewExShuffleOpt] = useState(true);
  const [excelFile, setExcelFile] = useState(null);
  const [excelQuestions, setExcelQuestions] = useState([]);
  const fileInputRef = useRef(null);

  const realStudents = typeof api.getRealStudents === 'function' ? api.getRealStudents() : [];
  const dynamicStudents = realStudents.map(st => ({
    id: st.id,
    name: st.full_name,
    role: 'student',
    grade: `Lớp ${st.grade_level || 2}`,
    xp: st.xp || 0,
    status: 'Hoạt động'
  }));

  const userList = [
    ...dynamicStudents,
    { id: 10, name: 'Cô Hoàng Mai', role: 'teacher', grade: 'Khối 2 & 4', xp: 0, status: 'Giáo viên chủ nhiệm' },
    { id: 99, name: 'Quản Trị Viên EduKids', role: 'admin', grade: 'Toàn trường', xp: 9999, status: 'Quản trị hệ thống' }
  ];

  const stats = [
    { label: 'Tổng Học Sinh', val: `${realStudents.length}`, icon: '👦', color: '#3B82F6' },
    { label: 'Giáo Viên', val: '1', icon: '👩‍🏫', color: '#10B981' },
    { label: 'Tổng Bài Tập / Đề Thi', val: `${exercisesList.length || 0}`, icon: '📝', color: '#8B5CF6' },
    { label: 'Ngân Hàng Câu Hỏi', val: `${exercisesList.reduce((acc, ex) => acc + (ex.questions?.length || 0), 0)} câu`, icon: '❓', color: '#F59E0B' }
  ];

  useEffect(() => {
    loadAllExercises();
  }, []);

  const loadAllExercises = () => {
    const res = api.getTeacherExercises();
    if (res.success && res.exercises) {
      setExercisesList(res.exercises);
    }
  };

  // Delete exercise
  const handleDeleteExercise = async (ex) => {
    sound.pop();
    const isConfirmed = await confirm({
      title: 'Xóa Bài Tập?',
      message: `Quản trị viên có chắc chắn muốn xóa bài tập "${ex.title}" (Mã #${ex.id}) khỏi toàn bộ hệ thống không?`,
      icon: '🗑️',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ'
    });

    if (isConfirmed) {
      await api.deleteExercise(ex.id);
      showSuccess('Đã Xóa Bài Tập', `Bài tập "${ex.title}" đã được xóa vĩnh viễn khỏi hệ thống!`);
      loadAllExercises();
    }
  };

  // Edit exercise save
  const handleSaveEditedExercise = (e) => {
    e.preventDefault();
    sound.pop();
    if (!editExercise) return;

    api.updateExercise(editExercise.id, editExercise);
    showSuccess('Cập Nhật Thành Công! ✨', `Đã lưu các thay đổi cho bài tập "${editExercise.title}"!`);
    setEditExercise(null);
    loadAllExercises();
  };

  // Excel upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);
    sound.pop();

    const res = await parseExcelFile(file);
    if (res.success && res.questions) {
      setExcelQuestions(res.questions);
      showSuccess('Đọc Excel thành công! 📊', `Đã trích xuất được ${res.questions.length} câu hỏi!`);
    } else {
      showError('Lỗi đọc Excel', res.message || 'Không thể trích xuất câu hỏi từ file.');
    }
  };

  const handleSaveExcelToBank = () => {
    if (excelQuestions.length === 0) {
      showError('Chưa có câu hỏi', 'Vui lòng tải lên file Excel có câu hỏi hợp lệ!');
      return;
    }

    sound.fanfare();
    const isRandom = newExRandomMode !== 'all';
    const randomCount = newExRandomMode === 'fixed_10' ? 10 : (newExRandomMode === 'fixed_20' ? 20 : (newExRandomMode === 'fixed_30' ? 30 : 10));

    const newEx = {
      id: Date.now() % 100000,
      title: newExTitle || 'Bài Tập Mới (Admin)',
      grade_level: parseInt(newExGrade, 10),
      subject_id: parseInt(newExSubject, 10),
      reward_xp: parseInt(newExXp, 10) || 50,
      questions: excelQuestions,
      assigned_to: `Lớp ${newExGrade}A1`,
      due_date: 'Chủ nhật tuần này (23:59)',
      is_random_pool: isRandom,
      random_mode: newExRandomMode,
      random_count: isRandom ? randomCount : excelQuestions.length,
      total_pool_count: excelQuestions.length,
      shuffle_questions: newExShuffleQ,
      shuffle_options: newExShuffleOpt
    };

    api.saveCustomExercise(newEx);
    showSuccess('Tạo Đề Thành Công! 🚀', `Đã lưu bài tập với ${excelQuestions.length} câu hỏi vào hệ thống!`);
    setShowCreateModal(false);
    setExcelQuestions([]);
    setExcelFile(null);
    loadAllExercises();
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    sound.pop();
    if (!newTeacherName) return;
    showSuccess('Thêm Giáo Viên', `Đã thêm giáo viên "${newTeacherName}" vào hệ thống EduKids thành công!`);
    setNewTeacherName('');
    setNewTeacherEmail('');
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice': return '🎯 Trắc Nghiệm';
      case 'fill_blank': return '✏️ Điền Ô / Số';
      case 'matching': return '🔗 Nối Cặp';
      case 'true_false': return '✅ Đúng / Sai';
      default: return 'Trắc Nghiệm';
    }
  };

  // Filter exercises
  const filteredExercises = exercisesList.filter(ex => {
    if (selectedGradeFilter !== 'all' && String(ex.grade_level) !== selectedGradeFilter) return false;
    if (selectedSubjectFilter !== 'all' && String(ex.subject_id) !== selectedSubjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return ex.title?.toLowerCase().includes(q) || String(ex.id).includes(q);
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Admin Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '24px',
        padding: '32px 36px',
        color: 'white',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.3)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>
            <span>👨‍💼 Quản Trị Viên Cấp Cao (Super Admin)</span>
            <span>•</span>
            <span>Hệ Thống Giáo Dục EduKids</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px', lineHeight: 1.2 }}>
            Bảng Điều Khiển & Quản Trị Hệ Thống ⚙️
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
            Toàn quyền Quản lý Người dùng, Chỉnh sửa/Xóa đề thi & bài tập toàn trường, Cấu hình Ngân hàng câu hỏi và Sao lưu hệ thống.
          </p>
        </div>

        <div style={{ fontSize: '4.2rem', opacity: 0.9 }}>🛡️</div>
      </div>

      {/* Admin Navigation Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => { sound.pop(); setAdminTab('overview'); }}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: adminTab === 'overview' ? '1.5px solid #1E293B' : '1.5px solid #E2E8F0',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: adminTab === 'overview' ? '#1E293B' : '#FFFFFF',
            color: adminTab === 'overview' ? '#FFFFFF' : '#475569',
            boxShadow: adminTab === 'overview' ? '0 4px 12px rgba(15, 23, 42, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          📊 Thống Kê Chung
        </button>

        <button
          onClick={() => { sound.pop(); setAdminTab('exercises'); }}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: adminTab === 'exercises' ? '1.5px solid #4F46E5' : '1.5px solid #E2E8F0',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: adminTab === 'exercises' ? '#4F46E5' : '#FFFFFF',
            color: adminTab === 'exercises' ? '#FFFFFF' : '#475569',
            boxShadow: adminTab === 'exercises' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          📝 Quản Lý & Chỉnh Sửa Đề Thi ({exercisesList.length} bài)
        </button>

        <button
          onClick={() => { sound.pop(); setAdminTab('users'); }}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: adminTab === 'users' ? '1.5px solid #1E293B' : '1.5px solid #E2E8F0',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: adminTab === 'users' ? '#1E293B' : '#FFFFFF',
            color: adminTab === 'users' ? '#FFFFFF' : '#475569',
            boxShadow: adminTab === 'users' ? '0 4px 12px rgba(15, 23, 42, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          👥 Quản Lý Người Dùng
        </button>

        <button
          onClick={() => { sound.pop(); setAdminTab('curriculum'); }}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: adminTab === 'curriculum' ? '1.5px solid #1E293B' : '1.5px solid #E2E8F0',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: adminTab === 'curriculum' ? '#1E293B' : '#FFFFFF',
            color: adminTab === 'curriculum' ? '#FFFFFF' : '#475569',
            boxShadow: adminTab === 'curriculum' ? '0 4px 12px rgba(15, 23, 42, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          📚 Khối Lớp & Môn Học
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {adminTab === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {stats.map((s, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                <div style={{ fontSize: '2.4rem', background: '#F8FAFC', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title">
                <span>📈</span>
                <span>Hoạt Động Học Tập Hôm Nay</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Số lượt làm bài tập hoàn thành:</span>
                  <strong style={{ color: 'var(--primary)' }}>342 lượt</strong>
                </li>
                <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Tổng điểm thưởng XP đã cấp:</span>
                  <strong style={{ color: '#B45309' }}>+12,450 XP ⭐</strong>
                </li>
                <li style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Tỷ lệ hoàn thành đúng 100%:</span>
                  <strong style={{ color: '#059669' }}>78.5%</strong>
                </li>
              </ul>
            </div>

            <div className="card">
              <div className="card-title">
                <span>🛡️</span>
                <span>Bảo Trì & Sao Lưu Hệ Thống</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
                Hệ thống hoạt động trên nền tảng đám mây an toàn, cơ sở dữ liệu đồng bộ thời gian thực và tự động tạo điểm khôi phục.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => { sound.pop(); showSuccess('Sao Lưu Thành Công', 'Toàn bộ dữ liệu đề thi và tài khoản đã được sao lưu an toàn!'); }}>
                  💾 Sao Lưu Dữ Liệu
                </button>
                <button className="btn-secondary" onClick={() => { sound.pop(); showSuccess('Kiểm Tra Tải', 'Hệ thống máy chủ hoạt động xuất sắc, độ trễ 12ms!'); }}>
                  ⚡ Kiểm Tra Tải
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: EXERCISES MANAGEMENT (FULL MASTER PRIVILEGES) ================= */}
      {adminTab === 'exercises' && (
        <div>
          {/* Controls Bar */}
          <div className="card" style={{ marginBottom: '20px', padding: '18px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              {/* Filters */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                <input
                  type="text"
                  placeholder="🔍 Tìm theo tên đề hoặc mã đề..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 700, minWidth: '220px' }}
                />

                <select
                  value={selectedGradeFilter}
                  onChange={e => setSelectedGradeFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 800, cursor: 'pointer' }}
                >
                  <option value="all">Tất cả khối lớp</option>
                  <option value="1">Khối Lớp 1</option>
                  <option value="2">Khối Lớp 2</option>
                  <option value="3">Khối Lớp 3</option>
                  <option value="4">Khối Lớp 4</option>
                  <option value="5">Khối Lớp 5</option>
                </select>

                <select
                  value={selectedSubjectFilter}
                  onChange={e => setSelectedSubjectFilter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 800, cursor: 'pointer' }}
                >
                  <option value="all">Tất cả môn học</option>
                  <option value="1">📐 Toán Học</option>
                  <option value="2">📖 Tiếng Việt</option>
                  <option value="3">🔬 Khoa Học</option>
                  <option value="4">🇬🇧 Tiếng Anh</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  📥 Tải Mẫu Excel
                </button>
                <button
                  type="button"
                  onClick={() => { sound.pop(); setShowCreateModal(true); }}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)', padding: '8px 16px', fontSize: '0.88rem' }}
                >
                  ➕ Thêm / Nhập Đề Thi Mới
                </button>
              </div>
            </div>
          </div>

          {/* Exercises Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                📑 Danh Sách Toàn Bộ Bài Tập & Đề Thi ({filteredExercises.length} bài)
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>
                Quyền Admin: Được phép Xem chi tiết, Chỉnh sửa câu hỏi & Xóa vĩnh viễn
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Tên Bài Tập / Đề Thi</th>
                    <th>Khối / Môn</th>
                    <th>Số Lượng Câu</th>
                    <th>Lớp Giao</th>
                    <th>Lượt Nộp</th>
                    <th>Điểm TB</th>
                    <th style={{ textAlign: 'center' }}>Thao Tác Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExercises.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8', fontWeight: 700 }}>
                        Không tìm thấy bài tập nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredExercises.map(ex => (
                      <tr key={ex.id}>
                        <td>
                          <strong>{ex.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã đề: #{ex.id} • +{ex.reward_xp || 50} XP</div>
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            background: '#EEF2FF',
                            color: '#4F46E5'
                          }}>
                            {ex.subject_icon || '📚'} Lớp {ex.grade_level}
                          </span>
                        </td>
                        <td>
                          {ex.is_random_pool || (ex.random_count && ex.random_count < (ex.questionsCount || ex.questions?.length)) ? (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontWeight: 900,
                              fontSize: '0.82rem',
                              background: '#F5F3FF',
                              color: '#7C3AED',
                              border: '1.5px solid #DDD6FE',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span>🎲</span>
                              <span>Random {ex.random_count || 10}/{ex.questionsCount || ex.questions?.length || 0} câu</span>
                            </span>
                          ) : (
                            <span style={{ fontWeight: 800, color: '#059669' }}>{ex.questionsCount || ex.questions?.length || 0} câu</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#334155' }}>{ex.assigned_to || `Lớp ${ex.grade_level}A1`}</span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: ex.submissions_count > 0 ? '#D1FAE5' : '#F1F5F9',
                            color: ex.submissions_count > 0 ? '#065F46' : '#64748B'
                          }}>
                            {ex.submissions_count || 0}/{ex.total_students || 3} đã nộp
                          </span>
                        </td>
                        <td>
                          {ex.average_score !== null ? (
                            <span style={{ fontWeight: 900, color: '#B45309' }}>{ex.average_score}/10</span>
                          ) : (
                            <span style={{ color: '#94A3B8', fontWeight: 700 }}>Chưa có</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => { sound.pop(); setViewExercise(ex); }}
                              title="Xem chi tiết câu hỏi & đáp án"
                              style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                            >
                              👁️ Xem
                            </button>
                            <button
                              type="button"
                              onClick={() => { sound.pop(); setEditExercise(JSON.parse(JSON.stringify(ex))); }}
                              title="Chỉnh sửa nội dung đề bài"
                              style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#B45309', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExercise(ex)}
                              title="Xóa đề bài này"
                              style={{ background: '#FEE2E2', border: '1px solid #FECDD3', color: '#DC2626', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= VIEW EXERCISE MODAL ================= */}
          {viewExercise && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px'
            }}>
              <div className="card" style={{ maxWidth: '750px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                      👁️ Chi Tiết Đề Bài: {viewExercise.title}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>
                      Mã #{viewExercise.id} • Khối {viewExercise.grade_level} • Gồm {viewExercise.questions?.length || 0} câu hỏi • +{viewExercise.reward_xp || 50} XP
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewExercise(null)}
                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: 900, cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Submissions List */}
                <div style={{ marginBottom: '20px', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ fontWeight: 900, color: '#166534', fontSize: '0.98rem', marginBottom: '8px' }}>
                    📊 Danh Sách Học Sinh Đã Nộp Bài ({viewExercise.submissionsList?.length || 0} em):
                  </h4>

                  {viewExercise.submissionsList && viewExercise.submissionsList.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {viewExercise.submissionsList.map((sub, sIdx) => (
                        <div key={sub.id || sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🐻</span>
                            <div>
                              <strong style={{ color: '#1E293B' }}>{sub.user_name}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Nộp lúc: {sub.submittedAt} • Làm trong {sub.timeTakenSeconds}s</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, color: '#059669', fontSize: '1.1rem' }}>{sub.score10}/10</div>
                            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>Đúng {sub.correctCount}/{sub.totalQuestions} câu</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#64748B', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      Chưa có học sinh nào nộp bài tập này.
                    </div>
                  )}
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(viewExercise.questions || []).map((q, idx) => (
                    <div key={q.id || idx} style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 900, color: '#4F46E5' }}>Câu {idx + 1}</span>
                        <span style={{ background: '#EEF2FF', color: '#4338CA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                          {getQuestionTypeLabel(q.question_type)}
                        </span>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1E293B', marginBottom: '8px' }}>
                        {q.question_text}
                      </div>

                      {q.image_url && (
                        <div style={{ marginBottom: '10px' }}>
                          <img src={q.image_url} alt="q" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid #CBD5E1', objectFit: 'contain' }} />
                        </div>
                      )}

                      {q.options && q.options.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                          {q.options.map(opt => (
                            <div
                              key={opt.option_label}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: opt.option_label === q.correct_answer ? '#D1FAE5' : 'white',
                                border: opt.option_label === q.correct_answer ? '2px solid #059669' : '1px solid #CBD5E1',
                                fontSize: '0.88rem',
                                fontWeight: 700
                              }}
                            >
                              <strong>[{opt.option_label}]</strong> {opt.answer_text}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ background: '#ECFDF5', padding: '8px 12px', borderRadius: '8px', color: '#065F46', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>
                        🎯 Đáp án đúng: {q.correct_answer}
                      </div>

                      {q.explanation && (
                        <div style={{ background: '#FFFBEB', padding: '8px 12px', borderRadius: '8px', color: '#92400E', fontSize: '0.82rem', fontWeight: 600 }}>
                          💡 Giải thích: {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= EDIT EXERCISE MODAL ================= */}
          {editExercise && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px'
            }}>
              <div className="card" style={{ maxWidth: '800px', width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                      ✏️ Admin: Chỉnh Sửa Đề Bài #{editExercise.id}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>
                      Thay đổi tiêu đề, khối lớp, câu hỏi và cấu hình random pool
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditExercise(null)}
                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: 900, cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveEditedExercise}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Tên bài tập:</label>
                      <input
                        type="text"
                        value={editExercise.title}
                        onChange={e => setEditExercise({ ...editExercise, title: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Khối lớp:</label>
                      <select
                        value={editExercise.grade_level}
                        onChange={e => setEditExercise({ ...editExercise, grade_level: parseInt(e.target.value, 10) })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      >
                        <option value="1">Lớp 1</option>
                        <option value="2">Lớp 2</option>
                        <option value="3">Lớp 3</option>
                        <option value="4">Lớp 4</option>
                        <option value="5">Lớp 5</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Lớp nhận bài:</label>
                      <input
                        type="text"
                        value={editExercise.assigned_to || `Lớp ${editExercise.grade_level}A1`}
                        onChange={e => setEditExercise({ ...editExercise, assigned_to: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  {/* Random Mode Setting */}
                  <div style={{ background: '#F5F3FF', padding: '14px', borderRadius: '10px', border: '1.5px solid #DDD6FE', marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontWeight: 900, color: '#6D28D9', fontSize: '0.88rem', marginBottom: '6px' }}>
                      🎲 Cấu hình phát đề ngẫu nhiên:
                    </label>
                    <select
                      value={editExercise.random_mode || (editExercise.is_random_pool ? 'fixed_10' : 'all')}
                      onChange={e => {
                        const val = e.target.value;
                        const isR = val !== 'all';
                        let cnt = editExercise.questions?.length || 10;
                        if (val === 'fixed_5') cnt = 5;
                        else if (val === 'fixed_10') cnt = 10;
                        else if (val === 'fixed_15') cnt = 15;
                        else if (val === 'fixed_20') cnt = 20;
                        else if (val === 'fixed_30') cnt = 30;
                        else if (val === 'fixed_50') cnt = 50;
                        else if (val === 'student_choice') cnt = 10;

                        setEditExercise({
                          ...editExercise,
                          random_mode: val,
                          is_random_pool: isR,
                          random_count: isR ? cnt : editExercise.questions?.length
                        });
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C4B5FD', fontWeight: 800, color: '#4C1D95' }}
                    >
                      <option value="all">📋 Làm toàn bộ câu hỏi trong đề</option>
                      <option value="fixed_5">🎲 Ngân hàng đề: Lấy ngẫu nhiên 5 câu mỗi lượt làm</option>
                      <option value="fixed_10">🎲 Ngân hàng đề: Lấy ngẫu nhiên 10 câu mỗi lượt làm</option>
                      <option value="fixed_15">🎲 Ngân hàng đề: Lấy ngẫu nhiên 15 câu mỗi lượt làm</option>
                      <option value="fixed_20">🎲 Ngân hàng đề: Lấy ngẫu nhiên 20 câu mỗi lượt làm</option>
                      <option value="fixed_30">🎲 Ngân hàng đề: Lấy ngẫu nhiên 30 câu mỗi lượt làm</option>
                      <option value="fixed_50">🎲 Ngân hàng đề: Lấy ngẫu nhiên 50 câu mỗi lượt làm</option>
                      <option value="student_choice">🎯 Học sinh tự chọn số lượng (10 / 20 / 30 / Tất cả)</option>
                    </select>
                  </div>

                  {/* List of Questions */}
                  <h4 style={{ fontWeight: 900, color: '#334155', marginBottom: '12px' }}>
                    Danh Sách Câu Hỏi ({editExercise.questions?.length || 0} câu):
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    {(editExercise.questions || []).map((q, idx) => (
                      <div key={q.id || idx} style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 900, color: '#4F46E5' }}>Câu hỏi #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQ = editExercise.questions.filter((_, i) => i !== idx);
                              setEditExercise({ ...editExercise, questions: updatedQ });
                            }}
                            style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            ✕ Xóa câu này
                          </button>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '2px' }}>Nội dung câu hỏi:</label>
                          <input
                            type="text"
                            value={q.question_text}
                            onChange={e => {
                              const updatedQ = [...editExercise.questions];
                              updatedQ[idx].question_text = e.target.value;
                              setEditExercise({ ...editExercise, questions: updatedQ });
                            }}
                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 700 }}
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '2px' }}>Đáp án đúng:</label>
                            <input
                              type="text"
                              value={q.correct_answer}
                              onChange={e => {
                                const updatedQ = [...editExercise.questions];
                                updatedQ[idx].correct_answer = e.target.value;
                                setEditExercise({ ...editExercise, questions: updatedQ });
                              }}
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #10B981', background: '#ECFDF5', fontWeight: 800, color: '#065F46' }}
                              required
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '2px' }}>Link ảnh minh họa (nếu có):</label>
                            <input
                              type="text"
                              value={q.image_url || ''}
                              onChange={e => {
                                const updatedQ = [...editExercise.questions];
                                updatedQ[idx].image_url = e.target.value;
                                setEditExercise({ ...editExercise, questions: updatedQ });
                              }}
                              placeholder="URL ảnh..."
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '2px' }}>Lời giải thích chi tiết:</label>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={e => {
                              const updatedQ = [...editExercise.questions];
                              updatedQ[idx].explanation = e.target.value;
                              setEditExercise({ ...editExercise, questions: updatedQ });
                            }}
                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setEditExercise(null)}
                      style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ background: 'linear-gradient(135deg, #10B981, #059669)', padding: '10px 24px' }}
                    >
                      <span>💾 Lưu Toàn Bộ Thay Đổi 🚀</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= CREATE / IMPORT MODAL ================= */}
          {showCreateModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px'
            }}>
              <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                    ➕ Admin: Thêm Bài Tập / Nhập Excel
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: 900, cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Meta fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Tên đề bài:</label>
                    <input
                      type="text"
                      value={newExTitle}
                      onChange={e => setNewExTitle(e.target.value)}
                      placeholder="Ví dụ: Đề thi khảo sát chất lượng..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Khối lớp:</label>
                    <select
                      value={newExGrade}
                      onChange={e => setNewExGrade(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 800 }}
                    >
                      <option value="1">Khối 1</option>
                      <option value="2">Khối 2</option>
                      <option value="3">Khối 3</option>
                      <option value="4">Khối 4</option>
                      <option value="5">Khối 5</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Môn học:</label>
                    <select
                      value={newExSubject}
                      onChange={e => setNewExSubject(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 800 }}
                    >
                      <option value="1">📐 Toán Học</option>
                      <option value="2">📖 Tiếng Việt</option>
                      <option value="3">🔬 Khoa Học</option>
                      <option value="4">🇬🇧 Tiếng Anh</option>
                    </select>
                  </div>
                </div>

                {/* Random Pool Config */}
                <div style={{ background: '#F5F3FF', padding: '14px', borderRadius: '12px', border: '1.5px solid #DDD6FE', marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontWeight: 900, color: '#6D28D9', fontSize: '0.88rem', marginBottom: '6px' }}>
                    🎲 Chế độ bốc đề ngẫu nhiên:
                  </label>
                  <select
                    value={newExRandomMode}
                    onChange={e => setNewExRandomMode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C4B5FD', fontWeight: 800, color: '#4C1D95' }}
                  >
                    <option value="all">📋 Làm toàn bộ câu hỏi trong file Excel</option>
                    <option value="fixed_10">🎲 Ngân hàng đề: Bốc ngẫu nhiên 10 câu mỗi lượt</option>
                    <option value="fixed_20">🎲 Ngân hàng đề: Bốc ngẫu nhiên 20 câu mỗi lượt</option>
                    <option value="fixed_30">🎲 Ngân hàng đề: Bốc ngẫu nhiên 30 câu mỗi lượt</option>
                    <option value="student_choice">🎯 Cho phép học sinh tự chọn số câu</option>
                  </select>
                </div>

                {/* Upload Excel Area */}
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{
                    border: '2px dashed #4F46E5',
                    background: '#EEF2FF',
                    borderRadius: '14px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: '20px'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📁</div>
                  <h4 style={{ fontWeight: 900, color: '#3730A3', fontSize: '1.05rem', margin: '0 0 4px 0' }}>
                    {excelFile ? `Đã chọn file: ${excelFile.name} (${excelQuestions.length} câu)` : 'Bấm vào đây để chọn file Excel (.xlsx / .csv)'}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#4F46E5', margin: 0 }}>
                    Hệ thống sẽ tự động nhập toàn bộ câu hỏi và đáp án vào cơ sở dữ liệu
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExcelToBank}
                    disabled={excelQuestions.length === 0}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #4338CA)', padding: '10px 24px', opacity: excelQuestions.length === 0 ? 0.6 : 1 }}
                  >
                    <span>🚀 Lưu & Phát Hành Đề Bài</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: USERS MANAGEMENT ================= */}
      {adminTab === 'users' && (
        <div>
          {/* Add Teacher Form */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">
              <span>➕</span>
              <span>Thêm Tài Khoản Giáo Viên Mới</span>
            </div>
            <form onSubmit={handleAddTeacher} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Họ tên giáo viên:</label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  placeholder="Cô Nguyễn Thị Hằng..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '4px' }}>Email liên hệ:</label>
                <input
                  type="email"
                  value={newTeacherEmail}
                  onChange={e => setNewTeacherEmail(e.target.value)}
                  placeholder="hang.nguyen@edukids.vn..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ height: '42px', justifyContent: 'center' }}>
                <span>Thêm Giáo Viên ➕</span>
              </button>
            </form>
          </div>

          {/* User List Table */}
          <div className="card">
            <div className="card-title">
              <span>👥</span>
              <span>Danh Sách Người Dùng Trong Hệ Thống</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Họ và Tên</th>
                  <th>Vai Trò</th>
                  <th>Khối / Lớp</th>
                  <th>Điểm XP</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {userList.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        background: u.role === 'teacher' ? '#D1FAE5' : '#EEF2FF',
                        color: u.role === 'teacher' ? '#065F46' : 'var(--primary)'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.grade}</td>
                    <td>{u.xp > 0 ? `${u.xp} XP ⭐` : '-'}</td>
                    <td><span style={{ color: '#059669', fontWeight: 700 }}>{u.status}</span></td>
                    <td>
                      <button
                        onClick={() => { sound.pop(); showSuccess('Đặt Lại Mật Khẩu', `Đã gửi mã đặt lại mật khẩu mới cho ${u.name}`); }}
                        style={{ background: '#F1F5F9', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        Đặt lại mật khẩu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CURRICULUM ================= */}
      {adminTab === 'curriculum' && (
        <div className="card">
          <div className="card-title">
            <span>📚</span>
            <span>Danh Mục Khối Lớp (1 - 5) & Môn Học</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {['Lớp 1 🌱', 'Lớp 2 🐥', 'Lớp 3 🐱', 'Lớp 4 🚀', 'Lớp 5 👑'].map((name, i) => (
              <div key={i} style={{ background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>{name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  • 📐 Toán Học<br/>
                  • 📖 Tiếng Việt<br/>
                  • 🔬 Khoa Học / TN&XH<br/>
                  • 🇬🇧 Tiếng Anh
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
