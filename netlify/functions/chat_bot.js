const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Missing DB config' }) };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        const body = JSON.parse(event.body || '{}');
        const userMsg = (body.message || '').toLowerCase();

        // Default response
        let botResponse = "I'm still learning! Please try searching for a district name like 'Mumbai' or 'Delhi'.";

        // 1. Check for greetings
        if (userMsg.match(/\b(hi|hello|hey|namaste)\b/)) {
            return {
                statusCode: 200,
                body: JSON.stringify({ reply: "Namaste! I am Rakt. Tell me your District or City to find blood banks nearby." })
            };
        }

        // 2. Check for "Help"
        if (userMsg.includes('help') || userMsg.includes('support')) {
            return {
                statusCode: 200,
                body: JSON.stringify({ reply: "You can type a city name (e.g., 'Pune') to get a list of blood banks, or ask about functionality." })
            };
        }

        // 3. Knowledge Base (Smart FAQ)
        // Simple fast match for common queries
        const knowledgeBase = [
            { k: ['who', 'donate', 'eligibility'], a: "Generally, donors should be 18-65 years old, weigh at least 45kg, and be in good health. You cannot donate if you have a cold, flu, or low hemoglobin." },
            { k: ['benefits', 'why'], a: "Donating blood saves lives! It also stimulates blood cell production, reduces risk of heart opacity, and gives you a free mini-health checkup." },
            { k: ['how', 'often', 'frequency'], a: "Men can donate every 3 months, and women can donate every 4 months." },
            { k: ['process', 'time'], a: "The donation itself only takes 10-15 minutes. The entire process (checkup, donation, refreshment) is about an hour." },
            { k: ['pain', 'hurt'], a: "You'll feel a slight pinch when the needle is inserted, but it's generally painless otherwise." },
            { k: ['documents', 'bring'], a: "Please bring a valid government ID (Aadhar, Pan Card, etc.) to the blood bank." },
            { k: ['alcohol', 'drink'], a: "Avoid alcohol for 24 hours before donating." },
            { k: ['food', 'eat'], a: "Eat a healthy meal and drink plenty of water before you come to donate." },
            { k: ['types', 'blood', 'group'], a: "The main types are A, B, AB, and O (positive and negative). O- is the universal donor." }
        ];

        // Check Knowledge Base
        for (const item of knowledgeBase) {
            // If user message contains ANY 2 keywords (or 1 if list is short), return answer
            const matchCount = item.k.filter(key => userMsg.includes(key)).length;
            if (matchCount >= Math.min(2, item.k.length)) {
                return { statusCode: 200, body: JSON.stringify({ reply: item.a }) };
            }
        }

        // 4. Search Database for District/City
        // We will try to match the user message against the 'address' or 'state' or 'district' columns
        // This is a naive search: we utilize Supabase's text search if possible, or just ILIKE

        // Extract potential location words (ignoring common stopwords)
        const stopWords = ['find', 'blood', 'banks', 'in', 'near', 'me', 'the', 'a', 'an', 'please', 'give', 'list'];
        const keywords = userMsg.split(' ').filter(w => !stopWords.includes(w) && w.length > 2);

        if (keywords.length > 0) {
            // Taking the last keyword as a potential city often works for "in Pune"
            const potentialCity = keywords[keywords.length - 1];

            const { data, error } = await supabase
                .from('institutes')
                .select('name, phone, address, category')
                .ilike('address', `%${potentialCity}%`)
                .limit(3);

            if (error) throw error;

            if (data && data.length > 0) {
                const banks = data.map(b => `🏥 **${b.name}**\n📍 ${b.address}\n📞 ${b.phone || 'N/A'}`).join('\n\n');
                botResponse = `Here are some blood banks I found for "${potentialCity}":\n\n${banks}\n\n[View all results](/index.html?district=${potentialCity})`;
            } else {
                botResponse = `I couldn't find any blood banks in "${potentialCity}". Please check the spelling or try a major district name.`;
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: botResponse })
        };

    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: "Accept my apologies, I am having trouble connecting to my brain right now. Please try searching manually." })
        };
    }
};
