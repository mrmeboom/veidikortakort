// ─────────────────────────────────────────────
// MAP SETUP
// ─────────────────────────────────────────────
const map = L.map('map', {
  center: [64.9, -19.0],
  zoom: 6,
  zoomControl: true
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let state = {
  region: 'all',
  nightFishing: false,
  fullDay: false,
  camping: false,
  allYear: false,
  month: null,
  activeId: null
};

// ─────────────────────────────────────────────
// MARKERS
// ─────────────────────────────────────────────
const markers = {};

function createMarkerIcon(loc, active = false, dimmed = false) {
  const isSpecial = loc.nightFishing && loc.fullDay;
  const color = dimmed ? '#a3adbc' : active ? '#c62a27' : (isSpecial ? '#313b4d' : '#3972b9');
  const scale = active ? 1.25 : 1;
  return L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
    html: `
      <div style="
        width:${28*scale}px;height:${28*scale}px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2.5px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        cursor:pointer;
        transition:all 0.15s;
        opacity:${dimmed ? 0.4 : 1};
        position:relative;
      "></div>`
  });
}

LOCATIONS.forEach(loc => {
  const marker = L.marker([loc.lat, loc.lng], {
    icon: createMarkerIcon(loc),
    title: loc.name
  });

  marker.on('click', () => {
    selectLocation(loc.id);
  });

  marker.bindTooltip(loc.name, {
    permanent: false,
    direction: 'top',
    offset: [0, -32],
    className: 'vk-tooltip'
  });

  marker.addTo(map);
  markers[loc.id] = marker;
});

// ─────────────────────────────────────────────
// FILTERING
// ─────────────────────────────────────────────
function filterLocations() {
  return LOCATIONS.filter(loc => {
    if (state.region !== 'all' && loc.region !== state.region) return false;
    if (state.nightFishing && !loc.nightFishing) return false;
    if (state.fullDay && !loc.fullDay) return false;
    if (state.camping && !loc.camping) return false;
    if (state.allYear && !loc.allYear) return false;
    if (state.month !== null) {
      if (loc.allYear) return true;
      if (state.month < loc.mStart || state.month > loc.mEnd) return false;
    }
    return true;
  });
}

function updateMap() {
  const visible = filterLocations();
  const visibleIds = new Set(visible.map(l => l.id));

  LOCATIONS.forEach(loc => {
    const isDimmed = !visibleIds.has(loc.id);
    const isActive = loc.id === state.activeId;
    markers[loc.id].setIcon(createMarkerIcon(loc, isActive, isDimmed));
  });

  const empty = document.getElementById('emptyOverlay');
  empty.classList.toggle('show', visible.length === 0);
}

// ─────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────
function selectLocation(id) {
  const loc = LOCATIONS.find(l => l.id === id);
  if (!loc) return;

  state.activeId = id;
  updateMap();
  map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 8), { duration: 0.8 });

  // Build badges
  let badges = '';
  if (loc.fullDay) badges += `<span class="badge badge-24h">🌙 24h veiðar</span>`;
  else if (loc.nightFishing) badges += `<span class="badge badge-night">🌙 Næturveiðar</span>`;
  if (loc.camping) badges += `<span class="badge badge-camping">⛺ Tjaldstæði</span>`;
  if (loc.allYear) badges += `<span class="badge badge-allyear">📅 Opið árið</span>`;
  if (loc.flyOnly) badges += `<span class="badge badge-flyonly">🪰 Fluga eingöngu</span>`;
  if (loc.fourByFour) badges += `<span class="badge badge-4x4">🚙 4x4 eingöngu</span>`;

  document.getElementById('detailInner').innerHTML = `
    <div class="detail-hero">
      <button class="detail-close" onclick="closeDetail()">✕</button>
      <div class="detail-region-badge">${loc.region}</div>
      <div class="detail-name">${loc.name}</div>
      <div class="coords-text">${loc.lat.toFixed(4)}°N, ${Math.abs(loc.lng).toFixed(4)}°W</div>
      ${badges ? `<div class="detail-badges">${badges}</div>` : ''}
    </div>

    <div class="detail-grid">
      <div class="info-card">
        <div class="label">Daglegur veiðitími</div>
        <div class="value">${loc.hours}</div>
      </div>
      <div class="info-card">
        <div class="label">Veiðitímabil</div>
        <div class="value">${loc.seasonText}</div>
      </div>
      ${loc.fishSpecies ? `
      <div class="info-card full">
        <div class="label">Fisktegundir</div>
        <div class="value">${loc.fishSpecies}</div>
      </div>` : ''}
      ${loc.bestTime ? `
      <div class="info-card full">
        <div class="label">Besti veiðitíminn</div>
        <div class="value">${loc.bestTime}</div>
      </div>` : ''}
      ${loc.legalBaits ? `
      <div class="info-card full">
        <div class="label">Lögleg agn</div>
        <div class="value">${loc.legalBaits}</div>
      </div>` : ''}
      ${loc.distance ? `
      <div class="info-card">
        <div class="label">Fjarlægð frá RVK</div>
        <div class="value">${loc.distance}</div>
      </div>` : ''}
      ${loc.sizeDepth ? `
      <div class="info-card">
        <div class="label">Stærð/Dýpt</div>
        <div class="value">${loc.sizeDepth}</div>
      </div>` : ''}
    </div>

    <div class="detail-section">
      <h4>Um svæðið</h4>
      <p>${loc.description}</p>
    </div>

    <div class="detail-section">
      <h4>Yfirlit</h4>
      <div class="detail-grid" style="margin-bottom:0">
        <div class="info-card">
          <div class="label">Næturveiðar</div>
          <div class="value" style="color:${loc.nightFishing ? 'var(--green-accent)' : 'var(--text-muted)'}">
            ${loc.nightFishing ? '✓ Já' : '✗ Nei'}
          </div>
        </div>
        <div class="info-card">
          <div class="label">Sólarhringur</div>
          <div class="value" style="color:${loc.fullDay ? 'var(--green-accent)' : 'var(--text-muted)'}">
            ${loc.fullDay ? '✓ Já' : '✗ Nei'}
          </div>
        </div>
        <div class="info-card">
          <div class="label">Tjaldstæði</div>
          <div class="value" style="color:${loc.camping ? 'var(--green-accent)' : 'var(--text-muted)'}">
            ${loc.camping ? '✓ Já' : '✗ Nei'}
          </div>
        </div>
        <div class="info-card">
          <div class="label">Opið árið</div>
          <div class="value" style="color:${loc.allYear ? 'var(--green-accent)' : 'var(--text-muted)'}">
            ${loc.allYear ? '✓ Já' : '✗ Nei'}
          </div>
        </div>
      </div>
    </div>

    <a href="${loc.url}" target="_blank" class="detail-link">
      Sjá fulla síðu á veidikortid.is →
    </a>
  `;

  document.getElementById('detailPanel').classList.add('open');
}

