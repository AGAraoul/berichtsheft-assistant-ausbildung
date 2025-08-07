// FIX: Import the 'fetch' function from the 'node-fetch' library
const fetch = require('node-fetch');

// This is the serverless function that will act as a secure proxy.
// It receives the request from the frontend, adds the secret API key,
// calls the Google API, and then returns the response.

exports.handler = async function(event, context) {
    // 1. Get the data (prompt) sent from the frontend
    // Add a check to ensure event.body exists before parsing
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is missing.' })
        };
    }
    const { prompt } = JSON.parse(event.body);

    // 2. Get the secret API key from the environment variables
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

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, topP: 1.0, maxOutputTokens: 1024 }
    };

    try {
        // 3. Call the Google API from the server
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
        
        // 4. Send the result back to the frontend
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
