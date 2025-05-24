// server\taskTreeAPI.js
const express = require('express');
const bcrypt = require('bcrypt');
const { resetDatabase } = require('./resetDatabase');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
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
        const PORT = process.env.PORT || 3002;
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
    // 计算节点及其所有子节点的总时间
    function calculateTotalTime(node) {
        let totalTime = node.elapsedTime || 0;
        
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                totalTime += calculateTotalTime(child);
            });
        }
        
        return totalTime;
    }
    
    // 保存根任务的摘要，包括完成状态和总时间
    const summary = nodes.map(node => ({ 
        id: node.id, 
        text: node.text,
        completed: node.completed,
        totalTime: calculateTotalTime(node)
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
    const { page = 1 } = req.query;
    const pageSize = 10;
    logRequest('GET', 'Summary', { user: user_id, page });
    
    // 获取任务摘要，使用分页
    db.all(`
        SELECT summary_date, summary_data 
        FROM user_task_summaries 
        WHERE user_id = ? 
        ORDER BY summary_date DESC
        LIMIT ? OFFSET ?`,
        [user_id, pageSize, (page - 1) * pageSize], 
        (err, summaryRows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            // 获取总记录数
            db.get('SELECT COUNT(*) as total FROM user_task_summaries WHERE user_id = ?', 
                [user_id], 
                (err, countRow) => {
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message });
                    }

                    // 获取工作时间
                    const summaryDates = summaryRows.map(row => row.summary_date).join("','");
                    const timeQuery = summaryDates ? 
                        `SELECT work_date, total_time FROM user_work_times WHERE user_id = ? AND work_date IN ('${summaryDates}') ORDER BY work_date DESC` :
                        'SELECT work_date, total_time FROM user_work_times WHERE user_id = ? AND 1=0';
                    
                    db.all(timeQuery, [user_id], (err, timeRows) => {
                        if (err) {
                            return res.status(500).json({ success: false, error: err.message });
                        }

                        // 将工作时间转换为以日期为键的对象
                        const timesByDate = {};
                        timeRows.forEach(row => {
                            timesByDate[row.work_date] = row.total_time;
                        });
                        
                        // 将摘要按日期分组
                        const summariesByDate = {};
                        summaryRows.forEach(row => {
                            const date = row.summary_date;
                            summariesByDate[date] = JSON.parse(row.summary_data);
                        });
                        
                        res.json({ 
                            success: true, 
                            summariesByDate,
                            timesByDate,
                            pagination: {
                                total: countRow.total,
                                page: parseInt(page),
                                pageSize,
                                hasMore: countRow.total > page * pageSize
                            }
                        });
                    });
                });
        });
});

// 获取用户所有蓝图根节点
app.get('/api/task-blueprint-roots/:user_id', (req, res) => {
    const { user_id } = req.params;
    logRequest('GET', 'Blueprint Roots', { user: user_id });
    
    db.all('SELECT blueprint_root FROM user_task_blueprints WHERE user_id = ? ORDER BY created_at DESC', 
        [user_id], (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            const roots = rows.map(row => JSON.parse(row.blueprint_root));
            res.json({ success: true, roots });
        });
});

// 获取特定蓝图树
app.get('/api/task-blueprint-tree/:user_id/:root_id', (req, res) => {
    const { user_id, root_id } = req.params;
    logRequest('GET', 'Blueprint Tree', { user: user_id, root: root_id });
    
    // 使用CAST将root_id转换为TEXT进行比较，或者使用LIKE进行模糊匹配
    db.get('SELECT blueprint_tree FROM user_task_blueprints WHERE user_id = ? AND CAST(root_id AS TEXT) LIKE ?', 
        [user_id, root_id + '%'], (err, row) => {
            if (err) {
                console.error('Error fetching blueprint tree:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            if (!row) {
                console.error('Blueprint tree not found for root_id:', root_id);
                return res.status(404).json({ success: false, message: '未找到对应的蓝图树' });
            }
            
            const nodes = JSON.parse(row.blueprint_tree);
            res.json({ success: true, nodes });
        });
});

// 新建或更新蓝图树
app.post('/api/task-blueprint/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { nodes, root_id } = req.body;
    logRequest('POST', 'Blueprint', { user: user_id, root: root_id });
    
    if (!nodes || !nodes.length || !root_id) {
        return res.status(400).json({ success: false, message: '无效的请求数据' });
    }
    
    // 提取根节点信息（不包含children）
    const rootNode = { ...nodes[0] };
    delete rootNode.children;
    
    db.get('SELECT id FROM user_task_blueprints WHERE user_id = ? AND root_id = ?', 
        [user_id, root_id], (err, row) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            const query = row ? 
                'UPDATE user_task_blueprints SET blueprint_root = ?, blueprint_tree = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND root_id = ?' :
                'INSERT INTO user_task_blueprints (user_id, root_id, blueprint_root, blueprint_tree) VALUES (?, ?, ?, ?)';
            
            const params = row ?
                [JSON.stringify(rootNode), JSON.stringify(nodes), user_id, root_id] :
                [user_id, root_id, JSON.stringify(rootNode), JSON.stringify(nodes)];
            
            db.run(query, params, (err) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.json({ success: true });
            });
        });
});

