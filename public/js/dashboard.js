/* UniConnect — Student Dashboard */

let currentUnreadCount = 0;

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr) {
  const days = Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
  if (days <= 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} from ${url}`);
  return res.json();
}

function updateNotifBadge(count) {
  const chip = document.getElementById('notif-count-chip');
  const badge = document.getElementById('notif-badge');
  if (count > 0) {
    chip.textContent = count;
    chip.style.display = 'inline-flex';
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    chip.style.display = 'none';
    badge.style.display = 'none';
  }
}

// ── Renderers ─────────────────────────────────────────────────────────────────

function renderWelcome(student) {
  document.getElementById('student-name').textContent = student.name.split(' ')[0];
  document.getElementById('nav-student-name').textContent = student.name;
  document.getElementById('student-course').textContent = student.course;
  document.getElementById('student-uni').textContent = student.university;
  document.getElementById('feed-subtitle').textContent =
    `Showing results for ${student.unitCodes.join(', ')}`;
  document.getElementById('unit-tags').innerHTML =
    student.unitCodes.map(u => `<span class="unit-chip">${u}</span>`).join('');
}

function renderFeed({ resources, events, forums }) {
  // Resources
  document.getElementById('feed-res').innerHTML = resources.length
    ? resources.map(r => `
        <div class="feed-item">
          <span class="feed-icon blue"><i class="material-icons white-text tiny">description</i></span>
          <div class="feed-item-body">
            <div class="feed-item-title">${r.title}</div>
            <div class="feed-item-meta">
              <span class="unit-chip small">${r.unitCode}</span>
              <span class="type-badge ${r.type}">${r.type.replace('-', ' ')}</span>
              · By ${r.uploadedBy?.name || 'Unknown'} · ${r.downloadCount} downloads
            </div>
          </div>
          <span class="feed-item-time">${timeAgo(r.createdAt)}</span>
        </div>`).join('')
    : '<p class="empty-state">No resources found for your units yet.</p>';

  // Events
  document.getElementById('feed-events').innerHTML = events.length
    ? events.map(e => `
        <div class="feed-item">
          <span class="feed-icon orange"><i class="material-icons white-text tiny">event</i></span>
          <div class="feed-item-body">
            <div class="feed-item-title">${e.title}</div>
            <div class="feed-item-meta">
              <span class="type-badge ${e.type}">${e.type}</span>
              · ${formatDate(e.date)} · ${e.location || 'Online'}
              · ${e.registeredStudents?.length || 0} registered
            </div>
          </div>
          <span class="feed-item-time">${daysUntil(e.date)}</span>
        </div>`).join('')
    : '<p class="empty-state">No upcoming events matching your interests.</p>';

  // Forums
  document.getElementById('feed-forums').innerHTML = forums.length
    ? forums.map(f => `
        <div class="feed-item">
          <span class="feed-icon green"><i class="material-icons white-text tiny">forum</i></span>
          <div class="feed-item-body">
            <div class="feed-item-title">${f.title}</div>
            <div class="feed-item-meta">
              ${f.unitCode ? `<span class="unit-chip small">${f.unitCode}</span> ·` : ''}
              By ${f.author?.name || 'Unknown'}
              · ${f.replies} replies · ${f.likes} likes
            </div>
          </div>
          <span class="feed-item-time">${timeAgo(f.createdAt)}</span>
        </div>`).join('')
    : '<p class="empty-state">No forum discussions found for your units.</p>';
}

function renderSuggestions(suggestions) {
  const container = document.getElementById('networking-grid');
  if (!suggestions.length) {
    container.innerHTML = '<p class="col s12 empty-state">No suggestions right now — try expanding your interests!</p>';
    return;
  }

  container.innerHTML = suggestions.map(s => `
    <div class="col s12 m6 l4">
      <div class="student-card">
        <div class="student-card-avatar">${s.name.charAt(0)}</div>
        <div class="student-card-name">${s.name}</div>
        <div class="student-card-course">${s.course} · Year ${s.year}</div>
        ${s.commonUnits.length ? `
          <div class="student-card-chips">
            ${s.commonUnits.map(u => `<span class="unit-chip accent">${u}</span>`).join('')}
          </div>` : ''}
        <div class="student-card-chips">
          ${s.skills.slice(0, 3).map(sk => `<span class="skill-chip">${sk}</span>`).join('')}
        </div>
        <div class="student-card-score">
          <i class="material-icons tiny">star</i>
          ${s.commonUnits.length} shared unit${s.commonUnits.length !== 1 ? 's' : ''}
          ${s.commonSkills.length ? ` · ${s.commonSkills.length} shared skill${s.commonSkills.length !== 1 ? 's' : ''}` : ''}
        </div>
        <button class="btn btn-small connect-btn waves-effect waves-light"
                data-id="${s._id}"
                onclick="connectWith('${s._id}', this)">
          <i class="material-icons left tiny">person_add</i>Connect
        </button>
      </div>
    </div>`).join('');
}

const NOTIF_META = {
  message:            { icon: 'email',          color: 'blue'   },
  forum_reply:        { icon: 'forum',           color: 'green'  },
  connection_request: { icon: 'person_add',      color: 'purple' },
  event:              { icon: 'event',           color: 'orange' },
  resource:           { icon: 'description',     color: 'teal'   }
};

function renderNotifications(notifications, unreadCount) {
  updateNotifBadge(unreadCount);
  currentUnreadCount = unreadCount;

  const container = document.getElementById('notifications-list');
  if (!notifications.length) {
    container.innerHTML = '<p class="empty-state center-align" style="margin-top:20px">No notifications</p>';
    return;
  }

  container.innerHTML = notifications.map(n => {
    const { icon, color } = NOTIF_META[n.type] || { icon: 'notifications', color: 'grey' };
    return `
      <div class="notif-item${n.read ? '' : ' unread'}" onclick="markRead('${n._id}', this)">
        <span class="notif-icon ${color}">
          <i class="material-icons white-text" style="font-size:14px;line-height:28px">${icon}</i>
        </span>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
        ${!n.read ? '<span class="notif-unread-dot"></span>' : ''}
      </div>`;
  }).join('');
}

function renderTracker(data) {
  document.getElementById('stat-resources').textContent   = data.stats.resourcesUploaded;
  document.getElementById('stat-events').textContent      = data.stats.eventsRegistered;
  document.getElementById('stat-posts').textContent       = data.stats.forumPosts;
  document.getElementById('stat-connections').textContent = data.stats.connections;
  document.getElementById('stat-downloads').textContent   = data.stats.totalDownloads;

  // My Resources
  document.getElementById('tracker-resources').innerHTML = data.myResources.length
    ? data.myResources.map(r => `
        <div class="tracker-item">
          <i class="material-icons blue-text">description</i>
          <div>
            <div class="tracker-item-title">${r.title}</div>
            <div class="tracker-item-meta">${r.unitCode} · ${r.type.replace('-', ' ')} · ${r.downloadCount} downloads</div>
          </div>
          <span class="tracker-item-time">${timeAgo(r.createdAt)}</span>
        </div>`).join('')
    : '<p class="empty-state">You haven\'t uploaded any resources yet.</p>';

  // My Events
  document.getElementById('tracker-events').innerHTML = data.myEvents.length
    ? data.myEvents.map(e => {
        const upcoming = new Date(e.date) >= new Date();
        return `
          <div class="tracker-item">
            <i class="material-icons ${upcoming ? 'orange' : 'grey'}-text">event</i>
            <div>
              <div class="tracker-item-title">${e.title}</div>
              <div class="tracker-item-meta">
                ${formatDate(e.date)} · ${e.location || 'Online'}
                <span class="${upcoming ? 'upcoming-chip' : 'past-chip'}">${upcoming ? 'Upcoming' : 'Past'}</span>
              </div>
            </div>
            <span class="tracker-item-time">${upcoming ? daysUntil(e.date) : 'Done'}</span>
          </div>`;
      }).join('')
    : '<p class="empty-state">You haven\'t registered for any events yet.</p>';

  // Forum Activity
  document.getElementById('tracker-forums').innerHTML = data.myPosts.length
    ? data.myPosts.map(p => `
        <div class="tracker-item">
          <i class="material-icons green-text">forum</i>
          <div>
            <div class="tracker-item-title">${p.title}</div>
            <div class="tracker-item-meta">${p.unitCode || 'General'} · ${p.replies} replies · ${p.likes} likes · ${p.views} views</div>
          </div>
          <span class="tracker-item-time">${timeAgo(p.createdAt)}</span>
        </div>`).join('')
    : '<p class="empty-state">You haven\'t posted in any forums yet.</p>';

  // Network
  document.getElementById('tracker-network').innerHTML = `
    <div class="network-empty-state">
      <i class="material-icons" style="font-size:3rem;color:var(--accent)">groups</i>
      <div class="stat-number" style="font-size:2rem">${data.stats.connections}</div>
      <p style="color:var(--muted)">Connections on UniConnect</p>
      <p style="font-size:.85rem;color:var(--muted)">Use Smart Networking Suggestions above to grow your academic network.</p>
    </div>`;
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function connectWith(targetId, btn) {
  btn.disabled = true;
  btn.innerHTML = '<i class="material-icons left tiny">hourglass_empty</i>Connecting...';
  try {
    await fetch(`/api/dashboard/connect/${targetId}`, { method: 'POST' });
    btn.innerHTML = '<i class="material-icons left tiny">check</i>Connected';
    btn.classList.replace('connect-btn', 'connected-btn');
    M.toast({ html: 'Connection request sent!', classes: 'green darken-1' });
  } catch {
    btn.disabled = false;
    btn.innerHTML = '<i class="material-icons left tiny">person_add</i>Connect';
    M.toast({ html: 'Could not connect. Try again.', classes: 'red darken-1' });
  }
}

async function markRead(notifId, el) {
  if (!el.classList.contains('unread')) return;
  await fetch(`/api/dashboard/notifications/${notifId}/read`, { method: 'PUT' });
  el.classList.remove('unread');
  el.querySelector('.notif-unread-dot')?.remove();
  currentUnreadCount = Math.max(0, currentUnreadCount - 1);
  updateNotifBadge(currentUnreadCount);
}

async function markAllRead() {
  await fetch('/api/dashboard/notifications/read-all', { method: 'PUT' });
  document.querySelectorAll('.notif-item.unread').forEach(el => {
    el.classList.remove('unread');
    el.querySelector('.notif-unread-dot')?.remove();
  });
  currentUnreadCount = 0;
  updateNotifBadge(0);
}

// ── Polling ───────────────────────────────────────────────────────────────────

function startPolling() {
  setInterval(async () => {
    try {
      const { count } = await fetchJSON('/api/dashboard/notifications/unread-count');
      if (count > currentUnreadCount) {
        const diff = count - currentUnreadCount;
        M.toast({ html: `${diff} new notification${diff > 1 ? 's' : ''}!`, classes: 'blue darken-1' });
        const data = await fetchJSON('/api/dashboard/notifications');
        renderNotifications(data.notifications, data.unreadCount);
      } else {
        updateNotifBadge(count);
        currentUnreadCount = count;
      }
    } catch {
      // silent — network hiccup, retry next tick
    }
  }, 15000);
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
  M.Tabs.init(document.getElementById('feed-tabs-el'));
  M.Tabs.init(document.getElementById('tracker-tabs-el'));

  document.getElementById('mark-all-read-btn').addEventListener('click', markAllRead);

  try {
    const [feedData, suggestionsData, notifData, trackerData] = await Promise.all([
      fetchJSON('/api/dashboard/feed'),
      fetchJSON('/api/dashboard/suggestions'),
      fetchJSON('/api/dashboard/notifications'),
      fetchJSON('/api/dashboard/tracker')
    ]);

    renderWelcome(feedData.student);
    renderFeed(feedData.feed);
    renderSuggestions(suggestionsData.suggestions);
    renderNotifications(notifData.notifications, notifData.unreadCount);
    renderTracker(trackerData);

    startPolling();
  } catch (err) {
    const banner = document.getElementById('error-banner');
    banner.style.display = 'flex';
    console.error('Dashboard load error:', err);
  }
});
