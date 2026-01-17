const { createClient } = require('@supabase/supabase-js');

exports.handler = async function () {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Missing env vars' })
    };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data, error } = await supabase
    .from('institutes')
    .select('type')
    .neq('type', null);

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }

  // remove duplicates
  const uniqueTypes = [...new Set(data.map(r => r.type))];

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      types: uniqueTypes
    })
  };
};
