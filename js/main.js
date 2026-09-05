// ══════════════════════════════════════════════
//  NAVIGATION — multi-page
// ══════════════════════════════════════════════
const PAGES = ['home', 'profile', 'projects', 'legislations', 'social'];
const PAGE_FILES = { home: 'index.html', profile: 'profile.html', projects: 'projects.html', legislations: 'legislations.html', social: 'social.html' };

function navigateTo(page) {
  if (!PAGES.includes(page)) page = 'home';
  window.location.href = PAGE_FILES[page] || 'index.html';
}

function getCurrentPage() {
  const file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const map = { 'index.html': 'home', 'profile.html': 'profile', 'projects.html': 'projects', 'legislations.html': 'legislations', 'social.html': 'social' };
  return map[file] || 'home';
}

function setActiveNav() {
  const page = getCurrentPage();
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
}

// ══════════════════════════════════════════════
//  RENDER FUNCTIONS
// ══════════════════════════════════════════════
function renderProjects() {
  const g = document.getElementById('projectsGrid');
  if (!g) return;
  g.innerHTML = appData.projects.map(p => {
    const img = p.img ? `<img src="${p.img}" alt="${p.title}">` : `<div class="proj-img-ph"><span>💻</span><small>Project preview</small></div>`;
    const techs = (p.tech || []).map(t => `<span class="tech">${t}</span>`).join('');
    const demo = p.demo ? `<a href="${p.demo}" target="_blank" class="pb pb-dark">Live Demo</a>` : '';
    const gh = p.github ? `<a href="${p.github}" target="_blank" class="pb pb-ghost">GitHub</a>` : '';
    return `<div class="proj-card reveal"><div class="proj-img">${img}</div><div class="proj-body"><div class="proj-techs">${techs}</div><h3 class="proj-title">${p.title}</h3><p class="proj-desc">${p.desc}</p><div class="proj-actions">${demo}${gh}</div></div></div>`;
  }).join('');

  // Admin-only add card
  g.innerHTML += `<div class="proj-card admin-only" style="border:2px dashed var(--tan);background:transparent;box-shadow:none;min-height:300px;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--tan);font-size:13px;font-style:italic;cursor:pointer;" onclick="requestAdmin()"><div style="font-size:32px;opacity:0.4;">+</div><span>Add project (Admin)</span></div>`;
  observeReveal();
}

function legCardHtml(l) {
  const icon = l.category === 'cics' ? '📜' : '🏛️';
  const name = l.name || l.title;
  const desc = l.title && l.name ? l.title : (l.desc || '');
  return `<div class="leg-card reveal"><div class="leg-header"><div class="leg-icon">${icon}</div><div class="leg-title">${name}</div></div>${l.date ? `<div class="leg-date">${l.date}</div>` : ''}<div class="leg-authors">${l.authors}</div><p class="leg-desc">${desc}</p>${l.link ? `<a href="${l.link}" target="_blank" class="leg-link">View Document ↗</a>` : ''}</div>`;
}

function renderLegislations() {
  const g = document.getElementById('legislationsGrid');
  if (!g) return;
  const sections = [
    { key: 'senate', label: 'Senate Legislations' },
    { key: 'cics', label: 'CICS Student Government Legislations' }
  ];
  let html = '';
  sections.forEach(({ key, label }) => {
    const items = appData.legislations.filter(l => l.category === key);
    if (!items.length) return;
    html += `<div class="leg-section-heading reveal">${label}</div>`;
    html += items.map(legCardHtml).join('');
  });
  html += `<div class="leg-card admin-only" style="border:2px dashed var(--tan);background:transparent;box-shadow:none;min-height:200px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--tan);font-size:13px;font-style:italic;cursor:pointer;" onclick="requestAdmin()"><div style="font-size:32px;opacity:0.4;">+</div><span>Add legislation (Admin)</span></div>`;
  g.innerHTML = html;
  observeReveal();
}

function renderCerts() {
  const list = document.getElementById('certList');
  if (!list) return;
  list.innerHTML = appData.certs.map(c =>
    `<div class="cert-item"><span class="cert-dot"></span><div><div class="cert-name">${c.name}</div><div class="cert-org">${c.org}</div></div></div>`
  ).join('');
}

