const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Missing env' }) };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const qp = event.queryStringParameters || {};

    const page = parseInt(qp.page || '1');
    const per_page = parseInt(qp.per_page || '50');
    const district = (qp.district || '').trim();
    const stateVal = (qp.state || '').trim();
    const type = (qp.type || '').trim();
    const contact = (qp.contact || 'all').trim();

    // 1. Fetch Data Query
    let query = supabase.from('institutes').select('*', { count: 'exact' });

    if (district) {
      query = query.or(`name.ilike.%${district}%,address.ilike.%${district}%`);
    }

    if (stateVal) {
      query = query.eq('state', stateVal);
    }

    if (type && type !== 'all') {
      query = query.eq('category', type);
    }

    if (contact === 'has') {
      query = query.not('phone', 'is', null).neq('phone', '');
    }

    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    const { data, error, count } = await query
      .order('sno', { ascending: true })
      .range(from, to);

    if (error) throw error;

    // 2. Fetch Distinct States (Cached-like approach: separate query only if needed or just once)
    // For now, let's fetch types from a separate function, but states we might want to return here 
    // OR create a new endpoint 'get_states'. 
    // To keep it simple for this V2, we'll create a separate endpoint or just return user-provided states in DB?
    // Actually, creating a separate endpoint for metadata is cleaner, but let's stick to the plan:
    // "Update get_data function to handle state param" -> Done above.
    // "Frontend: Add State Dropdown and logic in app.js" -> We need a way to get the list of states.

    // Let's rely on a separate 'get_states' function or just hardcode common ones if DB is empty, 
    // but better to fetch distinct states.
    // For performance, let's NOT fetch distinct states on every search. 
    // We will assume a separate call or hardcoded list for now, OR fetch them in a separate 'get_metadata.js' function.
    // Wait, the client requested "Auto populate state list from database".
    // I will modify this function to optionally return states if requested, or better, make a new lightweight function.
    // Let's stick to just search logic here to keep it fast.

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: data || [],
        total: count || 0,
        page,
        per_page
      })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
