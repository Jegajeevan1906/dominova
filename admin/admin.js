/* ================================================================
   DOMINOVA — Admin Studio Application Logic (SPA Router & API)
   ================================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  const state = {
    currentUser: null,
    projects: [],
    activeView: 'overview',
    editingProjectId: null,
    uploadedImageUrl: ''
  };

  // DOM Cache
  const loginView          = document.getElementById('loginView');
  const dashboardView      = document.getElementById('dashboardView');
  const loginForm          = document.getElementById('loginForm');
  const loginError         = document.getElementById('loginError');
  const loginErrorText     = document.getElementById('loginErrorText');
  const loginSubmitBtn     = document.getElementById('loginSubmitBtn');
  const usernameInput      = document.getElementById('usernameInput');
  const passwordInput      = document.getElementById('passwordInput');
  const togglePasswordBtn  = document.getElementById('togglePasswordBtn');
  const pwdEyeIcon         = document.getElementById('pwdEyeIcon');
  const logoutBtn          = document.getElementById('logoutBtn');
  const currentAdminName   = document.getElementById('currentAdminName');
  const pageTitle          = document.getElementById('pageTitle');
  const pageSubtitle       = document.getElementById('pageSubtitle');
  const projectForm        = document.getElementById('projectForm');
  const projectId          = document.getElementById('projectId');
  const inputTitle         = document.getElementById('inputTitle');
  const inputCategory      = document.getElementById('inputCategory');
  const inputShortDesc     = document.getElementById('inputShortDesc');
  const inputFullDesc      = document.getElementById('inputFullDesc');
  const inputTags          = document.getElementById('inputTags');
  const imageUrlInput      = document.getElementById('imageUrlInput');
  const thumbnailFileInput = document.getElementById('thumbnailFileInput');
  const thumbnailDropzone  = document.getElementById('thumbnailDropzone');
  const thumbnailPreviewContainer = document.getElementById('thumbnailPreviewContainer');
  const thumbnailPreviewImg       = document.getElementById('thumbnailPreviewImg');
  const removeThumbnailBtn        = document.getElementById('removeThumbnailBtn');
  const inputDemoUrl       = document.getElementById('inputDemoUrl');
  const inputGithubUrl     = document.getElementById('inputGithubUrl');
  const inputStatus        = document.getElementById('inputStatus');
  const inputFeatured      = document.getElementById('inputFeatured');
  const saveProjectBtn     = document.getElementById('saveProjectBtn');
  const cancelFormBtn      = document.getElementById('cancelFormBtn');
  const formTitle          = document.getElementById('formTitle');

  // Filters & Search
  const projectSearchInput = document.getElementById('projectSearchInput');
  const categoryFilter     = document.getElementById('categoryFilter');
  const statusFilter       = document.getElementById('statusFilter');
  const featuredFilter     = document.getElementById('featuredFilter');

  // Mobile Sidebar
  const openMobileSidebarBtn  = document.getElementById('openMobileSidebarBtn');
  const closeMobileSidebarBtn = document.getElementById('closeMobileSidebarBtn');
  const adminSidebar          = document.getElementById('adminSidebar');
  const sidebarOverlay        = document.getElementById('sidebarOverlay');

  // Boot Application
  initApp();

  async function initApp() {
    setupEventListeners();
    await checkAuth();
  }

  // ── 1. AUTHENTICATION LOGIC ─────────────────────────────────────

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        state.currentUser = data.user;
        showDashboardView();
      } else {
        showLoginView();
      }
    } catch (err) {
      console.warn('Auth check failed:', err);
      showLoginView();
    }
  }

  function showLoginView() {
    loginView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
  }

  async function showDashboardView() {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    if (currentAdminName && state.currentUser) {
      currentAdminName.textContent = state.currentUser.name || state.currentUser.username;
    }

    // Handle hash navigation or default to overview
    const hash = window.location.hash.replace('#', '') || 'overview';
    switchView(hash);
    await loadProjects();
  }

  async function handleLogin(e) {
    e.preventDefault();
    hideLoginError();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      displayLoginError('Please enter both username and password.');
      return;
    }

    loginSubmitBtn.disabled = true;
    loginSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      state.currentUser = data.user;
      showToast('Login successful. Welcome back!', 'success');
      showDashboardView();
    } catch (err) {
      displayLoginError(err.message);
    } finally {
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.innerHTML = `<span class="btn-text">Sign In to Dashboard</span><i class="fa-solid fa-arrow-right btn-icon"></i>`;
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      state.currentUser = null;
      showToast('Logged out successfully.', 'info');
      showLoginView();
    }
  }

  function displayLoginError(msg) {
    if (loginError && loginErrorText) {
      loginErrorText.textContent = msg;
      loginError.classList.remove('hidden');
    }
  }

  function hideLoginError() {
    if (loginError) loginError.classList.add('hidden');
  }

  // ── 2. SPA VIEW ROUTER ──────────────────────────────────────────

  function switchView(viewName) {
    if (!['overview', 'projects', 'add-project'].includes(viewName)) {
      viewName = 'overview';
    }

    state.activeView = viewName;
    window.location.hash = viewName;

    // Update active nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update content views
    document.querySelectorAll('.content-view').forEach(view => view.classList.remove('active'));

    if (viewName === 'overview') {
      document.getElementById('viewOverview')?.classList.add('active');
      pageTitle.textContent = 'Dashboard Overview';
      pageSubtitle.textContent = 'Track studio metrics and view recent project activity.';
    } else if (viewName === 'projects') {
      document.getElementById('viewProjects')?.classList.add('active');
      pageTitle.textContent = 'All Projects';
      pageSubtitle.textContent = 'Manage, edit, publish, or feature your portfolio items.';
    } else if (viewName === 'add-project') {
      document.getElementById('viewProjectForm')?.classList.add('active');
      if (!state.editingProjectId) {
        resetProjectForm();
        pageTitle.textContent = 'Add New Project';
        pageSubtitle.textContent = 'Fill out details to publish a new showcase project.';
      } else {
        pageTitle.textContent = 'Edit Project';
        pageSubtitle.textContent = 'Modify existing project parameters.';
      }
    }

    closeMobileMenu();
  }

  // ── 3. PROJECT DATA MANAGEMENT ─────────────────────────────────

  async function loadProjects() {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      state.projects = Array.isArray(data) ? data : [];

      renderStats();
      renderRecentProjects();
      renderProjectsTable();
      populateCategoryFilters();
    } catch (err) {
      console.error('Failed to load projects:', err);
      showToast('Could not load project data.', 'error');
    }
  }

  function renderStats() {
    const total = state.projects.length;
    const published = state.projects.filter(p => p.status === 'published').length;
    const drafts = state.projects.filter(p => p.status === 'draft').length;
    const featured = state.projects.filter(p => p.featured).length;

    const elTotal = document.getElementById('statTotal');
    const elPublished = document.getElementById('statPublished');
    const elDrafts = document.getElementById('statDrafts');
    const elFeatured = document.getElementById('statFeatured');
    const elSidebarCount = document.getElementById('sidebarProjectsCount');

    if (elTotal) elTotal.textContent = total;
    if (elPublished) elPublished.textContent = published;
    if (elDrafts) elDrafts.textContent = drafts;
    if (elFeatured) elFeatured.textContent = featured;
    if (elSidebarCount) elSidebarCount.textContent = total;
  }

  function renderRecentProjects() {
    const tbody = document.getElementById('recentProjectsTableBody');
    if (!tbody) return;

    const recent = [...state.projects].slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center">No projects found. Add your first project!</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(p => `
      <tr>
        <td>
          <img src="${escapeHTML(p.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200')}" alt="${escapeHTML(p.title)}" class="tbl-thumb" onerror="this.src='https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200'">
        </td>
        <td>
          <span class="tbl-title">${escapeHTML(p.title)}</span>
        </td>
        <td>
          <span class="tbl-category">${escapeHTML(p.category || 'General')}</span>
        </td>
        <td>
          <span class="badge-status ${p.status === 'published' ? 'badge-published' : 'badge-draft'}" data-action="toggle-status" data-id="${p.id}">
            <i class="fa-solid ${p.status === 'published' ? 'fa-circle-check' : 'fa-clock'}"></i> ${p.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </td>
        <td class="text-center">
          <i class="fa-star ${p.featured ? 'fa-solid badge-featured' : 'fa-regular badge-unfeatured'}" data-action="toggle-featured" data-id="${p.id}" title="Toggle Featured"></i>
        </td>
        <td>
          <div class="tbl-actions">
            <button class="btn-action" data-action="edit" data-id="${p.id}" title="Edit Project"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn-action btn-action-delete" data-action="delete" data-id="${p.id}" title="Delete Project"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderProjectsTable() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;

    const searchTerm = (projectSearchInput?.value || '').toLowerCase().trim();
    const selCategory = categoryFilter?.value || 'all';
    const selStatus = statusFilter?.value || 'all';
    const selFeatured = featuredFilter?.value || 'all';

    let filtered = state.projects.filter(p => {
      // Search matches title, category, shortDesc, or tags
      const matchQuery = !searchTerm ||
        p.title.toLowerCase().includes(searchTerm) ||
        (p.category || '').toLowerCase().includes(searchTerm) ||
        (p.shortDescription || '').toLowerCase().includes(searchTerm) ||
        (p.tags || []).some(t => t.toLowerCase().includes(searchTerm));

      const matchCategory = selCategory === 'all' || p.category === selCategory;
      const matchStatus = selStatus === 'all' || p.status === selStatus;
      const matchFeatured = selFeatured === 'all' || (selFeatured === 'featured' && p.featured);

      return matchQuery && matchCategory && matchStatus && matchFeatured;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center">No matching projects found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => `
      <tr>
        <td>
          <img src="${escapeHTML(p.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200')}" alt="${escapeHTML(p.title)}" class="tbl-thumb" onerror="this.src='https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200'">
        </td>
        <td>
          <span class="tbl-title">${escapeHTML(p.title)}</span>
          <span class="tbl-category">${escapeHTML(p.shortDescription || '').substring(0, 60)}...</span>
        </td>
        <td>
          <span class="tbl-category">${escapeHTML(p.category || 'General')}</span>
        </td>
        <td>
          <div class="tbl-tags">
            ${(p.tags || []).map(t => `<span class="tag-pill">${escapeHTML(t)}</span>`).join('')}
          </div>
        </td>
        <td>
          <span class="badge-status ${p.status === 'published' ? 'badge-published' : 'badge-draft'}" data-action="toggle-status" data-id="${p.id}">
            <i class="fa-solid ${p.status === 'published' ? 'fa-circle-check' : 'fa-clock'}"></i> ${p.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </td>
        <td class="text-center">
          <i class="fa-star ${p.featured ? 'fa-solid badge-featured' : 'fa-regular badge-unfeatured'}" data-action="toggle-featured" data-id="${p.id}" title="Toggle Featured"></i>
        </td>
        <td>
          <div class="tbl-actions">
            <button class="btn-action" data-action="edit" data-id="${p.id}" title="Edit Project"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn-action btn-action-delete" data-action="delete" data-id="${p.id}" title="Delete Project"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function populateCategoryFilters() {
    if (!categoryFilter) return;
    const categories = Array.from(new Set(state.projects.map(p => p.category).filter(Boolean))).sort();
    const currentSel = categoryFilter.value;

    categoryFilter.innerHTML = `<option value="all">All Categories (${categories.length})</option>` +
      categories.map(c => `<option value="${escapeHTML(c)}"${c === currentSel ? ' selected' : ''}>${escapeHTML(c)}</option>`).join('');
  }

  // ── 4. PROJECT CRUD ACTIONS ─────────────────────────────────────

  async function handleToggleStatus(id) {
    const project = state.projects.find(p => p.id === id);
    if (!project) return;
    const newStatus = project.status === 'published' ? 'draft' : 'published';

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Update failed');
      showToast(`Project updated to ${newStatus}.`, 'success');
      await loadProjects();
    } catch (err) {
      showToast('Could not update status.', 'error');
    }
  }

  async function handleToggleFeatured(id) {
    const project = state.projects.find(p => p.id === id);
    if (!project) return;
    const newFeatured = !project.featured;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newFeatured })
      });
      if (!res.ok) throw new Error('Update failed');
      showToast(newFeatured ? 'Project marked as Featured!' : 'Project unfeatured.', 'info');
      await loadProjects();
    } catch (err) {
      showToast('Could not update featured state.', 'error');
    }
  }

  async function handleDeleteProject(id) {
    const project = state.projects.find(p => p.id === id);
    if (!project) return;

    if (!confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast(`Deleted "${project.title}".`, 'success');
      await loadProjects();
    } catch (err) {
      showToast('Could not delete project.', 'error');
    }
  }

  function handleEditProject(id) {
    const project = state.projects.find(p => p.id === id);
    if (!project) return;

    state.editingProjectId = id;
    projectId.value = project.id;
    inputTitle.value = project.title || '';
    inputCategory.value = project.category || '';
    inputShortDesc.value = project.shortDescription || '';
    inputFullDesc.value = project.fullDescription || '';
    inputTags.value = (project.tags || []).join(', ');
    imageUrlInput.value = project.image || '';
    inputDemoUrl.value = project.demoUrl || '';
    inputGithubUrl.value = project.githubUrl || '';
    inputStatus.value = project.status || 'published';
    inputFeatured.checked = Boolean(project.featured);

    if (project.image) {
      setThumbnailPreview(project.image);
    } else {
      clearThumbnailPreview();
    }

    if (formTitle) formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Project: ${escapeHTML(project.title)}`;
    switchView('add-project');
  }

  function resetProjectForm() {
    state.editingProjectId = null;
    if (projectForm) projectForm.reset();
    if (projectId) projectId.value = '';
    clearThumbnailPreview();
    if (formTitle) formTitle.innerHTML = `<i class="fa-solid fa-folder-plus"></i> Add New Project`;
  }

  // ── 5. FORM & IMAGE UPLOAD HANDLING ──────────────────────────────

  async function handleProjectSubmit(e) {
    e.preventDefault();

    const title = inputTitle.value.trim();
    const category = inputCategory.value.trim();
    const shortDescription = inputShortDesc.value.trim();
    const fullDescription = inputFullDesc.value.trim();
    const tags = inputTags.value.split(',').map(t => t.trim()).filter(Boolean);
    const demoUrl = inputDemoUrl.value.trim();
    const githubUrl = inputGithubUrl.value.trim();
    const status = inputStatus.value;
    const featured = inputFeatured.checked;
    const image = state.uploadedImageUrl || imageUrlInput.value.trim();

    if (!title || !category || !shortDescription) {
      showToast('Please fill out all required fields (*).', 'error');
      return;
    }

    saveProjectBtn.disabled = true;
    saveProjectBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    const projectData = {
      title,
      category,
      shortDescription,
      fullDescription,
      tags,
      image,
      demoUrl,
      githubUrl,
      status,
      featured
    };

    try {
      let res;
      if (state.editingProjectId) {
        res = await fetch(`/api/projects/${state.editingProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save project');
      }

      showToast(state.editingProjectId ? 'Project updated successfully!' : 'New project published successfully!', 'success');
      resetProjectForm();
      await loadProjects();
      switchView('projects');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      saveProjectBtn.disabled = false;
      saveProjectBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save & Publish Project`;
    }
  }

  async function uploadFile(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('files', file);

    try {
      showToast('Uploading image...', 'info');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.json();
      setThumbnailPreview(data.url);
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      showToast('Could not upload image file.', 'error');
    }
  }

  function setThumbnailPreview(url) {
    state.uploadedImageUrl = url;
    if (thumbnailPreviewImg) thumbnailPreviewImg.src = url;
    if (thumbnailPreviewContainer) thumbnailPreviewContainer.classList.remove('hidden');
  }

  function clearThumbnailPreview() {
    state.uploadedImageUrl = '';
    if (imageUrlInput) imageUrlInput.value = '';
    if (thumbnailFileInput) thumbnailFileInput.value = '';
    if (thumbnailPreviewContainer) thumbnailPreviewContainer.classList.add('hidden');
  }

  // ── 6. EVENT LISTENERS SETUP ─────────────────────────────────────

  function setupEventListeners() {
    // Auth Forms
    loginForm?.addEventListener('submit', handleLogin);
    logoutBtn?.addEventListener('submit', (e) => e.preventDefault());
    logoutBtn?.addEventListener('click', handleLogout);

    // Password Toggle
    togglePasswordBtn?.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      pwdEyeIcon.className = type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });

    // Navigation Links
    document.querySelectorAll('[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view');
        switchView(targetView);
      });
    });

    // Mobile Sidebar
    openMobileSidebarBtn?.addEventListener('click', () => {
      adminSidebar?.classList.add('open');
      sidebarOverlay?.classList.remove('hidden');
    });

    closeMobileSidebarBtn?.addEventListener('click', closeMobileMenu);
    sidebarOverlay?.addEventListener('click', closeMobileMenu);

    // Filters & Search
    projectSearchInput?.addEventListener('input', renderProjectsTable);
    categoryFilter?.addEventListener('change', renderProjectsTable);
    statusFilter?.addEventListener('change', renderProjectsTable);
    featuredFilter?.addEventListener('change', renderProjectsTable);

    // Table Actions Event Delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');

      if (action === 'toggle-status') handleToggleStatus(id);
      if (action === 'toggle-featured') handleToggleFeatured(id);
      if (action === 'delete') handleDeleteProject(id);
      if (action === 'edit') handleEditProject(id);
    });

    // Image Upload Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.upload-tab-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId)?.classList.add('active');
      });
    });

    // Dropzone & File Input
    thumbnailDropzone?.addEventListener('click', () => thumbnailFileInput?.click());
    thumbnailFileInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        uploadFile(e.target.files[0]);
      }
    });

    // Drag and drop
    ['dragenter', 'dragover'].forEach(evt => {
      thumbnailDropzone?.addEventListener(evt, (e) => {
        e.preventDefault();
        thumbnailDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      thumbnailDropzone?.addEventListener(evt, (e) => {
        e.preventDefault();
        thumbnailDropzone.classList.remove('dragover');
        if (evt === 'drop' && e.dataTransfer.files && e.dataTransfer.files[0]) {
          uploadFile(e.dataTransfer.files[0]);
        }
      });
    });

    // Image URL input changes
    imageUrlInput?.addEventListener('input', () => {
      const url = imageUrlInput.value.trim();
      if (url) setThumbnailPreview(url);
    });

    removeThumbnailBtn?.addEventListener('click', clearThumbnailPreview);

    // Project Form Submit & Cancel
    projectForm?.addEventListener('submit', handleProjectSubmit);
    cancelFormBtn?.addEventListener('click', () => {
      resetProjectForm();
      switchView('projects');
    });
  }

  function closeMobileMenu() {
    adminSidebar?.classList.remove('open');
    sidebarOverlay?.classList.add('hidden');
  }

  // ── 7. TOAST NOTIFICATION ENGINE ─────────────────────────────────

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass} toast-icon"></i>
      <span class="toast-message">${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
