// js/scrapbook.js
// Renders photographyData (from js/photos.js) as a vintage, flip-through scrapbook.

let sbCurrent = 0;
let sbSpreads = [];

function sbBuildSpreads(photos) {
  const spreads = [];
  for (let i = 0; i < photos.length; i += 2) {
    spreads.push([photos[i], photos[i + 1] || null]);
  }
  if (spreads.length === 0) spreads.push([null, null]);
  return spreads;
}

function sbPolaroidHTML(photo, side) {
  if (!photo) {
    return `
      <div class="sb-page sb-empty">
        <span>✦ more memories to come ✦</span>
      </div>
    `;
  }
  const rotate = side === 'left' ? '-3deg' : '2.5deg';
  return `
    <div class="sb-page">
      <div class="sb-polaroid" style="transform:rotate(${rotate});">
        <div class="sb-tape"></div>
        <img
          src="${photo.img}"
          alt="${photo.title}"
          loading="lazy"
          onclick="openLightbox('${photo.img}', '${photo.title}')"
          onerror="this.style.display='none'"
        >
        <div class="sb-cap">${photo.title}</div>
      </div>
      <div class="sb-note">
        <strong>${photo.dateTaken || ''}</strong><br>
        ${photo.shotWith ? `Shot with ${photo.shotWith}` : ''}${photo.shotWith && photo.editedIn ? ' · ' : ''}${photo.editedIn ? `Edited in ${photo.editedIn}` : ''}
      </div>
    </div>
  `;
}

function sbRenderSpread(pair) {
  return `
    <div class="sb-spread">
      ${sbPolaroidHTML(pair[0], 'left')}
      ${sbPolaroidHTML(pair[1], 'right')}
    </div>
  `;
}

function renderPhotography() {
  const container = document.getElementById('photographyGrid');
  if (!container) return;

  const photos = (typeof photographyData !== 'undefined') ? photographyData : [];
  sbSpreads = sbBuildSpreads(photos);
  sbCurrent = 0;

  container.className = '';
  container.innerHTML = `
    <div class="scrapbook">
      <div class="scrapbook-rings"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="scrapbook-heading">
        <p class="sb-eyebrow">flip through the memories</p>
      </div>
      <div class="scrapbook-viewport" id="sbViewport">
        ${sbSpreads.map(sbRenderSpread).join('')}
      </div>
      <div class="scrapbook-controls">
        <button class="sb-btn" id="sbPrev" onclick="sbGo(sbCurrent - 1)" aria-label="Previous page">‹</button>
        <div class="sb-dots" id="sbDots"></div>
        <button class="sb-btn" id="sbNext" onclick="sbGo(sbCurrent + 1)" aria-label="Next page">›</button>
      </div>
    </div>
  `;

  const dots = document.getElementById('sbDots');
  dots.innerHTML = sbSpreads.map((_, i) =>
    `<span data-i="${i}" onclick="sbGo(${i})"></span>`
  ).join('');

  sbApplyState(0);
  sbSyncHeight();
  window.addEventListener('resize', sbSyncHeight);
}

function sbApplyState(dir) {
  const spreadEls = document.querySelectorAll('#sbViewport .sb-spread');
  spreadEls.forEach((el, i) => {
    el.classList.remove('sb-active', 'sb-enter-next', 'sb-enter-prev');
    if (i === sbCurrent) {
      el.classList.add('sb-active');
    } else if (dir > 0 && i > sbCurrent) {
      el.classList.add('sb-enter-next');
    } else if (dir < 0 && i < sbCurrent) {
      el.classList.add('sb-enter-prev');
    }
  });

  const dotEls = document.querySelectorAll('#sbDots span');
  dotEls.forEach((d, i) => d.classList.toggle('sb-dot-active', i === sbCurrent));

  const prevBtn = document.getElementById('sbPrev');
  const nextBtn = document.getElementById('sbNext');
  if (prevBtn) prevBtn.disabled = sbCurrent === 0;
  if (nextBtn) nextBtn.disabled = sbCurrent === sbSpreads.length - 1;
}

function sbGo(index) {
  if (index < 0 || index >= sbSpreads.length || index === sbCurrent) return;
  const dir = index > sbCurrent ? 1 : -1;
  sbCurrent = index;
  sbApplyState(dir);
  sbSyncHeight();
}

function sbSyncHeight() {
  const viewport = document.getElementById('sbViewport');
  const active = viewport ? viewport.querySelector('.sb-spread.sb-active') : null;
  if (viewport && active) {
    viewport.style.minHeight = active.scrollHeight + 'px';
  }
}

document.addEventListener('keydown', (e) => {
  const viewport = document.getElementById('sbViewport');
  if (!viewport) return;
  if (e.key === 'ArrowRight') sbGo(sbCurrent + 1);
  if (e.key === 'ArrowLeft') sbGo(sbCurrent - 1);
});
