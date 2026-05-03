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
  activeId: null,
  showLabels: false
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
// LOCATION LABELS (Leaflet divIcon markers)
// ─────────────────────────────────────────────
const labelMarkers = {};

function createLabelIcon(name, isDimmed = false) {
  const dimmedClass = isDimmed ? 'location-label dimmed' : 'location-label';
  return L.divIcon({
    className: 'location-label-marker',
    html: `<div class="${dimmedClass}">${name}</div>`,
    iconSize: null, // Auto size
    iconAnchor: [0, 20] // Anchor at bottom-left of label
  });
}

function updateLabelPositions() {
  if (!state.showLabels) {
    // Hide all label markers
    Object.values(labelMarkers).forEach(marker => marker.setOpacity(0));
    return;
  }

  const mapSize = map.getSize();
  
  // Get visible locations for dimming
  const visible = filterLocations();
  const visibleIds = new Set(visible.map(l => l.id));
  
  // Calculate screen positions for all locations
  const labelData = LOCATIONS.map(loc => {
    const point = map.latLngToContainerPoint([loc.lat, loc.lng]);
    const originalPoint = map.latLngToContainerPoint([loc.lat, loc.lng]);
    // Use only first word of name
    const firstWord = loc.name.split(' ')[0];
    return {
      id: loc.id,
      name: firstWord,
      lat: loc.lat,
      lng: loc.lng,
      x: point.x,
      y: point.y,
      originalX: originalPoint.x,
      originalY: originalPoint.y,
      width: 80,
      height: 20
    };
  }).filter(label => {
    // Only process visible labels
    return label.x >= -100 && label.x <= mapSize.x + 100 && 
           label.y >= -50 && label.y <= mapSize.y + 50;
  });

  // Iterative collision detection - vertical nudging priority
  const maxIterations = 10;
  const padding = 6;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let hasCollision = false;
    
    for (let i = 0; i < labelData.length; i++) {
      for (let j = i + 1; j < labelData.length; j++) {
        const a = labelData[i];
        const b = labelData[j];
        
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        
        // Check if labels overlap (they're wide, so check if X overlap exists)
        if (dx < a.width + padding && dy < a.height + padding) {
          hasCollision = true;
          
          // Vertical nudge - push labels up/down
          if (a.y < b.y) {
            a.y -= 15;
            b.y += 15;
          } else {
            a.y += 15;
            b.y -= 15;
          }
        }
      }
    }
    
    if (!hasCollision) break;
  }

  // Update or create label markers
  labelData.forEach(label => {
    const isDimmed = !visibleIds.has(label.id);
    
    // Update label marker
    if (labelMarkers[label.id]) {
      // Update position and dimming state
      const labelLatLng = map.containerPointToLatLng([label.x, label.y - 20]);
      labelMarkers[label.id].setLatLng(labelLatLng);
      // Re-create icon if dimming state changed
      labelMarkers[label.id].setIcon(createLabelIcon(label.name, isDimmed));
      labelMarkers[label.id].setOpacity(isDimmed ? 0.4 : 1);
    } else {
      // Create new label marker
      const labelLatLng = map.containerPointToLatLng([label.x, label.y - 20]);
      const marker = L.marker(labelLatLng, {
        icon: createLabelIcon(label.name, isDimmed),
        interactive: true,
        zIndexOffset: 1000
      });
      
      // Add click handler to select location
      marker.on('click', (e) => {
        e.originalEvent.stopPropagation();
        selectLocation(label.id);
      });
      
      marker.addTo(map);
      labelMarkers[label.id] = marker;
    }
  });

  // Hide labels for locations not in current view
  Object.keys(labelMarkers).forEach(id => {
    const idNum = parseInt(id);
    if (!labelData.find(l => l.id === idNum)) {
      labelMarkers[id].setOpacity(0);
    }
  });
}

function renderLabels() {
  updateLabelPositions();
}

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

  renderLabels();
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
  if (loc.fourByFour) badges += `<span class="badge badge-4x4">🚙 Krefst jeppa</span>`;

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
  if (state.showLabels) params.set('showLabels', 'true');
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
  if (params.has('showLabels')) {
    state.showLabels = params.get('showLabels') === 'true';
    document.getElementById('toggleLabels').checked = state.showLabels;
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
  syncMobileControls();
});

