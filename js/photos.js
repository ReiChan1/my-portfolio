// js/photos.js

const photographyData = [
  {
    id: 1,
    title: "Urban Architecture",
    img: "images/photographs/photo1.jpg",
    dateTaken: "March 15, 2026",
    editedIn: "Lightroom Mobile"
  }
];

function renderPhotography() {
  const photoGrid = document.getElementById('photographyGrid');
  if (!photoGrid) return;

  photoGrid.innerHTML = photographyData.map(photo => `
    <div class="project-card reveal" style="display: flex; flex-direction: column; opacity: 1; visibility: visible;">
      <div 
        onclick="openLightbox('${photo.img}', '${photo.title}')"
        style="width: 100%; height: 260px; overflow: hidden; background: #1a1a1a; border-radius: 8px; margin-bottom: 12px; position: relative; cursor: pointer;"
        title="Click to view full image"
      >
        <img 
          src="${photo.img}" 
          alt="${photo.title}" 
          style="width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease;" 
          onmouseover="this.style.transform='scale(1.05)'" 
          onmouseout="this.style.transform='scale(1)'"
          onerror="console.error('Failed to load image:', this.src); this.style.display='none';"
        >
      </div>
      <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">${photo.title}</h3>
      <div style="font-size: 0.85rem; color: #a0a0a0; display: flex; flex-direction: column; gap: 4px;">
        <p><strong>Date Taken:</strong> ${photo.dateTaken}</p>
        <p><strong>Edited in:</strong> ${photo.editedIn}</p>
      </div>
    </div>
  `).join('');
}

// Lightbox functions
function openLightbox(imgSrc, caption) {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');

  if (!modal || !modalImg) return;

  modalImg.src = imgSrc;
  if (modalCaption) modalCaption.textContent = caption || '';

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeLightbox(event) {
  // Close if close button clicked, Esc key pressed, or outside background clicked
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;

  if (!event || event.target.id === 'lightboxModal' || event.target.tagName === 'BUTTON' || event.key === 'Escape') {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore background scrolling
  }
}

// Close lightbox on 'Escape' key press
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox(e);
});

// Render on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPhotography);
} else {
  renderPhotography();
}
