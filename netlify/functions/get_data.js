// netlify/functions/get_data.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ success:false, error:'Missing Supabase env vars' }) };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const qp = event.queryStringParameters || {};
    const page = Math.max(1, parseInt(qp.page || '1', 10));
    const per_page = Math.max(1, parseInt(qp.per_page || qp.perPage || '50', 10));
    const districtRaw = (qp.district || '').trim();   // user typed location/city
    const nameRaw = (qp.name || '').trim();           // optional name param
    const type = (qp.type || '').trim();
    const contact = (qp.contact || '').trim(); // "all" | "has" | "no"

    // base query with exact count
    let query = supabase.from('blood').select('*', { count: 'exact' });

    // Build search filters:
    // Search both name AND location for the districtRaw (partial, case-insensitive)
    if (districtRaw) {
      const d = districtRaw.replace(/'/g, "''");
      // match if name OR location contains the substring
      // Supabase .or() expects comma-separated conditions
      const orExpr = `name.ilike.%${d}%,location.ilike.%${d}%`;
      query = query.or(orExpr);
    }

    // If a name param is provided, add it as an additional filter (AND)
    if (nameRaw) {
      query = query.ilike('name', `%${nameRaw.replace(/'/g,"''")}%`);
    }

    // Filter by type if requested (and not 'all')
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    // Contact filter
    if (contact === 'has') {
      query = query.not('contact', 'is', null).neq('contact', '');
    } else if (contact === 'no') {
      query = query.or('contact.is.null,contact.eq.');
    }

    // Pagination using range
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    const { data, error, count } = await query.order('public_id', { ascending: true }).range(from, to);

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ success:false, error: error.message || error }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: data || [],
        total: typeof count === 'number' ? count : (data ? data.length : 0),
        page: page,
        per_page: per_page
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success:false, error: err.message }) };
  }
};
