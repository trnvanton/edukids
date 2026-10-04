const { initDatabaseConnection, query } = require('./config/database');

async function setupCloudSync() {
  await initDatabaseConnection();
  
  await query(`
    CREATE TABLE IF NOT EXISTS cloud_synced_exercises (
      id BIGINT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      grade_level INT NOT NULL DEFAULT 1,
      subject_id INT NOT NULL DEFAULT 1,
      data_json LONGTEXT NOT NULL,
      created_by VARCHAR(100) DEFAULT 'Cô Hoàng Mai',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS cloud_synced_submissions (
      id VARCHAR(100) PRIMARY KEY,
      exercise_id BIGINT NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      student_avatar VARCHAR(100) DEFAULT 'mascot-bear',
      grade_level INT DEFAULT 1,
      score10 FLOAT DEFAULT 10,
      correct_count INT DEFAULT 0,
      total_questions INT DEFAULT 10,
      data_json LONGTEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('✅ [MySQL Cloud Sync]: Tables created and ready on Aiven Cloud Database!');
  process.exit(0);
}

setupCloudSync().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
