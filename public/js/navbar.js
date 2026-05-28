(function () {
  fetch('/partials/navbar.html')
    .then(r => {
      if (!r.ok) throw new Error('Navbar fetch failed');
      return r.text();
    })
    .then(html => {
      document.getElementById('navbar-placeholder').innerHTML = html;

      //  Active link highlight 
      const page = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('#nav-links a, #mobile-menu a').forEach(a => {
        const href = a.getAttribute('href') || '';
        // Skip hash/anchor links (e.g. #features, #how) — these are
        // page-section scrollers and should never get the active highlight.
        if (!href || href.includes('#')) return;
        if (href.split('/').pop() === page) {
          a.closest('li').classList.add('active');
        }
      });

      //  Auth 
      const token       = localStorage.getItem('uc_token');
      const displayName = localStorage.getItem('uc_display_name') || '...';

      const authItem   = document.getElementById('nav-auth-item');
      const logoutItem = document.getElementById('nav-logout-item');
      const mobileItem = document.getElementById('mobile-auth-item');

      //  Notification icon — only visible when logged in 
      const notifWrap = document.querySelector('.nav-notif-wrap');
      if (notifWrap) notifWrap.style.display = token ? '' : 'none';

      //  Contextual link visibility 
      function setNavItem(desktopId, mobileId, visible) {
        const d = document.getElementById(desktopId);
        const m = document.getElementById(mobileId);
        const v = visible ? '' : 'none';
        if (d) d.style.display = v;
        if (m) m.style.display = v;
      }

      const onIndex = (page === 'index.html' || page === '');

      // Dashboard — hidden on index page (irrelevant until logged in)
      setNavItem('nav-dashboard', 'mob-dashboard', !onIndex);

      // Features & How it works — only useful for logged-out visitors on index
      // Hide them once the user is authenticated
      setNavItem('nav-features', 'mob-features', !token);
      setNavItem('nav-how',      'mob-how',      !token);

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
          window.location.href = '/index.html';
        }

        document.getElementById('logout-btn').addEventListener('click', doLogout);
        const mobileLogout = document.getElementById('logout-btn-mobile');
        if (mobileLogout) mobileLogout.addEventListener('click', doLogout);

      } else {
        authItem.innerHTML = `<a class="btn btn-primary" href="/login.html">Login</a>`;
        logoutItem.style.display = 'none';
        mobileItem.innerHTML = `<a class="btn btn-primary" href="/login.html">Login</a>`;
      }

      //  Materialize sidenav
      M.Sidenav.init(document.querySelectorAll('.sidenav'));
    })
    .catch(err => console.error('Navbar error:', err));
})();