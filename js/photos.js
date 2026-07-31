// js/photos.js

const photographyData = [
  {
    id: 1,
    title: "Urban Architecture",
    img: "images/photo1.jpg", // FIXED: Removed 'my-portfolio/' prefix
    dateTaken: "March 15, 2026",
    editedIn: "Lightroom Mobile"
  }
];

function renderPhotography() {
  const photoGrid = document.getElementById('photographyGrid');
  if (!photoGrid) {
    console.warn("photographyGrid element not found!");
    return;
  }

  photoGrid.innerHTML = photographyData.map(photo => `
    <div class="project-card reveal" style="display: flex; flex-direction: column; overflow: hidden;">
      <div style="width: 100%; aspect-ratio: 4/3; overflow: hidden; background: var(--card-bg, #1a1a1a); border-radius: 8px; margin-bottom: 12px;">
        <img src="${photo.img}" alt="${photo.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      </div>
      <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">${photo.title}</h3>
      <div style="font-size: 0.85rem; color: var(--text-muted, #a0a0a0); display: flex; flex-direction: column; gap: 4px;">
        <p><strong>Date Taken:</strong> ${photo.dateTaken}</p>
        <p><strong>Edited in:</strong> ${photo.editedIn}</p>
      </div>
    </div>
  `).join('');
}

// Automatically render whenever DOM or script is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPhotography);
} else {
  renderPhotography();
}
