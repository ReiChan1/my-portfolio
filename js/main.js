// ══════════════════════════════════════════════
//  NAVIGATION — multi-page
// ══════════════════════════════════════════════
const PAGES = ['home','profile','projects','legislations','social'];
const PAGE_FILES = {home:'index.html',profile:'profile.html',projects:'projects.html',legislations:'legislations.html',social:'social.html'};

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
    const techs = p.tech.map(t=>`<span class="tech">${t}</span>`).join('');
    const demo  = p.demo   ? `<a href="${p.demo}"   target="_blank" class="pb pb-dark">Live Demo</a>` : '';
    const gh    = p.github ? `<a href="${p.github}" target="_blank" class="pb pb-ghost">GitHub</a>`   : '';
    return `<div class="proj-card reveal"><div class="proj-img">${img}</div><div class="proj-body"><div class="proj-techs">${techs}</div><h3 class="proj-title">${p.title}</h3><p class="proj-desc">${p.desc}</p><div class="proj-actions">${demo}${gh}</div></div></div>`;
  }).join('');
  // Admin-only add card
  g.innerHTML += `<div class="proj-card admin-only" style="border:2px dashed var(--tan);background:transparent;box-shadow:none;min-height:300px;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--tan);font-size:13px;font-style:italic;cursor:pointer;" onclick="requestAdmin()"><div style="font-size:32px;opacity:0.4;">+</div><span>Add project (Admin)</span></div>`;
  observeReveal();
}

function renderLegislations() {
  const g = document.getElementById('legislationsGrid');
  if (!g) return;
  g.innerHTML = appData.legislations.map(l =>
    `<div class="leg-card reveal"><div class="leg-header"><div class="leg-icon">🏛️</div><div class="leg-title">${l.title}</div></div><div class="leg-authors">${l.authors}</div><p class="leg-desc">${l.desc}</p>${l.link?`<a href="${l.link}" target="_blank" class="leg-link">View Document ↗</a>`:''}</div>`
  ).join('');
  g.innerHTML += `<div class="leg-card admin-only" style="border:2px dashed var(--tan);background:transparent;box-shadow:none;min-height:200px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:var(--tan);font-size:13px;font-style:italic;cursor:pointer;" onclick="requestAdmin()"><div style="font-size:32px;opacity:0.4;">+</div><span>Add legislation (Admin)</span></div>`;
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
    const bytes = Uint8Array.from(atob(appData.resumeB64), c => c.charCodeAt(0));
    const blob  = new Blob([bytes], {type:'application/pdf'});
    window.open(URL.createObjectURL(blob), '_blank');
  } catch(e) { showToast('Could not open resume.'); }
}

// ══════════════════════════════════════════════
//  ADMIN CRUD
// ══════════════════════════════════════════════
function adminList(items, editFn, deleteFn, labelFn, subFn) {
  return items.map(item =>
    `<div class="admin-item">
      <div class="admin-item-info"><strong>${labelFn(item)}</strong><small>${subFn(item)}</small></div>
      <div class="admin-item-btns">
        <button class="admin-btn secondary" style="padding:6px 12px;font-size:11px;" onclick="${editFn}(${item.id})">Edit</button>
        <button class="admin-btn danger"    style="padding:6px 12px;font-size:11px;" onclick="${deleteFn}(${item.id})">Del</button>
      </div>
    </div>`
  ).join('');
}
function renderAdminCerts()        { document.getElementById('adminCertList').innerHTML        = adminList(appData.certs,        'editCert',        'deleteCert',        c=>c.name,  c=>c.org); }
function renderAdminProjects()     { document.getElementById('adminProjectsList').innerHTML     = adminList(appData.projects,     'editProject',     'deleteProject',     p=>p.title, p=>p.tech.join(', ')); }
function renderAdminLegislations() { document.getElementById('adminLegislationsList').innerHTML = adminList(appData.legislations, 'editLegislation', 'deleteLegislation', l=>l.title, l=>l.authors); }

// — Certs —
function saveCert() {
  const editId = document.getElementById('editingCertId').value;
  const name   = document.getElementById('aCertName').value.trim();
  if (!name) { showToast('Enter a name.'); return; }
  const cert = {id: editId ? +editId : Date.now(), name, org: document.getElementById('aCertOrg').value.trim()};
  if (editId) { const i = appData.certs.findIndex(c=>c.id===+editId); if(i!==-1) appData.certs[i]=cert; }
  else appData.certs.push(cert);
  renderCerts(); renderAdminCerts(); clearCertForm(); showToast(editId?'Cert updated ✓':'Cert added ✓');
}
function editCert(id) {
  const c = appData.certs.find(x=>x.id===id); if(!c) return;
  document.getElementById('editingCertId').value = id;
  document.getElementById('aCertName').value = c.name;
  document.getElementById('aCertOrg').value  = c.org;
  showToast('Editing cert...');
}
function deleteCert(id) {
  if (!confirm('Delete this certification?')) return;
  appData.certs = appData.certs.filter(c=>c.id!==id);
  renderCerts(); renderAdminCerts(); showToast('Deleted.');
}
function clearCertForm() {
  document.getElementById('editingCertId').value='';
  ['aCertName','aCertOrg'].forEach(id=>document.getElementById(id).value='');
}

