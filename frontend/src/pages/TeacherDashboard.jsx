import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audio';
import { useToast } from '../context/ToastContext';
import { useDialog } from '../context/DialogContext';
import { downloadExcelTemplate, parseExcelFile } from '../services/excelService';
import QRCodeModal from '../components/QRCodeModal';

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
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [targetClassForStudent, setTargetClassForStudent] = useState('1');
  const [selectedQRClass, setSelectedQRClass] = useState(null);

  // Edit Class Modal State
  const [editingClass, setEditingClass] = useState(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassGrade, setEditClassGrade] = useState('2');

  // Multi-Class Assignment for Exercises
  const [selectedAssignedClasses, setSelectedAssignedClasses] = useState([]);

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

  // Edit Modal Specific States
  const [editSearchTerm, setEditSearchTerm] = useState('');
  const [isAddQOpenInEdit, setIsAddQOpenInEdit] = useState(false);
  const [editNewQType, setEditNewQType] = useState('multiple_choice');
  const [editNewQText, setEditNewQText] = useState('');
  const [editNewOptA, setEditNewOptA] = useState('');
  const [editNewOptB, setEditNewOptB] = useState('');
  const [editNewOptC, setEditNewOptC] = useState('');
  const [editNewOptD, setEditNewOptD] = useState('');
  const [editNewCorrect, setEditNewCorrect] = useState('A');
  const [editNewFillAns, setEditNewFillAns] = useState('');
  const [editNewTFAns, setEditNewTFAns] = useState('Đúng');
  const [editNewImgUrl, setEditNewImgUrl] = useState('');
  const [editNewExplanation, setEditNewExplanation] = useState('');
  const [editNewHint, setEditNewHint] = useState('');
  const [editCustomRandomCount, setEditCustomRandomCount] = useState(10);

  // Random Pool Mode States
  const [randomMode, setRandomMode] = useState('all'); // 'all' | 'fixed_10' | 'fixed_20' | 'fixed_30' | 'student_choice'
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);

  // Assign state
  const [assignClassId, setAssignClassId] = useState('1');
  const [assignTitle, setAssignTitle] = useState('Ôn tập phân số cuối tuần');

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    handleSyncAndLoad();
  }, []);

  const handleSyncAndLoad = async () => {
    setIsSyncing(true);
    await api.initCloudSync();
    await loadTeacherData();
    loadExercisesList();
    setIsSyncing(false);
  };

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
    const isRandom = randomMode !== 'all';
    const randomCount = randomMode === 'fixed_10' ? 10 : (randomMode === 'fixed_20' ? 20 : (randomMode === 'fixed_30' ? 30 : 10));

    const assignedLabel = selectedAssignedClasses.length === 0
      ? `Toàn Khối ${exerciseGrade}`
      : `Lớp ${selectedAssignedClasses.map(c => c.split('-')[0]).join(', ')}`;

    const assignedClassesList = selectedAssignedClasses.length === 0
      ? [`ALL_GRADE_${exerciseGrade}`]
      : selectedAssignedClasses;

    const newEx = {
      id: Date.now() % 100000,
      title: exerciseTitle,
      grade_level: parseInt(exerciseGrade, 10),
      subject_id: parseInt(exerciseSubject, 10),
      reward_xp: parseInt(exerciseXp, 10) || 50,
      questions: draftQuestions,
      assigned_to: assignedLabel,
      assigned_classes: assignedClassesList,
      due_date: 'Chủ nhật tuần này (23:59)',
      is_random_pool: isRandom,
      random_mode: randomMode,
      random_count: isRandom ? randomCount : draftQuestions.length,
      total_pool_count: draftQuestions.length,
      shuffle_questions: shuffleQuestions,
      shuffle_options: shuffleOptions
    };

    api.saveCustomExercise(newEx);
    showSuccess('Lưu Thành Công! 🎉', `Đã lưu "${exerciseTitle}" giao cho ${assignedLabel}!`);
    setDraftQuestions([]);
    setSelectedAssignedClasses([]);
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
    const isRandom = randomMode !== 'all';
    const randomCount = randomMode === 'fixed_10' ? 10 : (randomMode === 'fixed_20' ? 20 : (randomMode === 'fixed_30' ? 30 : 10));

    const assignedLabel = selectedAssignedClasses.length === 0
      ? `Toàn Khối ${exerciseGrade}`
      : `Lớp ${selectedAssignedClasses.map(c => c.split('-')[0]).join(', ')}`;

    const assignedClassesList = selectedAssignedClasses.length === 0
      ? [`ALL_GRADE_${exerciseGrade}`]
      : selectedAssignedClasses;

    const newEx = {
      id: Date.now() % 100000,
      title: exerciseTitle || 'Bài Tập Nhập Từ Excel',
      grade_level: parseInt(exerciseGrade, 10),
      subject_id: parseInt(exerciseSubject, 10),
      reward_xp: parseInt(exerciseXp, 10) || 50,
      questions: excelQuestions,
      assigned_to: assignedLabel,
      assigned_classes: assignedClassesList,
      due_date: 'Chủ nhật tuần này (23:59)',
      is_random_pool: isRandom,
      random_mode: randomMode,
      random_count: isRandom ? randomCount : excelQuestions.length,
      total_pool_count: excelQuestions.length,
      shuffle_questions: shuffleQuestions,
      shuffle_options: shuffleOptions
    };

    api.saveCustomExercise(newEx);
    showSuccess('Nhập Excel Thành Công! 🚀', `Đã lưu toàn bộ ${excelQuestions.length} câu hỏi giao cho ${assignedLabel}!`);
    setExcelQuestions([]);
    setExcelFile(null);
    setSelectedAssignedClasses([]);
    loadExercisesList();
    setActiveTeacherTab('assigned-list');
  };

  // Edit / Delete / View Exercise Actions
  const handleStartEdit = (ex) => {
    sound.pop();
    const cloned = JSON.parse(JSON.stringify(ex));
    if (cloned.questions && Array.isArray(cloned.questions)) {
      cloned.questions = cloned.questions.map((q, idx) => {
        const type = q.question_type || 'multiple_choice';
        let opts = q.options;
        if ((type === 'multiple_choice' || !type) && (!opts || opts.length === 0)) {
          opts = [
            { option_label: 'A', answer_text: '' },
            { option_label: 'B', answer_text: '' },
            { option_label: 'C', answer_text: '' },
            { option_label: 'D', answer_text: '' }
          ];
        }
        return {
          ...q,
          id: q.id !== undefined ? q.id : (Date.now() + idx),
          question_type: type,
          options: opts
        };
      });
    }
    // Set default random fields if missing
    if (cloned.is_random_pool === undefined) {
      cloned.is_random_pool = (cloned.random_mode && cloned.random_mode !== 'all');
    }
    if (!cloned.random_mode) {
      cloned.random_mode = cloned.is_random_pool ? 'fixed_10' : 'all';
    }
    if (cloned.shuffle_questions === undefined) cloned.shuffle_questions = true;
    if (cloned.shuffle_options === undefined) cloned.shuffle_options = true;

    setEditingExercise(cloned);
    setEditSearchTerm('');
    setIsAddQOpenInEdit(false);
    setEditCustomRandomCount(cloned.random_count || 10);
  };

  const handleAddQuestionInEditModal = (e) => {
    if (e) e.preventDefault();
    sound.pop();

    if (!editNewQText.trim()) {
      showError('Thiếu nội dung', 'Vui lòng nhập nội dung câu hỏi muốn thêm!');
      return;
    }

    let qData = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      question_type: editNewQType,
      question_text: editNewQText.trim(),
      image_url: editNewImgUrl.trim(),
      hint: editNewHint.trim(),
      explanation: editNewExplanation.trim(),
      points: 10
    };

    if (editNewQType === 'multiple_choice') {
      qData.options = [
        { option_label: 'A', answer_text: editNewOptA.trim() },
        { option_label: 'B', answer_text: editNewOptB.trim() },
        { option_label: 'C', answer_text: editNewOptC.trim() },
        { option_label: 'D', answer_text: editNewOptD.trim() }
      ];
      qData.correct_answer = editNewCorrect;
    } else if (editNewQType === 'fill_blank') {
      if (!editNewFillAns.trim()) {
        showError('Thiếu đáp án', 'Vui lòng nhập đáp án đúng để hệ thống chấm điểm!');
        return;
      }
      qData.correct_answer = editNewFillAns.trim();
    } else if (editNewQType === 'true_false') {
      qData.options = [
        { option_label: 'Đúng', answer_text: 'Đúng 👍' },
        { option_label: 'Sai', answer_text: 'Sai 👎' }
      ];
      qData.correct_answer = editNewTFAns;
    }

    setEditingExercise(prev => {
      const updatedQuestions = [...(prev.questions || []), qData];
      const isRandom = prev.random_mode !== 'all';
      return {
        ...prev,
        questions: updatedQuestions,
        total_pool_count: updatedQuestions.length,
        random_count: isRandom ? (prev.random_count || 10) : updatedQuestions.length
      };
    });

    showSuccess('Đã Thêm Câu Hỏi Mới! 🎉', 'Câu hỏi đã được thêm thành công vào bài tập!');
    setEditNewQText('');
    setEditNewOptA('');
    setEditNewOptB('');
    setEditNewOptC('');
    setEditNewOptD('');
    setEditNewFillAns('');
    setEditNewImgUrl('');
    setEditNewExplanation('');
    setEditNewHint('');
    setIsAddQOpenInEdit(false);
  };

  const handleDuplicateQuestionInEdit = (idx) => {
    sound.pop();
    const currentQ = editingExercise.questions[idx];
    const clonedQ = JSON.parse(JSON.stringify(currentQ));
    clonedQ.id = Date.now() + Math.floor(Math.random() * 1000);
    clonedQ.question_text = `${clonedQ.question_text} (Bản sao)`;

    const updated = [...editingExercise.questions];
    updated.splice(idx + 1, 0, clonedQ);
    setEditingExercise({
      ...editingExercise,
      questions: updated,
      total_pool_count: updated.length
    });
    showSuccess('Đã Nhân Bản Câu Hỏi', `Đã tạo bản sao cho Câu #${idx + 1}!`);
  };

  const handleMoveQuestionInEdit = (idx, direction) => {
    sound.pop();
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= editingExercise.questions.length) return;
    const updated = [...editingExercise.questions];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    setEditingExercise({ ...editingExercise, questions: updated });
  };

  const handleDeleteQuestionInEdit = async (idx) => {
    sound.pop();
    const isConfirmed = await confirm({
      title: 'Xóa Câu Hỏi?',
      message: `Cô có chắc chắn muốn xóa Câu hỏi #${idx + 1} khỏi bài tập này?`,
      icon: '🗑️',
      confirmText: 'Xóa câu này',
      cancelText: 'Giữ lại'
    });
    if (isConfirmed) {
      const updated = editingExercise.questions.filter((_, i) => i !== idx);
      setEditingExercise({
        ...editingExercise,
        questions: updated,
        total_pool_count: updated.length
      });
      showSuccess('Đã Xóa Câu Hỏi', `Đã xóa câu hỏi #${idx + 1} khỏi đề.`);
    }
  };

  const handleRandomModeChangeInEdit = (val) => {
    sound.pop();
    const isR = val !== 'all';
    let count = editingExercise.questions?.length || 0;
    if (val === 'fixed_5') count = 5;
    else if (val === 'fixed_10') count = 10;
    else if (val === 'fixed_15') count = 15;
    else if (val === 'fixed_20') count = 20;
    else if (val === 'fixed_30') count = 30;
    else if (val === 'fixed_50') count = 50;
    else if (val === 'custom') count = editCustomRandomCount || 10;
    else if (val === 'student_choice') count = 10;

    setEditingExercise({
      ...editingExercise,
      random_mode: val,
      is_random_pool: isR,
      random_count: isR ? count : (editingExercise.questions?.length || 0),
      total_pool_count: editingExercise.questions?.length || 0
    });
  };

  const handleSaveEditedExercise = (e) => {
    e.preventDefault();
    sound.pop();
    if (!editingExercise) return;

    if (!editingExercise.questions || editingExercise.questions.length === 0) {
      showError('Chưa có câu hỏi', 'Bài tập cần có ít nhất 1 câu hỏi!');
      return;
    }

    const payload = {
      ...editingExercise,
      total_pool_count: editingExercise.questions.length,
      random_count: editingExercise.is_random_pool ? (editingExercise.random_count || 10) : editingExercise.questions.length
    };

    api.updateExercise(payload.id, payload);
    showSuccess('Cập Nhật Thành Công! ✨', `Đã lưu các thay đổi cho bài tập "${payload.title}" (${payload.questions.length} câu)!`);
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
    if (!newClassName.trim()) return;
    const newClassObj = {
      id: Date.now(),
      className: newClassName.trim(),
      grade_level: parseInt(newClassGrade, 10)
    };
    api.saveCustomClass(newClassObj);
    showSuccess('Tạo Lớp Thành Công! 🚀', `Đã tạo thành công Lớp ${newClassName} (Khối ${newClassGrade})!`);
    setNewClassName('');
    loadTeacherData();
    setActiveTeacherTab('classes');
  };

  const handleStartEditClass = (cls) => {
    sound.pop();
    setEditingClass(cls);
    setEditClassName(cls.className);
    setEditClassGrade(String(cls.gradeLevel || 2));
  };

  const handleSaveEditClass = (e) => {
    e.preventDefault();
    sound.pop();
    if (!editingClass || !editClassName.trim()) return;

    api.updateCustomClass(editingClass.classId || editingClass.id, {
      className: editClassName.trim(),
      grade_level: parseInt(editClassGrade, 10)
    });

    showSuccess('Cập Nhật Lớp Thành Công! ✨', `Đã cập nhật thông tin Lớp ${editClassName.trim()} (Khối ${editClassGrade})!`);
    setEditingClass(null);
    loadTeacherData();
  };

  const handleDeleteClass = async (cls) => {
    sound.pop();
    const isConfirmed = await confirm({
      title: `Xóa Lớp ${cls.className}?`,
      message: `Cô có chắc chắn muốn xóa Lớp ${cls.className} (Mã Lớp: ${cls.class_code || `${cls.className}-8429`}) không? Toàn bộ dữ liệu của lớp sẽ được xóa khỏi hệ thống.`,
      icon: '🗑️',
      confirmText: 'Xóa Lớp Này',
      cancelText: 'Hủy'
    });

    if (isConfirmed) {
      api.deleteCustomClass(cls.classId || cls.id || cls.class_code);
      showSuccess('Đã Xóa Lớp Học', `Đã xóa thành công Lớp ${cls.className}!`);
      loadTeacherData();
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    sound.pop();
    if (!newStudentName.trim()) return;
    
    // Find target class
    let grade = 2;
    let targetCode = '';
    if (targetClassForStudent) {
      const cls = classAnalytics.find(c => String(c.classId) === String(targetClassForStudent) || c.className === targetClassForStudent);
      if (cls) {
        grade = cls.gradeLevel;
        targetCode = cls.class_code;
      }
    }

    const newStudentObj = {
      id: Date.now(),
      full_name: newStudentName.trim(),
      parent_phone: newStudentPhone.trim(),
      grade_level: grade,
      class_id: targetClassForStudent || `${grade}A1`,
      class_code: targetCode || `${grade}A1-8429`,
      avatar: 'mascot-bear',
      xp: 0
    };
    api.saveCustomStudent(newStudentObj);
    showSuccess('Thêm Học Sinh Thành Công! 🎉', `Đã thêm học sinh "${newStudentName}" vào danh sách!`);
    setNewStudentName('');
    setNewStudentPhone('');
    loadTeacherData();
    setActiveTeacherTab('classes');
  };

  const handleDeleteStudent = async (student) => {
    sound.pop();
    const isConfirmed = await confirm({
      title: 'Xóa Học Sinh Khỏi Lớp?',
      message: `Cô có chắc muốn xóa học sinh "${student.full_name}" khỏi danh sách lớp không?`,
      icon: '🗑️',
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });
    if (isConfirmed) {
      api.deleteCustomStudent(student.id, student.full_name);
      showSuccess('Đã Xóa Học Sinh', `Đã xóa học sinh "${student.full_name}" khỏi danh sách lớp.`);
      loadTeacherData();
    }
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

        <button
          onClick={async () => {
            sound.pop();
            await handleSyncAndLoad();
            showSuccess('Đã Đồng Bộ Cloud', 'Dữ liệu bài tập & nộp bài đã được đồng bộ 2 chiều với Cloud MySQL!');
          }}
          disabled={isSyncing}
          style={{
            marginLeft: 'auto',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1.5px solid #10B981',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            background: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          title="Đồng bộ 2 chiều tức thì với Cơ sở dữ liệu Cloud MySQL"
        >
          <span>{isSyncing ? '⏳' : '☁️'}</span>
          <span>{isSyncing ? 'Đang đồng bộ Cloud...' : 'Đồng Bộ Cloud 2 Chiều'}</span>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div className="chip" style={{ background: '#D1FAE5', color: '#065F46', border: '1.5px solid #A7F3D0', fontSize: '0.92rem' }}>
                    <span>📊 Điểm TB: <strong>{cls.stats.classAverageScore ? `${cls.stats.classAverageScore} / 10` : 'Chưa có bài nộp'}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartEditClass(cls)}
                    style={{
                      background: '#EEF2FF',
                      border: '1.5px solid #C7D2FE',
                      color: '#4338CA',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Đổi tên lớp hoặc khối lớp"
                  >
                    <span>✏️</span>
                    <span>Sửa Lớp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteClass(cls)}
                    style={{
                      background: '#FEF2F2',
                      border: '1.5px solid #FECDD3',
                      color: '#DC2626',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Xóa lớp học này khỏi hệ thống"
                  >
                    <span>🗑️</span>
                    <span>Xóa Lớp</span>
                  </button>
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

              {/* Class Code & Zalo QR Share Bar */}
              <div style={{
                background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
                border: '1.5px solid #DDD6FE',
                borderRadius: '14px',
                padding: '12px 18px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.3rem' }}>🔑</span>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6D28D9', display: 'block', textTransform: 'uppercase' }}>
                      Mã Lớp Học (Gửi cho Phụ Huynh):
                    </span>
                    <strong style={{ fontSize: '1.25rem', color: '#4C1D95', letterSpacing: '1px' }}>
                      {cls.class_code || `${cls.className}-8429`}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      sound.pop();
                      navigator.clipboard.writeText(cls.class_code || `${cls.className}-8429`);
                      showSuccess('Đã Sao Chép Mã Lớp! 🔑', `Mã lớp [${cls.class_code || `${cls.className}-8429`}] đã được lưu vào bộ nhớ tạm.`);
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #C4B5FD',
                      color: '#6D28D9',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>📋</span>
                    <span>Copy Mã</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.pop();
                      const joinUrl = `${window.location.origin}/?join_class=${encodeURIComponent(cls.class_code || `${cls.className}-8429`)}`;
                      navigator.clipboard.writeText(joinUrl);
                      showSuccess('Đã Sao Chép Link! 🔗', 'Đã sao chép link tham gia lớp gửi vào nhóm Zalo Phụ huynh!');
                    }}
                    style={{
                      background: '#0068FF',
                      border: 'none',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(0, 104, 255, 0.25)'
                    }}
                  >
                    <span>💬</span>
                    <span>Gửi Link Zalo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.pop();
                      setSelectedQRClass(cls);
                    }}
                    style={{
                      background: '#7C3AED',
                      border: 'none',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
                    }}
                  >
                    <span>📱</span>
                    <span>Xem Mã QR & Thẻ Lớp</span>
                  </button>
                </div>
              </div>

              {/* Student Table with Scores or Empty State */}
              {(!cls.stats.studentSummary || cls.stats.studentSummary.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: '#F8FAFC', borderRadius: '12px', border: '1.5px dashed #CBD5E1' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🎓</span>
                  <h4 style={{ fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Chưa có học sinh trong danh sách Lớp {cls.className}</h4>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                    Cô hãy gửi <strong>Mã Lớp: {cls.class_code || `${cls.className}-8429`}</strong> hoặc <strong>Link Zalo</strong> ở trên cho Phụ huynh. Khi học sinh tham gia và nộp bài, điểm số thật sẽ hiển thị tự động tại đây!
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => { sound.pop(); setSelectedQRClass(cls); }}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.88rem', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                    >
                      <span>📱 Mở Mã QR & Link Gửi Phụ Huynh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { sound.pop(); setActiveTeacherTab('create-class'); }}
                      style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: 'white', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
                    >
                      <span>➕ Thêm Học Sinh Thủ Công</span>
                    </button>
                  </div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Học Sinh</th>
                      <th>SĐT Phụ Huynh / Mã</th>
                      <th>Khối Lớp</th>
                      <th>XP Tích Lũy</th>
                      <th>Bài Đã Làm</th>
                      <th>Điểm TB</th>
                      <th>Đánh Giá Sư Phạm</th>
                      <th style={{ textAlign: 'center' }}>Thao Tác</th>
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
                        <td>
                          <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.85rem' }}>
                            {st.parent_phone ? `📱 ${st.parent_phone}` : (st.class_code ? `🔑 ${st.class_code}` : 'Chưa có SĐT')}
                          </span>
                        </td>
                        <td>Lớp {st.grade_level}</td>
                        <td><span style={{ color: '#B45309', fontWeight: 900 }}>⭐ {st.xp} XP</span></td>
                        <td>{st.submissionsCount > 0 ? `${st.submissionsCount} bài` : '0 bài'}</td>
                        <td>
                          {st.averageScore !== null ? (
                            <span className={`score-tag ${parseFloat(st.averageScore) >= 8.5 ? 'high' : (parseFloat(st.averageScore) >= 7.0 ? 'mid' : 'low')}`}>
                              {st.averageScore} / 10
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8', fontWeight: 700 }}>Chưa có</span>
                          )}
                        </td>
                        <td>
                          {st.averageScore === null ? (
                            <span style={{ color: '#94A3B8', fontWeight: 700 }}>⏳ Chưa làm bài tập nào</span>
                          ) : parseFloat(st.averageScore) >= 8.5 ? (
                            <span style={{ color: '#059669', fontWeight: 800 }}>🌟 Nắm rất vững kiến thức</span>
                          ) : parseFloat(st.averageScore) >= 7.0 ? (
                            <span style={{ color: '#D97706', fontWeight: 800 }}>👍 Đạt chuẩn kiến thức kỹ năng</span>
                          ) : (
                            <span style={{ color: '#DC2626', fontWeight: 800 }}>⚡ Cần ôn thêm chuyên đề</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(st)}
                            style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                            title="Xóa học sinh khỏi lớp"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                        <span style={{ fontWeight: 700, color: '#334155' }}>{ex.assigned_to || 'Lớp 4A1'}</span>
                      </td>
                      <td>
                        {ex.submissions_count === 0 ? (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: '#F1F5F9',
                            color: '#64748B'
                          }}>
                            0/{ex.total_students || 3} đã nộp
                          </span>
                        ) : (
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: '#D1FAE5',
                            color: '#065F46'
                          }}>
                            {ex.submissions_count}/{ex.total_students || 3} đã nộp
                          </span>
                        )}
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
                            onClick={() => { sound.pop(); setSelectedViewExercise(ex); }}
                            title="Xem chi tiết câu hỏi & danh sách học sinh nộp bài"
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
              <div className="card" style={{ maxWidth: '720px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                      👁️ Chi Tiết Đề Bài: {selectedViewExercise.title}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>
                      Khối {selectedViewExercise.grade_level} • Gồm {selectedViewExercise.questions?.length || 0} câu hỏi • +{selectedViewExercise.reward_xp || 50} XP • {selectedViewExercise.submissions_count || 0} lượt nộp bài
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

                {/* Submissions by Real Students */}
                <div style={{ marginBottom: '20px', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ fontWeight: 900, color: '#166534', fontSize: '0.98rem', marginBottom: '8px' }}>
                    📊 Danh Sách Học Sinh Đã Nộp Bài ({selectedViewExercise.submissionsList?.length || 0} em):
                  </h4>

                  {selectedViewExercise.submissionsList && selectedViewExercise.submissionsList.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedViewExercise.submissionsList.map((sub, sIdx) => (
                        <div key={sub.id || sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>{sub.user_avatar === 'mascot-bear' ? '🐻' : (sub.user_avatar === 'mascot-lion' ? '🦁' : '🐰')}</span>
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
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '16px'
            }}>
              <div className="card" style={{ maxWidth: '880px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '24px', position: 'relative', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                        ✏️ Chỉnh Sửa Bài Tập: {editingExercise.title}
                      </h3>
                      <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        Khối {editingExercise.grade_level}
                      </span>
                      <span style={{ background: editingExercise.is_random_pool ? '#F3E8FF' : '#DCFCE7', color: editingExercise.is_random_pool ? '#7E22CE' : '#15803D', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {editingExercise.is_random_pool ? `🎲 Random ${editingExercise.random_count || 10}/${editingExercise.questions?.length || 0} câu` : `📋 Toàn bộ ${editingExercise.questions?.length || 0} câu`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingExercise(null)}
                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#64748B' }}
                    title="Đóng modal"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveEditedExercise}>
                  {/* General Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>Tên bài tập:</label>
                      <input
                        type="text"
                        value={editingExercise.title}
                        onChange={e => setEditingExercise({ ...editingExercise, title: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>Khối lớp:</label>
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
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>Lớp nhận bài:</label>
                      <input
                        type="text"
                        value={editingExercise.assigned_to || `Lớp ${editingExercise.grade_level}A1`}
                        onChange={e => setEditingExercise({ ...editingExercise, assigned_to: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px', color: '#475569' }}>Thưởng XP:</label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={editingExercise.reward_xp || 50}
                        onChange={e => setEditingExercise({ ...editingExercise, reward_xp: parseInt(e.target.value, 10) || 50 })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  {/* Random Mode & Exam Config Box */}
                  <div style={{
                    background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
                    border: '1.5px solid #DDD6FE',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🎲</span>
                        <strong style={{ color: '#5B21B6', fontSize: '0.95rem' }}>Cấu Hình Chế Độ Phát Đề & Trộn Ngẫu Nhiên:</strong>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#6D28D9', fontWeight: 700, background: '#DDD6FE', padding: '2px 8px', borderRadius: '6px' }}>
                        Hiện có {editingExercise.questions?.length || 0} câu trong ngân hàng
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', alignItems: 'center' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#4C1D95', marginBottom: '4px' }}>
                          Chế độ làm bài cho học sinh:
                        </label>
                        <select
                          value={editingExercise.random_mode || (editingExercise.is_random_pool ? 'fixed_10' : 'all')}
                          onChange={e => handleRandomModeChangeInEdit(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #A78BFA',
                            fontWeight: 800,
                            color: '#3B0764',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="all">📋 Làm toàn bộ câu hỏi (Làm hết {editingExercise.questions?.length || 0} câu)</option>
                          <option value="fixed_5">🎲 Ngân hàng đề: Bốc ngẫu nhiên 5 câu mỗi lượt</option>
                          <option value="fixed_10">🎲 Ngân hàng đề: Bốc ngẫu nhiên 10 câu mỗi lượt</option>
                          <option value="fixed_15">🎲 Ngân hàng đề: Bốc ngẫu nhiên 15 câu mỗi lượt</option>
                          <option value="fixed_20">🎲 Ngân hàng đề: Bốc ngẫu nhiên 20 câu mỗi lượt</option>
                          <option value="fixed_30">🎲 Ngân hàng đề: Bốc ngẫu nhiên 30 câu mỗi lượt</option>
                          <option value="fixed_50">🎲 Ngân hàng đề: Bốc ngẫu nhiên 50 câu mỗi lượt</option>
                          <option value="student_choice">🎯 Học sinh tự chọn số câu khi bắt đầu (10 / 20 / 30 / Toàn bộ)</option>
                          <option value="custom">🔢 Tùy chỉnh số lượng câu bốc ngẫu nhiên...</option>
                        </select>
                      </div>

                      {editingExercise.random_mode === 'custom' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#4C1D95', marginBottom: '4px' }}>
                            Số câu bốc ngẫu nhiên mỗi lượt:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={editingExercise.questions?.length || 100}
                            value={editingExercise.random_count || editCustomRandomCount}
                            onChange={e => {
                              const val = parseInt(e.target.value, 10) || 10;
                              setEditCustomRandomCount(val);
                              setEditingExercise({ ...editingExercise, random_count: val });
                            }}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #A78BFA', fontWeight: 800 }}
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: '#4C1D95', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editingExercise.shuffle_questions !== false}
                          onChange={e => setEditingExercise({ ...editingExercise, shuffle_questions: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }}
                        />
                        <span>🔀 Đảo ngẫu nhiên thứ tự câu hỏi</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: '#4C1D95', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editingExercise.shuffle_options !== false}
                          onChange={e => setEditingExercise({ ...editingExercise, shuffle_options: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }}
                        />
                        <span>🔀 Đảo ngẫu nhiên vị trí đáp án A/B/C/D</span>
                      </label>
                    </div>
                  </div>

                  {/* Section 2: Add New Question directly inside Edit Modal */}
                  <div style={{
                    background: isAddQOpenInEdit ? '#F0FDF4' : '#F8FAFC',
                    border: isAddQOpenInEdit ? '2px solid #86EFAC' : '1.5px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsAddQOpenInEdit(!isAddQOpenInEdit)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>➕</span>
                        <strong style={{ color: isAddQOpenInEdit ? '#15803D' : '#334155', fontSize: '0.95rem' }}>
                          Thêm Câu Hỏi Mới Vào Bài Tập Này
                        </strong>
                      </div>
                      <button
                        type="button"
                        style={{
                          background: isAddQOpenInEdit ? '#DCFCE7' : '#E2E8F0',
                          color: isAddQOpenInEdit ? '#166534' : '#475569',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {isAddQOpenInEdit ? '▲ Thu gọn' : '▼ Mở form soạn câu'}
                      </button>
                    </div>

                    {isAddQOpenInEdit && (
                      <div style={{ marginTop: '14px', borderTop: '1px solid #BBF7D0', paddingTop: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>Dạng câu hỏi:</label>
                            <select
                              value={editNewQType}
                              onChange={e => setEditNewQType(e.target.value)}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1.5px solid #86EFAC', fontWeight: 700 }}
                            >
                              <option value="multiple_choice">🎯 Trắc Nghiệm 4 Lựa Chọn</option>
                              <option value="fill_blank">✏️ Điền Ô / Điền Số</option>
                              <option value="true_false">✅ Đúng / Sai</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>Link ảnh minh họa (nếu có):</label>
                            <input
                              type="text"
                              value={editNewImgUrl}
                              onChange={e => setEditNewImgUrl(e.target.value)}
                              placeholder="https://..."
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1.5px solid #CBD5E1', fontSize: '0.8rem' }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>Nội dung câu hỏi mới:</label>
                          <textarea
                            rows="2"
                            value={editNewQText}
                            onChange={e => setEditNewQText(e.target.value)}
                            placeholder="Nhập nội dung câu hỏi mới..."
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #86EFAC', fontWeight: 700 }}
                          />
                        </div>

                        {/* Options for Multiple Choice */}
                        {editNewQType === 'multiple_choice' && (
                          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                              Các phương án trả lời (chọn nút radio ở đáp án đúng):
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                              {['A', 'B', 'C', 'D'].map(label => {
                                const val = label === 'A' ? editNewOptA : (label === 'B' ? editNewOptB : (label === 'C' ? editNewOptC : editNewOptD));
                                const setVal = label === 'A' ? setEditNewOptA : (label === 'B' ? setEditNewOptB : (label === 'C' ? setEditNewOptC : setEditNewOptD));
                                const isCorrect = editNewCorrect === label;

                                return (
                                  <div key={label} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: isCorrect ? '#DCFCE7' : '#F8FAFC',
                                    border: isCorrect ? '2px solid #16A34A' : '1px solid #CBD5E1',
                                    borderRadius: '8px',
                                    padding: '6px 8px'
                                  }}>
                                    <input
                                      type="radio"
                                      name="new_correct_opt"
                                      checked={isCorrect}
                                      onChange={() => setEditNewCorrect(label)}
                                      style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                                      title={`Đặt ${label} làm đáp án đúng`}
                                    />
                                    <strong style={{ color: isCorrect ? '#15803D' : '#475569', minWidth: '18px' }}>{label}:</strong>
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={e => setVal(e.target.value)}
                                      placeholder={`Đáp án ${label}...`}
                                      style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: 700, outline: 'none', fontSize: '0.85rem' }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Fill in the blank option */}
                        {editNewQType === 'fill_blank' && (
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>Đáp án đúng chính xác:</label>
                            <input
                              type="text"
                              value={editNewFillAns}
                              onChange={e => setEditNewFillAns(e.target.value)}
                              placeholder="Ví dụ: 45 hoặc hình tròn..."
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #10B981', background: '#ECFDF5', fontWeight: 800, color: '#065F46' }}
                            />
                          </div>
                        )}

                        {/* True / False option */}
                        {editNewQType === 'true_false' && (
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>Đáp án đúng:</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              {['Đúng', 'Sai'].map(tf => (
                                <button
                                  key={tf}
                                  type="button"
                                  onClick={() => setEditNewTFAns(tf)}
                                  style={{
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    fontWeight: 800,
                                    border: editNewTFAns === tf ? '2px solid #16A34A' : '1px solid #CBD5E1',
                                    background: editNewTFAns === tf ? '#DCFCE7' : 'white',
                                    color: editNewTFAns === tf ? '#15803D' : '#475569',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {tf === 'Đúng' ? '👍 Đúng' : '👎 Sai'}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '2px' }}>Lời giải thích:</label>
                            <input
                              type="text"
                              value={editNewExplanation}
                              onChange={e => setEditNewExplanation(e.target.value)}
                              placeholder="Giải thích vì sao chọn đáp án này..."
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '2px' }}>Gợi ý (Hint):</label>
                            <input
                              type="text"
                              value={editNewHint}
                              onChange={e => setEditNewHint(e.target.value)}
                              placeholder="Gợi ý ngắn khi học sinh cần giúp đỡ..."
                              style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                            />
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={handleAddQuestionInEditModal}
                            style={{
                              background: 'linear-gradient(135deg, #10B981, #059669)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 18px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              fontSize: '0.88rem'
                            }}
                          >
                            ➕ Thêm Câu Này Vào Đề Thi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: List of Questions with Search & Full Options Editor */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontWeight: 900, color: '#334155', margin: 0, fontSize: '1.05rem' }}>
                      📋 Danh Sách Câu Hỏi ({editingExercise.questions?.length || 0} câu trong ngân hàng):
                    </h4>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editSearchTerm}
                        onChange={e => setEditSearchTerm(e.target.value)}
                        placeholder="🔍 Tìm nhanh câu hỏi..."
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.82rem', width: '180px', fontWeight: 600 }}
                      />
                      {editSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setEditSearchTerm('')}
                          style={{ background: '#E2E8F0', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Xóa tìm
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    {(editingExercise.questions || [])
                      .map((q, idx) => ({ q, originalIdx: idx }))
                      .filter(({ q }) => {
                        if (!editSearchTerm.trim()) return true;
                        const term = editSearchTerm.toLowerCase();
                        return (q.question_text && q.question_text.toLowerCase().includes(term)) ||
                               (q.correct_answer && String(q.correct_answer).toLowerCase().includes(term));
                      })
                      .map(({ q, originalIdx }) => {
                        const isMC = q.question_type === 'multiple_choice' || !q.question_type;
                        const hasOptions = q.options && q.options.length > 0;

                        return (
                          <div
                            key={q.id || originalIdx}
                            style={{
                              background: '#F8FAFC',
                              border: '1.5px solid #CBD5E1',
                              borderRadius: '12px',
                              padding: '14px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                          >
                            {/* Question Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 900, color: '#4F46E5', fontSize: '0.95rem' }}>
                                  Câu #{originalIdx + 1}
                                </span>
                                <span style={{
                                  background: isMC ? '#EEF2FF' : (q.question_type === 'fill_blank' ? '#FEF3C7' : '#DCFCE7'),
                                  color: isMC ? '#4338CA' : (q.question_type === 'fill_blank' ? '#B45309' : '#15803D'),
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800
                                }}>
                                  {getQuestionTypeLabel(q.question_type)}
                                </span>
                              </div>

                              {/* Question Actions */}
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  disabled={originalIdx === 0}
                                  onClick={() => handleMoveQuestionInEdit(originalIdx, -1)}
                                  style={{ background: '#E2E8F0', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: originalIdx === 0 ? 'not-allowed' : 'pointer', opacity: originalIdx === 0 ? 0.4 : 1 }}
                                  title="Di chuyển lên"
                                >
                                  ⬆️
                                </button>
                                <button
                                  type="button"
                                  disabled={originalIdx === (editingExercise.questions.length - 1)}
                                  onClick={() => handleMoveQuestionInEdit(originalIdx, 1)}
                                  style={{ background: '#E2E8F0', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: originalIdx === (editingExercise.questions.length - 1) ? 'not-allowed' : 'pointer', opacity: originalIdx === (editingExercise.questions.length - 1) ? 0.4 : 1 }}
                                  title="Di chuyển xuống"
                                >
                                  ⬇️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateQuestionInEdit(originalIdx)}
                                  style={{ background: '#E0F2FE', color: '#0369A1', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                  title="Nhân bản câu này"
                                >
                                  📄 Bản sao
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestionInEdit(originalIdx)}
                                  style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                                  title="Xóa câu hỏi này"
                                >
                                  ✕ Xóa
                                </button>
                              </div>
                            </div>

                            {/* Question Text */}
                            <div style={{ marginBottom: '10px' }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '2px', color: '#475569' }}>
                                Nội dung câu hỏi:
                              </label>
                              <input
                                type="text"
                                value={q.question_text}
                                onChange={e => {
                                  const updatedQ = [...editingExercise.questions];
                                  updatedQ[originalIdx].question_text = e.target.value;
                                  setEditingExercise({ ...editingExercise, questions: updatedQ });
                                }}
                                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                                required
                              />
                            </div>

                            {/* Multiple Choice Options Editor */}
                            {isMC && hasOptions && (
                              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                                  Lựa chọn A, B, C, D (nhấn vào chữ cái để chọn làm Đáp án Đúng):
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                                  {q.options.map(opt => {
                                    const isCorrect = q.correct_answer === opt.option_label;
                                    return (
                                      <div
                                        key={opt.option_label}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          background: isCorrect ? '#DCFCE7' : '#F8FAFC',
                                          border: isCorrect ? '2px solid #16A34A' : '1px solid #CBD5E1',
                                          borderRadius: '6px',
                                          padding: '4px 8px'
                                        }}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedQ = [...editingExercise.questions];
                                            updatedQ[originalIdx].correct_answer = opt.option_label;
                                            setEditingExercise({ ...editingExercise, questions: updatedQ });
                                          }}
                                          style={{
                                            background: isCorrect ? '#16A34A' : '#E2E8F0',
                                            color: isCorrect ? 'white' : '#475569',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '2px 6px',
                                            fontWeight: 900,
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
                                          }}
                                          title={`Đặt ${opt.option_label} làm đáp án đúng`}
                                        >
                                          {opt.option_label} {isCorrect ? '✓' : ''}
                                        </button>
                                        <input
                                          type="text"
                                          value={opt.answer_text}
                                          onChange={e => {
                                            const updatedQ = [...editingExercise.questions];
                                            const targetOpt = updatedQ[originalIdx].options.find(o => o.option_label === opt.option_label);
                                            if (targetOpt) targetOpt.answer_text = e.target.value;
                                            setEditingExercise({ ...editingExercise, questions: updatedQ });
                                          }}
                                          placeholder={`Lựa chọn ${opt.option_label}...`}
                                          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Fill in blank or custom correct answer */}
                            {(!isMC || !hasOptions) && (
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '2px', color: '#065F46' }}>
                                  Đáp án đúng:
                                </label>
                                <input
                                  type="text"
                                  value={q.correct_answer}
                                  onChange={e => {
                                    const updatedQ = [...editingExercise.questions];
                                    updatedQ[originalIdx].correct_answer = e.target.value;
                                    setEditingExercise({ ...editingExercise, questions: updatedQ });
                                  }}
                                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #10B981', background: '#ECFDF5', fontWeight: 800, color: '#065F46' }}
                                  required
                                />
                              </div>
                            )}

                            {/* Image, Explanation, Hint */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, marginBottom: '2px', color: '#64748B' }}>
                                  Link ảnh minh họa:
                                </label>
                                <input
                                  type="text"
                                  value={q.image_url || ''}
                                  onChange={e => {
                                    const updatedQ = [...editingExercise.questions];
                                    updatedQ[originalIdx].image_url = e.target.value;
                                    setEditingExercise({ ...editingExercise, questions: updatedQ });
                                  }}
                                  placeholder="URL ảnh..."
                                  style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, marginBottom: '2px', color: '#64748B' }}>
                                  Lời giải thích chi tiết:
                                </label>
                                <input
                                  type="text"
                                  value={q.explanation || ''}
                                  onChange={e => {
                                    const updatedQ = [...editingExercise.questions];
                                    updatedQ[originalIdx].explanation = e.target.value;
                                    setEditingExercise({ ...editingExercise, questions: updatedQ });
                                  }}
                                  placeholder="Giải thích vì sao..."
                                  style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Modal Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1.5px solid #E2E8F0',
                    paddingTop: '16px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>
                      Tổng: <strong style={{ color: '#1E293B' }}>{editingExercise.questions?.length || 0} câu</strong> | Chế độ: <strong style={{ color: '#7C3AED' }}>{editingExercise.is_random_pool ? `Random ${editingExercise.random_count || 10} câu` : 'Làm toàn bộ'}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingExercise(null)}
                        style={{ padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontWeight: 800, cursor: 'pointer', color: '#475569' }}
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', padding: '10px 24px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                      >
                        <span>💾 Lưu Toàn Bộ Thay Đổi ({editingExercise.questions?.length || 0} câu) 🚀</span>
                      </button>
                    </div>
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

            {/* Target Classes Assignment Multi-Selector */}
            <div style={{
              marginTop: '16px',
              padding: '16px 20px',
              background: '#F0FDF4',
              borderRadius: '14px',
              border: '1.5px solid #BBF7D0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 900, fontSize: '0.95rem' }}>
                  <span>🏫</span>
                  <span>Chọn Lớp Nhận Bài Tập (Có thể chọn nhiều lớp cùng lúc):</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      sound.pop();
                      setSelectedAssignedClasses(classAnalytics.map(c => c.class_code || `${c.className}-8429`));
                    }}
                    style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', fontSize: '0.78rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    ✓ Chọn Tất Cả Lớp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.pop();
                      setSelectedAssignedClasses([]);
                    }}
                    style={{ background: '#FEE2E2', border: '1px solid #FECDD3', color: '#B91C1C', fontSize: '0.78rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    ✕ Bỏ Chọn (Tất Cả Khối)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {/* Option 1: All in grade */}
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: selectedAssignedClasses.length === 0 ? '#15803D' : '#FFFFFF',
                  color: selectedAssignedClasses.length === 0 ? '#FFFFFF' : '#334155',
                  border: '1.5px solid #86EFAC',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: selectedAssignedClasses.length === 0 ? '0 2px 8px rgba(21, 128, 61, 0.25)' : 'none'
                }}>
                  <input
                    type="radio"
                    name="assign_mode_create"
                    checked={selectedAssignedClasses.length === 0}
                    onChange={() => setSelectedAssignedClasses([])}
                    style={{ display: 'none' }}
                  />
                  <span>🌐 Toàn Bộ Khối {exerciseGrade} (Mặc định)</span>
                </label>

                {/* Specific Classes */}
                {classAnalytics.map(c => {
                  const classIdOrCode = c.class_code || `${c.className}-8429`;
                  const isSelected = selectedAssignedClasses.includes(classIdOrCode);
                  return (
                    <label
                      key={c.classId}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: isSelected ? '#15803D' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? '1.5px solid #15803D' : '1.5px solid #CBD5E1',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 2px 8px rgba(21, 128, 61, 0.25)' : 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          sound.pop();
                          if (e.target.checked) {
                            setSelectedAssignedClasses(prev => [...prev.filter(x => x !== 'ALL'), classIdOrCode]);
                          } else {
                            setSelectedAssignedClasses(prev => prev.filter(x => x !== classIdOrCode));
                          }
                        }}
                        style={{ width: '16px', height: '16px', accentColor: '#15803D' }}
                      />
                      <span>Lớp {c.className} (Mã: {classIdOrCode})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Random Question Pool & Shuffling Settings */}
            <div style={{
              marginTop: '18px',
              padding: '16px 20px',
              background: '#F5F3FF',
              borderRadius: '14px',
              border: '1.5px solid #DDD6FE'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#6D28D9', fontWeight: 900, fontSize: '0.95rem' }}>
                <span>🎲</span>
                <span>Cấu Hình Chế Độ Ngân Hàng Đề & Trộn Câu Hỏi Ngẫu Nhiên</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#4C1D95', marginBottom: '4px' }}>
                    Chế độ phát đề cho học sinh:
                  </label>
                  <select
                    value={randomMode}
                    onChange={e => setRandomMode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C4B5FD', background: 'white', fontWeight: 800, color: '#4C1D95', cursor: 'pointer' }}
                  >
                    <option value="all">📋 Làm toàn bộ câu hỏi trong đề (Mặc định)</option>
                    <option value="fixed_10">🎲 Ngân hàng đề: Lấy ngẫu nhiên 10 câu mỗi lượt</option>
                    <option value="fixed_20">🎲 Ngân hàng đề: Lấy ngẫu nhiên 20 câu mỗi lượt</option>
                    <option value="fixed_30">🎲 Ngân hàng đề: Lấy ngẫu nhiên 30 câu mỗi lượt</option>
                    <option value="student_choice">🎯 Học sinh tự chọn số lượng (10 / 20 / 30 / Tất cả)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={e => setShuffleQuestions(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }}
                    />
                    <span>🔀 Đảo ngẫu nhiên thứ tự câu hỏi mỗi lượt làm</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={e => setShuffleOptions(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }}
                    />
                    <span>🔀 Đảo ngẫu nhiên vị trí các đáp án (A, B, C, D)</span>
                  </label>
                </div>
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

            {/* Target Classes Assignment Multi-Selector for Excel */}
            <div style={{
              marginTop: '16px',
              padding: '16px 20px',
              background: '#F0FDF4',
              borderRadius: '14px',
              border: '1.5px solid #BBF7D0',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 900, fontSize: '0.95rem' }}>
                  <span>🏫</span>
                  <span>Chọn Lớp Nhận Bài Tập (Có thể chọn nhiều lớp cùng lúc):</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      sound.pop();
                      setSelectedAssignedClasses(classAnalytics.map(c => c.class_code || `${c.className}-8429`));
                    }}
                    style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', fontSize: '0.78rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    ✓ Chọn Tất Cả Lớp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.pop();
                      setSelectedAssignedClasses([]);
                    }}
                    style={{ background: '#FEE2E2', border: '1px solid #FECDD3', color: '#B91C1C', fontSize: '0.78rem', fontWeight: 800, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    ✕ Bỏ Chọn (Tất Cả Khối)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {/* Option 1: All in grade */}
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: selectedAssignedClasses.length === 0 ? '#15803D' : '#FFFFFF',
                  color: selectedAssignedClasses.length === 0 ? '#FFFFFF' : '#334155',
                  border: '1.5px solid #86EFAC',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: selectedAssignedClasses.length === 0 ? '0 2px 8px rgba(21, 128, 61, 0.25)' : 'none'
                }}>
                  <input
                    type="radio"
                    name="assign_mode_excel"
                    checked={selectedAssignedClasses.length === 0}
                    onChange={() => setSelectedAssignedClasses([])}
                    style={{ display: 'none' }}
                  />
                  <span>🌐 Toàn Bộ Khối {exerciseGrade} (Mặc định)</span>
                </label>

                {/* Specific Classes */}
                {classAnalytics.map(c => {
                  const classIdOrCode = c.class_code || `${c.className}-8429`;
                  const isSelected = selectedAssignedClasses.includes(classIdOrCode);
                  return (
                    <label
                      key={c.classId}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: isSelected ? '#15803D' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        border: isSelected ? '1.5px solid #15803D' : '1.5px solid #CBD5E1',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 2px 8px rgba(21, 128, 61, 0.25)' : 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          sound.pop();
                          if (e.target.checked) {
                            setSelectedAssignedClasses(prev => [...prev.filter(x => x !== 'ALL'), classIdOrCode]);
                          } else {
                            setSelectedAssignedClasses(prev => prev.filter(x => x !== classIdOrCode));
                          }
                        }}
                        style={{ width: '16px', height: '16px', accentColor: '#15803D' }}
                      />
                      <span>Lớp {c.className} (Mã: {classIdOrCode})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Random Question Pool & Shuffling Settings for Excel */}
            <div style={{
              padding: '16px 20px',
              background: '#F5F3FF',
              borderRadius: '14px',
              border: '1.5px solid #DDD6FE',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#6D28D9', fontWeight: 900, fontSize: '0.95rem' }}>
                <span>🎲</span>
                <span>Cấu Hình Chế Độ Ngân Hàng Đề & Trộn Ngẫu Nhiên (Ví dụ nhập file 100 câu ➔ Random 10 hoặc 20 câu)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#4C1D95', marginBottom: '4px' }}>
                    Chế độ phát đề cho học sinh:
                  </label>
                  <select
                    value={randomMode}
                    onChange={e => setRandomMode(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C4B5FD', background: 'white', fontWeight: 800, color: '#4C1D95', cursor: 'pointer' }}
                  >
                    <option value="all">📋 Làm toàn bộ câu hỏi trong file Excel (Mặc định)</option>
                    <option value="fixed_10">🎲 Ngân hàng đề: Lấy ngẫu nhiên 10 câu mỗi lượt làm</option>
                    <option value="fixed_20">🎲 Ngân hàng đề: Lấy ngẫu nhiên 20 câu mỗi lượt làm</option>
                    <option value="fixed_30">🎲 Ngân hàng đề: Lấy ngẫu nhiên 30 câu mỗi lượt làm</option>
                    <option value="student_choice">🎯 Học sinh tự chọn số lượng (10 / 20 / 30 / Tất cả)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={e => setShuffleQuestions(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }}
                    />
                    <span>🔀 Đảo ngẫu nhiên thứ tự câu hỏi mỗi lượt làm</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={e => setShuffleOptions(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }}
                    />
                    <span>🔀 Đảo ngẫu nhiên vị trí các đáp án (A, B, C, D)</span>
                  </label>
                </div>
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
                  {classAnalytics.map(cls => (
                    <option key={cls.classId} value={cls.classId}>
                      Lớp {cls.className} (Khối {cls.gradeLevel} • {cls.stats.totalStudents} học sinh)
                    </option>
                  ))}
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
                {classAnalytics.map(cls => (
                  <option key={cls.classId} value={cls.classId}>
                    Lớp {cls.className} (Khối {cls.gradeLevel} • {cls.stats.totalStudents} học sinh)
                  </option>
                ))}
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
      {/* Edit Class Modal */}
      {editingClass && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✏️</span>
                <span>Chỉnh Sửa Lớp Học</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 900, color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditClass}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>
                  Tên Lớp Học: <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={e => setEditClassName(e.target.value)}
                  placeholder="Ví dụ: 2A1, 4A2..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', fontWeight: 800 }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>
                  Khối lớp:
                </label>
                <select
                  value={editClassGrade}
                  onChange={e => setEditClassGrade(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  <option value="1">🌱 Lớp 1</option>
                  <option value="2">🐥 Lớp 2</option>
                  <option value="3">🐱 Lớp 3</option>
                  <option value="4">🚀 Lớp 4</option>
                  <option value="5">👑 Lớp 5</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 800, cursor: 'pointer', color: '#475569' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 900, background: 'linear-gradient(135deg, #059669, #10B981)' }}
                >
                  💾 Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal for Teachers */}
      <QRCodeModal
        isOpen={!!selectedQRClass}
        onClose={() => setSelectedQRClass(null)}
        classObj={selectedQRClass}
      />
    </div>
  );
}