// ══════════════════════════════════════════════
//  RESUME
// ══════════════════════════════════════════════
function openResume() {
  try {
    window.open(appData.resumeURL, '_blank', 'noopener,noreferrer');
  } catch (e) {
    showToast('Could not open resume.');
  }
}

// ══════════════════════════════════════════════
//  SUPABASE DATA LOADING
//  Pulls live content into `appData` (and `photographyData` for the
//  scrapbook). Falls back silently to the hardcoded js/data.js values
//  if Supabase can't be reached.
// ══════════════════════════════════════════════
async function loadAllData() {
  if (!sb) return; // no Supabase SDK — stick with fallback data

  try {
    const [profileRes, projectsRes, legsRes, certsRes, photoRes] = await Promise.all([
      sb.from('profile').select('*').eq('id', 1).maybeSingle(),
      sb.from('projects').select('*').order('sort_order', { ascending: true }),
      sb.from('legislations').select('*').order('sort_order', { ascending: true }),
      sb.from('certs').select('*').order('sort_order', { ascending: true }),
      sb.from('photography').select('*').order('sort_order', { ascending: true }),
    ]);

    if (profileRes.data) {
      const p = profileRes.data;
      appData.resumeURL = p.resume_url || appData.resumeURL;
      appData.fullName = p.full_name;
      appData.tagline = p.tagline;
      appData.email = p.email;
      appData.location = p.location;
      appData.heroPhotoURL = p.hero_photo_url;
      appData.profilePhotoURL = p.profile_photo_url;
      applyProfileToDOM(p);
    }

    if (projectsRes.data) {
      appData.projects = projectsRes.data.map(row => ({
        id: row.id, title: row.title, desc: row.description || '',
        tech: row.tech || [], demo: row.demo_url || '', github: row.github_url || '',
        img: row.image_url || null
      }));
    }

    if (legsRes.data) {
      appData.legislations = legsRes.data.map(row => ({
        id: row.id, category: row.category, name: row.name, title: row.title,
        authors: row.authors, date: row.date_text, link: row.link
      }));
    }

    if (certsRes.data) {
      appData.certs = certsRes.data.map(row => ({ id: row.id, name: row.name, org: row.org }));
    }

    if (photoRes.data) {
      photographyData = photoRes.data.map(row => ({
        id: row.id, img: row.image_url, title: row.title,
        dateTaken: row.date_taken, shotWith: row.shot_with, editedIn: row.edited_in
      }));
    }
  } catch (e) {
    console.warn('Could not load live data from Supabase, using fallback data.', e);
  }
}

function applyProfileToDOM(p) {
  const homeH1 = document.querySelector('.home-h1');
  const heroName = document.querySelector('.hero-name-badge strong');
  const ftLogo = document.querySelector('.ft-logo');
  if (p.full_name) {
    if (homeH1) homeH1.innerHTML = "Hello, I'm<br><em>" + p.full_name + "</em>";
    if (heroName) heroName.textContent = p.full_name;
    if (ftLogo) ftLogo.textContent = p.full_name;
  }

  // Tagline — shown under the name on the home page
  const homeTagline = document.querySelector('.home-tagline');
  if (p.tagline && homeTagline) homeTagline.textContent = p.tagline;

  // Email & Location — shown as the two contact cards on the Social page
  const ccVals = document.querySelectorAll('.contact-card .cc-val');
  if (ccVals[0] && p.email) ccVals[0].textContent = p.email;
  if (ccVals[1] && p.location) ccVals[1].textContent = p.location;

  const heroImg = document.getElementById('heroImg');
  const profileImg = document.getElementById('profileImg');
  if (p.hero_photo_url && heroImg) heroImg.src = p.hero_photo_url;
  if (p.profile_photo_url && profileImg) profileImg.src = p.profile_photo_url;
}

// Fills the admin "Personal Info" inputs with whatever is currently live
// in appData, instead of leaving them at the hardcoded HTML placeholders.
// Without this, saving would silently overwrite fresh data with stale
// defaults whenever a field wasn't touched.
function populateAdminPersonalFields() {
  const map = {
    aName: appData.fullName,
    aTagline: appData.tagline,
    aEmail: appData.email,
    aLocation: appData.location
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  });
}

