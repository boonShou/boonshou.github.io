// Nav toggle
function toggleNav() {
document.getElementById('navLinks').classList.toggle('open');
}

// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
link.addEventListener('click', () => {
document.getElementById('navLinks').classList.remove('open');
});
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
entries.forEach((entry, i) => {
if (entry.isIntersecting) {
setTimeout(() => entry.target.classList.add('visible'), i * 80);
}
});
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Active nav highlight
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
let current = '';
sections.forEach(s => {
if (window.scrollY >= s.offsetTop - 100) current = s.getAttribute('id');
});
navLinks.forEach(a => {
a.style.color = a.getAttribute('href') === '#' + current ? 'var(--gold)' : '';
});
});

// Form submit mock
function submitForm() {
alert('Thank you for your message! I will get back to you soon.');
}

// --- GOOGLE SHEETS FETCH LOGIC ---
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzN-zKOBzw5I96FiPyeiyk_LzM8EN9SkF6wMZYXLl136aXJ_bvmr5yQkiOn8FFgzMIE/exec';

async function fetchProjects() {
const container = document.getElementById('projects-container');
if (!container) return; // Only run on pages with this container

try {
const response = await fetch(SCRIPT_URL);
const data = await response.json();

if (data.status === 'success') {
renderProjects(data.data);
} else {
container.innerHTML = `<p class="project-placeholder reveal" style="color: red;">Error: ${data.message}</p>`;
}
} catch (error) {
container.innerHTML = `<p class="project-placeholder reveal" style="color: red;">Failed to load projects. Please try again later.</p>`;
console.error('Error fetching projects:', error);
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
other: 'fas fa-link'
};

return mediaString.split('|').map(pair => {
const index = pair.indexOf(':');
if (index === -1) return '';
const type = pair.substring(0, index);
const url = pair.substring(index + 1);
const icon = iconMap[type] || iconMap.other;
return `<a href="${url}" target="_blank" class="media-icon-btn" onclick="event.stopPropagation()"><i class="${icon}"></i></a>`;
}).join('');
}

function renderProjects(projects) {
const container = document.getElementById('projects-container');
container.innerHTML = ''; // Clear loading

if (!projects || projects.length === 0) {
container.innerHTML = `<div class="project-placeholder reveal">
<i class="fas fa-folder-open"></i>
<p>No projects available right now. Check back soon!</p>
</div>`;
return;
}

projects.forEach((proj, index) => {
// Generate tags HTML
const tagsArray = proj.tags ? proj.tags.split(',').map(t => t.trim()) : [];
const tagsHtml = tagsArray.map(t => `<span class="project-tag">${t}</span>`).join('');

// Default image or icon logic
let imgContent = '';
if (proj.image_url) {
imgContent = `<img src="${proj.image_url}" alt="${proj.title}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; opacity: 0.3;">`;
}
// Always show icon
imgContent += `<i class="fas fa-laptop-code" style="z-index: 2;"></i>`;

const html = `
<div class="project-card reveal" style="cursor: pointer;" onclick="window.location.href='project.html?id=${proj.id}'">
<div class="project-img">
<span class="project-num">${(index + 1).toString().padStart(2, '0')}</span>
${imgContent}
</div>
<div class="project-body">
<div class="project-tags">
${tagsHtml}
</div>
<h3 class="project-title">${proj.title}</h3>
<p class="project-desc">${proj.short_description}</p>
<div class="project-media">
${renderMediaIcons(proj.media)}
</div>
</div>
</div>
`;
container.innerHTML += html;
});

// Re-run observer for new dynamic elements
document.querySelectorAll('.project-card').forEach(el => {
observer.observe(el);
// Give them a small timeout to animate in after being added
setTimeout(() => el.classList.add('visible'), 50);
});
}

// Call on load
document.addEventListener('DOMContentLoaded', fetchProjects);
