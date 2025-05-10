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
const dbPath = "./task_tree.db"

// 如果数据库不存在就默认创建
const db = new sqlite3.Database(dbPath);

// 如果数据表不存在就创建
db.serialize(() => {
    // 任务树表
    db.run(`
            CREATE TABLE IF NOT EXISTS user_task_trees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                tree_date TEXT NOT NULL,
                tree_data TEXT NOT NULL,  -- SQLite没有原生JSON类型，使用TEXT
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, tree_date)
            )
        `);

    // 任务树索引
    db.run('CREATE INDEX IF NOT EXISTS idx_user_id ON user_task_trees(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_tree_date ON user_task_trees(tree_date)');

    // 蓝图表
    db.run(`
            CREATE TABLE IF NOT EXISTS user_blueprints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                blueprint_data TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // 蓝图索引
    db.run('CREATE INDEX IF NOT EXISTS idx_blueprint_user_id ON user_blueprints(user_id)');
});


// 获取或创建任务树
app.get('/api/task-tree/:user_id/:date', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [GET Tree] user ${req.params.user_id}, date ${req.params.date}`);

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
    console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [POST Tree] user ${req.params.user_id}, date ${req.params.date}`);

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

// 获取用户蓝图
app.get('/api/task-blueprint/:user_id', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [GET Blueprint] user ${req.params.user_id}`);

    try {
        const { user_id } = req.params;

        db.get(
            'SELECT blueprint_data FROM user_blueprints WHERE user_id = ?',
            [user_id],
            (err, row) => {
                if (err) {
                    console.error('Error fetching blueprint:', err);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                if (row) {
                    // 如果存在，直接返回
                    res.json({ success: true, nodes: JSON.parse(row.blueprint_data) });
                } else {
                    // 如果不存在，创建默认蓝图
                    const defaultBlueprint = [{
                        id: Date.now(),
                        parentId: null,
                        text: "蓝图根节点",
                        completed: 0,
                        timeStamp: new Date().toISOString().split('T')[0],
                        children: []
                    }];

                    // 插入数据库
                    db.run(
                        'INSERT INTO user_blueprints (user_id, blueprint_data) VALUES (?, ?)',
                        [user_id, JSON.stringify(defaultBlueprint)],
                        (insertErr) => {
                            if (insertErr) {
                                console.error('Error creating default blueprint:', insertErr);
                                return res.status(500).json({ success: false, message: 'Internal server error' });
                            }
                            res.json({ success: true, nodes: defaultBlueprint });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Error in blueprint endpoint:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// 保存用户蓝图
app.post('/api/task-blueprint/:user_id', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [POST Blueprint] user ${req.params.user_id}`);

    try {
        const { user_id } = req.params;
        const { nodes } = req.body;

        // 检查是否存在该用户的蓝图
        db.get(
            'SELECT id FROM user_blueprints WHERE user_id = ?',
            [user_id],
            (err, row) => {
                if (err) {
                    console.error('Error checking blueprint:', err);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                if (row) {
                    // 更新现有记录
                    db.run(
                        'UPDATE user_blueprints SET blueprint_data = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                        [JSON.stringify(nodes), user_id],
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating blueprint:', updateErr);
                                return res.status(500).json({ success: false, message: 'Internal server error' });
                            }
                            res.json({ success: true });
                        }
                    );
                } else {
                    // 创建新记录
                    db.run(
                        'INSERT INTO user_blueprints (user_id, blueprint_data) VALUES (?, ?)',
                        [user_id, JSON.stringify(nodes)],
                        (insertErr) => {
                            if (insertErr) {
                                console.error('Error saving blueprint:', insertErr);
                                return res.status(500).json({ success: false, message: 'Internal server error' });
                            }
                            res.json({ success: true });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Error in save blueprint endpoint:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 关闭数据库连接当进程退出
process.on('SIGINT', () => {
    db.close();
    process.exit();
});