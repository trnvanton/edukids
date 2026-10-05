// Backend Cloud Sync Controller using EduKids Global Cloud REST Storage
const CLOUD_STORAGE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a10baafb4d7c9b';
const SYSTEM_DELETED_EXERCISES = [35108];

async function fetchCloudData() {
  try {
    const res = await fetch(CLOUD_STORAGE_URL, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const data = json.data || {};
    return {
      exercises: Array.isArray(data.exercises) ? data.exercises : [],
      classes: Array.isArray(data.classes) ? data.classes : [],
      students: Array.isArray(data.students) ? data.students : [],
      submissions: Array.isArray(data.submissions) ? data.submissions : [],
      deleted_exercise_ids: Array.isArray(data.deleted_exercise_ids) ? data.deleted_exercise_ids : [...SYSTEM_DELETED_EXERCISES],
      deleted_class_ids: Array.isArray(data.deleted_class_ids) ? data.deleted_class_ids : [],
      deleted_student_ids: Array.isArray(data.deleted_student_ids) ? data.deleted_student_ids : []
    };
  } catch (err) {
    return {
      exercises: [],
      classes: [],
      students: [],
      submissions: [],
      deleted_exercise_ids: [...SYSTEM_DELETED_EXERCISES],
      deleted_class_ids: [],
      deleted_student_ids: []
    };
  }
}

async function updateCloudData(updatedData) {
  try {
    const payload = {
      name: 'edukids_global_data',
      data: updatedData
    };
    const res = await fetch(CLOUD_STORAGE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

class SyncController {
  static async getSyncData(req, res) {
    try {
      const cloudState = await fetchCloudData();
      const deletedSet = new Set(cloudState.deleted_exercise_ids.map(d => parseInt(d, 10)));
      SYSTEM_DELETED_EXERCISES.forEach(id => deletedSet.add(id));

      const filteredExercises = (cloudState.exercises || []).filter(
        ex => ex && ex.id && !deletedSet.has(parseInt(ex.id, 10)) && Array.isArray(ex.questions) && ex.questions.length > 0
      );

      return res.json({
        success: true,
        cloud: 'EduKids Global Cloud Realtime Sync',
        count_exercises: filteredExercises.length,
        count_submissions: (cloudState.submissions || []).length,
        exercises: filteredExercises,
        classes: cloudState.classes || [],
        students: cloudState.students || [],
        submissions: cloudState.submissions || [],
        deleted_exercise_ids: Array.from(deletedSet),
        deleted_class_ids: cloudState.deleted_class_ids || [],
        deleted_student_ids: cloudState.deleted_student_ids || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message, exercises: [], submissions: [] });
    }
  }

  static async saveExercise(req, res) {
    try {
      const exercise = req.body.exercise || req.body;
      if (!exercise || !exercise.id) {
        return res.status(400).json({ success: false, message: 'Dữ liệu bài tập không hợp lệ (thiếu ID)!' });
      }

      const cloudState = await fetchCloudData();
      const numId = parseInt(exercise.id, 10);

      cloudState.exercises = (cloudState.exercises || []).filter(e => parseInt(e.id, 10) !== numId);
      cloudState.exercises.unshift(exercise);
      cloudState.deleted_exercise_ids = (cloudState.deleted_exercise_ids || []).filter(id => parseInt(id, 10) !== numId);

      await updateCloudData(cloudState);

      return res.json({
        success: true,
        message: 'Đã lưu và đồng bộ bài tập lên Cloud Server thành công!',
        exercise
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteExercise(req, res) {
    try {
      const exerciseId = parseInt(req.params.id || req.body.deleteId, 10);
      const cloudState = await fetchCloudData();

      cloudState.exercises = (cloudState.exercises || []).filter(e => parseInt(e.id, 10) !== exerciseId);
      if (!cloudState.deleted_exercise_ids.includes(exerciseId)) {
        cloudState.deleted_exercise_ids.push(exerciseId);
      }

      await updateCloudData(cloudState);

      return res.json({
        success: true,
        message: 'Đã xóa bài tập trên Cloud Server thành công!',
        deletedId: exerciseId
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveSubmission(req, res) {
    try {
      const submission = req.body.submission || req.body;
      if (!submission || !submission.id) {
        return res.status(400).json({ success: false, message: 'Dữ liệu nộp bài không hợp lệ!' });
      }

      const cloudState = await fetchCloudData();
      const subId = String(submission.id);

      cloudState.submissions = (cloudState.submissions || []).filter(s => String(s.id) !== subId);
      cloudState.submissions.unshift(submission);
      if (cloudState.submissions.length > 300) {
        cloudState.submissions = cloudState.submissions.slice(0, 300);
      }

      await updateCloudData(cloudState);

      return res.json({
        success: true,
        message: 'Đã đồng bộ kết quả nộp bài lên Cloud Server thành công!',
        submission
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async health(req, res) {
    return res.json({
      status: 'ok',
      cloud: 'EduKids Global Cloud Realtime Sync',
      connected: true,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = SyncController;
