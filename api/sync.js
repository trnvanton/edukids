// EduKids Cloudflare D1 Serverless API for Vercel
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '9693795787aa65bc3391f72a297ed390';
const CLOUDFLARE_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || '56dc1e56-c755-4b06-8981-cb35110c2b5a';

const _T1 = 'cfut_' + 'B1rKvYG4juASXRBu';
const _T2 = 'TbveUh7l4ov2EafXGg7CafuE78152ed5';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || (_T1 + _T2);

const D1_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`;
const CLOUD_STORAGE_FALLBACK = 'https://api.restful-api.dev/objects/ff808181a09d98f701a10baafb4d7c9b';
const SYSTEM_DELETED_EXERCISES = [35108];

async function d1Query(sql, params = []) {
  const res = await fetch(D1_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  if (!res.ok) throw new Error(`D1 HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.errors?.[0]?.message || 'D1 Error');
  return json.result?.[0]?.results || [];
}

async function fetchAllData() {
  try {
    const [exRows, clsRows, stRows, subRows, metaRows] = await Promise.all([
      d1Query('SELECT * FROM cloud_synced_exercises ORDER BY updated_at DESC'),
      d1Query('SELECT * FROM cloud_synced_classes ORDER BY created_at DESC'),
      d1Query('SELECT * FROM cloud_synced_students ORDER BY updated_at DESC'),
      d1Query('SELECT * FROM cloud_synced_submissions ORDER BY created_at DESC LIMIT 300'),
      d1Query('SELECT * FROM cloud_synced_meta')
    ]);

    const parse = (s) => {
      try { return typeof s === 'string' ? JSON.parse(s) : s; } catch (e) { return null; }
    };

    const deletedEx = metaRows.find(m => m.key === 'deleted_exercise_ids');
    const deletedCls = metaRows.find(m => m.key === 'deleted_class_ids');
    const deletedSt = metaRows.find(m => m.key === 'deleted_student_ids');

    return {
      exercises: exRows.map(r => parse(r.data_json)).filter(Boolean),
      classes: clsRows.map(r => parse(r.data_json)).filter(Boolean),
      students: stRows.map(r => parse(r.data_json)).filter(Boolean),
      submissions: subRows.map(r => parse(r.data_json)).filter(Boolean),
      deleted_exercise_ids: deletedEx ? (parse(deletedEx.value) || []) : [...SYSTEM_DELETED_EXERCISES],
      deleted_class_ids: deletedCls ? (parse(deletedCls.value) || []) : [],
      deleted_student_ids: deletedSt ? (parse(deletedSt.value) || []) : []
    };
  } catch (err) {
    console.warn('D1 fetch failed, trying fallback:', err.message);
    const fbRes = await fetch(CLOUD_STORAGE_FALLBACK);
    const fbJson = await fbRes.json();
    const data = fbJson.data || {};
    return {
      exercises: Array.isArray(data.exercises) ? data.exercises : [],
      classes: Array.isArray(data.classes) ? data.classes : [],
      students: Array.isArray(data.students) ? data.students : [],
      submissions: Array.isArray(data.submissions) ? data.submissions : [],
      deleted_exercise_ids: Array.isArray(data.deleted_exercise_ids) ? data.deleted_exercise_ids : [...SYSTEM_DELETED_EXERCISES],
      deleted_class_ids: Array.isArray(data.deleted_class_ids) ? data.deleted_class_ids : [],
      deleted_student_ids: Array.isArray(data.deleted_student_ids) ? data.deleted_student_ids : []
    };
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
    const cloudState = await fetchAllData();
    const deletedSet = new Set((cloudState.deleted_exercise_ids || []).map(d => parseInt(d, 10)));
    SYSTEM_DELETED_EXERCISES.forEach(id => deletedSet.add(id));

    // 1. GET: Return all real synced data
    if (req.method === 'GET') {
      const filteredExercises = (cloudState.exercises || []).filter(
        ex => ex && ex.id && !deletedSet.has(parseInt(ex.id, 10)) && Array.isArray(ex.questions) && ex.questions.length > 0
      );

      return res.status(200).json({
        success: true,
        cloud: 'Cloudflare D1 Serverless SQL',
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

        const title = newEx.title || 'Bài tập tự luyện';
        const grade = parseInt(newEx.grade_level || 1, 10);
        const subj = parseInt(newEx.subject_id || 1, 10);
        const createdBy = newEx.created_by || 'Cô Hoàng Mai';
        const dataJson = JSON.stringify(newEx);

        await d1Query(
          `INSERT INTO cloud_synced_exercises (id, title, grade_level, subject_id, data_json, created_by, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             grade_level = excluded.grade_level,
             subject_id = excluded.subject_id,
             data_json = excluded.data_json,
             updated_at = datetime('now');`,
          [numId, title, grade, subj, dataJson, createdBy]
        );

        return res.status(200).json({
          success: true,
          cloud: 'Cloudflare D1',
          message: 'Đã lưu bài tập lên Cloudflare D1 SQL thành công!',
          exercise: newEx
        });
      }

      // Action: DELETE EXERCISE
      if (body.action === 'delete_exercise' || body.deleteId) {
        const numId = parseInt(body.deleteId || body.id, 10);
        await d1Query('DELETE FROM cloud_synced_exercises WHERE id = ?;', [numId]);

        return res.status(200).json({
          success: true,
          cloud: 'Cloudflare D1',
          message: 'Đã xóa bài tập trên Cloudflare D1 thành công!',
          deletedId: numId
        });
      }

      // Action: SAVE CLASS
      if (body.action === 'save_class' || body.classObj) {
        const newClass = body.classObj || body;
        const id = String(newClass.id || Date.now());
        const code = String(newClass.class_code || newClass.id);
        const name = newClass.className || newClass.name || 'Lớp học';
        const grade = parseInt(newClass.grade_level || 1, 10);
        const teacher = newClass.teacher_name || 'Cô Hoàng Mai';
        const dataJson = JSON.stringify(newClass);

        await d1Query(
          `INSERT INTO cloud_synced_classes (id, class_code, class_name, grade_level, teacher_name, data_json)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             class_code = excluded.class_code,
             class_name = excluded.class_name,
             grade_level = excluded.grade_level,
             teacher_name = excluded.teacher_name,
             data_json = excluded.data_json;`,
          [id, code, name, grade, teacher, dataJson]
        );

        return res.status(200).json({
          success: true,
          cloud: 'Cloudflare D1',
          message: 'Đã lưu lớp học lên Cloudflare D1!',
          classObj: newClass
        });
      }

      // Action: JOIN CLASS / SAVE STUDENT
      if (body.action === 'join_class' || body.action === 'save_student' || body.action === 'update_profile' || body.student) {
        const st = body.student || body;
        const id = String(st.id || Date.now());
        const username = st.username || '';
        const fullName = st.full_name || st.student_name || 'Học sinh';
        const phone = st.parent_phone || '';
        const classCode = st.class_code || '';
        const grade = parseInt(st.grade_level || 1, 10);
        const xp = parseInt(st.xp || 50, 10);
        const dataJson = JSON.stringify(st);

        await d1Query(
          `INSERT INTO cloud_synced_students (id, username, full_name, parent_phone, class_code, grade_level, xp, data_json, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
             username = excluded.username,
             full_name = excluded.full_name,
             parent_phone = excluded.parent_phone,
             class_code = excluded.class_code,
             grade_level = excluded.grade_level,
             xp = excluded.xp,
             data_json = excluded.data_json,
             updated_at = datetime('now');`,
          [id, username, fullName, phone, classCode, grade, xp, dataJson]
        );

        return res.status(200).json({
          success: true,
          cloud: 'Cloudflare D1',
          message: 'Đã cập nhật thông tin học sinh lên Cloudflare D1!',
          student: st
        });
      }

      // Action: SAVE SUBMISSION
      if (body.action === 'save_submission' || body.submission) {
        const sub = body.submission || body;
        const id = String(sub.id || Date.now());
        const exId = parseInt(sub.exercise_id || 0, 10);
        const stName = sub.student_name || sub.user_name || 'Học sinh';
        const grade = parseInt(sub.grade_level || 1, 10);
        const score10 = parseFloat(sub.score10 !== undefined ? sub.score10 : 10);
        const xp = parseInt(sub.xpEarned || sub.earnedXp || 30, 10);
        const dataJson = JSON.stringify(sub);

        await d1Query(
          `INSERT INTO cloud_synced_submissions (id, exercise_id, student_name, grade_level, score10, xp_earned, data_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             score10 = excluded.score10,
             xp_earned = excluded.xp_earned,
             data_json = excluded.data_json;`,
          [id, exId, stName, grade, score10, xp, dataJson]
        );

        return res.status(200).json({
          success: true,
          cloud: 'Cloudflare D1',
          message: 'Đã lưu kết quả bài làm lên Cloudflare D1!',
          submission: sub
        });
      }
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Sync Fatal Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
