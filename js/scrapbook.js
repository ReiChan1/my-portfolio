// js/scrapbook.js
// Renders photographyData (from js/photos.js) as a vintage, flip-through scrapbook.
//
// This mimics a real book: a fixed spine down the middle, two static page
// slots either side of it, and — on each flip — a single "leaf" that rotates
// around the spine edge only (never the whole book). Going forward, the
// right page lifts and turns left to become the new left page, revealing
// the next right page underneath. Going back does the mirror image.

let sbPages = [];
let sbLeftIndex = 0;
let sbAnimating = false;

const SB_FLIP_MS = 850;

function sbPageInnerHTML(photo, idx) {
  if (!photo) {
    return `<div class="sb-page-empty">✦ more memories to come ✦</div>`;
  }
  const rotate = (idx % 2 === 0) ? '2.5deg' : '-3deg';
  return `
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
  `;
}

function sbTotalSpreads() {
  return Math.max(1, Math.ceil(sbPages.length / 2));
}

function sbSpreadIndex() {
  return Math.floor(sbLeftIndex / 2);
}

function renderPhotography() {
  const container = document.getElementById('photographyGrid');
  if (!container) return;

  sbPages = (typeof photographyData !== 'undefined') ? photographyData.slice() : [];
  sbLeftIndex = 0;
  sbAnimating = false;

  container.className = '';
  container.innerHTML = `
    <div class="scrapbook">
      <div class="scrapbook-rings"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="scrapbook-heading">
        <p class="sb-eyebrow">flip through the memories</p>
      </div>
      <div class="scrapbook-viewport" id="sbViewport">
        <div class="sb-book" id="sbBook">
          <div class="sb-slot sb-slot-left" id="sbLeftSlot"></div>
          <div class="sb-spine"></div>
          <div class="sb-slot sb-slot-right" id="sbRightSlot"></div>
        </div>
      </div>
      <div class="scrapbook-controls">
        <button class="sb-btn" id="sbPrev" onclick="sbPrev()" aria-label="Previous page">‹</button>
        <div class="sb-dots" id="sbDots"></div>
        <button class="sb-btn" id="sbNext" onclick="sbNext()" aria-label="Next page">›</button>
      </div>
    </div>
  `;

  const dots = document.getElementById('sbDots');
  dots.innerHTML = Array.from({ length: sbTotalSpreads() }, (_, i) =>
    `<span data-i="${i}" onclick="sbGoToSpread(${i})"></span>`
  ).join('');

  document.getElementById('sbLeftSlot').innerHTML = sbPageInnerHTML(sbPages[sbLeftIndex] || null, sbLeftIndex);
  document.getElementById('sbRightSlot').innerHTML = sbPageInnerHTML(sbPages[sbLeftIndex + 1] || null, sbLeftIndex + 1);

  sbUpdateControls();
  sbSyncHeight();
  window.addEventListener('resize', sbSyncHeight);
}

function sbUpdateControls() {
  const dotEls = document.querySelectorAll('#sbDots span');
  const current = sbSpreadIndex();
  dotEls.forEach((d, i) => d.classList.toggle('sb-dot-active', i === current));

  const prevBtn = document.getElementById('sbPrev');
  const nextBtn = document.getElementById('sbNext');
  if (prevBtn) prevBtn.disabled = sbLeftIndex === 0;
  if (nextBtn) nextBtn.disabled = sbLeftIndex + 2 >= sbPages.length;
}

