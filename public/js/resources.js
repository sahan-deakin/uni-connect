let resources = [];

let state = {
  unit: '',
  type: '',
  uni: '',
  q: '',
  sort: 'score',
  page: 1
};

const PER_PAGE = 6;

const TYPE_ICONS = {
  Notes: {
    icon: 'description',
    cls: 'notes'
  },

  'Past Exam': {
    icon: 'quiz',
    cls: 'exam'
  },

  Slides: {
    icon: 'slideshow',
    cls: 'slides'
  },

  'Video Link': {
    icon: 'play_circle',
    cls: 'video'
  },

  Textbook: {
    icon: 'menu_book',
    cls: 'book'
  },

  Other: {
    icon: 'folder',
    cls: 'other'
  }
};

// ========================================
// FETCH RESOURCES FROM API
// ========================================

async function fetchResources() {
  try {
    const response = await fetch('/api/resources');

    const result = await response.json();

    resources = result.data;

    render();

  } catch (err) {
    console.error('Error fetching resources:', err);
  }
}

// ========================================
// FILTER RESOURCES
// ========================================

function filtered() {
  return resources.filter(r => {

    if (state.unit && r.unit !== state.unit) return false;

    if (state.type && r.type !== state.type) return false;

    if (state.uni && r.institution !== state.uni) return false;

    if (state.q) {
      const q = state.q.toLowerCase();

      if (
        !r.title.toLowerCase().includes(q) &&
        !r.desc.toLowerCase().includes(q) &&
        !r.unit.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    return true;

  }).sort((a, b) => {

    if (state.sort === 'upvotes') {
      return b.upvotes - a.upvotes;
    }

    if (state.sort === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return b.score - a.score;
  });
}

// ========================================
// SCORE HELPERS
// ========================================

function scoreClass(score) {
  if (score >= 80) return 'high';

  if (score >= 65) return 'medium';

  return 'low';
}

function scoreIcon(score) {
  if (score >= 80) return 'trending_up';

  if (score >= 65) return 'thumbs_up_down';

  return 'trending_down';
}

// ========================================
// RENDER RESOURCE CARD
// ========================================

function renderCard(r) {

  const ti = TYPE_ICONS[r.type] || TYPE_ICONS.Other;

  return `
    <div class="resource-card"
    onclick="openResource('${r._id}')">

      <div class="resource-icon ${ti.cls}">
        <i class="material-icons">${ti.icon}</i>
      </div>

      <div class="resource-body">

        <div class="resource-title">
          ${r.title}
        </div>

        <div class="resource-meta">

          <span class="unit-badge">${r.unit}</span>

          <span class="type-badge type-${ti.cls}">
            ${r.type}
          </span>

          <span class="sep">·</span>

          <span>${r.institution}</span>

        </div>

        <p class="resource-desc">
          ${r.desc}
        </p>

        <div class="tag-list">
          ${r.tags.map(tag =>
            `<span class="tag-pill">#${tag}</span>`
          ).join('')}
        </div>

      </div>

      <div class="resource-right">

        <div class="score-badge ${scoreClass(r.score)}">
          <i class="material-icons">
            ${scoreIcon(r.score)}
          </i>

          ${r.score}
        </div>

        <button class="upvote-btn">
          <i class="material-icons">arrow_upward</i>
          ${r.upvotes}
        </button>

        <span class="institution-label">
          ${r.uploader}
        </span>

      </div>

    </div>
  `;
}

// ========================================
// MAIN RENDER
// ========================================

function render() {

  const all = filtered();

  const total = all.length;

  document.getElementById('result-count').textContent = total;

  document.getElementById('resource-list').innerHTML =
    all.map(renderCard).join('');

  document.getElementById('empty-state').style.display =
    total ? 'none' : 'block';
}

function openResource(id) {

  window.location.href =
    `/resourceView.html?id=${id}`;
}


// ========================================
// FILTER FUNCTIONS
// ========================================

function applyFilters() {

  state.q = document
    .getElementById('search-input')
    .value
    .trim();

  state.type = document
    .getElementById('filter-type')
    .value;

  state.uni = document
    .getElementById('filter-uni')
    .value;

  render();
}

function setUnit(el, val) {

  document
    .querySelectorAll('#unit-chips .filter-chip')
    .forEach(c => c.classList.remove('active'));

  el.classList.add('active');

  state.unit = val;

  render();
}

function setType(el, val) {

  document
    .querySelectorAll('.filter-chip')
    .forEach(c => c.classList.remove('active'));

  el.classList.add('active');

  state.type = val;

  render();
}

function setSort(el, val) {

  state.sort = val;

  render();
}

// ========================================
// MODAL SWITCH
// ========================================

function switchMethod(m) {

  document
    .getElementById('tab-file')
    .classList.toggle('active', m === 'file');

  document
    .getElementById('tab-url')
    .classList.toggle('active', m === 'url');

  document.getElementById('panel-file').style.display =
    m === 'file' ? '' : 'none';

  document.getElementById('panel-url').style.display =
    m === 'url' ? '' : 'none';
}

// ========================================
// PAGE LOAD
// ========================================

document.addEventListener('DOMContentLoaded', () => {

  M.AutoInit();

  fetchResources();
});

async function submitResource() {

  try {

    const title =
      document.getElementById('m-title').value.trim();

    const unit =
      document.getElementById('m-unit').value.trim();

    const type =
      document.getElementById('m-type').value;

    const desc =
      document.getElementById('m-desc').value.trim();

    const institution =
      document.getElementById('m-institution').value;

    const tags = document
      .getElementById('m-tags')
      .value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    // File input
    const fileInput =
      document.getElementById('resource-file');

    const file =
      fileInput ? fileInput.files[0] : null;

    // URL input
    const url =
      document.getElementById('m-url')
      ? document.getElementById('m-url').value.trim()
      : '';

    // ================================
    // VALIDATION
    // ================================

    if (
      !title ||
      !unit ||
      !type ||
      !desc ||
      !institution
    ) {

      M.toast({
        html: 'Please complete all required fields'
      });

      return;
    }

    // Require either file OR URL
    if (!file && !url) {

      M.toast({
        html: 'Please upload a file or provide a URL'
      });

      return;
    }

    // ================================
    // BUILD FORM DATA
    // ================================

    const formData = new FormData();

    formData.append('title', title);

    formData.append('unit', unit);

    formData.append('type', type);

    formData.append('desc', desc);

    formData.append('institution', institution);

    formData.append('uploader', 'Anonymous Student');

    formData.append('tags', JSON.stringify(tags));

    formData.append('upvotes', 0);

    formData.append('score', 70);

    formData.append('downloadCount', 0);

    // Append uploaded file
    if (file) {

      formData.append('resourceFile', file);
    }

    // Append URL if provided
    if (url) {

      formData.append('resourceUrl', url);
    }

    // ================================
    // SEND REQUEST
    // ================================

    const response = await fetch('/api/resources', {

      method: 'POST',

      body: formData
    });

    const result = await response.json();

    // ================================
    // HANDLE ERRORS
    // ================================

    if (!result.success) {

      throw new Error(
        result.message || 'Upload failed'
      );
    }

    // ================================
    // SUCCESS
    // ================================

    M.toast({
      html: 'Resource uploaded successfully!'
    });

    // Close modal
    const modal =
      M.Modal.getInstance(
        document.getElementById('upload-modal')
      );

    modal.close();

    // ================================
    // RESET FORM
    // ================================

    document.getElementById('m-title').value = '';

    document.getElementById('m-unit').value = '';

    document.getElementById('m-desc').value = '';

    document.getElementById('m-tags').value = '';

    document.getElementById('m-url').value = '';

    if (fileInput) {
      fileInput.value = '';
    }

    // Reset Materialize fields
    M.updateTextFields();

    // Refresh resource list
    fetchResources();

  } catch (err) {

    console.error(err);

    M.toast({
      html: err.message || 'Upload failed'
    });
  }
}

// ── Report popup ──
let _reportId = null;

function openReport(id, title, e) {
  e.stopPropagation();
  _reportId = id;
  document.getElementById('rp-title').textContent = `"${title}"`;
  document.getElementById('rp-msg').value = '';
  document.getElementById('rp-err').style.display = 'none';
  document.getElementById('report-popup').style.display = 'flex';
  setTimeout(() => document.getElementById('rp-msg').focus(), 50);
}

function closeReport() {
  document.getElementById('report-popup').style.display = 'none';
}

document.getElementById('report-popup').addEventListener('click', e => { if(e.target===e.currentTarget) closeReport(); });
document.addEventListener('keydown', e => { if(e.key==='Escape') closeReport(); });

async function submitReport() {
  const msg = document.getElementById('rp-msg').value.trim();
  const err = document.getElementById('rp-err');
  if (!msg) { err.textContent='Please describe the issue.'; err.style.display='block'; return; }
  try {
    const res = await fetch(`/api/resources/${_reportId}/report`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({reason:msg})
    });
    if (!res.ok) { const d=await res.json(); err.textContent=d.error||'Failed.'; err.style.display='block'; return; }
    closeReport();
    M.toast({html:'✅ Report submitted — our team will review it shortly.',classes:'rounded',displayLength:4000});
  } catch { err.textContent='Network error. Try again.'; err.style.display='block'; }
}