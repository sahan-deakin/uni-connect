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
      const token = localStorage.getItem('uc_token');
      const displayName = localStorage.getItem('uc_display_name') || '...';

      const authItem = document.getElementById('nav-auth-item');
      const logoutItem = document.getElementById('nav-logout-item');
      const mobileItem = document.getElementById('mobile-auth-item');

      if (token) {
        // Insert the name button
        authItem.innerHTML = `
          <a class="btn"
             style="background:var(--accent)!important;color:white;pointer-events:auto"
             id="nav-student-name">${displayName}</a>
        `;

        const nameBtn = document.getElementById('nav-student-name');
        const card = document.getElementById('nav-profile-card');
        const cardBody = document.getElementById('nav-profile-card-content');

        if (nameBtn && card && cardBody) {
          nameBtn.style.cursor = 'pointer';

          // ── OPEN PROFILE CARD + FETCH DATA ─────────────────────────────
          nameBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // prevent instant close

            const token = localStorage.getItem('uc_token');
            if (!token) return;

            try {
              const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': 'Bearer ' + token }
              });

              const data = await res.json();
              if (!res.ok) return;

              const user = data.user;
              const student = data.student;

              // Update navbar name
              nameBtn.innerText = student.name;
              localStorage.setItem('uc_display_name', student.name);

              // Update localStorage
              localStorage.setItem('uc_user', JSON.stringify({ ...user, ...student }));

              // Fill dropdown card
              cardBody.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
    <div style="
      width:42px; height:42px; border-radius:50%;
      background:#e2e8f0; display:flex; align-items:center; justify-content:center;
      font-weight:600; font-size:1rem; color:#475569;
    ">
      ${student.name?.[0] || '?'}
    </div>

    <div>
      <div style="font-size:1rem; font-weight:600; color:#0f172a;">
        ${student.name}
      </div>
      <div style="font-size:0.82rem; color:#64748b;">
        ${user.email}
      </div>
    </div>
  </div>

  <div style="margin-bottom:10px;">
    <div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8;">University</div>
    <div style="font-size:0.9rem; font-weight:500; color:#1e293b;">${student.university || '—'}</div>
  </div>

  <div style="margin-bottom:10px;">
    <div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8;">Course</div>
    <div style="font-size:0.9rem; font-weight:500; color:#1e293b;">${student.course || '—'}</div>
  </div>

  <div style="margin-bottom:10px;">
    <div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8;">Year</div>
    <div style="font-size:0.9rem; font-weight:500; color:#1e293b;">${student.year || '—'}</div>
  </div>
              `;

              // Toggle card visibility
              card.style.display =
                (card.style.display === 'none' || !card.style.display)
                  ? 'block'
                  : 'none';

            } catch (err) {
              console.error('Error fetching /api/auth/me:', err);
            }
          });

          // ── PREVENT CARD CLICK FROM CLOSING IT ─────────────────────────
          card.addEventListener('click', (e) => {
            e.stopPropagation();
          });

          // ── CLOSE CARD WHEN CLICKING OUTSIDE ───────────────────────────
          document.addEventListener('click', () => {
            card.style.display = 'none';
          });
        }

        // ── Logout ─────────────────────────────────────────────────────
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
