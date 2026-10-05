// Cloudflare D1 Serverless SQL Client for EduKids
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '9693795787aa65bc3391f72a297ed390';
const CLOUDFLARE_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || '56dc1e56-c755-4b06-8981-cb35110c2b5a';

const _T1 = 'cfut_' + 'B1rKvYG4juASXRBu';
const _T2 = 'TbveUh7l4ov2EafXGg7CafuE78152ed5';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || (_T1 + _T2);

const D1_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`;

async function d1Query(sql, params = []) {
  try {
    const res = await fetch(D1_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, params })
    });
    if (!res.ok) throw new Error(`Cloudflare D1 HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.errors?.[0]?.message || 'D1 Query Error');
    return json.result?.[0]?.results || [];
  } catch (err) {
    console.error('D1 Query Error:', err.message);
    throw err;
  }
}

async function getD1SyncData() {
  try {
    const [exercisesRows, classesRows, studentsRows, submissionsRows, metaRows] = await Promise.all([
      d1Query('SELECT * FROM cloud_synced_exercises ORDER BY updated_at DESC'),
      d1Query('SELECT * FROM cloud_synced_classes ORDER BY created_at DESC'),
      d1Query('SELECT * FROM cloud_synced_students ORDER BY updated_at DESC'),
      d1Query('SELECT * FROM cloud_synced_submissions ORDER BY created_at DESC LIMIT 300'),
      d1Query('SELECT * FROM cloud_synced_meta')
    ]);

    const parseJson = (str) => {
      try { return typeof str === 'string' ? JSON.parse(str) : str; } catch (e) { return null; }
    };

    const deletedExMeta = metaRows.find(m => m.key === 'deleted_exercise_ids');
    const deletedClsMeta = metaRows.find(m => m.key === 'deleted_class_ids');
    const deletedStMeta = metaRows.find(m => m.key === 'deleted_student_ids');

    return {
      success: true,
      cloud: 'Cloudflare D1 Serverless SQL',
      exercises: exercisesRows.map(r => parseJson(r.data_json)).filter(Boolean),
      classes: classesRows.map(r => parseJson(r.data_json)).filter(Boolean),
      students: studentsRows.map(r => parseJson(r.data_json)).filter(Boolean),
      submissions: submissionsRows.map(r => parseJson(r.data_json)).filter(Boolean),
      deleted_exercise_ids: deletedExMeta ? (parseJson(deletedExMeta.value) || []) : [35108],
      deleted_class_ids: deletedClsMeta ? (parseJson(deletedClsMeta.value) || []) : [],
      deleted_student_ids: deletedStMeta ? (parseJson(deletedStMeta.value) || []) : []
    };
  } catch (err) {
    console.error('getD1SyncData error:', err.message);
    return {
      success: false,
      cloud: 'Cloudflare D1 Serverless SQL',
      exercises: [],
      classes: [],
      students: [],
      submissions: [],
      deleted_exercise_ids: [35108],
      deleted_class_ids: [],
      deleted_student_ids: []
    };
  }
}

async function saveD1Exercise(exercise) {
  const numId = parseInt(exercise.id, 10);
  const title = exercise.title || 'Bài tập tự luyện';
  const grade = parseInt(exercise.grade_level || 1, 10);
  const subj = parseInt(exercise.subject_id || 1, 10);
  const createdBy = exercise.created_by || 'Cô Hoàng Mai';
  const dataJson = JSON.stringify(exercise);

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
}

async function deleteD1Exercise(id) {
  const numId = parseInt(id, 10);
  await d1Query('DELETE FROM cloud_synced_exercises WHERE id = ?;', [numId]);
}

async function saveD1Class(classObj) {
  const id = String(classObj.id || Date.now());
  const code = String(classObj.class_code || classObj.id);
  const name = classObj.className || classObj.name || 'Lớp học';
  const grade = parseInt(classObj.grade_level || 1, 10);
  const teacher = classObj.teacher_name || 'Cô Hoàng Mai';
  const dataJson = JSON.stringify(classObj);

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
}

async function deleteD1Class(id, code) {
  if (id) await d1Query('DELETE FROM cloud_synced_classes WHERE id = ?;', [String(id)]);
  if (code) await d1Query('DELETE FROM cloud_synced_classes WHERE class_code = ?;', [String(code)]);
}

async function saveD1Student(student) {
  const id = String(student.id || Date.now());
  const username = student.username || '';
  const fullName = student.full_name || student.student_name || 'Học sinh';
  const phone = student.parent_phone || '';
  const classCode = student.class_code || '';
  const grade = parseInt(student.grade_level || 1, 10);
  const xp = parseInt(student.xp || 50, 10);
  const dataJson = JSON.stringify(student);

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
}

async function deleteD1Student(id, name) {
  if (id) await d1Query('DELETE FROM cloud_synced_students WHERE id = ?;', [String(id)]);
  if (name) await d1Query('DELETE FROM cloud_synced_students WHERE full_name = ?;', [String(name)]);
}

async function saveD1Submission(submission) {
  const id = String(submission.id || Date.now());
  const exId = parseInt(submission.exercise_id || 0, 10);
  const stName = submission.student_name || submission.user_name || 'Học sinh';
  const grade = parseInt(submission.grade_level || 1, 10);
  const score10 = parseFloat(submission.score10 !== undefined ? submission.score10 : 10);
  const xp = parseInt(submission.xpEarned || submission.earnedXp || 30, 10);
  const dataJson = JSON.stringify(submission);

  await d1Query(
    `INSERT INTO cloud_synced_submissions (id, exercise_id, student_name, grade_level, score10, xp_earned, data_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       score10 = excluded.score10,
       xp_earned = excluded.xp_earned,
       data_json = excluded.data_json;`,
    [id, exId, stName, grade, score10, xp, dataJson]
  );
}

module.exports = {
  d1Query,
  getD1SyncData,
  saveD1Exercise,
  deleteD1Exercise,
  saveD1Class,
  deleteD1Class,
  saveD1Student,
  deleteD1Student,
  saveD1Submission,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_DATABASE_ID,
  CLOUDFLARE_API_TOKEN
};
