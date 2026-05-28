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

    const downloadButton = r.fileUrl

  ? `
      <div style="margin-bottom: 2rem;">

        <a
          href="http://localhost:3000${r.fileUrl}"
          target="_blank"
          class="btn-large waves-effect waves-light">

          <i class="material-icons left">
            download
          </i>

          Download Resource

        </a>

      </div>
    `

  : `
      <button
        class="btn-large grey"
        disabled>

        No File Available

      </button>
    `;

  const previewSection = r.fileUrl

  ? `
      <div class="resource-preview-section">

        <h4>Preview</h4>

        <div class="pdf-preview-wrapper">

          <embed
            src="${r.fileUrl}"
            type="application/pdf"
            width="100%"
            height="800px"
            class="pdf-preview">

        </div>

      </div>
    `

  : `
      <div class="resource-preview-section">

        <p>No preview available.</p>

      </div>
    `;

  // HERO CONTENT
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

  const currentUserId =
  localStorage.getItem('studentId');

  const isOwner =
  r.uploadedBy === currentUserId;

  // MAIN CONTENT
  document.getElementById('resource-container')
    .innerHTML = `

      <div class="resource-main-card">

      ${isOwner

      ? `
          <div class="owner-actions">

            <button class="btn amber">
              Edit Resource
            </button>

            <button class="btn red">
              Delete Resource
            </button>

          </div>
        `

      : ''
    }

       ${downloadButton}

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

            ${r.tags.map(tag => `
              <span class="tag-pill">
                #${tag}
              </span>
            `).join('')}

          </div>

        </div>

      </div>
    `;

  // STATS
  document.getElementById('resource-stats')
    .innerHTML = `

      <div class="stat-row">
        <span>Upvotes</span>
        <strong>${r.upvotes}</strong>
      </div>

      <div class="stat-row">
        <span>Downloads</span>
        <strong>${r.downloadCount}</strong>
      </div>

      <div class="stat-row">
        <span>Score</span>
        <strong>${r.score}</strong>
      </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {

  M.AutoInit();

  fetchResource();
});

