async function loadNews() {
    const grid = document.querySelector('.news-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#666;">Loading updates...</div>';

    try {
        const res = await fetch('/.netlify/functions/get_news');
        const json = await res.json();

        if (!json.success || !json.articles) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">Failed to load news.</div>';
            return;
        }

        grid.innerHTML = '';
        const emojis = ['🏥', '🩸', '💊', '🩺', '🧪', '🧬', '👨‍⚕️', '🔬'];

        json.articles.forEach(article => {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            const card = document.createElement('article');
            card.className = 'news-card';
            card.innerHTML = `
        <div class="news-img">${randomEmoji}</div>
        <div class="news-content">
          <div class="news-date">${article.date}</div>
          <h2 class="news-title">${limitText(article.title, 60)}</h2>
          <p class="news-excerpt">${limitText(article.title, 100)}</p>
          <a href="${article.link}" target="_blank" class="news-link">Read More →</a>
        </div>
      `;
            grid.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">Could not connect to news feed.</div>';
    }
}

function limitText(text, count) {
    return text.length > count ? text.slice(0, count) + "..." : text;
}

document.addEventListener('DOMContentLoaded', loadNews);
