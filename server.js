const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

// JWT密钥
const JWT_SECRET = 'your-secret-key';

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: '未授权访问' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '无效的token' });
        }
        req.user = user;
        next();
    });
};

// 登录路由
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // 在实际应用中，这里应该从数据库验证用户
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: '用户名或密码错误' });
    }
});

// 受保护的路由
app.post('/api/projects', authenticateToken, upload.array('images', 10), (req, res) => {
    const { name, category, year, description } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`);
    
    const project = {
        id: Date.now(),
        name,
        category,
        year,
        description,
        images,
        createdAt: new Date()
    };
    
    projects.push(project);
    res.json(project);
});

app.get('/api/projects', (req, res) => {
    res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        res.json(project);
    } else {
        res.status(404).json({ error: '项目不存在' });
    }
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    const projectId = parseInt(req.params.id);
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
        return res.status(404).json({ message: '项目不存在' });
    }
    
    projects.splice(projectIndex, 1);
    res.json({ message: '项目已删除' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 