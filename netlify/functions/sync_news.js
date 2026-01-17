const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

// RSS Feeds
const FEEDS = [
    { url: 'https://news.google.com/rss/search?q=blood+donation+india&hl=en-IN&gl=IN&ceid=IN:en', defaultCategory: 'Donation' },
    { url: 'https://news.google.com/rss/search?q=public+health+india&hl=en-IN&gl=IN&ceid=IN:en', defaultCategory: 'Health' },
    { url: 'https://news.google.com/rss/search?q=medical+emergency+india&hl=en-IN&gl=IN&ceid=IN:en', defaultCategory: 'Emergency' }
];

async function fetchRSS(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseRSS(xml, defaultCat) {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const content = match[1];
        const getTag = (tag) => {
            const r = new RegExp(`<${tag}.*?>(.*?)</${tag}>`, 's');
            const m = content.match(r);
            return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
        };
        const title = getTag('title');
        const link = getTag('link');
        const pubDate = getTag('pubDate');
        const guid = getTag('guid') || link; // Fallback to link if guid missing
        let desc = getTag('description').replace(/<[^>]*>?/gm, ''); // Strip HTML

        if (title && link) {
            // Basic auto-tagging refinement
            let cat = defaultCat;
            if (title.toLowerCase().includes('blood')) cat = 'Donation';
            if (title.toLowerCase().includes('hospital')) cat = 'Medical';

            items.push({
                title,
                link,
                guid,
                description: desc,
                published_at: new Date(pubDate),
                source: 'Google News',
                category: cat,
                status: 'published' // Auto-publish for now
            });
        }
    }
    return items;
}

exports.handler = async (event, context) => {
    // Scheduled trigger usually (or manual GET)
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { statusCode: 500, body: 'Missing Config' };
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    let allNews = [];

    try {
        console.log("Starting News Sync...");

        for (const feed of FEEDS) {
            try {
                const xml = await fetchRSS(feed.url);
                const items = parseRSS(xml, feed.defaultCategory);
                allNews = [...allNews, ...items];
            } catch (e) {
                console.error(`Failed to fetch ${feed.url}`, e);
            }
        }

        // Upsert to Supabase
        // We use 'guid' as the unique key to prevent duplicates
        // Chunk sizes if huge, but here ~50 items is fine
        let insertedCount = 0;

        for (const news of allNews) {
            // Check existence logic can be handled by `upsert` if we have a connection generic constraint,
            // but `onConflict` requires the constraint name usually or just the column.
            // Let's rely on the UNIQUE constraint on 'guid' we created in SQL.
            const { error } = await supabase.from('medical_news')
                .upsert(news, { onConflict: 'guid', ignoreDuplicates: true });

            if (!error) insertedCount++;
        }

        console.log(`Sync Complete. Processed ${allNews.length} items.`);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, processed: allNews.length })
        };

    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
