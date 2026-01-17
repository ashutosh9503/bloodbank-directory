const NEWS_ENDPOINT = '/.netlify/functions/get_news';

let state = {
    page: 1,
    limit: 9,
    category: 'all',
    total: 0,
    isLoading: false
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return dateStr; }
}

function esc(s) {
    return s ? String(s).replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m])) : '';
}

function renderNews(articles, append = false) {
    const container = document.getElementById('news-grid');
    const noMsg = document.getElementById('no-news-msg');
    const loadBtn = document.getElementById('loadMoreBtn');

    if (!container) return;

    if (!append) {
        container.innerHTML = '';
        container.style.display = 'grid';
    }

    if ((!articles || articles.length === 0) && !append) {
        container.style.display = 'none';
        if (noMsg) noMsg.style.display = 'block';
        if (loadBtn) loadBtn.style.display = 'none';
        return;
    }

    if (noMsg) noMsg.style.display = 'none';

    articles.forEach(item => {
        // Use summary or description or content
        const text = item.summary || item.description || item.content || '';
        const summary = text.length > 120 ? text.substring(0, 120) + '...' : text;

        const source = item.source || 'News';
        const cat = item.category || 'General';

        const div = document.createElement('div');
        div.className = 'card news-card animate-fade-in';
        div.innerHTML = `
            <div class="card-header">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                     <span class="card-badge">${esc(cat)}</span>
                     <small style="color:var(--text-muted);">${formatDate(item.published_at)}</small>
                </div>
                <h3 class="card-title">${esc(item.title)}</h3>
            </div>
            <div class="card-body">
                <p style="color:var(--text-muted);">${esc(summary)}</p>
                <div style="margin-top:10px; font-size:12px; color:#888;">Source: ${esc(source)}</div>
            </div>
            <div class="card-actions">
                ${item.url ? `<a href="${item.url}" target="_blank" class="btn btn-outline" style="width:100%;">Read More</a>` : ''}
            </div>
        `;
        container.appendChild(div);
    });

    // Load More Button Logic
    if (loadBtn) {
        const displayed = state.page * state.limit;
        loadBtn.style.display = (displayed < state.total && state.total > 0) ? 'inline-block' : 'none';
        loadBtn.textContent = 'Load More Articles';
        loadBtn.disabled = false;
    }
}

async function fetchNews(append = false) {
    if (state.isLoading) return;
    state.isLoading = true;

    const loadBtn = document.getElementById('loadMoreBtn');
    if (loadBtn) {
        loadBtn.textContent = 'Loading...';
        loadBtn.disabled = true;
    }

    // Show skeletons if initial load
    if (!append) {
        const grid = document.getElementById('news-grid');
        if (grid && grid.children.length === 0) {
            grid.innerHTML = Array(3).fill('<div class="card skeleton skeleton-card"></div>').join('');
        }
    }

    try {
        const params = new URLSearchParams({
            page: state.page,
            limit: state.limit,
            category: state.category
        });

        console.log('Fetching:', `${NEWS_ENDPOINT}?${params.toString()}`);
        const res = await fetch(`${NEWS_ENDPOINT}?${params.toString()}`);

        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const json = await res.json();
        state.isLoading = false;

        if (json.success) {
            state.total = json.meta ? json.meta.total : 0;
            renderNews(json.data, append);
        } else {
            console.error('API Error:', json.error);
            if (!append) {
                renderNews([]);
                // Show error message on UI if needed
                const noMsg = document.getElementById('no-news-msg');
                if (noMsg) noMsg.innerHTML = `<p style="color:red">Error: ${json.error}</p>`;
            }
        }
    } catch (e) {
        state.isLoading = false;
        console.error('Fetch Exception:', e);
        if (!append) renderNews([]);
    }
}

function filterNews(cat) {
    if (cat === state.category) return;
    state.category = cat;
    state.page = 1;

    // Toggle active class
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });

    fetchNews(false);
}

function loadMore() {
    state.page++;
    fetchNews(true);
}

// Global scope
window.filterNews = filterNews;
window.loadMore = loadMore;

document.addEventListener('DOMContentLoaded', () => {
    fetchNews(false);
});
