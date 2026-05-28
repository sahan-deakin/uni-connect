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

    const title = document.getElementById('m-title').value;

    const unit = document.getElementById('m-unit').value;

    const type = document.getElementById('m-type').value;

    const desc = document.getElementById('m-desc').value;

    // Basic validation
    if (!title || !unit || !type || !desc) {

      M.toast({
        html: 'Please fill in all required fields'
      });

      return;
    }

    // Build new resource object
    
    const tags = document
    .getElementById('m-tags')
    .value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag);

    const resourceData = {

    title,

    unit,

    type,

    desc,

    institution: document.getElementById('m-institution').value,

    uploader: 'Anonymous Student',

    tags,

    upvotes: 0,

    score: 70,

    downloadCount: 0
    };

    // Send POST request
    const response = await fetch('/api/resources', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(resourceData)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Success toast
    M.toast({
      html: 'Resource uploaded successfully!'
    });

    // Close modal
    const modal = M.Modal.getInstance(
      document.getElementById('upload-modal')
    );

    modal.close();

    // Reset form
    document.getElementById('m-title').value = '';
    document.getElementById('m-unit').value = '';
    document.getElementById('m-desc').value = '';

    // Reload resources
    fetchResources();

  } catch (err) {

    console.error(err);

    M.toast({
      html: 'Upload failed'
    });
  }
}