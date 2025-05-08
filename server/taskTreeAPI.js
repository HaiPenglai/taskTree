// server\taskTreeAPI.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
const VERBOSE = 1;

const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password123.',
    database: 'task_tree_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 获取或创建任务树
app.get('/api/task-tree/:user_id/:date', async (req, res) => {
    if (VERBOSE > 0) {
        console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [GET] user ${req.params.user_id}, date ${req.params.date}`);
        if (VERBOSE > 1) {
            console.log('Request headers:', req.headers);
        }
    }
    try {
        const { user_id, date } = req.params;

        // 检查是否存在该日期的任务树
        const [rows] = await pool.query(
            'SELECT tree_data FROM user_task_trees WHERE user_id = ? AND tree_date = ?',
            [user_id, date]
        );

        if (rows.length > 0) {
            // 如果存在，直接返回
            res.json({ success: true, nodes: rows[0].tree_data });
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
            await pool.query(
                'INSERT INTO user_task_trees (user_id, tree_date, tree_data) VALUES (?, ?, ?)',
                [user_id, date, JSON.stringify(defaultTree)]
            );

            res.json({ success: true, nodes: defaultTree });
        }
    } catch (error) {
        console.error('Error fetching task tree:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// 保存任务树
app.post('/api/task-tree/:user_id/:date', async (req, res) => {
    if (VERBOSE > 0) {
        console.log(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] [POST] user ${req.params.user_id}, date ${req.params.date}`);
        if (VERBOSE > 1){
            console.log('Request body:', req.body);
        }
    }
    try {
        const { user_id, date } = req.params;
        const { nodes } = req.body;

        // 检查是否存在该日期的任务树
        const [rows] = await pool.query(
            'SELECT id FROM user_task_trees WHERE user_id = ? AND tree_date = ?',
            [user_id, date]
        );

        if (rows.length > 0) {
            // 更新现有记录
            await pool.query(
                'UPDATE user_task_trees SET tree_data = ? WHERE id = ?',
                [JSON.stringify(nodes), rows[0].id]
            );
        } else {
            // 创建新记录
            await pool.query(
                'INSERT INTO user_task_trees (user_id, tree_date, tree_data) VALUES (?, ?, ?)',
                [user_id, date, JSON.stringify(nodes)]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving task tree:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});