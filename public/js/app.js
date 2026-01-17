const API_ENDPOINT = '/.netlify/functions/get_data';
const STATS_ENDPOINT = '/.netlify/functions/get_stats';

const state = {
  page: 1,
  per_page: 50,
  district: '',
  state: '',
  type: 'all',
  contact: 'all',
  view: 'cards'
};

// --- Utilities ---
const $ = q => document.querySelector(q);
const $$ = q => document.querySelectorAll(q);

function esc(s) {
  return s ? String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m])) : '';
}

// Debounce Utility
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// --- Data Fetching ---
async function fetchData() {
  const container = $('#cardsWrap');
  if (container && state.view === 'cards') {
    container.innerHTML = Array(6).fill('<div class="card skeleton skeleton-card"></div>').join('');
  }

  const p = new URLSearchParams({
    page: state.page,
    per_page: state.per_page,
    district: state.district,
    state: state.state,
    type: state.type,
    contact: state.contact
  });

  try {
    const res = await fetch(`${API_ENDPOINT}?${p.toString()}`);
    const j = await res.json();
    const rows = j.data || [];

    const totalEl = $('#totalCount');
    if (totalEl) totalEl.textContent = j.total || 0;

    renderCards(rows);
    renderPager(j.total || 0);
  } catch (err) {
    console.error('Fetch error:', err);
    if (container) container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">Failed to load data.</div>';
  }
}

async function fetchStats() {
  try {
    const res = await fetch(STATS_ENDPOINT);
    const data = await res.json();
    if (data.success) {
      if ($('#stat-institutes')) $('#stat-institutes').textContent = data.institutes;
      if ($('#stat-users')) $('#stat-users').textContent = data.users;
      // if($('#stat-states')) $('#stat-states').textContent = data.states; 
      if ($('#stat-online')) $('#stat-online').textContent = data.online;
    }
  } catch (e) { console.error('Stats error', e); }
}

async function sendHeartbeat() {
  // Basic anonymous "I am here" ping. 
  // Ideally user is auth'd or we generate a random ID for anon.
  // For now, let's just trigger the Supabase upsert from client if we had the anon key logic here, 
  // or rely on a lightweight function. 
  // Since we are adding `active_users` logic, let's do it right.
  if (window.supabase) {
    let anonId = localStorage.getItem('anon_id');
    if (!anonId) {
      anonId = crypto.randomUUID();
      localStorage.setItem('anon_id', anonId);
    }
    await window.supabase.from('active_users').upsert({ id: anonId, last_seen: new Date() });
  }
}

// --- Loaders ---
async function loadTypes() {
  try {
    const res = await fetch('/.netlify/functions/get_types');
    const json = await res.json();
    if (!json.success) return;
    const select = document.getElementById('filters-type');
    if (!select) return;

    const existingValues = new Set(Array.from(select.options).map(opt => opt.value));
    json.types.forEach(type => {
      if (!existingValues.has(type)) {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type;
        select.appendChild(opt);
      }
    });
  } catch (e) { console.error('Type load error:', e); }
}

async function detectCityFromPincode(query) {
  // Logic: Checking if query is exactly 6 digits
  if (!/^\d{6}$/.test(query)) return;

  try {
    // Show some loading indicator if we had one separate from search
    const res = await fetch(`https://api.postalpincode.in/pincode/${query}`);
    const data = await res.json();

    if (data[0].Status === "Success") {
      const details = data[0].PostOffice[0];
      const city = details.District; // Usually District is best for Bloodbank search

      // Update state without UI dropdown
      state.district = city;
      // We could also set state.state = details.State; if we want to narrow down, 
      // but district is usually unique enough or robust.
      // Let's rely on district.

      // Update UI input to show we found it (Optional, maybe nice UX)
      // $('#filters-district').value = city; 

      // Trigger search immediately with the new City
      fetchData();
    }
  } catch (e) {
    console.log("PIN lookup failed");
  }
}

// --- Render Functions ---
function formatLocation(addr, city, st) {
  // Clean up address
  let cleanVal = (addr || '').replace(/,(\s*,)+/g, ',').replace(/^,/, '').replace(/,$/, '').trim();

  // If it's very short or empty, just show City, State
  if (cleanVal.length < 5) return `${city || ''}, ${st || ''}`;

  return cleanVal;
}

function renderCards(rows) {
  const w = $('#cardsWrap');
  if (!w || state.view !== 'cards') {
    if (w) w.style.display = 'none';
    return;
  }
  w.style.display = 'grid';
  w.innerHTML = '';

  if (rows.length === 0) {
    w.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No blood banks found matching filters.</div>';
    return;
  }

  rows.forEach(r => {
    const tel = r.phone ? r.phone.split('/')[0].trim() : '';
    const loc = formatLocation(r.address, r.district, r.state);

    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-header">
        <span class="card-badge">${esc(r.type)}</span>
        <h3 class="card-title">${esc(r.name)}</h3>
      </div>
      <div class="card-body">
         <div class="card-row">
            <span class="card-icon">📍</span>
            <span><strong>Location:</strong><br>${esc(loc)}<br><small>${esc(r.district)}, ${esc(r.state)}</small></span>
         </div>
      </div>
      <div class="card-actions">
        ${tel ? `<a class="action-btn action-call" href="tel:${tel}">📞 Call</a>`
        : `<span class="action-btn" style="opacity:0.5;cursor:not-allowed;">📞 Call</span>`}
        <a class="action-btn action-map" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + loc)}">📍 Map</a>
      </div>`;
    w.appendChild(div);
  });
}

function renderPager(total) {
  const p = $('#pager');
  if (!p) return;
  p.innerHTML = '';
  const pages = Math.ceil(total / state.per_page) || 1;

  if (pages > 1) {
    for (let i = 1; i <= Math.min(10, pages); i++) {
      const b = document.createElement('button');
      b.className = 'page-btn' + (i === state.page ? ' active' : '');
      b.textContent = i;
      b.onclick = () => {
        state.page = i;
        fetchData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      p.appendChild(b);
    }
  }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // Initial Loads
  fetchData();
  fetchStats();
  loadTypes();
  setInterval(fetchStats, 30000); // Poll stats every 30s

  // Heartbeat every 2 minutes
  sendHeartbeat();
  setInterval(sendHeartbeat, 120000);

  // Search Inputs (Debounced)
  const distInput = $('#filters-district');
  if (distInput) {
    distInput.addEventListener('input', debounce((e) => {
      const val = e.target.value.trim();

      // If pincode, auto-detect (special logic)
      if (/^\d{6}$/.test(val)) {
        detectCityFromPincode(val);
      } else {
        // Normal search
        state.district = val;
        state.page = 1;
        fetchData();
      }
    }, 600));
  }

  // Buttons
  const applyBtn = $('#applyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      state.page = 1;
      state.district = distInput ? distInput.value.trim() : '';
      // Removed State drop down logic as requested
      state.type = $('#filters-type').value;
      state.contact = $('#filters-contact').value;
      const perPageEl = $('#filters-perPage');
      state.per_page = perPageEl ? parseInt(perPageEl.value) : 50;
      fetchData();
    });
  }

  const resetBtn = $('#resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }
});
