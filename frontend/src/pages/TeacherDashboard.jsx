import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { useToast } from '../context/ToastContext';
import { useDialog } from '../context/DialogContext';
import { downloadExcelTemplate, parseExcelFile } from '../services/excelService';

export default function TeacherDashboard() {
  const { showSuccess, showError, showInfo } = useToast();
  const { alert: dialogAlert, confirm } = useDialog();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTeacherTab, setActiveTeacherTab] = useState('classes'); // 'classes', 'assigned-list', 'create-exercise', 'import-excel', 'create-class', 'assign'

  // Form states - Create Class & Add Student
  const [newClassName, setNewClassName] = useState('5A2');
  const [newClassGrade, setNewClassGrade] = useState('5');
  const [newStudentName, setNewStudentName] = useState('');
  const [targetClassForStudent, setTargetClassForStudent] = useState('1');

  // Exercise Metadata
  const [exerciseTitle, setExerciseTitle] = useState('Phiếu Bài Tập Rèn Luyện Toàn Diện');
  const [exerciseGrade, setExerciseGrade] = useState('4');
  const [exerciseSubject, setExerciseSubject] = useState('1'); // 1: Toan, 2: Tieng Viet, 3: Khoa Hoc, 4: Tieng Anh
  const [exerciseXp, setExerciseXp] = useState('50');

  // Question Creator State
  const [questionType, setQuestionType] = useState('multiple_choice'); // 'multiple_choice', 'fill_blank', 'matching', 'true_false'
  const [questionText, setQuestionText] = useState('Tính nhẩm nhanh: 25 x 4 = ?');
  const [imageUrl, setImageUrl] = useState('');
  const [hint, setHint] = useState('Bé nhẩm 25 x 2 = 50 rồi nhân 2 tiếp nhé!');
  const [explanation, setExplanation] = useState('Giải thích: 25 x 4 = 100. Bé có thể tính nhẩm hoặc nhân theo thứ tự từ phải sang trái.');

  // Multiple Choice fields
  const [optA, setOptA] = useState('80');
  const [optB, setOptB] = useState('100');
  const [optC, setOptC] = useState('120');
  const [optD, setOptD] = useState('150');
  const [correctOpt, setCorrectOpt] = useState('B');

  // Fill Blank field
  const [fillAnswer, setFillAnswer] = useState('100');

  // True/False field
  const [tfAnswer, setTfAnswer] = useState('Đúng');

  // Matching fields (Pairs)
  const [matchingPairs, setMatchingPairs] = useState([
    { id: 1, left: '3 x 5', right: '15' },
    { id: 2, left: '4 x 6', right: '24' },
    { id: 3, left: '9 x 2', right: '18' }
  ]);

  // List of questions currently compiled for this new exercise
  const [draftQuestions, setDraftQuestions] = useState([]);

  // Excel Import states
  const [excelFile, setExcelFile] = useState(null);
  const [excelQuestions, setExcelQuestions] = useState([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const fileInputRef = useRef(null);

  // Assigned Exercises List State
  const [teacherExercises, setTeacherExercises] = useState([]);
  const [selectedViewExercise, setSelectedViewExercise] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);

  // Assign state
  const [assignClassId, setAssignClassId] = useState('1');
  const [assignTitle, setAssignTitle] = useState('Ôn tập phân số cuối tuần');

  useEffect(() => {
    loadTeacherData();
    loadExercisesList();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    const res = await api.getTeacherDashboard();
    if (res.success) {
      setData(res);
    }
    setLoading(false);
  };

  const loadExercisesList = () => {
    const res = api.getTeacherExercises();
    if (res.success && res.exercises) {
      setTeacherExercises(res.exercises);
    }
  };

  // Image upload helper
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showError('Ảnh quá lớn', 'Vui lòng chọn ảnh có dung lượng dưới 2MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
      showSuccess('Tải ảnh thành công', 'Ảnh minh họa đã được đính kèm vào câu hỏi!');
    };
    reader.readAsDataURL(file);
  };

  // Add question to draft list
  const handleAddQuestionToDraft = (e) => {
    e.preventDefault();
    sound.pop();

    if (!questionText.trim()) {
      showError('Thiếu nội dung', 'Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    let qData = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      question_type: questionType,
      question_text: questionText,
      image_url: imageUrl,
      hint: hint.trim(),
      explanation: explanation.trim(),
      points: 10
    };

    if (questionType === 'multiple_choice') {
      qData.options = [
        { option_label: 'A', answer_text: optA },
        { option_label: 'B', answer_text: optB },
        { option_label: 'C', answer_text: optC },
        { option_label: 'D', answer_text: optD }
      ];
      qData.correct_answer = correctOpt;
    } else if (questionType === 'fill_blank') {
      if (!fillAnswer.trim()) {
        showError('Thiếu đáp án', 'Vui lòng nhập đáp án đúng để hệ thống chấm điểm!');
        return;
      }
      qData.correct_answer = fillAnswer.trim();
    } else if (questionType === 'true_false') {
      qData.options = [
        { option_label: 'Đúng', answer_text: 'Đúng 👍' },
        { option_label: 'Sai', answer_text: 'Sai 👎' }
      ];
      qData.correct_answer = tfAnswer;
    } else if (questionType === 'matching') {
      const validPairs = matchingPairs.filter(p => p.left.trim() && p.right.trim());
      if (validPairs.length < 2) {
        showError('Chưa đủ cặp nối', 'Cần ít nhất 2 cặp vế để tạo câu hỏi nối!');
        return;
      }
      const left = validPairs.map((p, idx) => ({ id: `${idx + 1}`, text: p.left.trim() }));
      const right = validPairs.map((p, idx) => ({ id: String.fromCharCode(65 + idx), text: p.right.trim() }));
      const correctPairs = {};
      validPairs.forEach((p, idx) => {
        correctPairs[`${idx + 1}`] = String.fromCharCode(65 + idx);
      });

      const shuffledRight = [...right].sort(() => Math.random() - 0.5);

      qData.matching_data = {
        left,
        right: shuffledRight,
        correctPairs
      };
      qData.correct_answer = Object.entries(correctPairs).map(([l, r]) => `${l} ➔ ${r}`).join(', ');
    }

    setDraftQuestions(prev => [...prev, qData]);
    showSuccess('Đã thêm câu hỏi', `Câu hỏi dạng [${getQuestionTypeLabel(questionType)}] đã được thêm vào đề!`);

    setQuestionText('');
    setImageUrl('');
    setHint('');
    setExplanation('');
    setFillAnswer('');
  };

  const handleRemoveDraftQuestion = (idx) => {
    sound.pop();
    setDraftQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  // Save complete exercise
  const handleSaveFullExercise = () => {
    if (draftQuestions.length === 0) {
      showError('Chưa có câu hỏi', 'Vui lòng soạn ít nhất 1 câu hỏi trước khi lưu bài tập!');
      return;
    }

    sound.fanfare();
    const newEx = {
      id: Date.now() % 100000,
      title: exerciseTitle,
      grade_level: parseInt(exerciseGrade, 10),
      subject_id: parseInt(exerciseSubject, 10),
      reward_xp: parseInt(exerciseXp, 10) || 50,
      questions: draftQuestions,
      assigned_to: 'Lớp 4A1',
      due_date: 'Chủ nhật tuần này'
    };

    api.saveCustomExercise(newEx);
    showSuccess('Lưu Thành Công! 🎉', `Đã lưu "${exerciseTitle}" gồm ${draftQuestions.length} câu hỏi vào Ngân hàng đề thi!`);
    setDraftQuestions([]);
    loadExercisesList();
    setActiveTeacherTab('assigned-list');
  };

  // Excel handlers
  const handleDownloadExcelTemplate = () => {
    sound.pop();
    downloadExcelTemplate();
    showSuccess('Đã tải file mẫu', 'Mở file Excel "EduKids_Mau_Nhap_Bai_Tap.xlsx" để xem mẫu và nhập câu hỏi!');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);
    setIsParsingExcel(true);
    sound.pop();

    const res = await parseExcelFile(file);
    setIsParsingExcel(false);

    if (res.success && res.questions) {
      setExcelQuestions(res.questions);
      showSuccess('Đọc Excel thành công! 📊', `Đã trích xuất thành công ${res.questions.length} câu hỏi từ file!`);
    } else {
      showError('Lỗi đọc file Excel', res.message || 'Không thể trích xuất câu hỏi từ file này.');
    }
  };

  const handleImportExcelToBank = () => {
    if (excelQuestions.length === 0) {
      showError('Chưa có câu hỏi', 'Vui lòng tải lên file Excel hợp lệ có chứa câu hỏi!');
      return;
    }

    sound.fanfare();
    const newEx = {
      id: Date.now() % 100000,
      title: exerciseTitle || 'Bài Tập Nhập Từ Excel',
      grade_level: parseInt(exerciseGrade, 10),
      subject_id: parseInt(exerciseSubject, 10),
      reward_xp: parseInt(exerciseXp, 10) || 50,
      questions: excelQuestions,
      assigned_to: 'Lớp 4A1',
      due_date: 'Chủ nhật tuần này'
    };

    api.saveCustomExercise(newEx);
    showSuccess('Nhập Excel Thành Công! 🚀', `Đã lưu toàn bộ ${excelQuestions.length} câu hỏi vào Ngân hàng đề thi Khối ${exerciseGrade}!`);
    setExcelQuestions([]);
    setExcelFile(null);
    loadExercisesList();
    setActiveTeacherTab('assigned-list');
  };

  // Edit / Delete / View Exercise Actions
  const handleStartEdit = (ex) => {
    sound.pop();
    setEditingExercise(JSON.parse(JSON.stringify(ex)));
  };

  const handleSaveEditedExercise = (e) => {
    e.preventDefault();
    sound.pop();
    if (!editingExercise) return;

    api.updateExercise(editingExercise.id, editingExercise);
    showSuccess('Cập Nhật Thành Công! ✨', `Đã lưu các thay đổi cho bài tập "${editingExercise.title}"!`);
    setEditingExercise(null);
    loadExercisesList();
  };

  const handleDeleteExercise = async (ex) => {
    sound.pop();
    const isConfirmed = await confirm({
      title: 'Xóa Bài Tập?',
      message: `Cô có chắc chắn muốn xóa bài tập "${ex.title}" khỏi danh sách giao bài không?`,
      icon: '🗑️',
      confirmText: 'Xóa luôn',
      cancelText: 'Hủy bỏ'
    });

    if (isConfirmed) {
      api.deleteExercise(ex.id);
      showSuccess('Đã Xóa Bài Tập', `Bài tập "${ex.title}" đã được xóa an toàn!`);
      loadExercisesList();
    }
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

  const handleCreateClass = (e) => {
    e.preventDefault();
    sound.pop();
    showSuccess('Tạo Lớp Thành Công', `Đã tạo thành công Lớp ${newClassName} (Khối ${newClassGrade})!`);
    setActiveTeacherTab('classes');
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    sound.pop();
    if (!newStudentName) return;
    showSuccess('Thêm Học Sinh', `Đã thêm học sinh "${newStudentName}" vào Lớp 4A1 thành công!`);
    setNewStudentName('');
  };

  const handleAssign = (e) => {
    e.preventDefault();
    sound.pop();
    showSuccess('Giao Bài Tập', `Đã giao bài "${assignTitle}" cho lớp thành công!`);
    setActiveTeacherTab('assigned-list');
  };

  if (loading || !data) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>⏳ Đang tải dữ liệu giáo viên...</h2>
      </div>
    );
  }

  const { teacher, classAnalytics } = data;

  return (
    <div className="container" style={{ padding: '24px 0 60px 0' }}>
      {/* Teacher Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #3B82F6 100%)',
        borderRadius: '24px',
        padding: '32px 36px',
        color: 'white',
        boxShadow: '0 12px 30px rgba(16, 185, 129, 0.25)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>
            <span>👩‍🏫 Giáo Viên Chủ Nhiệm</span>
            <span>•</span>
            <span>Trường Tiểu Học EduKids</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.3px' }}>
            Góc Giáo Viên: {teacher.full_name} 🎓
          </h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.95, lineHeight: 1.6, fontWeight: 500 }}>
            Quản lý lớp học, theo dõi bài tập đã giao, chỉnh sửa câu hỏi trực quan và nhập đề hàng loạt bằng Excel!
          </p>
        </div>
        <div style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}>
          👩‍🏫
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        background: 'white',
        padding: '8px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => { sound.pop(); setActiveTeacherTab('classes'); }}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: activeTeacherTab === 'classes' ? '#059669' : 'transparent',
            color: activeTeacherTab === 'classes' ? 'white' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🏫</span>
          <span>Lớp Học & Điểm Số</span>
        </button>

        <button
          onClick={() => { sound.pop(); loadExercisesList(); setActiveTeacherTab('assigned-list'); }}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: activeTeacherTab === 'assigned-list' ? '#059669' : 'transparent',
            color: activeTeacherTab === 'assigned-list' ? 'white' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>📋</span>
          <span>Bài Tập Đã Giao & Chỉnh Sửa</span>
          <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 900 }}>
            {teacherExercises.length} bài
          </span>
        </button>

        <button
          onClick={() => { sound.pop(); setActiveTeacherTab('create-exercise'); }}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: activeTeacherTab === 'create-exercise' ? '#059669' : 'transparent',
            color: activeTeacherTab === 'create-exercise' ? 'white' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>✍️</span>
          <span>Soạn Bài Mới</span>
          {draftQuestions.length > 0 && (
            <span style={{ background: '#F59E0B', color: 'white', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 900 }}>
              {draftQuestions.length} câu
            </span>
          )}
        </button>

        <button
          onClick={() => { sound.pop(); setActiveTeacherTab('import-excel'); }}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: activeTeacherTab === 'import-excel' ? '#059669' : 'transparent',
            color: activeTeacherTab === 'import-excel' ? 'white' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>📊</span>
          <span>Nhập Excel / CSV</span>
        </button>

        <button
          onClick={() => { sound.pop(); setActiveTeacherTab('create-class'); }}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            background: activeTeacherTab === 'create-class' ? '#059669' : 'transparent',
            color: activeTeacherTab === 'create-class' ? 'white' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>➕</span>
          <span>Tạo Lớp & Học Sinh</span>
        </button>
      </div>

      {/* TAB 1: CLASSES & STUDENT SCORES */}
      {activeTeacherTab === 'classes' && (
        <div>
          {classAnalytics.map(cls => (
            <div key={cls.classId} className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 900,
                    fontSize: '1.2rem'
                  }}>
                    Lớp {cls.className}
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                    Khối {cls.gradeLevel} • Năm học {cls.schoolYear} • Sĩ số: <strong>{cls.stats.totalStudents} học sinh</strong>
                  </span>
                </div>

                <div className="chip" style={{ background: '#D1FAE5', color: '#065F46', border: '1.5px solid #A7F3D0', fontSize: '0.95rem' }}>
                  <span>📊 Điểm TB Lớp: <strong>{cls.stats.classAverageScore} / 10</strong></span>
                </div>
              </div>

              {/* Alert for Struggling Students */}
              {cls.stats.strugglingStudents && cls.stats.strugglingStudents.length > 0 && (
                <div style={{
                  background: '#FFF1F2',
                  border: '2px solid #FECDD3',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '1.6rem' }}>🚨</span>
                  <div style={{ fontSize: '0.92rem', color: '#9F1239', fontWeight: 700 }}>
                    <strong>Cảnh báo học sinh cần hỗ trợ:</strong> Em {cls.stats.strugglingStudents.map(s => s.full_name).join(', ')} có điểm dưới 7.0 (cần giao thêm bài tập bổ trợ).
                  </div>
                </div>
              )}

              {/* Student Table with Scores */}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Học Sinh</th>
                    <th>Khối Lớp</th>
                    <th>XP Tích Lũy</th>
                    <th>Bài Đã Làm</th>
                    <th>Điểm TB</th>
                    <th>Đánh Giá Sư Phạm</th>
                  </tr>
                </thead>
                <tbody>
                  {cls.stats.studentSummary.map(st => (
                    <tr key={st.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.4rem' }}>{st.avatar === 'mascot-bear' ? '🐻' : (st.avatar === 'mascot-lion' ? '🦁' : '🐰')}</span>
                          <strong>{st.full_name}</strong>
                        </div>
                      </td>
                      <td>Lớp {st.grade_level}</td>
                      <td><span style={{ color: '#B45309', fontWeight: 900 }}>⭐ {st.xp} XP</span></td>
                      <td>{st.submissionsCount} bài</td>
                      <td>
                        <span className={`score-tag ${st.averageScore >= 8.5 ? 'high' : (st.averageScore >= 7.0 ? 'mid' : 'low')}`}>
                          {st.averageScore} / 10
                        </span>
                      </td>
                      <td>
                        {st.averageScore >= 8.5 ? (
                          <span style={{ color: '#059669', fontWeight: 800 }}>🌟 Nắm rất vững kiến thức</span>
                        ) : st.averageScore >= 7.0 ? (
                          <span style={{ color: '#D97706', fontWeight: 800 }}>👍 Đạt chuẩn kiến thức kỹ năng</span>
                        ) : (
                          <span style={{ color: '#DC2626', fontWeight: 800 }}>⚡ Cần ôn thêm chuyên đề</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ASSIGNED EXERCISES LIST & VIEW / EDIT STUDIO */}
      {activeTeacherTab === 'assigned-list' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span>
                <span>Danh Sách Bài Tập Đã Giao Cho Học Sinh ({teacherExercises.length} bài)</span>
              </div>

              <button
                type="button"
                onClick={() => { sound.pop(); setActiveTeacherTab('create-exercise'); }}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
              >
                <span>➕ Soạn Bài Tập Mới</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên Bài Tập</th>
                    <th>Khối / Môn</th>
                    <th>Số Câu Hỏi</th>
                    <th>Lớp Nhận Bài</th>
                    <th>Tiến Độ Nộp</th>
                    <th>Điểm TB</th>
                    <th style={{ textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherExercises.map(ex => (
                    <tr key={ex.id}>
                      <td>
                        <strong>{ex.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã đề: #{ex.id} • Hạn: {ex.due_date}</div>
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
                        <span style={{ fontWeight: 800, color: '#059669' }}>{ex.questionsCount || ex.questions?.length || 0} câu</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#334155' }}>{ex.assigned_to || 'Lớp 4A1'}</span>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: '#D1FAE5',
                          color: '#065F46'
                        }}>
                          {ex.submissions_count || 3}/{ex.total_students || 3} đã nộp
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 900, color: '#B45309' }}>{ex.average_score || 8.5}/10</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => { sound.pop(); setSelectedViewExercise(ex); }}
                            title="Xem chi tiết câu hỏi"
                            style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                          >
                            👁️ Xem
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(ex)}
                            title="Chỉnh sửa câu hỏi và đáp án"
                            style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#B45309', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExercise(ex)}
                            title="Xóa bài tập"
                            style={{ background: '#FEE2E2', border: '1px solid #FECDD3', color: '#DC2626', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* VIEW DETAIL MODAL */}
          {selectedViewExercise && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px'
            }}>
              <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                      👁️ Chi Tiết Đề Bài: {selectedViewExercise.title}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>
                      Khối {selectedViewExercise.grade_level} • Gồm {selectedViewExercise.questions?.length || 0} câu hỏi • +{selectedViewExercise.reward_xp || 50} XP
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedViewExercise(null)}
                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontWeight: 900, cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(selectedViewExercise.questions || []).map((q, idx) => (
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

                      {/* Options or Answer */}
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

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedViewExercise(null); handleStartEdit(selectedViewExercise); }}
                    className="btn-primary"
                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                  >
                    <span>✏️ Chỉnh Sửa Bài Tập Này</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT EXERCISE MODAL */}
          {editingExercise && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px'
            }}>
              <div className="card" style={{ maxWidth: '720px', width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                    ✏️ Chỉnh Sửa Bài Tập: {editingExercise.title}
                  </h3>

                  <button
                    type="button"
                    onClick={() => setEditingExercise(null)}
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
                        value={editingExercise.title}
                        onChange={e => setEditingExercise({ ...editingExercise, title: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>Khối lớp:</label>
                      <select
                        value={editingExercise.grade_level}
                        onChange={e => setEditingExercise({ ...editingExercise, grade_level: parseInt(e.target.value, 10) })}
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
                        value={editingExercise.assigned_to || 'Lớp 4A1'}
                        onChange={e => setEditingExercise({ ...editingExercise, assigned_to: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  {/* List of Questions for Quick Edit */}
                  <h4 style={{ fontWeight: 900, color: '#334155', marginBottom: '12px' }}>
                    Danh Sách Câu Hỏi ({editingExercise.questions?.length || 0} câu):
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    {(editingExercise.questions || []).map((q, idx) => (
                      <div key={q.id || idx} style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 900, color: '#4F46E5' }}>Câu hỏi #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQ = editingExercise.questions.filter((_, i) => i !== idx);
                              setEditingExercise({ ...editingExercise, questions: updatedQ });
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
                              const updatedQ = [...editingExercise.questions];
                              updatedQ[idx].question_text = e.target.value;
                              setEditingExercise({ ...editingExercise, questions: updatedQ });
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
                                const updatedQ = [...editingExercise.questions];
                                updatedQ[idx].correct_answer = e.target.value;
                                setEditingExercise({ ...editingExercise, questions: updatedQ });
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
                                const updatedQ = [...editingExercise.questions];
                                updatedQ[idx].image_url = e.target.value;
                                setEditingExercise({ ...editingExercise, questions: updatedQ });
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
                              const updatedQ = [...editingExercise.questions];
                              updatedQ[idx].explanation = e.target.value;
                              setEditingExercise({ ...editingExercise, questions: updatedQ });
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
                      onClick={() => setEditingExercise(null)}
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
        </div>
      )}

      {/* TAB 3: RICH MULTI-TYPE EXERCISE CREATOR */}
      {activeTeacherTab === 'create-exercise' && (
        <div>
          {/* Exercise Info Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">
              <span>📋</span>
              <span>1. Thông Tin Chung Về Phiếu Bài Tập</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>Tên phiếu bài tập:</label>
                <input
                  type="text"
                  value={exerciseTitle}
                  onChange={e => setExerciseTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn tập toán tư duy cuối tuần..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>Môn học:</label>
                <select
                  value={exerciseSubject}
                  onChange={e => setExerciseSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 800, cursor: 'pointer' }}
                >
                  <option value="1">📐 Toán Học</option>
                  <option value="2">📖 Tiếng Việt</option>
                  <option value="3">🔬 Khoa Học & TNXH</option>
                  <option value="4">🇬🇧 Tiếng Anh</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>Dành cho khối lớp:</label>
                <select
                  value={exerciseGrade}
                  onChange={e => setExerciseGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 800, cursor: 'pointer' }}
                >
                  <option value="1">🌱 Lớp 1</option>
                  <option value="2">🐥 Lớp 2</option>
                  <option value="3">🐱 Lớp 3</option>
                  <option value="4">🚀 Lớp 4</option>
                  <option value="5">👑 Lớp 5</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>Điểm thưởng khi hoàn thành:</label>
                <select
                  value={exerciseXp}
                  onChange={e => setExerciseXp(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 800, color: '#B45309', background: '#FEF3C7', cursor: 'pointer' }}
                >
                  <option value="30">⭐ +30 XP</option>
                  <option value="50">⭐ +50 XP (Chuẩn)</option>
                  <option value="100">⭐ +100 XP (Thử thách)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question Builder Box */}
          <div className="card" style={{ marginBottom: '24px', border: '2px solid #C7D2FE' }}>
            <div className="card-title" style={{ color: '#4338CA' }}>
              <span>✍️</span>
              <span>2. Thêm Câu Hỏi Mới Vào Đề Bài</span>
            </div>

            {/* Select Question Type Buttons */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px', color: '#1E293B' }}>
                Chọn dạng câu hỏi tương tác:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { sound.pop(); setQuestionType('multiple_choice'); }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: questionType === 'multiple_choice' ? '2.5px solid #4F46E5' : '1.5px solid #E2E8F0',
                    background: questionType === 'multiple_choice' ? '#EEF2FF' : '#F8FAFC',
                    color: questionType === 'multiple_choice' ? '#4F46E5' : '#475569',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🎯</span>
                  <span>Trắc Nghiệm (4 Đáp Án)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.pop(); setQuestionType('fill_blank'); }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: questionType === 'fill_blank' ? '2.5px solid #059669' : '1.5px solid #E2E8F0',
                    background: questionType === 'fill_blank' ? '#ECFDF5' : '#F8FAFC',
                    color: questionType === 'fill_blank' ? '#059669' : '#475569',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>✏️</span>
                  <span>Điền Từ / Điền Số</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.pop(); setQuestionType('matching'); }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: questionType === 'matching' ? '2.5px solid #D97706' : '1.5px solid #E2E8F0',
                    background: questionType === 'matching' ? '#FFFBEB' : '#F8FAFC',
                    color: questionType === 'matching' ? '#D97706' : '#475569',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>🔗</span>
                  <span>Nối Cặp Tương Ứng</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.pop(); setQuestionType('true_false'); }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: questionType === 'true_false' ? '2.5px solid #8B5CF6' : '1.5px solid #E2E8F0',
                    background: questionType === 'true_false' ? '#F5F3FF' : '#F8FAFC',
                    color: questionType === 'true_false' ? '#8B5CF6' : '#475569',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <span>Đúng / Sai</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddQuestionToDraft}>
              {/* Question Text */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Nội dung câu hỏi:
                </label>
                <textarea
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  placeholder="Ví dụ: Tính nhẩm nhanh phép tính sau, hoặc Điền số còn thiếu vào chỗ trống..."
                  rows={2}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 700, fontFamily: 'inherit', fontSize: '1rem' }}
                  required
                />
              </div>

              {/* Image Attachment (Link or Upload) */}
              <div style={{ marginBottom: '18px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '8px', color: '#334155' }}>
                  🖼️ Hình ảnh minh họa cho câu hỏi (Tùy chọn):
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="Dán đường dẫn ảnh (URL) tại đây..."
                    style={{ flex: 1, minWidth: '220px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 600, fontSize: '0.85rem' }}
                  />
                  <label style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1.5px solid #C7D2FE'
                  }}>
                    <span>📷 Tải ảnh từ máy</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      ✕ Xóa ảnh
                    </button>
                  )}
                </div>

                {imageUrl && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={imageUrl} alt="Minh họa câu hỏi" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #CBD5E1' }} />
                    <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>✅ Ảnh đã sẵn sàng hiển thị cho học sinh</span>
                  </div>
                )}
              </div>

              {/* 1. Multiple Choice 4 Options */}
              {questionType === 'multiple_choice' && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>
                    Nhập 4 lựa chọn trả lời:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>Đáp án A:</label>
                      <input type="text" value={optA} onChange={e => setOptA(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }} required />
                    </div>
                    <div>
                      <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>Đáp án B:</label>
                      <input type="text" value={optB} onChange={e => setOptB(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }} required />
                    </div>
                    <div>
                      <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>Đáp án C:</label>
                      <input type="text" value={optC} onChange={e => setOptC(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }} required />
                    </div>
                    <div>
                      <label style={{ fontWeight: 800, fontSize: '0.85rem' }}>Đáp án D:</label>
                      <input type="text" value={optD} onChange={e => setOptD(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }} required />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 800, fontSize: '0.88rem', marginRight: '10px' }}>Chọn đáp án đúng:</label>
                    <select
                      value={correctOpt}
                      onChange={e => setCorrectOpt(e.target.value)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '2px solid #10B981', background: '#D1FAE5', color: '#065F46', fontWeight: 900 }}
                    >
                      <option value="A">Đáp án A</option>
                      <option value="B">Đáp án B</option>
                      <option value="C">Đáp án C</option>
                      <option value="D">Đáp án D</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 2. Fill in Blank */}
              {questionType === 'fill_blank' && (
                <div style={{ marginBottom: '18px', background: '#ECFDF5', padding: '16px', borderRadius: '12px', border: '1.5px solid #A7F3D0' }}>
                  <label style={{ display: 'block', fontWeight: 900, fontSize: '0.9rem', color: '#065F46', marginBottom: '6px' }}>
                    🎯 Nhập đáp án chính xác (Số hoặc Từ ngữ bé cần điền):
                  </label>
                  <p style={{ fontSize: '0.8rem', color: '#047857', marginBottom: '8px' }}>
                    Hệ thống sẽ tự động so khớp không phân biệt chữ hoa chữ thường.
                  </p>
                  <input
                    type="text"
                    value={fillAnswer}
                    onChange={e => setFillAnswer(e.target.value)}
                    placeholder="Ví dụ: 100 hoặc hoa sen..."
                    style={{ width: '100%', maxWidth: '300px', padding: '10px 14px', borderRadius: '8px', border: '2px solid #059669', fontWeight: 900, fontSize: '1.1rem' }}
                    required
                  />
                </div>
              )}

              {/* 3. True / False */}
              {questionType === 'true_false' && (
                <div style={{ marginBottom: '18px', background: '#F5F3FF', padding: '16px', borderRadius: '12px', border: '1.5px solid #DDD6FE' }}>
                  <label style={{ display: 'block', fontWeight: 900, fontSize: '0.9rem', color: '#5B21B6', marginBottom: '8px' }}>
                    🎯 Khẳng định trên là Đúng hay Sai?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setTfAnswer('Đúng')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: tfAnswer === 'Đúng' ? '2.5px solid #059669' : '1.5px solid #CBD5E1',
                        background: tfAnswer === 'Đúng' ? '#D1FAE5' : 'white',
                        color: tfAnswer === 'Đúng' ? '#065F46' : '#64748B',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                    >
                      👍 Đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => setTfAnswer('Sai')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: tfAnswer === 'Sai' ? '2.5px solid #DC2626' : '1.5px solid #CBD5E1',
                        background: tfAnswer === 'Sai' ? '#FEE2E2' : 'white',
                        color: tfAnswer === 'Sai' ? '#991B1B' : '#64748B',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                    >
                      👎 Sai
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Matching Pairs */}
              {questionType === 'matching' && (
                <div style={{ marginBottom: '18px', background: '#FFFBEB', padding: '16px', borderRadius: '12px', border: '1.5px solid #FDE68A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontWeight: 900, fontSize: '0.9rem', color: '#92400E' }}>
                      🔗 Các cặp vế nối tương ứng (Vế Trái ➔ Vế Phải):
                    </label>
                    <button
                      type="button"
                      onClick={() => setMatchingPairs(prev => [...prev, { id: Date.now(), left: '', right: '' }])}
                      style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ➕ Thêm cặp nối
                    </button>
                  </div>

                  {matchingPairs.map((p, idx) => (
                    <div key={p.id || idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#B45309', width: '24px' }}>{idx + 1}.</span>
                      <input
                        type="text"
                        value={p.left}
                        onChange={e => {
                          const val = e.target.value;
                          setMatchingPairs(prev => prev.map((item, i) => i === idx ? { ...item, left: val } : item));
                        }}
                        placeholder={`Vế trái ${idx + 1} (Ví dụ: 3 x 5, Con Mèo)...`}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                        required
                      />
                      <span style={{ fontWeight: 900, color: '#D97706' }}>➔</span>
                      <input
                        type="text"
                        value={p.right}
                        onChange={e => {
                          const val = e.target.value;
                          setMatchingPairs(prev => prev.map((item, i) => i === idx ? { ...item, right: val } : item));
                        }}
                        placeholder={`Vế phải ${idx + 1} (Ví dụ: 15, Bắt chuột)...`}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                        required
                      />
                      {matchingPairs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setMatchingPairs(prev => prev.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', fontWeight: 900, cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Hint & Explanation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>💡 Gợi ý cho bé (Khi bấm nút trợ giúp):</label>
                  <input
                    type="text"
                    value={hint}
                    onChange={e => setHint(e.target.value)}
                    placeholder="Ví dụ: Nhớ lại bảng nhân 2..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>📖 Lời giải thích chi tiết sư phạm:</label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                    placeholder="Ví dụ: Giải thích từng bước để bé hiểu bài..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>➕ Thêm Câu Hỏi Này Vào Đề Bài</span>
              </button>
            </form>
          </div>

          {/* Draft Questions List & Save Button */}
          <div className="card">
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📑</span>
                <span>3. Danh Sách Câu Hỏi Trong Đề ({draftQuestions.length} câu)</span>
              </div>

              {draftQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveFullExercise}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', padding: '8px 20px' }}
                >
                  <span>💾 Xuất Bản Bài Tập Ngay 🚀</span>
                </button>
              )}
            </div>

            {draftQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
                <div style={{ fontWeight: 700 }}>Chưa có câu hỏi nào trong đề bài. Hãy soạn câu hỏi ở trên và bấm "Thêm Câu Hỏi Này Vào Đề Bài"!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {draftQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 900, color: '#4F46E5', fontSize: '1.1rem', background: '#EEF2FF', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {idx + 1}
                      </span>
                      {q.image_url && (
                        <img src={q.image_url} alt="q" style={{ width: '40px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.95rem' }}>{q.question_text}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>
                          <span style={{ fontWeight: 800, color: '#059669' }}>[{getQuestionTypeLabel(q.question_type)}]</span> • Đáp án đúng: <strong>{q.correct_answer}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDraftQuestion(idx)}
                      style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '6px 10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      ✕ Xóa
                    </button>
                  </div>
                ))}

                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleSaveFullExercise}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.05rem' }}
                  >
                    <span>🚀 Lưu & Xuất Bản Đề Bài ({draftQuestions.length} Câu) Vào Ngân Hàng Đề Thi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EXCEL / CSV IMPORT STUDIO */}
      {activeTeacherTab === 'import-excel' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">
              <span>📊</span>
              <span>Nhập Đề Bài Tự Động Bằng File Excel / CSV</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>
              Giáo viên có thể soạn đề thi nhanh chóng trên Microsoft Excel hoặc Google Sheets theo file mẫu chuẩn, sau đó tải lên hệ thống. EduKids sẽ tự động nhận diện cả 4 dạng câu hỏi (Trắc nghiệm, Điền ô, Nối cặp, Đúng/Sai) kèm ảnh minh họa và lời giải!
            </p>

            {/* Step 1: Download Template */}
            <div style={{
              background: '#EEF2FF',
              border: '2px dashed #C7D2FE',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div>
                <h4 style={{ fontWeight: 900, color: '#3730A3', fontSize: '1.05rem', marginBottom: '4px' }}>
                  📥 Bước 1: Tải File Mẫu Excel (.xlsx) Chuẩn EduKids
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#4F46E5', margin: 0 }}>
                  File mẫu có sẵn tiêu đề cột, hướng dẫn chi tiết và ví dụ đầy đủ cho từng dạng bài tập.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadExcelTemplate}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📥 Tải File Mẫu Excel (.xlsx)</span>
              </button>
            </div>

            {/* Step 2: Configure & Upload */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>Tên bài tập:</label>
                <input
                  type="text"
                  value={exerciseTitle}
                  onChange={e => setExerciseTitle(e.target.value)}
                  placeholder="Ví dụ: Đề kiểm tra định kỳ..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>Môn học:</label>
                <select
                  value={exerciseSubject}
                  onChange={e => setExerciseSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 800, cursor: 'pointer' }}
                >
                  <option value="1">📐 Toán Học</option>
                  <option value="2">📖 Tiếng Việt</option>
                  <option value="3">🔬 Khoa Học & TNXH</option>
                  <option value="4">🇬🇧 Tiếng Anh</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>Khối lớp:</label>
                <select
                  value={exerciseGrade}
                  onChange={e => setExerciseGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontWeight: 800, cursor: 'pointer' }}
                >
                  <option value="1">🌱 Lớp 1</option>
                  <option value="2">🐥 Lớp 2</option>
                  <option value="3">🐱 Lớp 3</option>
                  <option value="4">🚀 Lớp 4</option>
                  <option value="5">👑 Lớp 5</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop / Upload Area */}
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                border: '2.5px dashed #059669',
                background: '#ECFDF5',
                borderRadius: '18px',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📁</div>
              <h4 style={{ fontWeight: 900, color: '#065F46', fontSize: '1.2rem', marginBottom: '6px' }}>
                {excelFile ? `Đã chọn file: ${excelFile.name}` : 'Bấm vào đây để chọn hoặc Kéo thả file Excel (.xlsx / .csv) vào đây'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0 }}>
                Hệ thống tự động đọc tiêu đề câu hỏi, các lựa chọn, đáp án đúng và lời giải thích.
              </p>
              {isParsingExcel && (
                <div style={{ marginTop: '10px', color: '#B45309', fontWeight: 800 }}>
                  ⏳ Đang phân tích nội dung file Excel...
                </div>
              )}
            </div>

            {/* Extracted Questions Table Preview */}
            {excelQuestions.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontWeight: 900, color: '#1E293B', fontSize: '1.1rem' }}>
                    ✅ Xem Trước Dữ Liệu Trích Xuất ({excelQuestions.length} câu hỏi):
                  </h4>

                  <button
                    type="button"
                    onClick={handleImportExcelToBank}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', padding: '10px 24px' }}
                  >
                    <span>🚀 Xác Nhận Nhập Toàn Bộ Vào Hệ Thống</span>
                  </button>
                </div>

                <table className="data-table" style={{ marginBottom: '16px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>STT</th>
                      <th>Dạng Câu Hỏi</th>
                      <th>Nội Dung Đề Bài</th>
                      <th>Ảnh Minh Họa</th>
                      <th>Đáp Án Đúng</th>
                      <th>Lời Giải Thích</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelQuestions.map((q, idx) => (
                      <tr key={idx}>
                        <td><strong>#{idx + 1}</strong></td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            background: q.question_type === 'fill_blank' ? '#ECFDF5' : (q.question_type === 'matching' ? '#FFFBEB' : '#EEF2FF'),
                            color: q.question_type === 'fill_blank' ? '#065F46' : (q.question_type === 'matching' ? '#92400E' : '#4338CA')
                          }}>
                            {getQuestionTypeLabel(q.question_type)}
                          </span>
                        </td>
                        <td><strong>{q.question_text}</strong></td>
                        <td>
                          {q.image_url ? (
                            <img src={q.image_url} alt="minh hoa" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Không có</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 900, color: '#059669' }}>{q.correct_answer}</span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {q.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CREATE CLASS & ADD STUDENT */}
      {activeTeacherTab === 'create-class' && (
        <div className="grid-2">
          {/* Create Class Card */}
          <div className="card">
            <div className="card-title">
              <span>🏫</span>
              <span>Tạo Lớp Học Mới</span>
            </div>
            <form onSubmit={handleCreateClass}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Tên lớp học:</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: 3A1, 4B, 5C..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Khối lớp:</label>
                <select
                  value={newClassGrade}
                  onChange={e => setNewClassGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                >
                  <option value="1">Lớp 1 🌱</option>
                  <option value="2">Lớp 2 🐥</option>
                  <option value="3">Lớp 3 🐱</option>
                  <option value="4">Lớp 4 🚀</option>
                  <option value="5">Lớp 5 👑</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <span>Tạo Lớp Học 🚀</span>
              </button>
            </form>
          </div>

          {/* Add Student Card */}
          <div className="card">
            <div className="card-title">
              <span>👦</span>
              <span>Thêm Học Sinh Vào Lớp</span>
            </div>
            <form onSubmit={handleAddStudent}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Chọn lớp tiếp nhận:</label>
                <select
                  value={targetClassForStudent}
                  onChange={e => setTargetClassForStudent(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                >
                  <option value="1">Lớp 4A1 (Cô Hoàng Mai)</option>
                  <option value="2">Lớp 2A3</option>
                  <option value="3">Lớp 1B</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Họ và tên học sinh:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Bé Lê Hoàng Nam..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <span>Thêm Vào Danh Sách Lớp ➕</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: ASSIGN EXERCISE */}
      {activeTeacherTab === 'assign' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-title">
            <span>📤</span>
            <span>Giao Bài Tập Cho Lớp Học</span>
          </div>
          <form onSubmit={handleAssign}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Chọn lớp nhận bài:</label>
              <select
                value={assignClassId}
                onChange={e => setAssignClassId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
              >
                <option value="1">Lớp 4A1 (3 học sinh)</option>
                <option value="2">Lớp 2A3 (1 học sinh)</option>
                <option value="3">Lớp 1B</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>Tên bài tập:</label>
              <input
                type="text"
                value={assignTitle}
                onChange={e => setAssignTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontWeight: 700 }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <span>Giao Bài Cho Học Sinh Ngay 🚀</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