// — Projects —
function saveProject() {
  const editId = document.getElementById('editingProjectId').value;
  const title  = document.getElementById('aProjTitle').value.trim();
  if (!title) { showToast('Enter a title.'); return; }
  const imgFile = document.getElementById('aProjImg').files[0];
  const finish = imgSrc => {
    const proj = {
      id: editId ? +editId : Date.now(), title,
      desc:   document.getElementById('aProjDesc').value.trim(),
      tech:   document.getElementById('aProjTech').value.split(',').map(t=>t.trim()).filter(Boolean),
      demo:   document.getElementById('aProjDemo').value.trim(),
      github: document.getElementById('aProjGit').value.trim(),
      img:    imgSrc
    };
    if (editId) { const i=appData.projects.findIndex(p=>p.id===+editId); if(i!==-1) appData.projects[i]=proj; }
    else appData.projects.push(proj);
    renderProjects(); renderAdminProjects(); clearProjectForm(); showToast(editId?'Project updated ✓':'Project added ✓');
  };
  if (imgFile) { const r=new FileReader(); r.onload=e=>finish(e.target.result); r.readAsDataURL(imgFile); }
  else finish(editId ? (appData.projects.find(p=>p.id===+editId)?.img||null) : null);
}
function editProject(id) {
  const p=appData.projects.find(x=>x.id===id); if(!p) return;
  document.getElementById('editingProjectId').value=id;
  document.getElementById('aProjTitle').value=p.title;
  document.getElementById('aProjDesc').value=p.desc;
  document.getElementById('aProjTech').value=p.tech.join(', ');
  document.getElementById('aProjDemo').value=p.demo||'';
  document.getElementById('aProjGit').value=p.github||'';
  showToast('Editing project...');
}
function deleteProject(id) {
  if(!confirm('Delete this project?')) return;
  appData.projects=appData.projects.filter(p=>p.id!==id);
  renderProjects(); renderAdminProjects(); showToast('Deleted.');
}
function clearProjectForm() {
  document.getElementById('editingProjectId').value='';
  ['aProjTitle','aProjDesc','aProjTech','aProjDemo','aProjGit'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('aProjImg').value='';
}

// — Legislations —
function saveLegislation() {
  const editId=document.getElementById('editingLegId').value;
  const title=document.getElementById('aLegTitle').value.trim();
  if(!title){showToast('Enter a title.');return;}
  const leg={id:editId?+editId:Date.now(),title,authors:document.getElementById('aLegAuthors').value.trim(),desc:document.getElementById('aLegDesc').value.trim(),link:document.getElementById('aLegLink').value.trim()};
  if(editId){const i=appData.legislations.findIndex(l=>l.id===+editId);if(i!==-1)appData.legislations[i]=leg;}
  else appData.legislations.push(leg);
  renderLegislations();renderAdminLegislations();clearLegForm();showToast(editId?'Updated ✓':'Added ✓');
}
function editLegislation(id){
  const l=appData.legislations.find(x=>x.id===id);if(!l)return;
  document.getElementById('editingLegId').value=id;
  document.getElementById('aLegTitle').value=l.title;
  document.getElementById('aLegAuthors').value=l.authors;
  document.getElementById('aLegDesc').value=l.desc;
  document.getElementById('aLegLink').value=l.link||'';
  showToast('Editing legislation...');
}
function deleteLegislation(id){
  if(!confirm('Delete?'))return;
  appData.legislations=appData.legislations.filter(l=>l.id!==id);
  renderLegislations();renderAdminLegislations();showToast('Deleted.');
}
function clearLegForm(){
  document.getElementById('editingLegId').value='';
  ['aLegTitle','aLegAuthors','aLegDesc','aLegLink'].forEach(id=>document.getElementById(id).value='');
}

// — Personal & media —
function savePersonal(){
  const name = document.getElementById('aName').value;
  const homeH1 = document.querySelector('.home-h1');
  const heroName = document.querySelector('.hero-name-badge strong');
  const ftLogo = document.querySelector('.ft-logo');
  if (homeH1) homeH1.innerHTML = "Hello, I'm<br><em>" + name + "</em>";
  if (heroName) heroName.textContent = name;
  if (ftLogo) ftLogo.textContent = name;
  showToast('Saved ✓');
}
function saveResume(){
  const f=document.getElementById('aResume').files[0];
  if(!f){showToast('No file selected.');return;}
  const r=new FileReader();
  r.onload=e=>{appData.resumeB64=e.target.result.split(',')[1];showToast('Resume updated ✓');};
  r.readAsDataURL(f);
}
function savePhotos(){
  const h=document.getElementById('aHeroPhoto').files[0];
  const p=document.getElementById('aProfilePhoto').files[0];
  const heroImg=document.getElementById('heroImg');
  const profileImg=document.getElementById('profileImg');
  if(h && heroImg){const r=new FileReader();r.onload=e=>{heroImg.src=e.target.result;showToast('Hero updated ✓');};r.readAsDataURL(h);}
  if(p && profileImg){const r=new FileReader();r.onload=e=>{profileImg.src=e.target.result;showToast('Profile updated ✓');};r.readAsDataURL(p);}
}

// ══════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════
function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}
function toggleMobile(){ document.getElementById('mobileMenu').classList.toggle('open'); }
window.addEventListener('scroll',()=>{ document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20); });

function observeReveal() {
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*60);obs.unobserve(e.target);}
    });
  },{threshold:0.1});
  document.querySelectorAll('.reveal:not(.visible)').forEach(el=>obs.observe(el));
}
function animateSkillBars(){
  document.querySelectorAll('.bar-fill').forEach(b=>{b.style.width=b.dataset.w+'%';});
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
//  INIT
// ══════════════════════════════════════════════
(function init(){
  setActiveNav();
  const page = getCurrentPage();
  if (page === 'profile') { initSkillBars(); renderCerts(); }
  if (page === 'projects') renderProjects();
  if (page === 'legislations') renderLegislations();
  observeReveal();
  if (new URLSearchParams(window.location.search).get('admin') === '1') openLoginModal();
})();
