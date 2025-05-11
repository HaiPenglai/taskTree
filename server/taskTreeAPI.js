// server\taskTreeAPI.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

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
    `);

    // 创建任务摘要索引
    db.run('CREATE INDEX IF NOT EXISTS idx_summary_user_id ON user_task_summaries(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_summary_date ON user_task_summaries(summary_date)');
});

function logRequest(method, action, params) {
    console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [${method} ${action}] ${Object.entries(params).map(([k,v]) => `${k} ${v}`).join(', ')}`);
}

function saveTaskSummary(user_id, date, nodes) {
    const summary = nodes.map(node => ({ id: node.id, text: node.text }));
    db.get('SELECT id FROM user_task_summaries WHERE user_id = ? AND summary_date = ?', [user_id, date], (_, row) => {
        if (row) {
            db.run('UPDATE user_task_summaries SET summary_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [JSON.stringify(summary), row.id]);
        } else {
            db.run('INSERT INTO user_task_summaries (user_id, summary_date, summary_data) VALUES (?, ?, ?)',
                [user_id, date, JSON.stringify(summary)]);
        }
    });
}

// 获取或创建任务树
app.get('/api/task-tree/:user_id/:date', (req, res) => {
    const { user_id, date } = req.params;
    logRequest('GET', 'Tree', { user: user_id, date });
    db.get('SELECT tree_data FROM user_task_trees WHERE user_id = ? AND tree_date = ?', [user_id, date], (_, row) => {
        if (row) {
            res.json({ success: true, nodes: JSON.parse(row.tree_data) });
        } else {
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
                hidden: 0,
                children: []
            }];
            db.run('INSERT INTO user_task_trees (user_id, tree_date, tree_data) VALUES (?, ?, ?)',
                [user_id, date, JSON.stringify(defaultTree)]);
            res.json({ success: true, nodes: defaultTree });
        }
    });
});

// 保存任务树
app.post('/api/task-tree/:user_id/:date', (req, res) => {
    const { user_id, date } = req.params;
    logRequest('POST', 'Tree', { user: user_id, date });
    const { nodes } = req.body;
    
    db.get('SELECT id FROM user_task_trees WHERE user_id = ? AND tree_date = ?', [user_id, date], (_, row) => {
        if (row) {
            db.run('UPDATE user_task_trees SET tree_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [JSON.stringify(nodes), row.id]);
        } else {
            db.run('INSERT INTO user_task_trees (user_id, tree_date, tree_data) VALUES (?, ?, ?)',
                [user_id, date, JSON.stringify(nodes)]);
        }
        res.json({ success: true });
    });
    
    saveTaskSummary(user_id, date, nodes);
});

app.get('/api/task-summary/:user_id', (req, res) => {
    const { user_id } = req.params;
    logRequest('GET', 'Summary', { user: user_id });
    db.all('SELECT summary_date, summary_data FROM user_task_summaries WHERE user_id = ? ORDER BY summary_date DESC',
        [user_id], (_, rows) => {
            const allSummaries = rows.reduce((acc, row) => acc.concat(JSON.parse(row.summary_data)), []);
            res.json({ success: true, summaries: allSummaries });
        });
});

// 获取用户蓝图
app.get('/api/task-blueprint/:user_id', (req, res) => {
    const { user_id } = req.params;
    logRequest('GET', 'Blueprint', { user: user_id });
    db.get('SELECT blueprint_data FROM user_task_blueprints WHERE user_id = ?', [user_id], (_, row) => {
        if (row) {
            res.json({ success: true, nodes: JSON.parse(row.blueprint_data) });
        } else {
            const defaultBlueprint = [{
                id: Date.now(),
                parentId: null,
                text: "蓝图根节点",
                completed: 0,
                timeStamp: new Date().toISOString().split('T')[0],
                hidden: 0,
                children: []
            }];
            db.run('INSERT INTO user_task_blueprints (user_id, blueprint_data) VALUES (?, ?)',
                [user_id, JSON.stringify(defaultBlueprint)]);
            res.json({ success: true, nodes: defaultBlueprint });
        }
    });
});

// 保存用户蓝图
app.post('/api/task-blueprint/:user_id', (req, res) => {
    const { user_id } = req.params;
    logRequest('POST', 'Blueprint', { user: user_id });
    const { nodes } = req.body;
    
    db.get('SELECT id FROM user_task_blueprints WHERE user_id = ?', [user_id], (_, row) => {
        if (row) {
            db.run('UPDATE user_task_blueprints SET blueprint_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [JSON.stringify(nodes), row.id]);
        } else {
            db.run('INSERT INTO user_task_blueprints (user_id, blueprint_data) VALUES (?, ?)',
                [user_id, JSON.stringify(nodes)]);
        }
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('SIGINT', () => {
    db.close();
    process.exit();
});