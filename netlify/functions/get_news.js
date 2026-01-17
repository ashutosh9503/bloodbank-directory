const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('Missing Supabase Config');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Server configuration error' })
        };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Params
    const { page = 1, limit = 9, category = 'all' } = event.queryStringParameters || {};
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        let query = supabase
            .from('medical_news')
            .select('*', { count: 'exact' })
            .order('published_at', { ascending: false })
            .range(from, to);

        if (category && category.toLowerCase() !== 'all') {
            query = query.eq('category', category);
        }

        const { data, count, error } = await query;

        if (error) {
            console.error('Supabase Query Error:', error);
            throw error;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: data,
                meta: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            })
        };

    } catch (err) {
        console.error('Handler Exception:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: err.message || 'Internal Server Error'
            })
        };
    }
};
