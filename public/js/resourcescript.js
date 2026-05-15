//Demo data for Resources (since backend is not done)
const RESOURCES = [
  { id:1,  title:'Data Structures & Algorithms — Complete Notes', unit:'SIT221', type:'Notes',     desc:'Comprehensive week-by-week notes covering arrays, linked lists, trees, graphs, sorting, and complexity analysis. Includes diagrams for every data structure.', tags:['week1-6','sorting','graphs'], upvotes:48, score:92, institution:'Deakin',    uploader:'Alex M.',   time:'2d ago' },
  { id:2,  title:'OOP Final Exam 2023 with Worked Solutions',     unit:'SIT232', type:'Past Exam', desc:'Full past exam paper with complete model answers. Covers inheritance, polymorphism, interfaces, and design patterns. Great for exam revision.', tags:['oop','inheritance','exam-prep'], upvotes:39, score:87, institution:'Deakin',    uploader:'Jamie T.',  time:'5d ago' },
  { id:3,  title:'Computer Networks Cheat Sheet',                  unit:'SIT202', type:'Notes',     desc:'One-page summary of OSI model, TCP/IP stack, subnetting, routing protocols, and common port numbers. Print-ready A4 format.', tags:['osi','tcp-ip','subnetting'], upvotes:31, score:84, institution:'Monash',    uploader:'Sam K.',    time:'1w ago' },
  { id:4,  title:'Machine Learning Lecture Slides — All Weeks',   unit:'SIT374', type:'Slides',    desc:'Full set of 12 weeks of ML lecture slides covering supervised, unsupervised, and reinforcement learning. Includes code examples in Python.', tags:['ml','python','neural-nets'], upvotes:27, score:80, institution:'Deakin',    uploader:'Priya S.',  time:'1w ago' },
  { id:5,  title:'Cybersecurity Fundamentals — Study Guide',       unit:'SIT715', type:'Notes',     desc:'Detailed study guide covering cryptography, network security, threat modelling, vulnerability assessment, and incident response frameworks.', tags:['crypto','owasp','threats'], upvotes:22, score:76, institution:'RMIT',      uploader:'Chris L.',  time:'2w ago' },
  { id:6,  title:'Database Systems — ER Diagrams & SQL Notes',    unit:'SIT225', type:'Notes',     desc:'Full notes on relational modelling, ER diagram notation, normalisation (1NF–3NF), and SQL query optimisation with real examples.', tags:['sql','normalisation','er-diagrams'], upvotes:19, score:74, institution:'Melbourne', uploader:'Dana W.',   time:'2w ago' },
  { id:7,  title:'Algorithms Mid-Semester Practice Questions',     unit:'SIT221', type:'Past Exam', desc:'30 practice questions on time complexity, recursion, dynamic programming, and graph traversal with full worked answers for each.', tags:['complexity','dp','graphs'], upvotes:33, score:88, institution:'Deakin',    uploader:'Alex M.',   time:'3d ago' },
  { id:8,  title:'Introduction to React — Video Series Link',      unit:'SIT374', type:'Video Link',desc:'Curated playlist of 15 short videos covering React fundamentals, hooks, state management, and deployment. Ideal for complete beginners.', tags:['react','hooks','frontend'], upvotes:15, score:68, institution:'Swinburne',  uploader:'Mei L.',    time:'3w ago' },
  { id:9,  title:'Networks Lab Manual — Weeks 1 to 6',            unit:'SIT202', type:'Notes',     desc:'Step-by-step lab instructions for Wireshark captures, packet analysis, routing table configuration, and VLAN setup exercises.', tags:['wireshark','vlan','labs'], upvotes:11, score:62, institution:'La Trobe',  uploader:'Tom H.',    time:'3w ago' },
  { id:10, title:'Software Engineering — Agile & Scrum Guide',     unit:'SIT374', type:'Notes',     desc:'Practical guide to Agile methodologies, sprint planning, Scrum ceremonies, user story writing, and retrospective techniques.', tags:['agile','scrum','planning'], upvotes:25, score:79, institution:'Monash',    uploader:'Anna B.',   time:'4d ago' },
  { id:11, title:'OOP Design Patterns — Slides & Examples',        unit:'SIT232', type:'Slides',    desc:'Beautifully formatted slides covering all 23 GoF design patterns with Java code examples and UML diagrams for each pattern.', tags:['design-patterns','gof','java'], upvotes:17, score:71, institution:'RMIT',      uploader:'Kai P.',    time:'10d ago' },
  { id:12, title:'Intro to Security — OWASP Top 10 Summary',      unit:'SIT715', type:'Textbook',  desc:'Concise summary of each OWASP Top 10 vulnerability category with real-world examples, attack vectors, and recommended mitigations.', tags:['owasp','xss','injection'], upvotes:20, score:75, institution:'Melbourne', uploader:'Rach D.',   time:'1w ago' },
];


//Map each resource type to a Materials Icon and css class for UI
const TYPE_ICONS = {
  'Notes':     { icon:'description', cls:'notes'  },
  'Past Exam': { icon:'quiz',        cls:'exam'   },
  'Slides':    { icon:'slideshow',   cls:'slides' },
  'Video Link':{ icon:'play_circle', cls:'video'  },
  'Textbook':  { icon:'menu_book',   cls:'book'   },
  'Other':     { icon:'folder',      cls:'other'  },
};

