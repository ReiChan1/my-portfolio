// js/photos.js
// Fallback photo data — used only if Supabase can't be reached.
// main.js overwrites this (via `let`, so it's reassignable) once the
// live "photography" table loads.

let photographyData = [
  {
    id: 1,
    title: "Creative Shot - Graduation01",
    img: "images/photographs/photo1.jpg",
    dateTaken: "July 23, 2026",
    shotWith: "Sony A6400",
    editedIn: "Lightroom Classic"
  },
  {
    id: 2,
    title: "Creative Shot - Graduation02",
    img: "images/photographs/photo2.jpg",
    dateTaken: "July 23, 2026",
    shotWith: "Sony A6400",
    editedIn: "Lightroom Classic"
  },
  {
    id: 3,
    title: "Creative Shot - Graduation03",
    img: "images/photographs/photo3.jpg",
    dateTaken: "July 23, 2026",
    shotWith: "Sony A6400",
    editedIn: "Lightroom Classic"
  }
];

// NOTE: The photography grid is now rendered as a vintage flip-through
// scrapbook — see js/scrapbook.js for renderPhotography()'s implementation.
// This file just holds the photo data + the lightbox modal logic.

// Lightbox functions
function openLightbox(imgSrc, caption) {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');

  if (!modal || !modalImg) return;

  modalImg.src = imgSrc;
  if (modalCaption) modalCaption.textContent = caption || '';

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox(event) {
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;

  if (!event || event.target.id === 'lightboxModal' || event.target.tagName === 'BUTTON' || event.key === 'Escape') {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox(e);
});
