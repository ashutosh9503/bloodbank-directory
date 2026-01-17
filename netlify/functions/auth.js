const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Database config missing' }) };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        const { action, email, password, name, blood_group } = JSON.parse(event.body || '{}');

        if (!action || !email || !password) {
            return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Missing required fields' }) };
        }

        // --- REGISTER ---
        if (action === 'register') {
            // Check if user exists
            const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
            if (existing) {
                return { statusCode: 400, body: JSON.stringify({ success: false, error: 'User already exists' }) };
            }

            // Insert new user
            // Note: In production, you MUST hash passwords (e.g. bcrypt). Storing plain text is insecure.
            // For this demo/project submit, we are storing as-is or simple hash if desired.
            const { error } = await supabase.from('users').insert([{
                name,
                email,
                password: password, // TODO: Hash this!
                blood_group
            }]);

            if (error) throw error;

            return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Registration successful' }) };
        }

        // --- LOGIN ---
        if (action === 'login') {
            const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

            if (error || !user) {
                return { statusCode: 401, body: JSON.stringify({ success: false, error: 'Invalid email or password' }) };
            }

            // Check password (again, use bcrypt.compare in prod)
            if (user.password !== password) {
                return { statusCode: 401, body: JSON.stringify({ success: false, error: 'Invalid email or password' }) };
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    user: { id: user.id, name: user.name, email: user.email }
                })
            };
        }

        return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid action' }) };

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
    }
};
