const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const db = require('./data/db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dominova_super_secret_jwt_key_2026';

// Initialize DB on boot
db.initDatabase();

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueName = `img-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(__dirname));

// JWT Auth Middleware
function requireAuth(req, res, next) {
  let token = req.cookies?.dominova_admin_token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }
}

// Optional Auth Helper for API endpoints
function checkAuthOptional(req) {
  let token = req.cookies?.dominova_admin_token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ── Auth Endpoints ──────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Create JWT Token
  const payload = { userId: user.id, username: user.username, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  // Set HTTP-only Cookie
  res.cookie('dominova_admin_token', token, {
    httpOnly: true,
    secure: false, // set true if using HTTPS in prod
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, name: user.name }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('dominova_admin_token');
  return res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// ── Project API Endpoints ────────────────────────────────────────

// GET /api/projects - Public returns published; Admin returns all
app.get('/api/projects', (req, res) => {
  const user = checkAuthOptional(req);
  if (user) {
    return res.json(db.getAllProjects());
  } else {
    return res.json(db.getPublishedProjects());
  }
});

// GET /api/projects/:id
app.get('/api/projects/:id', (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const user = checkAuthOptional(req);
  if (!user && project.status !== 'published') {
    return res.status(403).json({ error: 'Access denied' });
  }
  return res.json(project);
});

// POST /api/projects - Create project
app.post('/api/projects', requireAuth, (req, res) => {
  const { title, shortDescription, fullDescription, category, tags, image, gallery, demoUrl, githubUrl, status, featured } = req.body;

  if (!title || !shortDescription) {
    return res.status(400).json({ error: 'Title and Short Description are required.' });
  }

  const created = db.saveProject({
    title,
    shortDescription,
    fullDescription,
    category,
    tags,
    image,
    gallery,
    demoUrl,
    githubUrl,
    status,
    featured
  });

  return res.status(201).json({ message: 'Project created successfully', project: created });
});

// PUT /api/projects/:id - Update project
app.put('/api/projects/:id', requireAuth, (req, res) => {
  const existing = db.getProjectById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const updated = db.saveProject({
    id: req.params.id,
    ...req.body
  });

  return res.json({ message: 'Project updated successfully', project: updated });
});

// DELETE /api/projects/:id - Delete project
app.delete('/api/projects/:id', requireAuth, (req, res) => {
  const success = db.deleteProject(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json({ message: 'Project deleted successfully' });
});

// POST /api/upload - Handle file upload
app.post('/api/upload', requireAuth, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  }

  const fileUrls = req.files.map(f => `/uploads/${f.filename}`);
  return res.json({
    message: 'Upload successful',
    url: fileUrls[0], // primary uploaded URL
    urls: fileUrls     // array of uploaded URLs if multiple
  });
});

// Serve Admin routes (SPA fallback for /admin and /admin/*)
app.get(['/admin', '/admin/*'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Serve Root SPA / Portfolio fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server locally if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 DOMINOVA Server running on http://localhost:${PORT}`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin\n`);
  });
}

module.exports = app;
