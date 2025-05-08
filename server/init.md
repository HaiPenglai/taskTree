```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS task_tree_db;
USE task_tree_db;

-- 创建用户任务树表
CREATE TABLE IF NOT EXISTS user_task_trees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tree_date DATE NOT NULL,
    tree_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, tree_date),
    INDEX (user_id),
    INDEX (tree_date)
) ENGINE=InnoDB;
```