// --- CONFIGURATION (Obfuscated) ---
const _u = 'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J5RENzbWR4eDJ3bmdubk93MmZ0aExrakpKb1NJRFVmNmUxOWFSZGZ1QnMtd0Z1SDJraXBZN19XVmt2RnJPRENXRzMvZXhlYw==';
const _k = 'Qm9vblNob3VfUG9ydGZvbGlvX0FjY2Vzc18yMDI2';
const SCRIPT_URL = atob(_u);

// --- UI HELPERS ---
function toggleNav() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.toggle('open');
}

// Close nav on link click
document.addEventListener('click', (e) => {
  if (e.target.closest('.nav-links a')) {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('open');
  }
});

// --- PROJECT FETCHING ---
async function fetchProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  try {
    const response = await fetch(`${SCRIPT_URL}?key=${atob(_k)}`);
    const result = await response.json();
    if (result.status === 'success') {
      renderProjects(result.data);
    } else {
      container.innerHTML = `<p class="project-placeholder reveal" style="color: red;">Error: ${result.message}</p>`;
    }
  } catch (err) {
    container.innerHTML = `<p class="project-placeholder reveal" style="color: red;">Failed to load projects. Please try again later.</p>`;
    console.error('Error fetching projects:', err);
  }
}

function renderMediaIcons(mediaString) {
  if (!mediaString) return '';
  const iconMap = { 
    github: 'fab fa-github', 
    demo: 'fas fa-external-link-alt', 
    youtube: 'fab fa-youtube', 
    linkedin: 'fab fa-linkedin', 
    website: 'fas fa-globe', 
    pdf: 'fas fa-file-pdf',
    poster: 'fas fa-image',
    other: 'fas fa-link' 
  };
  
  return mediaString.split('|').map(pair => {
    let type, url, poster = '';
    if (pair.includes(':::')) {
      const parts = pair.split(':::');
      type = parts[0];
      url = parts[1];
      poster = parts[2] || '';
    } else {
      const firstColonIndex = pair.indexOf(':');
      if (firstColonIndex === -1) return '';
      type = pair.substring(0, firstColonIndex);
      url = pair.substring(firstColonIndex + 1);
    }
    
    if (!url) return '';
    const icon = iconMap[type] || iconMap.other;
    
    if (poster) {
      return `
        <a href="${url}" target="_blank" class="media-icon-btn has-poster" onclick="event.stopPropagation()" title="${type.toUpperCase()}">
          <img src="${poster}" alt="${type}" class="poster-img">
          <i class="${icon}"></i>
        </a>`;
    }
    return `<a href="${url}" target="_blank" class="media-icon-btn" onclick="event.stopPropagation()" title="${type.toUpperCase()}"><i class="${icon}"></i></a>`;
  }).join('');
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (!projects || projects.length === 0) {
    container.innerHTML = `<div class="project-placeholder reveal"><i class="fas fa-folder-open"></i><p>No projects available right now.</p></div>`;
    return;
  }

  projects.forEach((proj, i) => {
    const tagsHtml = (proj.tags || '').split(',').map(t => `<span class="project-tag">${t.trim()}</span>`).join('');
    const html = `
      <div class="project-card reveal" onclick="window.location.href='project.html?id=${proj.id}'">
        <div class="project-img" onclick="event.stopPropagation(); openLightbox('${proj.image_url}')">
          <span class="project-num">${(i+1).toString().padStart(2,'0')}</span>
          <img src="${proj.image_url}" alt="${proj.title}" style="width:100%; height:100%; object-fit:cover; position:absolute; inset:0; opacity:0.4;">
          <i class="fas fa-laptop-code" style="z-index:2"></i>
        </div>
        <div class="project-body">
          <div class="project-tags">${tagsHtml}</div>
          <h3 class="project-title">${proj.title}</h3>
          <p class="project-desc">${proj.short_description}</p>
          <div class="project-media">${renderMediaIcons(proj.media || proj[""])}</div>
        </div>
      </div>
    `;
    container.innerHTML += html;
  });

  // Reveal animation logic
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// --- LIGHTBOX LOGIC ---
function openLightbox(src) {
  if (!src) return;
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <span class="lightbox-close">&times;</span>
        <img id="lightbox-img" src="" alt="Full View">
      </div>
    `;
    document.body.appendChild(lightbox);
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); });
  }
  
  const img = document.getElementById('lightbox-img');
  img.src = src;
  lightbox.classList.add('active');
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  fetchProjects();
  // Initialize other reveal elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
