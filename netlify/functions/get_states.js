const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Missing env' }) };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // List of all Indian States and UTs
        const allStates = [
            "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
            "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
            "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
            "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
            "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
            "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
        ];

        // Fetch distinct states from DB to ensure we cover any custom inputs/spelling
        const { data, error } = await supabase
            .from('institutes')
            .select('state')
            .not('state', 'is', null)
            .neq('state', '');

        const dbStates = data ? data.map(item => item.state) : [];

        // Merge and Dedupe
        const combinedStates = [...new Set([...allStates, ...dbStates])].sort();

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                states: combinedStates
            })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
    }
};
