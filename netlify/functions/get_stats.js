const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Missing env' }) };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // 1. Total Blood Banks
        const { count: instituteCount, error: instError } = await supabase
            .from('institutes')
            .select('*', { count: 'exact', head: true });

        // 2. Total Registered Users
        const { count: userCount, error: userError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // 3. States Covered (Approximate or distinct query)
        // Using a cached/estimated number or fetch distinctive (might be slow if large DB, but for 3k rows it's fast)
        // We can reuse get_states logic or just do a quick fetch
        const { data: statesData } = await supabase
            .from('institutes')
            .select('state');

        const uniqueStates = new Set(statesData ? statesData.map(i => i.state).filter(Boolean) : []);
        const stateCount = uniqueStates.size;

        // 4. Live Users (Active in last 5 mins)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const { count: activeCount, error: activeError } = await supabase
            .from('active_users')
            .select('*', { count: 'exact', head: true })
            .gt('last_seen', fiveMinutesAgo);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                institutes: instituteCount || 0,
                users: userCount || 0,
                states: stateCount || 0,
                online: activeCount || 1 // Always at least 1 (you!)
            })
        };

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
    }
};
