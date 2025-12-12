// netlify/functions/get_data_debug.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  // Return present/absent of env vars (no secret output)
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Missing Supabase env vars',
        env: { SUPABASE_URL_set: !!SUPABASE_URL, SUPABASE_KEY_set: !!SUPABASE_KEY }
      })
    };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    // small test query (first 3 rows) and count
    const { data, error, count } = await supabase
      .from('blood')
      .select('*', { count: 'exact' })
      .range(0, 2);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ success:false, error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success:true, sample: data, count }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success:false, error: err.message }) };
  }
};
