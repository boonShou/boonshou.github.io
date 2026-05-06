// --- ADMIN LOGIC (Obfuscated) ---
const _u = 'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6Ti16S09Cenc1STk2RmlQeWVpeWtfTHpNOEVOOVNrRjZ3TVpZWExsMTM2YVhKX2J2bXI1eVFraU9uOEZGZ3pNSUUvZXhlYw==';
const SCRIPT_URL = atob(_u);

let adminPassword = '';
let currentProjects = [];

function login() {
  const pwd = document.getElementById('admin-password').value;
  if (!pwd) return;
  adminPassword = pwd;
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
  document.getElementById('logout-btn').style.display = 'block';
  loadAdminProjects();
}

function logout() {
  adminPassword = '';
  location.reload();
}

async function loadAdminProjects() {
  const loader = document.getElementById('admin-loader');
  const table = document.getElementById('projects-table');
  if (loader) loader.style.display = 'block';
  if (table) table.style.display = 'none';

  try {
    const response = await fetch(SCRIPT_URL);
    const result = await response.json();
    if (result.status === 'success') {
      currentProjects = result.data;
      renderAdminTable();
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    alert("Failed to fetch projects. Check your SCRIPT_URL and deployment.");
  } finally {
    if (loader) loader.style.display = 'none';
    if (table) table.style.display = 'table';
  }
}

function renderAdminTable() {
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  currentProjects.forEach(proj => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${proj.id}</td>
      <td>${proj.title}</td>
      <td>${proj.tags}</td>
      <td>
        <button class="action-btn edit" onclick="editProject('${proj.id}')"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" onclick="deleteProject('${proj.id}')"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- MODAL HELPERS ---
function addMediaRow(type = 'github', url = '', poster = '') {
  const container = document.getElementById('media-links-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'media-row';
  div.innerHTML = `
    <select class="m-type">
      <option value="github" ${type === 'github' ? 'selected' : ''}>GitHub</option>
      <option value="demo" ${type === 'demo' ? 'selected' : ''}>Live Demo</option>
      <option value="youtube" ${type === 'youtube' ? 'selected' : ''}>YouTube</option>
      <option value="linkedin" ${type === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
      <option value="website" ${type === 'website' ? 'selected' : ''}>Website</option>
      <option value="pdf" ${type === 'pdf' ? 'selected' : ''}>PDF Document</option>
      <option value="poster" ${type === 'poster' ? 'selected' : ''}>Poster (PDF/Image)</option>
      <option value="other" ${type === 'other' ? 'selected' : ''}>Other</option>
    </select>
    <input type="text" class="m-url" placeholder="Link URL (https://...)" value="${url}">
    <input type="text" class="m-poster" placeholder="Poster Image URL (Optional)" value="${poster}">
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(div);
}

function addImageRow(url = '') {
  const container = document.getElementById('gallery-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'image-row';
  div.innerHTML = `
    <input type="text" class="g-url" placeholder="images/project-gallery1.jpg" value="${url}">
    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(div);
}

function openModal() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.style.display = 'block';
  document.getElementById('modal-title').innerText = 'Add Project';
  document.getElementById('proj-id').value = '';
  document.getElementById('project-form').reset();
  document.getElementById('media-links-container').innerHTML = '';
  document.getElementById('gallery-container').innerHTML = '';
}

function closeModal() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.style.display = 'none';
}

function editProject(id) {
  const proj = currentProjects.find(p => p.id == id);
  if (!proj) return;
  openModal();
  document.getElementById('modal-title').innerText = 'Edit Project';
  document.getElementById('proj-id').value = proj.id;
  document.getElementById('proj-title').value = proj.title;
  document.getElementById('proj-role').value = proj.role;
  document.getElementById('proj-short').value = proj.short_description;
  document.getElementById('proj-detailed').value = proj.detailed_description;
  document.getElementById('proj-tags').value = proj.tags;
  document.getElementById('proj-image').value = proj.image_url;

  if (proj.media) {
    proj.media.split('|').forEach(pair => {
      if (pair.includes(':::')) {
        const parts = pair.split(':::');
        addMediaRow(parts[0], parts[1], parts[2] || '');
      } else {
        const firstColonIndex = pair.indexOf(':');
        if (firstColonIndex !== -1) {
          const t = pair.substring(0, firstColonIndex);
          const u = pair.substring(firstColonIndex + 1);
          addMediaRow(t, u);
        }
      }
    });
  }
  if (proj.additional_images) {
    proj.additional_images.split('|').forEach(url => addImageRow(url));
  }
}

async function saveProject() {
  const btn = document.getElementById('save-btn');
  const originalText = btn.innerText;
  btn.disabled = true;
  btn.innerText = 'Saving...';

  const id = document.getElementById('proj-id').value;
  const payload = {
    password: adminPassword,
    action: id ? 'edit' : 'add',
    id: id,
    title: document.getElementById('proj-title').value,
    role: document.getElementById('proj-role').value,
    short_description: document.getElementById('proj-short').value,
    detailed_description: document.getElementById('proj-detailed').value,
    tags: document.getElementById('proj-tags').value,
    image_url: document.getElementById('proj-image').value,
    media: Array.from(document.querySelectorAll('.media-row')).map(r => {
      const t = r.querySelector('.m-type').value;
      const u = r.querySelector('.m-url').value;
      const p = r.querySelector('.m-poster').value;
      return u ? `${t}:::${u}:::${p}` : null;
    }).filter(x => x).join('|'),
    additional_images: Array.from(document.querySelectorAll('.g-url')).map(i => i.value).filter(x => x).join('|')
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    const res = await response.json();
    if (res.status === 'success') {
      closeModal();
      loadAdminProjects();
    } else {
      alert("Error: " + res.message);
    }
  } catch (err) {
    alert("Failed to save. Check your connection.");
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
}

async function deleteProject(id) {
  if (!confirm("Are you sure you want to delete this project?")) return;
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ password: adminPassword, action: 'delete', id: id }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
    const res = await response.json();
    if (res.status === 'success') {
      loadAdminProjects();
    } else {
      alert("Error: " + res.message);
    }
  } catch (err) {
    alert("Failed to delete.");
  }
}

// Hamburger Toggle for Admin
function toggleNav() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.toggle('open');
}
