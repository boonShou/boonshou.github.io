console.log("admin.js loading...");
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
document.getElementById('admin-login').style.display = 'block';
document.getElementById('admin-dashboard').style.display = 'none';
document.getElementById('logout-btn').style.display = 'none';
document.getElementById('admin-password').value = '';
}

async function loadAdminProjects() {
const loader = document.getElementById('admin-loader');
const table = document.getElementById('projects-table');
loader.style.display = 'block';
table.style.display = 'none';

try {
console.log("Fetching projects from:", SCRIPT_URL);
const response = await fetch(SCRIPT_URL);
console.log("Response received:", response.status);
const data = await response.json();
if (data.status === 'success') {
currentProjects = data.data;
renderTable();
} else {
alert("Error: " + data.message);
}
} catch (err) {
alert("Failed to fetch projects.");
} finally {
loader.style.display = 'none';
table.style.display = 'table';
}
}

function renderTable() {
const tbody = document.getElementById('projects-tbody');
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

function addImageRow(url = '') {
const container = document.getElementById('additional-images-container');
const row = document.createElement('div');
row.className = 'media-link-row';
row.innerHTML = `
<input type="text" class="additional-image-url" placeholder="e.g. images/project-gallery1.jpg" value="${url}">
<button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">&times;</button>
`;
container.appendChild(row);
}

function addMediaRow(type = '', url = '') {
const container = document.getElementById('media-links-container');
const row = document.createElement('div');
row.className = 'media-link-row';
row.innerHTML = `
<select class="media-type">
<option value="github" ${type === 'github' ? 'selected' : ''}>GitHub</option>
<option value="demo" ${type === 'demo' ? 'selected' : ''}>Live Demo</option>
<option value="youtube" ${type === 'youtube' ? 'selected' : ''}>YouTube</option>
<option value="linkedin" ${type === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
<option value="website" ${type === 'website' ? 'selected' : ''}>Website</option>
<option value="other" ${type === 'other' ? 'selected' : ''}>Other</option>
</select>
<input type="text" class="media-url" placeholder="https://..." value="${url}">
<button type="button" class="remove-link-btn" onclick="this.parentElement.remove()">&times;</button>
`;
container.appendChild(row);
}

function openModal() {
document.getElementById('project-modal').style.display = 'block';
document.getElementById('modal-title').innerText = 'Add Project';
document.getElementById('proj-id').value = '';
document.getElementById('proj-title').value = '';
document.getElementById('proj-role').value = '';
document.getElementById('proj-short').value = '';
document.getElementById('proj-detailed').value = '';
document.getElementById('proj-tags').value = '';
document.getElementById('proj-image').value = '';
document.getElementById('additional-images-container').innerHTML = '';
document.getElementById('media-links-container').innerHTML = '';
}

function closeModal() {
document.getElementById('project-modal').style.display = 'none';
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

// Populate additional images
if (proj.additional_images) {
const paths = proj.additional_images.split('|');
paths.forEach(path => addImageRow(path));
}

// Populate media links
if (proj.media) {
const pairs = proj.media.split('|');
pairs.forEach(pair => {
const index = pair.indexOf(':');
if (index > -1) {
const type = pair.substring(0, index);
const url = pair.substring(index + 1);
addMediaRow(type, url);
}
});
}
}

async function saveProject() {
const btn = document.getElementById('save-btn');
btn.innerText = 'Saving...';
btn.disabled = true;

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
additional_images: Array.from(document.querySelectorAll('.additional-image-url')).map(input => input.value).filter(x => x).join('|'),
media: Array.from(document.querySelectorAll('.media-link-row')).map(row => {
const type = row.querySelector('.media-type').value;
const url = row.querySelector('.media-url').value;
return url ? `${type}:${url}` : null;
}).filter(x => x).join('|')
};

try {
const response = await fetch(SCRIPT_URL, {
method: 'POST',
body: JSON.stringify(payload),
headers: {
'Content-Type': 'text/plain;charset=utf-8',
}
});
const result = await response.json();
if (result.status === 'success') {
closeModal();
loadAdminProjects(); // reload
} else {
alert("Error: " + result.message);
}
} catch (err) {
alert("Failed to save.");
} finally {
btn.innerText = 'Save Project';
btn.disabled = false;
}
}

async function deleteProject(id) {
if (!confirm("Are you sure you want to delete this project?")) return;

try {
const response = await fetch(SCRIPT_URL, {
method: 'POST',
body: JSON.stringify({ password: adminPassword, action: 'delete', id: id }),
headers: {
'Content-Type': 'text/plain;charset=utf-8',
}
});
const result = await response.json();
if (result.status === 'success') {
loadAdminProjects(); // reload
} else {
alert("Error: " + result.message);
}
} catch (err) {
alert("Failed to delete.");
}
}
