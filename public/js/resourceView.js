async function fetchResource() {

  try {

    const params =
      new URLSearchParams(window.location.search);

    const id = params.get('id');

    const response =
      await fetch(`/api/resources/${id}`);

    const result = await response.json();

    const resource = result.data;

    renderResource(resource);

  } catch (err) {

    console.error(err);

    document.getElementById('resource-container')
      .innerHTML = `
        <div class="card-panel red lighten-4">
          Failed to load resource.
        </div>
      `;
  }
}


function renderResource(r) {

  const currentUserId =
    localStorage.getItem('studentId');

  const isOwner =
    r.uploadedBy === currentUserId;

  // =========================================
  // FILE / LINK DETECTION
  // =========================================

  const resourceLink =
    r.fileUrl || r.resourceUrl || '';

  const isPdf =
    resourceLink.toLowerCase().includes('.pdf');

  const isImage =
    resourceLink.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  // =========================================
  // DOWNLOAD / OPEN BUTTON
  // =========================================

  let actionButton = `
    <button class="btn-large grey" disabled>
      No Resource Available
    </button>
  `;

  if (resourceLink) {

    actionButton = `
      <a
        href="${resourceLink}"
        target="_blank"
        class="btn-large waves-effect waves-light">

        <i class="material-icons left">
          download
        </i>

        ${r.fileUrl ? 'Download Resource' : 'Open Resource'}

      </a>
    `;
  }

  // =========================================
  // PREVIEW SECTION
  // =========================================

  let previewSection = `
    <div class="resource-preview-section">
      <p>No preview available.</p>
    </div>
  `;

  // PDF preview
  if (isPdf) {

    previewSection = `
      <div class="resource-preview-section">

        <h4>Preview</h4>

        <iframe
          src="${resourceLink}"
          width="100%"
          height="800px"
          style="
            border:none;
            border-radius:16px;
            background:#fff;
          ">
        </iframe>

      </div>
    `;
  }

  // Image preview
  else if (isImage) {

    previewSection = `
      <div class="resource-preview-section">

        <h4>Preview</h4>

        <img
          src="${resourceLink}"
          alt="${r.title}"
          style="
            width:100%;
            border-radius:16px;
            margin-top:1rem;
          "
        >

      </div>
    `;
  }

  // External link preview
  else if (r.resourceUrl) {

    previewSection = `
      <div class="resource-preview-section">

        <h4>External Resource</h4>

        <p>
          This resource is hosted externally.
        </p>

        <a
          href="${r.resourceUrl}"
          target="_blank"
          class="btn waves-effect waves-light">

          <i class="material-icons left">
            open_in_new
          </i>

          Visit Link

        </a>

      </div>
    `;
  }

  // =========================================
  // HERO CONTENT
  // =========================================

  document.getElementById('resource-hero-content')
    .innerHTML = `

      <span class="tag">
        ${r.type}
      </span>

      <h1>
        ${r.title}
      </h1>

      <p>
        ${r.unit}
        ·
        ${r.institution}
        ·
        Uploaded by ${r.uploader}
      </p>
    `;

  // =========================================
  // MAIN CONTENT
  // =========================================

  document.getElementById('resource-container')
    .innerHTML = `

      <div class="resource-main-card">

        ${isOwner ? `

          <div
            style="
              display:flex;
              gap:12px;
              margin-bottom:2rem;
              flex-wrap:wrap;
            ">

            <button class="btn amber">
              <i class="material-icons left">edit</i>
              Edit
            </button>

            <button class="btn red">
              <i class="material-icons left">delete</i>
              Delete
            </button>

          </div>

        ` : ''}

        <div style="margin-bottom:2rem;">
          ${actionButton}
        </div>

        ${previewSection}

        <div class="resource-content-section">

          <h4>Description</h4>

          <p>
            ${r.desc}
          </p>

        </div>

        <div class="resource-content-section">

          <h4>Tags</h4>

          <div class="tag-list">

            ${(r.tags || []).map(tag => `

              <span class="tag-pill">
                #${tag}
              </span>

            `).join('')}

          </div>

        </div>

      </div>
    `;

  // =========================================
  // QUICK ACTIONS / STATS
  // =========================================

  document.getElementById('resource-stats')
    .innerHTML = `

      <div class="stat-row">
        <span>Upvotes</span>
        <strong id="upvote-count">${r.upvotes}</strong>
      </div>

      <div class="stat-row">
        <span>Downloads</span>
        <strong>${r.downloadCount}</strong>
      </div>

      <div class="stat-row">
        <span>Score</span>
        <strong>${r.score}</strong>
      </div>

      <div style="margin-top:2rem;">

        <button
          class="btn waves-effect waves-light"
          style="width:100%; margin-bottom:12px;"
          onclick="upvoteResource('${r._id}')">

          <i class="material-icons left">
            thumb_up
          </i>

          Upvote

        </button>

        <button
          class="btn red waves-effect waves-light"
          style="width:100%;"
          onclick="openReport('${r._id}','${(r.title || '').replace(/'/g, '&#39;')}')">

          <i class="material-icons left">
            flag
          </i>

          Report

        </button>

      </div>
    `;
}

// =========================================
// UPVOTE RESOURCE
// =========================================

async function upvoteResource(id) {

  try {

    const response = await fetch(
      `/api/resources/${id}/upvote`,
      {
        method: 'POST'
      }
    );

    const result = await response.json();

    if (result.success) {

      document.getElementById('upvote-count')
        .textContent = result.data.upvotes;

      M.toast({
        html: 'Resource upvoted!'
      });
    }

  } catch (err) {

    console.error(err);

    M.toast({
      html: 'Failed to upvote'
    });
  }
}

// =========================================
// REPORT POPUP
// =========================================

let _reportId = null;

function openReport(id, title) {

  _reportId = id;

  document.getElementById('rp-title')
    .textContent = `"${title}"`;

  document.getElementById('rp-msg').value = '';

  document.getElementById('rp-err').style.display = 'none';

  document.getElementById('report-popup')
    .style.display = 'flex';
}

function closeReport() {

  document.getElementById('report-popup')
    .style.display = 'none';
}

async function submitReport() {

  const msg =
    document.getElementById('rp-msg')
    .value
    .trim();

  const err =
    document.getElementById('rp-err');

  if (!msg) {

    err.textContent =
      'Please describe the issue.';

    err.style.display = 'block';

    return;
  }

  try {

    const response = await fetch(
      `/api/resources/${_reportId}/report`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          reason: msg
        })
      }
    );

    const result = await response.json();

    if (!result.success) {

      err.textContent =
        result.error || 'Failed to submit report';

      err.style.display = 'block';

      return;
    }

    closeReport();

    M.toast({
      html: 'Report submitted successfully'
    });

  } catch (error) {

    console.error(error);

    err.textContent =
      'Network error';

    err.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {

  M.AutoInit();

  fetchResource();
});