function reRenderCurrentPage() {
  const page = getCurrentPage();
  if (page === 'profile') renderCerts();
  if (page === 'projects') renderProjects();
  if (page === 'legislations') renderLegislations();
  if (page === 'projects' && typeof renderPhotography === 'function') renderPhotography();
  if (document.body.classList.contains('admin-mode')) {
    renderAdminCerts(); renderAdminProjects(); renderAdminLegislations(); renderAdminPhotography();
  }
}

// ══════════════════════════════════════════════
//  ADMIN AUTH (Supabase Auth)
// ══════════════════════════════════════════════
let loginAttempts = 0;
let lockoutTimer = null;

function requestAdmin() {
  if (document.body.classList.contains('admin-mode')) {
    openAdminPanel();
  } else {
    openLoginModal();
  }
}

function openLoginModal() {
  if (!sb) { showToast('Supabase is not configured — admin login unavailable.'); return; }
  const modal = document.getElementById('adminLoginModal');
  if (modal) modal.classList.add('open');
}

function closeLoginModal() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) modal.classList.remove('open');
  const err = document.getElementById('loginErr');
  if (err) err.textContent = '';
}

async function attemptLogin() {
  const passInput = document.getElementById('loginPassword');
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginErr');
  if (!passInput || !sb) return;

  btn.disabled = true;
  btn.textContent = 'Logging in...';

  const { error } = await sb.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: passInput.value
  });

  btn.disabled = false;
  btn.textContent = 'Login';

  if (!error) {
    sbIsAdmin = true;
    document.body.classList.add('admin-mode');
    closeLoginModal();
    openAdminPanel();
    showToast('Welcome Admin!');
    passInput.value = '';
    loginAttempts = 0;
  } else {
    loginAttempts++;
    if (loginAttempts >= 3) {
      if (err) err.innerHTML = `<span class="lockout-msg">Too many attempts. Locked out for 30s.</span>`;
      passInput.disabled = true;
      let count = 30;
      lockoutTimer = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(lockoutTimer);
          passInput.disabled = false;
          if (err) err.textContent = '';
          loginAttempts = 0;
        } else if (err) {
          err.innerHTML = `<span class="lockout-msg">Try again in ${count}s</span>`;
        }
      }, 1000);
    } else if (err) {
      err.textContent = `Incorrect password. (${3 - loginAttempts} attempts left)`;
    }
  }
}

async function logoutAdmin() {
  if (sb) await sb.auth.signOut();
  sbIsAdmin = false;
  document.body.classList.remove('admin-mode');
  closeAdmin();
  showToast('Logged out.');
}

async function checkAdminSession() {
  if (!sb) return;
  const { data } = await sb.auth.getSession();
  if (data && data.session) {
    sbIsAdmin = true;
    document.body.classList.add('admin-mode');
  }
}

function openAdminPanel() {
  populateAdminPersonalFields();
  renderAdminCerts();
  renderAdminProjects();
  renderAdminLegislations();
  renderAdminPhotography();
  const panel = document.getElementById('adminPanel');
  if (panel) panel.classList.add('open');
}

function closeAdmin() {
  const panel = document.getElementById('adminPanel');
  if (panel) panel.classList.remove('open');
}

function adminList(items, editFn, deleteFn, labelFn, subFn) {
  return items.map(item =>
    `<div class="admin-item">
      <div class="admin-item-info"><strong>${labelFn(item)}</strong><small>${subFn(item)}</small></div>
      <div class="admin-item-btns">
        <button class="admin-btn secondary" style="padding:6px 12px;font-size:11px;" onclick="${editFn}(${item.id})">Edit</button>
        <button class="admin-btn danger" style="padding:6px 12px;font-size:11px;" onclick="${deleteFn}(${item.id})">Del</button>
      </div>
    </div>`
  ).join('');
}

function renderAdminCerts() {
  const el = document.getElementById('adminCertList');
  if (el) el.innerHTML = adminList(appData.certs, 'editCert', 'deleteCert', c => c.name, c => c.org);
}
function renderAdminProjects() {
  const el = document.getElementById('adminProjectsList');
  if (el) el.innerHTML = adminList(appData.projects, 'editProject', 'deleteProject', p => p.title, p => (p.tech || []).join(', '));
}
function renderAdminLegislations() {
  const el = document.getElementById('adminLegislationsList');
  if (el) el.innerHTML = adminList(appData.legislations, 'editLegislation', 'deleteLegislation', l => l.name || l.title, l => l.authors);
}
function renderAdminPhotography() {
  const el = document.getElementById('adminPhotographyList');
  if (!el) return;
  const items = (typeof photographyData !== 'undefined') ? photographyData : [];
  el.innerHTML = adminList(items, 'editPhotography', 'deletePhotography', ph => ph.title || 'Untitled', ph => ph.dateTaken || '');
}

