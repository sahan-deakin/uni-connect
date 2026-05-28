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

  // MAIN CONTENT
  document.getElementById('resource-container')
    .innerHTML = `

      <div class="resource-main-card">

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