function closeDetail() {
  state.activeId = null;
  document.getElementById('detailPanel').classList.remove('open');
  updateMap();
}

// ─────────────────────────────────────────────
// UI CONTROLS
// ─────────────────────────────────────────────

// URL parameter handling
function updateURL() {
  const params = new URLSearchParams();
  if (state.region !== 'all') params.set('region', state.region);
  if (state.nightFishing) params.set('nightFishing', 'true');
  if (state.fullDay) params.set('fullDay', 'true');
  if (state.camping) params.set('camping', 'true');
  if (state.allYear) params.set('allYear', 'true');
  if (state.month !== null) params.set('month', state.month);
  const newURL = params.toString() ? '?' + params.toString() : window.location.pathname;
  window.history.replaceState({}, '', newURL);
}

function loadURLParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('region')) {
    state.region = params.get('region');
    const pill = document.querySelector(`.pill[data-region="${state.region}"]`);
    if (pill) {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    }
  }
  if (params.has('nightFishing')) {
    state.nightFishing = params.get('nightFishing') === 'true';
    document.getElementById('toggleNight').checked = state.nightFishing;
  }
  if (params.has('fullDay')) {
    state.fullDay = params.get('fullDay') === 'true';
    document.getElementById('toggle24h').checked = state.fullDay;
  }
  if (params.has('camping')) {
    state.camping = params.get('camping') === 'true';
    document.getElementById('toggleCamping').checked = state.camping;
  }
  if (params.has('allYear')) {
    state.allYear = params.get('allYear') === 'true';
    document.getElementById('toggleAllYear').checked = state.allYear;
  }
  if (params.has('month')) {
    state.month = parseInt(params.get('month'));
    const btn = document.querySelector(`.month-btn[data-month="${state.month}"]`);
    if (btn) {
      document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  }
}

// Load URL parameters on page load
loadURLParams();

// Debounce helper
let debounceTimer;
function debounceUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateMap();
    updateURL();
  }, 100);
}

// Region pills
document.getElementById('regionPills').addEventListener('click', e => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  state.region = pill.dataset.region;
  debounceUpdate();
});

// Toggles
document.getElementById('toggleNight').addEventListener('change', e => {
  state.nightFishing = e.target.checked;
  if (e.target.checked) {
    document.getElementById('toggle24h').checked = false;
    state.fullDay = false;
  }
  debounceUpdate();
});
document.getElementById('toggle24h').addEventListener('change', e => {
  state.fullDay = e.target.checked;
  if (e.target.checked) {
    document.getElementById('toggleNight').checked = false;
    state.nightFishing = false;
  }
  debounceUpdate();
});
document.getElementById('toggleCamping').addEventListener('change', e => {
  state.camping = e.target.checked;
  debounceUpdate();
});
document.getElementById('toggleAllYear').addEventListener('change', e => {
  state.allYear = e.target.checked;
  debounceUpdate();
});

// Month buttons
document.getElementById('monthBtns').addEventListener('click', e => {
  const btn = e.target.closest('.month-btn');
  if (!btn) return;
  const m = parseInt(btn.dataset.month);
  if (state.month === m) {
    state.month = null;
    btn.classList.remove('active');
  } else {
    document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.month = m;
  }
  debounceUpdate();
});

// Reset
document.getElementById('resetBtn').addEventListener('click', () => {
  state = { region: 'all', nightFishing: false, fullDay: false, camping: false, allYear: false, month: null, activeId: state.activeId };
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  document.querySelector('.pill[data-region="all"]').classList.add('active');
  ['toggleNight','toggle24h','toggleCamping','toggleAllYear'].forEach(id => document.getElementById(id).checked = false);
  document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
  updateMap();
});

// Tooltip styling
const style = document.createElement('style');
style.textContent = `.vk-tooltip { background: #313b4d; color: white; border: none; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); } .vk-tooltip::before { display: none; }`;
document.head.appendChild(style);

// Language selector
const langBtn = document.getElementById('langBtn');
const langDropdown = document.getElementById('langDropdown');

langBtn.addEventListener('click', () => {
  langDropdown.classList.toggle('show');
});

document.querySelectorAll('.lang-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
    option.classList.add('active');
    const flag = option.querySelector('.lang-flag').textContent;
    const code = option.querySelector('.lang-code').textContent;
    langBtn.querySelector('.lang-flag').textContent = flag;
    langBtn.querySelector('.lang-code').textContent = code;
    langDropdown.classList.remove('show');
  });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.lang-selector')) {
    langDropdown.classList.remove('show');
  }
});

// Initial render
updateMap();
