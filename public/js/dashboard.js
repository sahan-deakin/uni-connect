
// Auth
function getToken() {
  return localStorage.getItem('uc_token');
}

function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('uc_token');
  localStorage.removeItem('uc_user');
  window.location.href = '/login.html';
}

// Redirect to login if no token
const token = getToken();
if (!token) {
  window.location.href = '/login.html';
}

const currentUser = parseJWT(token) || {};

let currentUnreadCount = 0;

//Helpers
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

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    logout();
    return;
  }

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

// Renderers 

function renderWelcome(student) {
  document.getElementById('student-name').textContent = student.name.split(' ')[0];
  document.getElementById('nav-student-name').textContent = student.name;
  document.getElementById('student-course').textContent = student.course;
  document.getElementById('student-uni').textContent = student.university;
  document.getElementById('feed-subtitle').textContent =
    `Showing results for ${student.unitCodes.join(', ') || 'your enrolled units'}`;
  document.getElementById('unit-tags').innerHTML =
    student.unitCodes.map(u => `<span class="unit-chip">${u}</span>`).join('');

  localStorage.setItem('uc_display_name', student.name);
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

const NOTIF_META = {
  message:            { icon: 'email',          color: 'blue'   },
  forum_reply:        { icon: 'forum',           color: 'green'  },
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
  document.getElementById('stat-downloads').textContent   = data.stats.totalDownloads;

  // My Resources
  document.getElementById('tracker-resources').innerHTML = data.myResources.length
    ? data.myResources.map(r => `
        <div class="tracker-item" id="res-${r._id}">
          <i class="material-icons blue-text">description</i>
          <div>
            <div class="tracker-item-title">${r.title}</div>
            <div class="tracker-item-meta">${r.unitCode} · ${r.type.replace('-', ' ')} · ${r.downloadCount} downloads</div>
          </div>
          <div class="tracker-item-actions">
            <span class="tracker-item-time">${timeAgo(r.createdAt)}</span>
            <button class="tracker-action-btn red-text" onclick="deleteResource('${r._id}')" title="Delete">
              <i class="material-icons tiny">delete</i>
            </button>
          </div>
        </div>`).join('')
    : '<p class="empty-state">You haven\'t uploaded any resources yet.</p>';

  // My Events
  document.getElementById('tracker-events').innerHTML = data.myEvents.length
    ? data.myEvents.map(e => {
        const upcoming = new Date(e.date) >= new Date();
        const editBtn = `<button class="tracker-action-btn blue-text" onclick="openEditEvent(${JSON.stringify(e).replace(/"/g, '&quot;')})" title="Edit"><i class="material-icons tiny">edit</i></button>`;
        const deleteLabel = e.isCreator ? 'Delete event' : 'Unregister';
        return `
          <div class="tracker-item" id="evt-${e._id}">
            <i class="material-icons ${upcoming ? 'orange' : 'grey'}-text">event</i>
            <div>
              <div class="tracker-item-title">${e.title}</div>
              <div class="tracker-item-meta">
                ${formatDate(e.date)} · ${e.location || 'Online'}
                <span class="${upcoming ? 'upcoming-chip' : 'past-chip'}">${upcoming ? 'Upcoming' : 'Past'}</span>
              </div>
            </div>
            <div class="tracker-item-actions">
              <span class="tracker-item-time">${upcoming ? daysUntil(e.date) : 'Done'}</span>
              ${editBtn}
              <button class="tracker-action-btn red-text" onclick="deleteEvent('${e._id}', ${e.isCreator})" title="${deleteLabel}">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </div>`;
      }).join('')
    : '<p class="empty-state">You haven\'t registered for any events yet.</p>';

  // Forum Activity
  document.getElementById('tracker-forums').innerHTML = data.myPosts.length
    ? data.myPosts.map(p => `
        <div class="tracker-item" id="post-${p._id}">
          <i class="material-icons green-text">forum</i>
          <div>
            <div class="tracker-item-title">${p.title}</div>
            <div class="tracker-item-meta">${p.unitCode || 'General'} · ${p.replies} replies · ${p.likes} likes · ${p.views} views</div>
          </div>
          <div class="tracker-item-actions">
            <span class="tracker-item-time">${timeAgo(p.createdAt)}</span>
            <button class="tracker-action-btn red-text" onclick="deleteForumPost('${p._id}')" title="Delete">
              <i class="material-icons tiny">delete</i>
            </button>
          </div>
        </div>`).join('')
    : '<p class="empty-state">You haven\'t posted in any forums yet.</p>';
}

//Actions

async function markRead(notifId, el) {
  if (!el.classList.contains('unread')) return;
  await fetchJSON(`/api/dashboard/notifications/${notifId}/read`, { method: 'PUT' });
  el.classList.remove('unread');
  el.querySelector('.notif-unread-dot')?.remove();
  currentUnreadCount = Math.max(0, currentUnreadCount - 1);
  updateNotifBadge(currentUnreadCount);
}

async function markAllRead() {
  await fetchJSON('/api/dashboard/notifications/read-all', { method: 'PUT' });
  document.querySelectorAll('.notif-item.unread').forEach(el => {
    el.classList.remove('unread');
    el.querySelector('.notif-unread-dot')?.remove();
  });
  currentUnreadCount = 0;
  updateNotifBadge(0);
}

// Student item actions

function showConfirm({ title, msg, label, icon = 'delete', onConfirm }) {
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-msg').textContent   = msg;
  document.getElementById('confirm-modal-label').textContent = label;
  document.getElementById('confirm-modal-icon').textContent  = icon;
  const okBtn = document.getElementById('confirm-modal-ok');
  okBtn.onclick = () => {
    M.Modal.getInstance(document.getElementById('confirm-modal')).close();
    onConfirm();
  };
  M.Modal.getInstance(document.getElementById('confirm-modal')).open();
}

function deleteResource(id) {
  showConfirm({
    title: 'Delete Resource',
    msg:   'This will permanently remove the resource. This cannot be undone.',
    label: 'Delete',
    onConfirm: async () => {
      try {
        await fetchJSON(`/api/student/resources/${id}`, { method: 'DELETE' });
        document.getElementById(`res-${id}`)?.remove();
        M.toast({ html: 'Resource deleted', classes: 'teal darken-1' });
      } catch {
        M.toast({ html: 'Failed to delete resource', classes: 'red darken-1' });
      }
    }
  });
}

function deleteForumPost(id) {
  showConfirm({
    title: 'Delete Post',
    msg:   'This will permanently remove your forum post. This cannot be undone.',
    label: 'Delete',
    onConfirm: async () => {
      try {
        await fetchJSON(`/api/student/forum-posts/${id}`, { method: 'DELETE' });
        document.getElementById(`post-${id}`)?.remove();
        M.toast({ html: 'Post deleted', classes: 'teal darken-1' });
      } catch {
        M.toast({ html: 'Failed to delete post', classes: 'red darken-1' });
      }
    }
  });
}

function deleteEvent(id, isCreator) {
  showConfirm({
    title: isCreator ? 'Delete Event' : 'Unregister from Event',
    msg:   isCreator
      ? 'This will permanently delete the event for all registered students.'
      : 'You will be removed from this event\'s registration list.',
    label: isCreator ? 'Delete' : 'Unregister',
    icon:  isCreator ? 'delete' : 'event_busy',
    onConfirm: async () => {
      try {
        const result = await fetchJSON(`/api/student/events/${id}`, { method: 'DELETE' });
        document.getElementById(`evt-${id}`)?.remove();
        const msg = result.action === 'deleted' ? 'Event deleted' : 'Unregistered from event';
        M.toast({ html: msg, classes: 'teal darken-1' });
      } catch {
        M.toast({ html: 'Failed to remove event', classes: 'red darken-1' });
      }
    }
  });
}

function openEditEvent(e) {
  document.getElementById('edit-event-id').value        = e._id;
  document.getElementById('edit-event-title').value     = e.title || '';
  document.getElementById('edit-event-desc').value      = e.description || '';
  document.getElementById('edit-event-date').value      = e.date ? e.date.slice(0, 16) : '';
  document.getElementById('edit-event-location').value  = e.location || '';
  document.getElementById('edit-event-type').value      = e.type || '';
  M.FormSelect.init(document.getElementById('edit-event-type'));
  M.updateTextFields();
  M.Modal.getInstance(document.getElementById('edit-event-modal')).open();
}

async function submitEditEvent() {
  const id = document.getElementById('edit-event-id').value;
  const body = {
    title:       document.getElementById('edit-event-title').value.trim(),
    description: document.getElementById('edit-event-desc').value.trim(),
    date:        document.getElementById('edit-event-date').value,
    location:    document.getElementById('edit-event-location').value.trim(),
    type:        document.getElementById('edit-event-type').value
  };

  if (!body.title || !body.date) {
    M.toast({ html: 'Title and date are required', classes: 'orange darken-2' });
    return;
  }

  try {
    await fetchJSON(`/api/student/events/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });
    M.Modal.getInstance(document.getElementById('edit-event-modal')).close();
    M.toast({ html: 'Event updated — pending re-approval', classes: 'teal darken-1' });
    const trackerData = await fetchJSON('/api/dashboard/tracker');
    if (trackerData) renderTracker(trackerData);
  } catch {
    M.toast({ html: 'Failed to update event', classes: 'red darken-1' });
  }
}

//Real-time socket

function connectSocket() {
  const socket = io();
  const dot = document.querySelector('.socket-dot');

  socket.on('connect', () => {
    // Use user ID from JWT as session room identifier
    socket.emit('join', currentUser.userId);
    dot.classList.replace('disconnected', 'connected');
    document.querySelector('.socket-indicator').title = 'Notification socket connected';
  });

  socket.on('new-notification', async (notif) => {
    M.toast({ html: `<i class="material-icons left tiny">notifications</i>${notif.title}`, classes: 'blue darken-1' });
    try {
      const data = await fetchJSON('/api/dashboard/notifications');
      renderNotifications(data.notifications, data.unreadCount);
    } catch { 
      console.error('Failed to refresh notifications after socket update');
     }
  });

  socket.on('disconnect', () => {
    dot.classList.replace('connected', 'disconnected');
    document.querySelector('.socket-indicator').title = 'Disconnected - reconnecting...';
  });
}

// Init 

document.addEventListener('DOMContentLoaded', async () => {
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
  M.Tabs.init(document.getElementById('feed-tabs-el'));
  M.Tabs.init(document.getElementById('tracker-tabs-el'));
  M.Modal.init(document.querySelectorAll('.modal'));
  M.FormSelect.init(document.querySelectorAll('select'));

  document.getElementById('mark-all-read-btn').addEventListener('click', markAllRead);
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('logout-btn-mobile')?.addEventListener('click', logout);

  try {
    const [feedData, notifData, trackerData] = await Promise.all([
      fetchJSON('/api/dashboard/feed'),
      fetchJSON('/api/dashboard/notifications'),
      fetchJSON('/api/dashboard/tracker')
    ]);

    if (!feedData || !notifData || !trackerData) return; // redirected to login

    renderWelcome(feedData.student);
    renderFeed(feedData.feed);
    renderNotifications(notifData.notifications, notifData.unreadCount);
    renderTracker(trackerData);

    connectSocket();
  } catch (err) {
    const banner = document.getElementById('error-banner');
    banner.style.display = 'flex';
    console.error('Dashboard load error:', err);
  }
});
