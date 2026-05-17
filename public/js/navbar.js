(function () {
  fetch('/partials/navbar.html')
    .then(r => {
      if (!r.ok) throw new Error('Navbar fetch failed');
      return r.text();
    })
    .then(html => {
      document.getElementById('navbar-placeholder').innerHTML = html;

      // Active link highlight
      const page = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('#nav-links a, #mobile-menu a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href && href.split('/').pop().split('#')[0] === page) {
          a.closest('li').classList.add('active');
        }
      });

      // Student name from sessionStorage
      const user = JSON.parse(sessionStorage.getItem('uc_user') || 'null');
      if (user) {
        const nameEl   = document.getElementById('nav-student-name');
        const mobileEl = document.getElementById('mobile-student-name');
        if (nameEl)   nameEl.textContent   = user.name;
        if (mobileEl) mobileEl.textContent = user.name;
      }

      // Materialize sidenav
      M.Sidenav.init(document.querySelectorAll('.sidenav'));
    })
    .catch(err => console.error('Navbar error:', err));
})();