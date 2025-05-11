// server\taskTreeAPI.js
const express = require('express');
const bcrypt = require('bcrypt');
const { resetDatabase } = require('./resetDatabase');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// 初始化数据库
let db;

// 启动函数
async function initializeServer() {
    try {
        // 初始化数据库，不删除现有数据库
        db = await resetDatabase(false);
        
        // 启动服务器
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}, accessible from all interfaces`));
    } catch (error) {
        console.error('Server initialization failed:', error);
        process.exit(1);
    }
}

function logRequest(method, action, params) {
    console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [${method} ${action}] ${Object.entries(params).map(([k,v]) => `${k} ${v}`).join(', ')}`);
}

function saveTaskSummary(user_id, date, nodes) {
    // 只保存没有完成的顶级任务的摘要
    const summary = nodes
        .filter(node => !node.hidden) // 过滤掉隐藏的任务
        .map(node => ({ 
            id: node.id, 
            text: node.text,
            completed: node.completed
        }));
    
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

// 用户注册API
app.post('/api/auth/register', (req, res) => {
    const { username, password, nickname } = req.body;
    logRequest('POST', 'Register', { username, nickname });
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
        if (row) {
            return res.status(409).json({ success: false, message: '用户名已存在' });
        }
        
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        db.run('INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)',
            [username, passwordHash, nickname || username], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: '用户创建失败' });
                }
                
                res.json({ 
                    success: true, 
                    user: { 
                        id: this.lastID, 
                        username, 
                        nickname: nickname || username 
                    } 
                });
            });
    });
});

// 用户登录API
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    logRequest('POST', 'Login', { username });
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    db.get('SELECT id, username, password_hash, nickname FROM users WHERE username = ?', 
        [username], async (err, user) => {
            if (!user) {
                return res.status(401).json({ success: false, message: '用户名或密码错误' });
            }
            
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(401).json({ success: false, message: '用户名或密码错误' });
            }
            
            res.json({ 
                success: true, 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    nickname: user.nickname 
                } 
            });
        });
});

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
            // 将摘要按日期分组
            const summariesByDate = {};
            rows.forEach(row => {
                const date = row.summary_date;
                summariesByDate[date] = JSON.parse(row.summary_data);
            });
            res.json({ success: true, summariesByDate });
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

// 启动服务器
initializeServer();

process.on('SIGINT', () => {
    if (db) {
        db.close();
    }
    process.exit();
});