// 删除蓝图树
app.delete('/api/task-blueprint/:user_id/:root_id', (req, res) => {
    const { user_id, root_id } = req.params;
    logRequest('DELETE', 'Blueprint', { user: user_id, root: root_id });
    
    db.run('DELETE FROM user_task_blueprints WHERE user_id = ? AND CAST(root_id AS TEXT) LIKE ?',
        [user_id, root_id + '%'], (err) => {
            if (err) {
                console.error('Error deleting blueprint tree:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            // 检查是否真的删除了记录
            db.get('SELECT changes() as affected', [], (err, row) => {
                if (err) {
                    console.error('Error checking affected rows:', err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                
                if (row.affected === 0) {
                    console.warn('No blueprint tree was deleted for root_id:', root_id);
                    return res.status(404).json({ success: false, message: '未找到对应的蓝图树' });
                }
                
                res.json({ success: true });
            });
        });
});

// 获取用户工作时间
app.get('/api/task-time/:user_id/:date', (req, res) => {
    const { user_id, date } = req.params;
    logRequest('GET', 'WorkTime', { user: user_id, date });
    
    db.get('SELECT total_time FROM user_work_times WHERE user_id = ? AND work_date = ?', 
        [user_id, date], (err, row) => {
            if (row) {
                res.json({ success: true, totalTime: row.total_time });
            } else {
                res.json({ success: true, totalTime: 0 });
            }
        });
});

// 保存用户工作时间
app.post('/api/task-time/:user_id/:date', (req, res) => {
    const { user_id, date } = req.params;
    const { totalTime } = req.body;
    logRequest('POST', 'WorkTime', { user: user_id, date, time: totalTime });
    
    if (totalTime === undefined) {
        return res.status(400).json({ success: false, message: '总时间不能为空' });
    }
    
    db.get('SELECT id FROM user_work_times WHERE user_id = ? AND work_date = ?', 
        [user_id, date], (err, row) => {
            if (row) {
                db.run('UPDATE user_work_times SET total_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [totalTime, row.id]);
            } else {
                db.run('INSERT INTO user_work_times (user_id, work_date, total_time) VALUES (?, ?, ?)',
                    [user_id, date, totalTime]);
            }
            res.json({ success: true });
        });
});

// 获取休息清单
app.get('/api/rest-list/:user_id/:date', (req, res) => {
    const { user_id, date } = req.params;
    logRequest('GET', 'RestList', { user: user_id, date });
    
    db.get('SELECT rest_data FROM user_rest_lists WHERE user_id = ? AND rest_date = ?', 
        [user_id, date], (_, row) => {
            if (row) {
                res.json({ success: true, restList: JSON.parse(row.rest_data) });
            } else {
                const defaultRestList = [{
                    id: Date.now(),
                    text: "休息一下",
                    restTime: 0
                }];
                db.run('INSERT INTO user_rest_lists (user_id, rest_date, rest_data) VALUES (?, ?, ?)',
                    [user_id, date, JSON.stringify(defaultRestList)]);
                res.json({ success: true, restList: defaultRestList });
            }
        });
});

// 保存休息清单
app.post('/api/rest-list/:user_id/:date', (req, res) => {
    const { user_id, date } = req.params;
    logRequest('POST', 'RestList', { user: user_id, date });
    const { restList } = req.body;
    
    db.get('SELECT id FROM user_rest_lists WHERE user_id = ? AND rest_date = ?', 
        [user_id, date], (_, row) => {
            if (row) {
                db.run('UPDATE user_rest_lists SET rest_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [JSON.stringify(restList), row.id]);
            } else {
                db.run('INSERT INTO user_rest_lists (user_id, rest_date, rest_data) VALUES (?, ?, ?)',
                    [user_id, date, JSON.stringify(restList)]);
            }
            res.json({ success: true });
        });
});

// 获取用户笔记
app.get('/api/note/:user_id/:date', (req, res) => {
    const { user_id, date } = req.params;
    logRequest('GET', 'Note', { user: user_id, date });
    db.get('SELECT note_content FROM user_notes WHERE user_id = ? AND note_date = ?', [user_id, date], (err, row) => {
        if (row) {
            res.json({ success: true, note: row.note_content });
        } else {
            res.json({ success: true, note: '' });
        }
    });
});

// 保存用户笔记
app.post('/api/note/:user_id/:date', (req, res) => {
    const { user_id, date } = req.params;
    const { note } = req.body;
    logRequest('POST', 'Note', { user: user_id, date });
    db.get('SELECT id FROM user_notes WHERE user_id = ? AND note_date = ?', [user_id, date], (err, row) => {
        if (row) {
            db.run('UPDATE user_notes SET note_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [note, row.id]);
        } else {
            db.run('INSERT INTO user_notes (user_id, note_date, note_content) VALUES (?, ?, ?)', [user_id, date, note]);
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