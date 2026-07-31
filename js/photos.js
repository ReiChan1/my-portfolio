// js/photos.js

const photographyData = [
  {
    id: 1,
    title: "Creative Shot - Graduation",
    img: "images/photographs/photo1.jpg",
    dateTaken: "July 23, 2026",
    editedIn: "Lightroom Classic"
  }
];

function renderPhotography() {
  const photoGrid = document.getElementById('photographyGrid');
  if (!photoGrid) return;

  photoGrid.innerHTML = photographyData.map(photo => `
    <div class="project-card reveal" style="display: flex; flex-direction: column; opacity: 1; visibility: visible;">
      <div style="width: 100%; height: 260px; overflow: hidden; background: #1a1a1a; border-radius: 8px; margin-bottom: 12px; position: relative;">
        <img 
          src="${photo.img}" 
          alt="${photo.title}" 
          style="width: 100%; height: 100%; object-fit: cover; display: block;" 
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPhotography);
} else {
  renderPhotography();
}