//Set state to hold the current state of the page 
let state = { unit:'', type:'', uni:'', q:'', sort:'score', page:1, voted:new Set() };

// Number of resources per page for pagination
const PER_PAGE = 6;

function filtered() {
  return RESOURCES.filter(r => {
    if (state.unit && r.unit !== state.unit) return false;
    if (state.type && r.type !== state.type) return false;
    if (state.uni  && r.institution !== state.uni) return false;
    if (state.q) {
      const q = state.q.toLowerCase();
      if (!r.title.toLowerCase().includes(q) &&
          !r.desc.toLowerCase().includes(q)  &&
          !r.unit.toLowerCase().includes(q)  &&
          !r.tags.join(' ').includes(q)) return false;
    }
    return true;
  }).sort((a,b) => {
    if (state.sort === 'newest')  return RESOURCES.indexOf(a) > RESOURCES.indexOf(b) ? 1 : -1;
    if (state.sort === 'upvotes') return b.upvotes - a.upvotes;
    return b.score - a.score;
  });
}

function scoreClass(s) { return s >= 80 ? 'high' : s >= 65 ? 'medium' : 'low'; }

function scoreIcon(s)  { return s >= 80 ? 'trending_up' : s >= 65 ? 'thumbs_up_down' : 'trending_down'; }

function renderCard(r) {
  const ti = TYPE_ICONS[r.type] || TYPE_ICONS['Other'];
  const voted = state.voted.has(r.id);
  return `
  <div class="resource-card" onclick="openResource(${r.id})">
    <div class="resource-icon ${ti.cls}">
      <i class="material-icons">${ti.icon}</i>
    </div>
    <div class="resource-body">
      <div class="resource-title">${r.title}</div>
      <div class="resource-meta">
        <span class="unit-badge">${r.unit}</span>
        <span class="type-badge type-${ti.cls}">${r.type}</span>
        <span class="sep">·</span>
        <span>${r.institution}</span>
        <span class="sep">·</span>
        <span>${r.time}</span>
      </div>
      <p class="resource-desc">${r.desc}</p>
      <div class="tag-list">
        ${r.tags.map(t=>`<span class="tag-pill">#${t}</span>`).join('')}
      </div>
    </div>
    <div class="resource-right">
      <div class="score-badge ${scoreClass(r.score)}">
        <i class="material-icons">${scoreIcon(r.score)}</i>${r.score}
      </div>
      <button class="upvote-btn ${voted?'voted':''}"
              onclick="event.stopPropagation();toggleUpvote(${r.id},this)">
        <i class="material-icons">arrow_upward</i>${r.upvotes}
      </button>
      <span class="institution-label">${r.uploader}</span>
    </div>
  </div>`;
}

function render() {
  const all  = filtered();
  const total = all.length;
  const pages = Math.ceil(total / PER_PAGE);
  state.page  = Math.min(state.page, pages || 1);
  const slice = all.slice((state.page-1)*PER_PAGE, state.page*PER_PAGE);

  document.getElementById('result-count').textContent = total;
  document.getElementById('resource-list').innerHTML = slice.map(renderCard).join('');
  document.getElementById('empty-state').style.display = total ? 'none' : 'block';

  // Pagination
  const pg = document.getElementById('pagination');
  if (pages <= 1) { pg.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="goPage(${state.page-1})" ${state.page===1?'disabled':''}>
    <i class="material-icons" style="font-size:1rem;">chevron_left</i></button>`;
  for (let i=1;i<=pages;i++) html += `<button class="page-btn ${i===state.page?'active':''}" onclick="goPage(${i})">${i}</button>`;
  html += `<button class="page-btn" onclick="goPage(${state.page+1})" ${state.page===pages?'disabled':''}>
    <i class="material-icons" style="font-size:1rem;">chevron_right</i></button>`;
  pg.innerHTML = html;
}

function goPage(p) { state.page = p; render(); window.scrollTo({top:280,behavior:'smooth'}); }

function setUnit(el, val) {
  document.querySelectorAll('#unit-chips .filter-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  state.unit = val; state.page = 1; render();
}

function setType(el, val) {
  el.closest('.filter-chip-group').querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  state.type = val;
  document.getElementById('filter-type').value = val;
  state.page = 1; render();
}

function setSort(el, val) {
  if (el) {
    el.closest('.filter-chip-group').querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
  }
  state.sort = val;
  document.getElementById('sort-inline').value = val;
  state.page = 1; render();
}


//Display upload-modal when upload buttong is clicked (modal-trigger)
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  render();
});

//Switch between Upload by File and Upload by URL tabs
function switchMethod(m) {
  document.getElementById('tab-file').classList.toggle('active', m==='file');
  document.getElementById('tab-url').classList.toggle('active',  m==='url');
  document.getElementById('panel-file').style.display = m==='file' ? '' : 'none';
  document.getElementById('panel-url').style.display  = m==='url'  ? '' : 'none';
}

//Apply filter based on user's selection
 function applyFilters() {
  state.q    = document.getElementById('search-input').value.trim();
  state.type = document.getElementById('filter-type').value;
  state.uni  = document.getElementById('filter-uni').value;
  state.page = 1; render();
}