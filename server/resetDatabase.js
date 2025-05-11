const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../task_tree.db');

/**
 * 重置数据库
 * @param {boolean} deleteExisting 是否删除现有数据库
 * @returns {Promise<sqlite3.Database>} 数据库连接
 */
function resetDatabase(deleteExisting = false) {
  return new Promise((resolve, reject) => {
    // 如果数据库文件存在且需要删除
    if (deleteExisting && fs.existsSync(dbPath)) {
      console.log('找到旧数据库文件，正在删除...');
      fs.unlinkSync(dbPath);
      console.log('旧数据库文件已删除');
    } else if (deleteExisting) {
      console.log('未找到旧数据库文件');
    }

    // 创建新的数据库连接
    console.log('正在创建/打开数据库...');
    const db = new sqlite3.Database(dbPath);

    // 创建表结构
    db.serialize(() => {
      console.log('正在创建数据表...');
      
      // 用户表
      db.run(`
          CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL UNIQUE,
              password_hash TEXT NOT NULL,
              nickname TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
      `);

      // 用户索引
      db.run('CREATE INDEX IF NOT EXISTS idx_username ON users(username)');

      // 任务树表
      db.run(`
          CREATE TABLE IF NOT EXISTS user_task_trees (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              tree_date TEXT NOT NULL,
              tree_data TEXT NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE (user_id, tree_date)
          )
      `);

      // 任务树索引
      db.run('CREATE INDEX IF NOT EXISTS idx_user_id ON user_task_trees(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_tree_date ON user_task_trees(tree_date)');

      // 蓝图表
      db.run(`
          CREATE TABLE IF NOT EXISTS user_task_blueprints (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL UNIQUE,
              blueprint_data TEXT NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
      `);

      // 蓝图索引
      db.run('CREATE INDEX IF NOT EXISTS idx_blueprint_user_id ON user_task_blueprints(user_id)');

      // 创建任务摘要
      db.run(`
          CREATE TABLE IF NOT EXISTS user_task_summaries (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              summary_date TEXT NOT NULL,
              summary_data TEXT NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE (user_id, summary_date)
          )
      `, err => {
        if (err) {
          reject(err);
        } else {
          // 创建任务摘要索引
          db.run('CREATE INDEX IF NOT EXISTS idx_summary_user_id ON user_task_summaries(user_id)');
          db.run('CREATE INDEX IF NOT EXISTS idx_summary_date ON user_task_summaries(summary_date)', err => {
            if (err) {
              reject(err);
            } else {
              console.log('数据表创建完成');
              resolve(db);
            }
          });
        }
      });
    });
  });
}

// 如果直接运行此脚本，则完全重置数据库
if (require.main === module) {
  resetDatabase(true)
    .then(db => {
      db.close(() => {
        console.log('数据库重置完成，数据库连接已关闭');
      });
    })
    .catch(err => {
      console.error('重置数据库时出错:', err);
      process.exit(1);
    });
}

module.exports = { resetDatabase, dbPath }; 