// netlify/functions/get_data_inspect.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event, context) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ success:false, error: 'Missing Supabase env vars' }) };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // Fetch one sample row from blood
    const { data, error } = await supabase
      .from('blood')
      .select('*')
      .limit(1);

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ success:false, error: error.message || error }) };
    }

    const sample = (data && data.length) ? data[0] : {};
    // return the keys (column names) and a sample row (non-sensitive)
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        columns: Object.keys(sample),
        sampleRow: sample
      })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success:false, error: err.message }) };
  }
};