// ══════════════════════════════════════════════
//  ADMIN CRUD — all backed by Supabase
// ══════════════════════════════════════════════

function requireAdmin() {
  if (!sb) { showToast('Supabase is not configured.'); return false; }
  return true;
}

// — Certs —
async function saveCert() {
  if (!requireAdmin()) return;
  const editId = document.getElementById('editingCertId').value;
  const name = document.getElementById('aCertName').value.trim();
  if (!name) { showToast('Enter a name.'); return; }
  const row = { name, org: document.getElementById('aCertOrg').value.trim() };

  const { error } = editId
    ? await sb.from('certs').update(row).eq('id', editId)
    : await sb.from('certs').insert(row);

  if (error) { showToast('Error saving cert.'); console.error(error); return; }

  await loadAllData();
  renderCerts(); renderAdminCerts(); clearCertForm();
  showToast(editId ? 'Cert updated ✓' : 'Cert added ✓');
}
function editCert(id) {
  const c = appData.certs.find(x => x.id === id); if (!c) return;
  document.getElementById('editingCertId').value = id;
  document.getElementById('aCertName').value = c.name;
  document.getElementById('aCertOrg').value = c.org;
  showToast('Editing cert...');
}
async function deleteCert(id) {
  if (!requireAdmin()) return;
  if (!confirm('Delete this certification?')) return;
  const { error } = await sb.from('certs').delete().eq('id', id);
  if (error) { showToast('Error deleting.'); console.error(error); return; }
  await loadAllData();
  renderCerts(); renderAdminCerts(); showToast('Deleted.');
}
function clearCertForm() {
  document.getElementById('editingCertId').value = '';
  ['aCertName', 'aCertOrg'].forEach(id => document.getElementById(id).value = '');
}

