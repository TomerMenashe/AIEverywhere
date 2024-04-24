const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

const OPENAI_API_KEY = 'sk-proj-MHiDWEqoFNuANlZR20uzT3BlbkFJwYrCe1Efz5rzlsDthmEy';
const OPENAI_API_URL = 'https://api.openai.com/v1/completions'; // Correct endpoint for text completions

app.use(cors());
app.use(bodyParser.json());

app.post('/improveEnglish', async (req, res) => {
    const text = req.body.text;
    try {
        const improvedText = await improveEnglish(text, 0.3, "text-davinci-004"); // Use text-davinci-004 or gpt-4 if available
        res.json({ improvedText });
    } catch (error) {
        console.error("Failed to improve text:", error);
        res.status(500).send("Failed to process the text.");
    }
});

app.post('/improveEnglishCreative', async (req, res) => {
    const text = req.body.text;
    try {
        const creativeText = await improveEnglish(text, 0.7, "text-davinci-004"); // Higher temperature for more creativity
        res.json({ improvedText: creativeText });
    } catch (error) {
        console.error("Failed to improve text creatively:", error);
        res.status(500).send("Failed to process the creative text.");
    }
});

async function improveEnglish(text, temperature) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };
    const data = {
        model: 'davinci-002', // Update the model name here
        prompt: `Rewrite the following sentence with correct grammar and improved style, keeping the length similar: "${text}"`,
        temperature,
        max_tokens: text.split(" ").length + 10,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error(`Invalid response from OpenAI: ${JSON.stringify(response.data)}`);
        }
        let improvedText = response.data.choices[0].text.trim();
        improvedText = addPunctuation(capitalizeFirstLetter(improvedText));
        return improvedText;
    } catch (error) {
        console.error("Detailed API error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function addPunctuation(str) {
    const lastChar = str.charAt(str.length - 1);
    if (!/[.!?]/.test(lastChar)) {
        return str + '.';
    }
    return str;
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
