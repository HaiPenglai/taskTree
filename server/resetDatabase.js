const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = './task_tree.db'

// 默认用户数据
const defaultUsers = [
  {
    id: 1,
    username: "user",
    password_hash: "$2b$10$rTyGLi/TvyIVzFd6i6BX2.TaHrfDw1Hj2nkpN.o3yF7kHyiNXSbqS", // 明文密码: 'password'
    nickname: "测试用户",
  },
];

// 将db.run包装成Promise
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * 重置数据库
 * @param {boolean} forceReset 是否强制重置数据库
 * @returns {Promise<sqlite3.Database>} 数据库连接
 */
async function resetDatabase(forceReset = false) {
  // 如果强制重置且数据库存在，则删除
  if (forceReset && fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  // 创建数据库连接
  const db = await new Promise((resolve, reject) => {
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      else resolve(database);
    });
  });

  console.log("已连接到SQLite数据库!");

  try {
    // 创建用户表
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nickname TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建任务树表
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS user_task_trees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        tree_date TEXT NOT NULL,
        tree_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tree_date)
      )
    `);

    // 创建任务摘要表
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS user_task_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        summary_date TEXT NOT NULL,
        summary_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, summary_date)
      )
    `);

    // 创建蓝图表
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS user_task_blueprints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        root_id TEXT NOT NULL,
        blueprint_root TEXT NOT NULL,
        blueprint_tree TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, root_id)
      )
    `);

    // 创建用户工作时间表
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS user_work_count (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        work_date TEXT NOT NULL,
        total_time INTEGER DEFAULT 0,
        total_chars INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, work_date)
      )
    `);

    // 创建休息清单表
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS user_rest_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        rest_date TEXT NOT NULL,
        rest_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, rest_date)
      )
    `);

    // 创建笔记表
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS user_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        note_date TEXT NOT NULL,
        note_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, note_date)
      )
    `);

    // 创建日历表
    await runQuery(db, `
      CREATE TABLE IF NOT EXISTS user_calendar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        calendar_date TEXT NOT NULL,
        calendar_nodes TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, calendar_date)
      )
    `);

    // 如果强制重置，插入默认用户
    if (forceReset) {
      for (const user of defaultUsers) {
        await runQuery(
          db,
          `INSERT OR REPLACE INTO users (id, username, password_hash, nickname) VALUES (?, ?, ?, ?)`,
          [user.id, user.username, user.password_hash, user.nickname]
        );
      }
    }

    console.log("数据库初始化完成!");
    return db;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}

// 如果直接运行此脚本，则完全重置数据库
if (require.main === module) {
  resetDatabase(true)
    .then(db => {
      db.close(() => {
        console.log('数据库重置完成，连接已关闭');
      });
    })
    .catch(err => {
      console.error('重置数据库时发生错误:', err);
      process.exit(1);
    });
}

module.exports = { resetDatabase, dbPath }; 