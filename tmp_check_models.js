const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function run() {
    try {
        const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        console.log('Key exists:', !!key);
        if (!key) return;
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
        const data = await response.json();
        
        if (data.error) {
            console.error('API Error:', JSON.stringify(data.error, null, 2));
        } else {
            const geminiModels = data.models
                .filter(m => m.name.includes('gemini'))
                .map(m => ({
                    name: m.name,
                    displayName: m.displayName,
                    supportedMethods: m.supportedMethods
                }));
            console.log(JSON.stringify(geminiModels, null, 2));
        }
    } catch (e) {
        console.error('Script Error:', e);
    }
}

run();
