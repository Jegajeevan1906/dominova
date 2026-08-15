const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname);
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed projects
const INITIAL_PROJECTS = [
  {
    id: "proj-1",
    title: "SUPERDEALS",
    category: "International Trading Company",
    shortDescription: "A modern e-commerce platform designed for seamless shopping, fast performance, and an intuitive user experience.",
    fullDescription: "SUPERDEALS is a full-featured international trading and e-commerce platform built with high performance, intuitive product browsing, responsive layout, and robust customer ordering flows.",
    tags: ["React", "Tailwind CSS"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fproject5-peach-rho.vercel.app%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://project5-peach-rho.vercel.app/",
    githubUrl: "",
    status: "published",
    featured: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  },
  {
    id: "proj-2",
    title: "MG Bakery",
    category: "Bakery Website",
    shortDescription: "A premium bakery website with modern UI, responsive design, product showcase, and smooth user experience.",
    fullDescription: "MG Bakery showcases artisanal baked goods with interactive menus, online ordering options, dynamic product sliders, and elegant visual branding.",
    tags: ["React", "Tailwind CSS"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fmg-bakery.vercel.app%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://mg-bakery.vercel.app/",
    githubUrl: "",
    status: "published",
    featured: true,
    createdAt: "2026-08-02T10:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z"
  },
  {
    id: "proj-3",
    title: "Dominova Portfolio Showcase",
    category: "Company Portfolio",
    shortDescription: "Premium portfolio showcasing company projects with modern animations, responsive layouts, and interactive user experiences.",
    fullDescription: "Dominova Portfolio Showcase highlights our digital studio agency work featuring WebGL shaders, Framer Motion transitions, responsive grids, and high-converting service showcases.",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fdominova-portfolio-showcase.vercel.app%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://dominova-portfolio-showcase.vercel.app/",
    githubUrl: "",
    status: "published",
    featured: true,
    createdAt: "2026-08-03T10:00:00.000Z",
    updatedAt: "2026-08-03T10:00:00.000Z"
  },
  {
    id: "proj-4",
    title: "Exim World",
    category: "Import & Export",
    shortDescription: "Corporate website developed for an international import and export business with a professional enterprise design and global reach.",
    fullDescription: "Exim World is an enterprise platform representing global import and export trade services, logistics tracking, multi-region compliance, and corporate partnership channels.",
    tags: ["React", "Tailwind CSS"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fwww.eximworld.co.in%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://www.eximworld.co.in/",
    githubUrl: "",
    status: "published",
    featured: false,
    createdAt: "2026-08-04T10:00:00.000Z",
    updatedAt: "2026-08-04T10:00:00.000Z"
  },
  {
    id: "proj-5",
    title: "Kirthiga's Tech Sphere",
    category: "Technology Website",
    shortDescription: "Technology-focused website featuring modern layouts, responsive design, and engaging content presentation for tech enthusiasts.",
    fullDescription: "Kirthiga's Tech Sphere presents modern tech insights, software developments, interactive developer tools, and responsive digital article layouts.",
    tags: ["React", "Tailwind CSS"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fkirthiga-s-tech-sphere.vercel.app%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://kirthiga-s-tech-sphere.vercel.app/",
    githubUrl: "",
    status: "published",
    featured: false,
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z"
  },
  {
    id: "proj-6",
    title: "Regal Gemini Shoppe",
    category: "E-Commerce",
    shortDescription: "Modern online shopping website with elegant product presentation and responsive shopping experience for discerning customers.",
    fullDescription: "Regal Gemini Shoppe is a high-end luxury e-commerce boutique with dynamic product filtering, cart management, sleek UI cards, and responsive payment flows.",
    tags: ["React", "Tailwind CSS"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fregal-gemini-shoppe.vercel.app%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://regal-gemini-shoppe.vercel.app/",
    githubUrl: "",
    status: "published",
    featured: false,
    createdAt: "2026-08-06T10:00:00.000Z",
    updatedAt: "2026-08-06T10:00:00.000Z"
  },
  {
    id: "proj-7",
    title: "Prabha Lands",
    category: "Real Estate",
    shortDescription: "Professional real estate website showcasing residential and commercial properties with modern UI and seamless property discovery.",
    fullDescription: "Prabha Lands is a real estate portal for browsing residential plots, commercial properties, property valuation calculators, and client inquiry booking.",
    tags: ["React", "Tailwind CSS"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fwww.prabhalands.com%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://www.prabhalands.com/",
    githubUrl: "",
    status: "published",
    featured: false,
    createdAt: "2026-08-07T10:00:00.000Z",
    updatedAt: "2026-08-07T10:00:00.000Z"
  },
  {
    id: "proj-8",
    title: "Pre Play School",
    category: "Education",
    shortDescription: "Interactive preschool website with colorful design, responsive layouts, admissions information, and engaging user experience for families.",
    fullDescription: "Pre Play School features early-childhood learning pathways, admissions forms, virtual campus tours, teacher profiles, and parent communication channels.",
    tags: ["React", "Tailwind CSS"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fpre-play-school.vercel.app%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://pre-play-school.vercel.app/",
    githubUrl: "",
    status: "published",
    featured: false,
    createdAt: "2026-08-08T10:00:00.000Z",
    updatedAt: "2026-08-08T10:00:00.000Z"
  },
  {
    id: "proj-9",
    title: "Bethel Schools",
    category: "Education",
    shortDescription: "Official website for Bethel Nursery & Primary School, featuring admissions, academic programs, campus facilities, and interactive parent resources.",
    fullDescription: "Bethel Nursery & Primary School (established 1993) provides quality English Medium primary education from Pre-KG to 5th Standard, featuring online admission forms, academic announcements, and campus highlights.",
    tags: ["React", "Tailwind CSS"],
    image: "https://api.screenshotone.com/take?access_key=public&url=https%3A%2F%2Fwww.bethelschools.com%2F&viewport_width=1280&viewport_height=800&format=webp&quality=80&block_ads=true&delay=2",
    gallery: [],
    demoUrl: "https://www.bethelschools.com/",
    githubUrl: "",
    status: "published",
    featured: false,
    createdAt: "2026-08-12T10:00:00.000Z",
    updatedAt: "2026-08-12T10:00:00.000Z"
  }
];

// Read JSON file safely
function readJSON(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return fallback;
  }
}

// Write JSON file atomically
function writeJSON(file, data) {
  try {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, file);
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Initialize Database (Seed default admin and projects)
function initDatabase() {
  // Users DB initialization
  let users = readJSON(USERS_FILE, []);
  if (!users || users.length === 0) {
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUser = {
      id: 'usr-admin-1',
      username: (process.env.ADMIN_USERNAME || 'admin').toLowerCase(),
      passwordHash: bcrypt.hashSync(adminPass, 10),
      name: 'System Admin',
      createdAt: new Date().toISOString()
    };
    users = [adminUser];
    writeJSON(USERS_FILE, users);
    console.log(`[DB] Admin user initialized (username: ${adminUser.username})`);
  }

  // Projects DB initialization
  let projects = readJSON(PROJECTS_FILE, null);
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    writeJSON(PROJECTS_FILE, INITIAL_PROJECTS);
    console.log(`[DB] ${INITIAL_PROJECTS.length} default projects seeded.`);
  }
}

// User Operations
function findUserByUsername(username) {
  const users = readJSON(USERS_FILE, []);
  return users.find(u => u.username.toLowerCase() === (username || '').trim().toLowerCase());
}

function findUserById(id) {
  const users = readJSON(USERS_FILE, []);
  return users.find(u => u.id === id);
}

// Project Operations
function getAllProjects() {
  return readJSON(PROJECTS_FILE, []);
}

function getPublishedProjects() {
  const projects = getAllProjects();
  return projects.filter(p => p.status === 'published');
}

function getProjectById(id) {
  const projects = getAllProjects();
  return projects.find(p => p.id === id);
}

function saveProject(projectData) {
  const projects = getAllProjects();
  const now = new Date().toISOString();
  
  if (projectData.id) {
    // Update existing
    const idx = projects.findIndex(p => p.id === projectData.id);
    if (idx === -1) return null;
    
    const updated = {
      ...projects[idx],
      ...projectData,
      updatedAt: now
    };
    projects[idx] = updated;
    writeJSON(PROJECTS_FILE, projects);
    return updated;
  } else {
    // Create new
    const newProject = {
      id: `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: projectData.title || 'Untitled Project',
      category: projectData.category || 'General',
      shortDescription: projectData.shortDescription || '',
      fullDescription: projectData.fullDescription || '',
      tags: Array.isArray(projectData.tags) ? projectData.tags : (projectData.tags ? String(projectData.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
      image: projectData.image || '',
      gallery: Array.isArray(projectData.gallery) ? projectData.gallery : [],
      demoUrl: projectData.demoUrl || '',
      githubUrl: projectData.githubUrl || '',
      status: projectData.status === 'published' ? 'published' : 'draft',
      featured: Boolean(projectData.featured),
      createdAt: now,
      updatedAt: now
    };
    projects.unshift(newProject);
    writeJSON(PROJECTS_FILE, projects);
    return newProject;
  }
}

function deleteProject(id) {
  let projects = getAllProjects();
  const initialLen = projects.length;
  projects = projects.filter(p => p.id !== id);
  if (projects.length < initialLen) {
    writeJSON(PROJECTS_FILE, projects);
    return true;
  }
  return false;
}

module.exports = {
  initDatabase,
  findUserByUsername,
  findUserById,
  getAllProjects,
  getPublishedProjects,
  getProjectById,
  saveProject,
  deleteProject
};
