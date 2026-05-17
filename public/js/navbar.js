(function () {
  fetch('/partials/navbar.html')
    .then(r => {
      if (!r.ok) throw new Error('Navbar fetch failed');
      return r.text();
    })
    .then(html => {
      document.getElementById('navbar-placeholder').innerHTML = html;

      // ── Active link highlight ──────────────────────────────────────
      const page = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('#nav-links a, #mobile-menu a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href && href.split('/').pop().split('#')[0] === page) {
          a.closest('li').classList.add('active');
        }
      });

      // ── Auth ───────────────────────────────────────────────────────
      const token       = localStorage.getItem('uc_token');
      const displayName = localStorage.getItem('uc_display_name') || '...';

      const authItem   = document.getElementById('nav-auth-item');
      const logoutItem = document.getElementById('nav-logout-item');
      const mobileItem = document.getElementById('mobile-auth-item');

      if (token) {
        authItem.innerHTML = `
          <a class="btn"
             style="background:var(--accent)!important;color:white;pointer-events:none"
             id="nav-student-name">${displayName}</a>
        `;

        logoutItem.style.display = '';
        logoutItem.innerHTML = `
          <a class="btn btn-flat" id="logout-btn"
             style="color:rgba(255,255,255,0.8);
                    border:1px solid rgba(255,255,255,0.3);
                    border-radius:8px;
                    cursor:pointer;">Logout</a>
        `;

        mobileItem.innerHTML = `<a>${displayName}</a>`;

        function doLogout() {
          localStorage.removeItem('uc_token');
          localStorage.removeItem('uc_user');
          localStorage.removeItem('uc_display_name');
          window.location.href = '/login.html';
        }

        document.getElementById('logout-btn').addEventListener('click', doLogout);
        const mobileLogout = document.getElementById('logout-btn-mobile');
        if (mobileLogout) mobileLogout.addEventListener('click', doLogout);

      } else {
        authItem.innerHTML = `<a class="btn btn-primary" href="/login.html">Login</a>`;
        logoutItem.style.display = 'none';
        mobileItem.innerHTML = `<a class="btn btn-primary" href="/login.html">Login</a>`;
      }

      // ── Materialize sidenav ────────────────────────────────────────
      M.Sidenav.init(document.querySelectorAll('.sidenav'));
    })
    .catch(err => console.error('Navbar error:', err));
})();