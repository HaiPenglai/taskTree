// server\taskTreeAPI.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// 数据库文件路径
const dbPath = process.env.IS_PACKAGED === 'true'
  ? path.join(process.resourcesPath, 'server', 'task_tree.db')
  : path.join(__dirname, 'task_tree.db');

// 检查并初始化数据库
if (!fs.existsSync(dbPath)) {
    console.log('Creating new SQLite database...');
    const newDb = new sqlite3.Database(dbPath);
    
    newDb.serialize(() => {
        newDb.run(`
            CREATE TABLE user_task_trees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                tree_date TEXT NOT NULL,
                tree_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, tree_date)
            )
        `);
        
        newDb.run('CREATE INDEX idx_user_id ON user_task_trees(user_id)');
        newDb.run('CREATE INDEX idx_tree_date ON user_task_trees(tree_date)');
    });
    
    newDb.close();
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath);

// 获取或创建任务树
app.get('/api/task-tree/:user_id/:date', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [GET] user ${req.params.user_id}, date ${req.params.date}`);

    try {
        const { user_id, date } = req.params;

        db.get(
            'SELECT tree_data FROM user_task_trees WHERE user_id = ? AND tree_date = ?',
            [user_id, date],
            (err, row) => {
                if (err) {
                    console.error('Error fetching task tree:', err);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                if (row) {
                    // 如果存在，直接返回
                    res.json({ success: true, nodes: JSON.parse(row.tree_data) });
                } else {
                    // 如果不存在，创建默认任务树
                    const defaultTree = [{
                        id: Date.now(),
                        parentId: null,
                        text: "根任务",
                        comment: "这是根任务",
                        estimatedTime: 90,
                        remainingTime: 5400,
                        startTime: 0,
                        elapsedTime: 0,
                        completed: 0,
                        timeStamp: date,
                        children: []
                    }];

                    // 插入数据库
                    db.run(
                        'INSERT INTO user_task_trees (user_id, tree_date, tree_data) VALUES (?, ?, ?)',
                        [user_id, date, JSON.stringify(defaultTree)],
                        (insertErr) => {
                            if (insertErr) {
                                console.error('Error creating default task tree:', insertErr);
                                return res.status(500).json({ success: false, message: 'Internal server error' });
                            }
                            res.json({ success: true, nodes: defaultTree });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Error in task tree endpoint:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// 保存任务树
app.post('/api/task-tree/:user_id/:date', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [POST] user ${req.params.user_id}, date ${req.params.date}`);

    try {
        const { user_id, date } = req.params;
        const { nodes } = req.body;

        // 检查是否存在该日期的任务树
        db.get(
            'SELECT id FROM user_task_trees WHERE user_id = ? AND tree_date = ?',
            [user_id, date],
            (err, row) => {
                if (err) {
                    console.error('Error checking task tree:', err);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                if (row) {
                    // 更新现有记录
                    db.run(
                        'UPDATE user_task_trees SET tree_data = ? WHERE id = ?',
                        [JSON.stringify(nodes), row.id],
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating task tree:', updateErr);
                                return res.status(500).json({ success: false, message: 'Internal server error' });
                            }
                            res.json({ success: true });
                        }
                    );
                } else {
                    // 创建新记录
                    db.run(
                        'INSERT INTO user_task_trees (user_id, tree_date, tree_data) VALUES (?, ?, ?)',
                        [user_id, date, JSON.stringify(nodes)],
                        (insertErr) => {
                            if (insertErr) {
                                console.error('Error saving task tree:', insertErr);
                                return res.status(500).json({ success: false, message: 'Internal server error' });
                            }
                            res.json({ success: true });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Error in save task tree endpoint:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 关闭数据库连接当进程退出
process.on('SIGINT', () => {
    db.close();
    process.exit();
});