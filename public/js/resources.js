// ==========================================
// RESOURCE DATA STATE
// ==========================================

let resources = [];

let state = {
  unit: '',
  type: '',
  uni: '',
  q: '',
  sort: 'score',
  page: 1,
  voted: new Set()
};

const PER_PAGE = 6;

// ==========================================
// RESOURCE TYPE ICONS
// ==========================================

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

// ==========================================
// FETCH RESOURCES FROM BACKEND
// ==========================================

async function fetchResources() {
  try {
    const response = await fetch('/api/resources');

    const result = await response.json();

    console.log(result.data);

    // Render resources here
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchResources();
});

// ==========================================
// FILTERING
// ==========================================

function filtered() {
  return resources
    .filter((r) => {
      if (state.unit && r.unit !== state.unit) return false;

      if (state.type && r.type !== state.type) return false;

      if (state.uni && r.institution !== state.uni) return false;

      if (state.q) {
        const q = state.q.toLowerCase();

        if (
          !r.title.toLowerCase().includes(q) &&
          !r.desc.toLowerCase().includes(q) &&
          !r.unit.toLowerCase().includes(q) &&
          !r.tags.join(' ').toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    })

    .sort((a, b) => {
      if (state.sort === 'upvotes') {
        return b.upvotes - a.upvotes;
      }

      if (state.sort === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      return b.score - a.score;
    });
}

// ==========================================
// SCORE UI HELPERS
// ==========================================

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

// ==========================================
// RENDER RESOURCE CARD
// ==========================================

function renderCard(resource) {
  const ti = TYPE_ICONS[resource.type] || TYPE_ICONS.Other;

  const voted = state.voted.has(resource._id);

  return `
    <div class="resource-card" onclick="openResource('${resource._id}')">

      <div class="resource-icon ${ti.cls}">
        <i class="material-icons">${ti.icon}</i>
      </div>

      <div class="resource-body">

        <div class="resource-title">
          ${resource.title}
        </div>

        <div class="resource-meta">
          <span class="unit-badge">${resource.unit}</span>

          <span class="type-badge type-${ti.cls}">
            ${resource.type}
          </span>

          <span class="sep">·</span>

          <span>${resource.institution}</span>
        </div>

        <p class="resource-desc">
          ${resource.desc}
        </p>

        <div class="tag-list">
          ${resource.tags
            .map((tag) => `<span class="tag-pill">#${tag}</span>`)
            .join('')}
        </div>

      </div>

      <div class="resource-right">

        <div class="score-badge ${scoreClass(resource.score)}">
          <i class="material-icons">
            ${scoreIcon(resource.score)}
          </i>

          ${resource.score}
        </div>

        <button
          class="upvote-btn ${voted ? 'voted' : ''}"
          onclick="event.stopPropagation(); toggleUpvote('${resource._id}', this)"
        >
          <i class="material-icons">arrow_upward</i>
          ${resource.upvotes}
        </button>

        <span class="institution-label">
          ${resource.uploader}
        </span>

      </div>

    </div>
  `;
}

// ==========================================
// MAIN RENDER
// ==========================================

function render() {
  const all = filtered();

  const total = all.length;

  const pages = Math.ceil(total / PER_PAGE);

  state.page = Math.min(state.page, pages || 1);

  const slice = all.slice(
    (state.page - 1) * PER_PAGE,
    state.page * PER_PAGE
  );

  document.getElementById('result-count').textContent = total;

  document.getElementById('resource-list').innerHTML =
    slice.map(renderCard).join('');

  document.getElementById('empty-state').style.display =
    total ? 'none' : 'block';

  renderPagination(pages);
}

// ==========================================
// PAGINATION
// ==========================================

function renderPagination(pages) {
  const pg = document.getElementById('pagination');

  if (pages <= 1) {
    pg.innerHTML = '';
    return;
  }

  let html = `
    <button
      class="page-btn"
      onclick="goPage(${state.page - 1})"
      ${state.page === 1 ? 'disabled' : ''}
    >
      <i class="material-icons" style="font-size:1rem;">
        chevron_left
      </i>
    </button>
  `;

  for (let i = 1; i <= pages; i++) {
    html += `
      <button
        class="page-btn ${i === state.page ? 'active' : ''}"
        onclick="goPage(${i})"
      >
        ${i}
      </button>
    `;
  }

  html += `
    <button
      class="page-btn"
      onclick="goPage(${state.page + 1})"
      ${state.page === pages ? 'disabled' : ''}
    >
      <i class="material-icons" style="font-size:1rem;">
        chevron_right
      </i>
    </button>
  `;

  pg.innerHTML = html;
}

function goPage(page) {
  state.page = page;

  render();

  window.scrollTo({
    top: 280,
    behavior: 'smooth'
  });
}

// ==========================================
// FILTER FUNCTIONS
// ==========================================

function setUnit(el, val) {
  document
    .querySelectorAll('#unit-chips .filter-chip')
    .forEach((chip) => chip.classList.remove('active'));

  el.classList.add('active');

  state.unit = val;

  state.page = 1;

  render();
}

function setType(el, val) {
  el.closest('.filter-chip-group')
    .querySelectorAll('.filter-chip')
    .forEach((chip) => chip.classList.remove('active'));

  el.classList.add('active');

  state.type = val;

  document.getElementById('filter-type').value = val;

  state.page = 1;

  render();
}

function setSort(el, val) {
  if (el) {
    el.closest('.filter-chip-group')
      .querySelectorAll('.filter-chip')
      .forEach((chip) => chip.classList.remove('active'));

    el.classList.add('active');
  }

  state.sort = val;

  document.getElementById('sort-inline').value = val;

  state.page = 1;

  render();
}

function applyFilters() {
  state.q = document
    .getElementById('search-input')
    .value
    .trim();

  state.type = document.getElementById('filter-type').value;

  state.uni = document.getElementById('filter-uni').value;

  state.page = 1;

  render();
}

// ==========================================
// SEARCH EVENT
// ==========================================

document
  .getElementById('search-input')
  .addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  });

// ==========================================
// UPVOTE
// ==========================================

function toggleUpvote(id, btn) {
  if (state.voted.has(id)) {
    state.voted.delete(id);
  } else {
    state.voted.add(id);
  }

  render();
}

// ==========================================
// OPEN RESOURCE
// ==========================================

function openResource(id) {
  console.log('Open resource:', id);
}

// ==========================================
// UPLOAD MODAL
// ==========================================

function switchMethod(method) {
  document
    .getElementById('tab-file')
    .classList.toggle('active', method === 'file');

  document
    .getElementById('tab-url')
    .classList.toggle('active', method === 'url');

  document.getElementById('panel-file').style.display =
    method === 'file' ? '' : 'none';

  document.getElementById('panel-url').style.display =
    method === 'url' ? '' : 'none';
}

// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  M.AutoInit();

  fetchResources();
});