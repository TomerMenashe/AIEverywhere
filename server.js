const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

// Define the API key and URL directly
const OPENAI_API_KEY = 'sk-proj-MHiDWEqoFNuANlZR20uzT3BlbkFJwYrCe1Efz5rzlsDthmEy';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';


app.use(cors());
app.use(bodyParser.json());

app.post('/improveEnglish', async (req, res) => {
    const text = req.body.text;
    console.log("Received text to improve:", text);
    try {
        const improvedText = await improveEnglish(text);
        console.log("Improved text:", improvedText);
        res.json({ improvedText });
    } catch (error) {
        console.error("Failed to improve text:", error);
        res.status(500).send("Failed to process the text.");
    }
});

app.post('/improveEnglishCreative', async (req, res) => {
    const text = req.body.text;
    console.log("Received creative text to improve:", text);
    try {
        // Call improveEnglish with a higher temperature for creativity
        const creativeText = await improveEnglish(text, 0.9);
        console.log("Creative improved text:", creativeText);
        res.json({ improvedText: creativeText });
    } catch (error) {
        console.error("Failed to improve text creatively:", error);
        res.status(500).send("Failed to process the creative text.");
    }
});



async function improveEnglish(text, temperature = 0.5) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };
    const data = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: text }],
        temperature: temperature  // Use the temperature parameter in the API call
    };
    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (!response.data || !response.data.choices) {
            throw new Error('Invalid response from the OpenAI API.');
        }
        const improvedText = response.data.choices[0].message.content.trim();
        return improvedText;
    } catch (error) {
        console.error("Error calling the OpenAI API:", error.response ? error.response.data : error.message);
        throw error;
    }
}



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