function sbNext() {
  if (sbAnimating) return;
  if (sbLeftIndex + 2 >= sbPages.length) return;

  const book = document.getElementById('sbBook');
  const leftSlot = document.getElementById('sbLeftSlot');
  const rightSlot = document.getElementById('sbRightSlot');
  if (!book || !leftSlot || !rightSlot) return;

  const oldRight = sbPages[sbLeftIndex + 1] || null;   // currently showing on the right
  const newLeft = oldRight;                             // same page becomes the new left
  const newRight = sbPages[sbLeftIndex + 3] || null;    // revealed underneath on the right

  sbAnimating = true;

  // The real right slot swaps immediately — it's hidden under the leaf
  // until the leaf has turned far enough to become edge-on.
  rightSlot.innerHTML = sbPageInnerHTML(newRight, sbLeftIndex + 3);

  const leaf = document.createElement('div');
  leaf.className = 'sb-flip-leaf sb-flip-right sb-flipping';
  leaf.innerHTML = `
    <div class="sb-flip-face sb-flip-front">${sbPageInnerHTML(oldRight, sbLeftIndex + 1)}</div>
    <div class="sb-flip-face sb-flip-back">${sbPageInnerHTML(newLeft, sbLeftIndex + 1)}</div>
  `;
  book.appendChild(leaf);

  void leaf.offsetWidth; // force initial paint before animating
  requestAnimationFrame(() => { leaf.style.transform = 'rotateY(-180deg)'; });

  sbLeftIndex += 2;
  sbUpdateControls();

  setTimeout(() => {
    leftSlot.innerHTML = sbPageInnerHTML(newLeft, sbLeftIndex);
    leaf.remove();
    sbAnimating = false;
    sbSyncHeight();
  }, SB_FLIP_MS);

  sbSyncHeight();
}

function sbPrev() {
  if (sbAnimating) return;
  if (sbLeftIndex === 0) return;

  const book = document.getElementById('sbBook');
  const leftSlot = document.getElementById('sbLeftSlot');
  const rightSlot = document.getElementById('sbRightSlot');
  if (!book || !leftSlot || !rightSlot) return;

  const oldLeft = sbPages[sbLeftIndex] || null;         // currently showing on the left
  const newRight = oldLeft;                             // same page becomes the new right
  const newLeft = sbPages[sbLeftIndex - 2] || null;     // revealed underneath on the left

  sbAnimating = true;

  leftSlot.innerHTML = sbPageInnerHTML(newLeft, sbLeftIndex - 2);

  const leaf = document.createElement('div');
  leaf.className = 'sb-flip-leaf sb-flip-left sb-flipping';
  leaf.innerHTML = `
    <div class="sb-flip-face sb-flip-front">${sbPageInnerHTML(oldLeft, sbLeftIndex)}</div>
    <div class="sb-flip-face sb-flip-back">${sbPageInnerHTML(newRight, sbLeftIndex)}</div>
  `;
  book.appendChild(leaf);

  void leaf.offsetWidth;
  requestAnimationFrame(() => { leaf.style.transform = 'rotateY(180deg)'; });

  sbLeftIndex -= 2;
  sbUpdateControls();

  setTimeout(() => {
    rightSlot.innerHTML = sbPageInnerHTML(newRight, sbLeftIndex + 1);
    leaf.remove();
    sbAnimating = false;
    sbSyncHeight();
  }, SB_FLIP_MS);

  sbSyncHeight();
}

function sbGoToSpread(spreadIndex) {
  const targetLeft = spreadIndex * 2;
  if (targetLeft === sbLeftIndex || sbAnimating) return;
  if (targetLeft > sbLeftIndex && sbLeftIndex + 2 <= targetLeft) {
    sbNext();
  } else if (targetLeft < sbLeftIndex && sbLeftIndex - 2 >= targetLeft) {
    sbPrev();
  }
}

function sbSyncHeight() {
  const viewport = document.getElementById('sbViewport');
  const book = document.getElementById('sbBook');
  if (viewport && book) {
    viewport.style.minHeight = book.scrollHeight + 'px';
  }
}

document.addEventListener('keydown', (e) => {
  const viewport = document.getElementById('sbViewport');
  if (!viewport) return;
  if (e.key === 'ArrowRight') sbNext();
  if (e.key === 'ArrowLeft') sbPrev();
});