// — Projects —
async function saveProject() {
  if (!requireAdmin()) return;
  const editId = document.getElementById('editingProjectId').value;
  const title = document.getElementById('aProjTitle').value.trim();
  if (!title) { showToast('Enter a title.'); return; }
  const imgFile = document.getElementById('aProjImg').files[0];

  let imageUrl = editId ? (appData.projects.find(p => p.id === +editId)?.img || null) : null;
  if (imgFile) {
    try {
      showToast('Uploading image...');
      imageUrl = await sbUploadFile(imgFile, 'projects');
    } catch (e) {
      showToast('Image upload failed.'); console.error(e); return;
    }
  }

  const row = {
    title,
    description: document.getElementById('aProjDesc').value.trim(),
    tech: document.getElementById('aProjTech').value.split(',').map(t => t.trim()).filter(Boolean),
    demo_url: document.getElementById('aProjDemo').value.trim(),
    github_url: document.getElementById('aProjGit').value.trim(),
    image_url: imageUrl
  };

  const { error } = editId
    ? await sb.from('projects').update(row).eq('id', editId)
    : await sb.from('projects').insert(row);

  if (error) { showToast('Error saving project.'); console.error(error); return; }

  await loadAllData();
  renderProjects(); renderAdminProjects(); clearProjectForm();
  showToast(editId ? 'Project updated ✓' : 'Project added ✓');
}
function editProject(id) {
  const p = appData.projects.find(x => x.id === id); if (!p) return;
  document.getElementById('editingProjectId').value = id;
  document.getElementById('aProjTitle').value = p.title;
  document.getElementById('aProjDesc').value = p.desc;
  document.getElementById('aProjTech').value = (p.tech || []).join(', ');
  document.getElementById('aProjDemo').value = p.demo || '';
  document.getElementById('aProjGit').value = p.github || '';
  showToast('Editing project...');
}
async function deleteProject(id) {
  if (!requireAdmin()) return;
  if (!confirm('Delete this project?')) return;
  const { error } = await sb.from('projects').delete().eq('id', id);
  if (error) { showToast('Error deleting.'); console.error(error); return; }
  await loadAllData();
  renderProjects(); renderAdminProjects(); showToast('Deleted.');
}
function clearProjectForm() {
  document.getElementById('editingProjectId').value = '';
  ['aProjTitle', 'aProjDesc', 'aProjTech', 'aProjDemo', 'aProjGit'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('aProjImg').value = '';
}

// — Legislations —
async function saveLegislation() {
  if (!requireAdmin()) return;
  const editId = document.getElementById('editingLegId').value;
  const title = document.getElementById('aLegTitle').value.trim();
  if (!title) { showToast('Enter a title.'); return; }
  const row = {
    category: document.getElementById('aLegCategory')?.value || 'senate',
    name: title,
    title: document.getElementById('aLegDesc').value.trim(),
    authors: document.getElementById('aLegAuthors').value.trim(),
    date_text: document.getElementById('aLegDate')?.value.trim() || '',
    link: document.getElementById('aLegLink').value.trim()
  };

  const { error } = editId
    ? await sb.from('legislations').update(row).eq('id', editId)
    : await sb.from('legislations').insert(row);

  if (error) { showToast('Error saving.'); console.error(error); return; }

  await loadAllData();
  renderLegislations(); renderAdminLegislations(); clearLegForm();
  showToast(editId ? 'Updated ✓' : 'Added ✓');
}
function editLegislation(id) {
  const l = appData.legislations.find(x => x.id === id); if (!l) return;
  document.getElementById('editingLegId').value = id;
  document.getElementById('aLegTitle').value = l.name || l.title;
  document.getElementById('aLegAuthors').value = l.authors;
  document.getElementById('aLegDesc').value = l.title || l.desc || '';
  const catEl = document.getElementById('aLegCategory'); if (catEl) catEl.value = l.category || 'senate';
  const dateEl = document.getElementById('aLegDate'); if (dateEl) dateEl.value = l.date || '';
  document.getElementById('aLegLink').value = l.link || '';
  showToast('Editing legislation...');
}
async function deleteLegislation(id) {
  if (!requireAdmin()) return;
  if (!confirm('Delete?')) return;
  const { error } = await sb.from('legislations').delete().eq('id', id);
  if (error) { showToast('Error deleting.'); console.error(error); return; }
  await loadAllData();
  renderLegislations(); renderAdminLegislations(); showToast('Deleted.');
}
function clearLegForm() {
  document.getElementById('editingLegId').value = '';
  ['aLegTitle', 'aLegAuthors', 'aLegDesc', 'aLegLink', 'aLegDate'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const catEl = document.getElementById('aLegCategory'); if (catEl) catEl.value = 'senate';
}

// — Photography (scrapbook) —
async function savePhotography() {
  if (!requireAdmin()) return;
  const editId = document.getElementById('editingPhotoId').value;
  const imgFile = document.getElementById('aPhotoImg').files[0];
  let imageUrl = editId ? (photographyData.find(p => p.id === +editId)?.img || null) : null;

  if (imgFile) {
    try {
      showToast('Uploading photo...');
      imageUrl = await sbUploadFile(imgFile, 'photography');
    } catch (e) {
      showToast('Photo upload failed.'); console.error(e); return;
    }
  }
  if (!imageUrl) { showToast('Choose an image.'); return; }

  const row = {
    title: document.getElementById('aPhotoTitle').value.trim(),
    image_url: imageUrl,
    date_taken: document.getElementById('aPhotoDate').value.trim(),
    shot_with: document.getElementById('aPhotoShotWith').value.trim(),
    edited_in: document.getElementById('aPhotoEditedIn').value.trim()
  };

  const { error } = editId
    ? await sb.from('photography').update(row).eq('id', editId)
    : await sb.from('photography').insert(row);

  if (error) { showToast('Error saving photo.'); console.error(error); return; }

  await loadAllData();
  if (typeof renderPhotography === 'function') renderPhotography();
  renderAdminPhotography(); clearPhotoForm();
  showToast(editId ? 'Photo updated ✓' : 'Photo added ✓');
}
function editPhotography(id) {
  const ph = photographyData.find(x => x.id === id); if (!ph) return;
  document.getElementById('editingPhotoId').value = id;
  document.getElementById('aPhotoTitle').value = ph.title || '';
  document.getElementById('aPhotoDate').value = ph.dateTaken || '';
  document.getElementById('aPhotoShotWith').value = ph.shotWith || '';
  document.getElementById('aPhotoEditedIn').value = ph.editedIn || '';
  showToast('Editing photo...');
}
async function deletePhotography(id) {
  if (!requireAdmin()) return;
  if (!confirm('Delete this photo?')) return;
  const { error } = await sb.from('photography').delete().eq('id', id);
  if (error) { showToast('Error deleting.'); console.error(error); return; }
  await loadAllData();
  if (typeof renderPhotography === 'function') renderPhotography();
  renderAdminPhotography(); showToast('Deleted.');
}
function clearPhotoForm() {
  document.getElementById('editingPhotoId').value = '';
  ['aPhotoTitle', 'aPhotoDate', 'aPhotoShotWith', 'aPhotoEditedIn'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('aPhotoImg').value = '';
}

// — Personal & media —
async function savePersonal() {
  if (!requireAdmin()) return;
  const row = {
    full_name: document.getElementById('aName').value.trim(),
    tagline: document.getElementById('aTagline').value.trim(),
    email: document.getElementById('aEmail').value.trim(),
    location: document.getElementById('aLocation').value.trim()
  };
  const { data, error } = await sb.from('profile').update(row).eq('id', 1).select();
  if (error) {
    showToast('Error saving: ' + error.message);
    console.error('savePersonal error:', error);
    return;
  }
  if (!data || data.length === 0) {
    showToast('No profile row found — check supabase-schema.sql was run.');
    console.warn('savePersonal: update matched 0 rows. Does a profile row with id=1 exist?');
    return;
  }
  await loadAllData();
  showToast('Saved ✓');
}
async function saveResume() {
  if (!requireAdmin()) return;
  const f = document.getElementById('aResume').files[0];
  if (!f) { showToast('No file selected.'); return; }
  try {
    showToast('Uploading resume...');
    const url = await sbUploadFile(f, 'resume');
    const { error } = await sb.from('profile').update({ resume_url: url }).eq('id', 1);
    if (error) throw error;
    await loadAllData();
    showToast('Resume updated ✓');
  } catch (e) {
    showToast('Resume upload failed.'); console.error(e);
  }
}
async function savePhotos() {
  if (!requireAdmin()) return;
  const h = document.getElementById('aHeroPhoto').files[0];
  const p = document.getElementById('aProfilePhoto').files[0];
  const row = {};
  try {
    if (h) { showToast('Uploading hero photo...'); row.hero_photo_url = await sbUploadFile(h, 'profile'); }
    if (p) { showToast('Uploading profile photo...'); row.profile_photo_url = await sbUploadFile(p, 'profile'); }
    if (Object.keys(row).length === 0) { showToast('No file selected.'); return; }
    const { error } = await sb.from('profile').update(row).eq('id', 1);
    if (error) throw error;
    await loadAllData();
    showToast('Photos updated ✓');
  } catch (e) {
    showToast('Photo upload failed.'); console.error(e);
  }
}

// ══════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function toggleMobile() {
  const el = document.getElementById('mobileMenu');
  if (el) el.classList.toggle('open');
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar') || document.querySelector('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
});

function observeReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

function animateSkillBars() {
  document.querySelectorAll('.bar-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });
}

function initSkillBars() {
  const container = document.getElementById('skillsContainer');
  if (!container) return;
  const run = () => animateSkillBars();
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(run, 120);
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    obs.observe(container);
  } else {
    setTimeout(run, 250);
  }
}

// ══════════════════════════════════════════════
//  CONTENT PROTECTION
// ══════════════════════════════════════════════
document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', e => {
  const key = e.key.toUpperCase();
  if (key === 'F12') e.preventDefault();
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(key)) e.preventDefault();
  if ((e.ctrlKey || e.metaKey) && key === 'U') e.preventDefault();
});

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
(async function init() {
  setActiveNav();
  await checkAdminSession();
  await loadAllData();

  const page = getCurrentPage();
  if (page === 'profile') { initSkillBars(); renderCerts(); }
  if (page === 'projects') renderProjects();
  if (page === 'legislations') renderLegislations();
  if (page === 'projects' && typeof renderPhotography === 'function') renderPhotography();

  if (document.body.classList.contains('admin-mode')) {
    renderAdminCerts(); renderAdminProjects(); renderAdminLegislations(); renderAdminPhotography();
  }

  observeReveal();
  if (new URLSearchParams(window.location.search).get('admin') === '1') openLoginModal();
})();
