// EduKids Realtime Cloud Sync Serverless API for Vercel
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
    console.warn('Cannot fetch from cloud storage:', err);
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
    console.warn('Cannot update cloud storage:', err);
    return false;
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const cloudState = await fetchCloudData();
    const deletedSet = new Set(cloudState.deleted_exercise_ids.map(d => parseInt(d, 10)));
    SYSTEM_DELETED_EXERCISES.forEach(id => deletedSet.add(id));

    // 1. GET: Return all real synced data
    if (req.method === 'GET') {
      const filteredExercises = (cloudState.exercises || []).filter(
        ex => ex && ex.id && !deletedSet.has(parseInt(ex.id, 10)) && Array.isArray(ex.questions) && ex.questions.length > 0
      );

      return res.status(200).json({
        success: true,
        cloud: 'EduKids Global Cloud Realtime Sync',
        exercises: filteredExercises,
        classes: cloudState.classes || [],
        students: cloudState.students || [],
        submissions: cloudState.submissions || [],
        deleted_exercise_ids: Array.from(deletedSet),
        deleted_class_ids: cloudState.deleted_class_ids || [],
        deleted_student_ids: cloudState.deleted_student_ids || [],
        timestamp: new Date().toISOString()
      });
    }

    // 2. POST: Actions
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      // Action: SAVE EXERCISE
      if (body.action === 'save_exercise' || body.exercise) {
        const newEx = body.exercise || body;
        const numId = parseInt(newEx.id, 10);
        if (!numId || deletedSet.has(numId)) {
          return res.status(400).json({ success: false, message: 'Invalid or deleted exercise ID' });
        }

        const existingIdx = cloudState.exercises.findIndex(e => parseInt(e.id, 10) === numId);
        if (existingIdx >= 0) {
          cloudState.exercises[existingIdx] = newEx;
        } else {
          cloudState.exercises.unshift(newEx);
        }

        // Remove from deleted list if re-added
        cloudState.deleted_exercise_ids = cloudState.deleted_exercise_ids.filter(id => parseInt(id, 10) !== numId);

        await updateCloudData(cloudState);
        return res.status(200).json({
          success: true,
          message: 'Đã đồng bộ bài tập lên Cloud Server thành công!',
          exercise: newEx
        });
      }

      // Action: DELETE EXERCISE
      if (body.action === 'delete_exercise' || body.deleteId) {
        const numId = parseInt(body.deleteId || body.id, 10);
        cloudState.exercises = cloudState.exercises.filter(e => parseInt(e.id, 10) !== numId);
        if (!cloudState.deleted_exercise_ids.includes(numId)) {
          cloudState.deleted_exercise_ids.push(numId);
        }

        await updateCloudData(cloudState);
        return res.status(200).json({
          success: true,
          message: 'Đã xóa bài tập trên Cloud Server thành công!',
          deletedId: numId
        });
      }

      // Action: SAVE CLASS
      if (body.action === 'save_class' || body.classObj) {
        const newClass = body.classObj || body;
        const code = String(newClass.class_code || newClass.id);
        cloudState.classes = cloudState.classes.filter(c => String(c.class_code || c.id) !== code);
        cloudState.classes.push(newClass);

        await updateCloudData(cloudState);
        return res.status(200).json({
          success: true,
          message: 'Đã lưu lớp học lên Cloud Server!',
          classObj: newClass
        });
      }

      // Action: JOIN CLASS / SAVE STUDENT
      if (body.action === 'join_class' || body.action === 'save_student' || body.action === 'update_profile' || body.student) {
        const st = body.student || body;
        const uName = (st.username || st.full_name || '').toLowerCase().trim();
        const idStr = String(st.id);

        cloudState.students = cloudState.students.filter(s => {
          const sUser = (s.username || s.full_name || '').toLowerCase().trim();
          const sId = String(s.id);
          return sUser !== uName && sId !== idStr;
        });
        cloudState.students.unshift(st);

        await updateCloudData(cloudState);
        return res.status(200).json({
          success: true,
          message: 'Đã cập nhật thông tin học sinh lên Cloud Server!',
          student: st
        });
      }

      // Action: SAVE SUBMISSION
      if (body.action === 'save_submission' || body.submission) {
        const sub = body.submission || body;
        const subId = String(sub.id || Date.now());
        cloudState.submissions = cloudState.submissions.filter(s => String(s.id) !== subId);
        cloudState.submissions.unshift(sub);
        if (cloudState.submissions.length > 300) {
          cloudState.submissions = cloudState.submissions.slice(0, 300);
        }

        await updateCloudData(cloudState);
        return res.status(200).json({
          success: true,
          message: 'Đã lưu kết quả bài làm lên Cloud Server!',
          submission: sub
        });
      }

      // Action: GET STUDENT PROFILE
      if (body.action === 'get_student_profile') {
        const queryUser = (body.username || '').toLowerCase().trim();
        const found = cloudState.students.find(s => {
          const sUser = (s.username || '').toLowerCase().trim();
          const sName = (s.full_name || s.student_name || '').toLowerCase().trim();
          const sId = String(s.id).toLowerCase().trim();
          return sUser === queryUser || sName === queryUser || sId === queryUser;
        });

        if (found) {
          return res.status(200).json({ success: true, user: found });
        }
        return res.status(404).json({ success: false, message: 'Student not found in cloud' });
      }
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Sync Fatal Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
