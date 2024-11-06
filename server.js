const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();

// JWT密钥
const JWT_SECRET = 'your-secret-key';

// 静态文件中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// CORS 和 JSON 中间件
app.use(cors());
app.use(express.json());

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 管理后台路由
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

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

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/alpha_studio', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// 项目模型
const Project = mongoose.model('Project', {
    name: String,
    category: String,
    year: Number,
    description: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
});

// 用户模型
const User = mongoose.model('User', {
    username: String,
    password: String
});

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件类型'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    }
});

// 登录路由
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // 在实际应用中，这里应该从数据库验证用户
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: '用户名���密码错误' });
    }
});

// 受保护的路由
app.post('/api/projects', authenticateToken, upload.array('images', 10), async (req, res) => {
    try {
        const { name, category, year, description } = req.body;
        const images = req.files.map(file => `/uploads/${file.filename}`);
        
        const project = new Project({
            name,
            category,
            year,
            description,
            images
        });
        
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: '项目创建失败', error: error.message });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: '获取项目失败', error: error.message });
    }
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

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const result = await Project.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: '项目不存在' });
        }
        res.json({ message: '项目已删除' });
    } catch (error) {
        res.status(500).json({ message: '删除失败', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器错误', error: err.message });
}); 