// Toggles
document.getElementById('toggleNight').addEventListener('change', e => {
  state.nightFishing = e.target.checked;
  if (e.target.checked) {
    document.getElementById('toggle24h').checked = false;
    state.fullDay = false;
  }
  debounceUpdate();
  syncMobileControls();
});
document.getElementById('toggle24h').addEventListener('change', e => {
  state.fullDay = e.target.checked;
  if (e.target.checked) {
    document.getElementById('toggleNight').checked = false;
    state.nightFishing = false;
  }
  debounceUpdate();
  syncMobileControls();
});
document.getElementById('toggleCamping').addEventListener('change', e => {
  state.camping = e.target.checked;
  debounceUpdate();
  syncMobileControls();
});
document.getElementById('toggleAllYear').addEventListener('change', e => {
  state.allYear = e.target.checked;
  debounceUpdate();
  syncMobileControls();
});
document.getElementById('toggleLabels').addEventListener('change', e => {
  state.showLabels = e.target.checked;
  debounceUpdate();
  syncMobileControls();
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
  syncMobileControls();
});

// Reset
document.getElementById('resetBtn').addEventListener('click', () => {
  state = { region: 'all', nightFishing: false, fullDay: false, camping: false, allYear: false, month: null, activeId: state.activeId };
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  document.querySelector('.pill[data-region="all"]').classList.add('active');
  ['toggleNight','toggle24h','toggleCamping','toggleAllYear'].forEach(id => document.getElementById(id).checked = false);
  document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
  syncMobileControls();
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

// ─────────────────────────────────────────────
// MOBILE BOTTOM SHEET
// ─────────────────────────────────────────────
const filterFab = document.getElementById('filterFab');
const bottomSheet = document.getElementById('bottomSheet');
const bottomSheetBackdrop = document.getElementById('bottomSheetBackdrop');
const bottomSheetClose = document.getElementById('bottomSheetClose');

let sheetState = 'closed'; // 'closed', 'half', 'full'
let sheetStartY = 0;
let sheetCurrentY = 0;
let sheetHeight = 0;

function openBottomSheet() {
  sheetState = 'half';
  bottomSheet.classList.add('open', 'open-half');
  bottomSheetBackdrop.classList.add('open');
}

function closeBottomSheet() {
  sheetState = 'closed';
  bottomSheet.classList.remove('open', 'open-half', 'open-full');
  bottomSheetBackdrop.classList.remove('open');
}

function setSheetState(state) {
  sheetState = state;
  bottomSheet.classList.remove('open-half', 'open-full', 'dragging');
  if (state === 'closed') {
    bottomSheet.classList.remove('open');
    bottomSheetBackdrop.classList.remove('open');
  } else {
    bottomSheet.classList.add('open');
    bottomSheetBackdrop.classList.add('open');
    if (state === 'half') bottomSheet.classList.add('open-half');
    if (state === 'full') bottomSheet.classList.add('open-full');
  }
}

if (filterFab) {
  filterFab.addEventListener('click', openBottomSheet);
}

if (bottomSheetBackdrop) {
  bottomSheetBackdrop.addEventListener('click', closeBottomSheet);
}

if (bottomSheetClose) {
  bottomSheetClose.addEventListener('click', closeBottomSheet);
}

// Drag functionality
if (bottomSheet) {
  let isDragging = false;
  let startY = 0;
  let currentY = 0;

  const dragArea = bottomSheet.querySelector('.bottom-sheet-header');

  dragArea.addEventListener('touchstart', (e) => {
    isDragging = true;
    startY = e.touches[0].clientY;
    sheetHeight = bottomSheet.offsetHeight;
    bottomSheet.classList.add('dragging');
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const maxDelta = sheetHeight;
    const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaY));
    
    if (sheetState === 'half') {
      const newHeight = Math.max(30, Math.min(85, 69 - (clampedDelta / window.innerHeight * 100)));
      bottomSheet.style.height = `${newHeight}vh`;
    } else if (sheetState === 'full') {
      const newHeight = Math.max(30, Math.min(85, 85 - (clampedDelta / window.innerHeight * 100)));
      bottomSheet.style.height = `${newHeight}vh`;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    bottomSheet.classList.remove('dragging');
    bottomSheet.style.height = '';

    const deltaY = currentY - startY;
    const threshold = 50;

    if (sheetState === 'half') {
      if (deltaY > threshold) {
        setSheetState('closed');
      } else if (deltaY < -threshold) {
        setSheetState('full');
      } else {
        setSheetState('half');
      }
    } else if (sheetState === 'full') {
      if (deltaY > threshold) {
        if (deltaY > threshold * 2) {
          setSheetState('closed');
        } else {
          setSheetState('half');
        }
      } else {
        setSheetState('full');
      }
    }
  });
}

// Sync mobile filter controls with state
function syncMobileControls() {
  // Sync region pills
  document.querySelectorAll('#regionPillsMobile .pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.region === state.region);
  });

  // Sync toggles
  const toggleNightMobile = document.getElementById('toggleNightMobile');
  const toggle24hMobile = document.getElementById('toggle24hMobile');
  const toggleCampingMobile = document.getElementById('toggleCampingMobile');
  const toggleAllYearMobile = document.getElementById('toggleAllYearMobile');
  const toggleLabelsMobile = document.getElementById('toggleLabelsMobile');

  if (toggleNightMobile) toggleNightMobile.checked = state.nightFishing;
  if (toggle24hMobile) toggle24hMobile.checked = state.fullDay;
  if (toggleCampingMobile) toggleCampingMobile.checked = state.camping;
  if (toggleAllYearMobile) toggleAllYearMobile.checked = state.allYear;
  if (toggleLabelsMobile) toggleLabelsMobile.checked = state.showLabels;

  // Sync month buttons
  document.querySelectorAll('#monthBtnsMobile .month-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.month) === state.month);
  });
}

