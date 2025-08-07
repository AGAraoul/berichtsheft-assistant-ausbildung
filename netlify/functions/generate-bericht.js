const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is missing.' })
        };
    }
    const { prompt } = JSON.parse(event.body);

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key is not set on the server.' })
        };
    }
    
    if (!prompt) {
         return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Prompt is missing from the request.' })
        };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // FIX: Increased the maximum number of tokens for the output.
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, topP: 1.0, maxOutputTokens: 2048 }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Google API Error:', errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Google API request failed: ${errorBody}` })
            };
        }

        const result = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Internal Server Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
