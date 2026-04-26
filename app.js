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

  document.getElementById('resultCount').textContent = visible.length + ' svæði';
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

// Region pills
document.getElementById('regionPills').addEventListener('click', e => {
  if (!e.target.matches('.pill')) return;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  e.target.classList.add('active');
  state.region = e.target.dataset.region;
  updateMap();
});

// Toggles
document.getElementById('toggleNight').addEventListener('change', e => {
  state.nightFishing = e.target.checked;
  if (e.target.checked) {
    document.getElementById('toggle24h').checked = false;
    state.fullDay = false;
  }
  updateMap();
});
document.getElementById('toggle24h').addEventListener('change', e => {
  state.fullDay = e.target.checked;
  if (e.target.checked) {
    document.getElementById('toggleNight').checked = false;
    state.nightFishing = false;
  }
  updateMap();
});
document.getElementById('toggleCamping').addEventListener('change', e => {
  state.camping = e.target.checked;
  updateMap();
});
document.getElementById('toggleAllYear').addEventListener('change', e => {
  state.allYear = e.target.checked;
  updateMap();
});

// Month buttons
document.getElementById('monthBtns').addEventListener('click', e => {
  if (!e.target.matches('.month-btn')) return;
  const m = parseInt(e.target.dataset.month);
  if (state.month === m) {
    state.month = null;
    e.target.classList.remove('active');
  } else {
    document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.month = m;
  }
  updateMap();
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

// Initial render
updateMap();