// Sync desktop filter controls with state
function syncDesktopControls() {
  // Sync region pills
  document.querySelectorAll('#regionPills .pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.region === state.region);
  });

  // Sync toggles
  const toggleNight = document.getElementById('toggleNight');
  const toggle24h = document.getElementById('toggle24h');
  const toggleCamping = document.getElementById('toggleCamping');
  const toggleAllYear = document.getElementById('toggleAllYear');
  const toggleLabels = document.getElementById('toggleLabels');

  if (toggleNight) toggleNight.checked = state.nightFishing;
  if (toggle24h) toggle24h.checked = state.fullDay;
  if (toggleCamping) toggleCamping.checked = state.camping;
  if (toggleAllYear) toggleAllYear.checked = state.allYear;
  if (toggleLabels) toggleLabels.checked = state.showLabels;

  // Sync month buttons
  document.querySelectorAll('#monthBtns .month-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.month) === state.month);
  });
}

// Mobile region pills
const regionPillsMobile = document.getElementById('regionPillsMobile');
if (regionPillsMobile) {
  regionPillsMobile.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.region = pill.dataset.region;
    debounceUpdate();
    syncDesktopControls();
  });
}

// Mobile toggles
const toggleNightMobile = document.getElementById('toggleNightMobile');
if (toggleNightMobile) {
  toggleNightMobile.addEventListener('change', e => {
    state.nightFishing = e.target.checked;
    if (e.target.checked) {
      state.fullDay = false;
      if (toggle24hMobile) toggle24hMobile.checked = false;
    }
    debounceUpdate();
    syncDesktopControls();
  });
}

const toggle24hMobile = document.getElementById('toggle24hMobile');
if (toggle24hMobile) {
  toggle24hMobile.addEventListener('change', e => {
    state.fullDay = e.target.checked;
    if (e.target.checked) {
      state.nightFishing = false;
      if (toggleNightMobile) toggleNightMobile.checked = false;
    }
    debounceUpdate();
    syncDesktopControls();
  });
}

const toggleCampingMobile = document.getElementById('toggleCampingMobile');
if (toggleCampingMobile) {
  toggleCampingMobile.addEventListener('change', e => {
    state.camping = e.target.checked;
    debounceUpdate();
    syncDesktopControls();
  });
}

const toggleAllYearMobile = document.getElementById('toggleAllYearMobile');
if (toggleAllYearMobile) {
  toggleAllYearMobile.addEventListener('change', e => {
    state.allYear = e.target.checked;
    debounceUpdate();
    syncDesktopControls();
  });
}

const toggleLabelsMobile = document.getElementById('toggleLabelsMobile');
if (toggleLabelsMobile) {
  toggleLabelsMobile.addEventListener('change', e => {
    state.showLabels = e.target.checked;
    debounceUpdate();
    syncDesktopControls();
  });
}

// Mobile month buttons
const monthBtnsMobile = document.getElementById('monthBtnsMobile');
if (monthBtnsMobile) {
  monthBtnsMobile.addEventListener('click', e => {
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
    syncDesktopControls();
  });
}

// Mobile reset button
const resetBtnMobile = document.getElementById('resetBtnMobile');
if (resetBtnMobile) {
  resetBtnMobile.addEventListener('click', () => {
    state = { region: 'all', nightFishing: false, fullDay: false, camping: false, allYear: false, month: null, activeId: state.activeId };
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.pill[data-region="all"]').classList.add('active');
    ['toggleNight','toggle24h','toggleCamping','toggleAllYear'].forEach(id => document.getElementById(id).checked = false);
    document.querySelectorAll('.month-btn').forEach(b => b.classList.remove('active'));
    syncDesktopControls();
    updateMap();
  });
}

// Update loadURLParams to sync both mobile and desktop controls
const originalLoadURLParams = loadURLParams;
loadURLParams = function() {
  originalLoadURLParams();
  syncMobileControls();
  syncDesktopControls();
};

// Initial render
updateMap();

// Map event listeners for label recalculation
map.on('move', renderLabels);
map.on('moveend', renderLabels);
map.on('zoomend', renderLabels);
