// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// Create express app
const app = express();
const port = 3000;

// Set OpenAI API key and endpoint
const OPENAI_API_KEY = 'sk-proj-MHiDWEqoFNuANlZR20uzT3BlbkFJwYrCe1Efz5rzlsDthmEy';
const OPENAI_API_URL = 'https://api.openai.com/v1/completions';

// Use middleware
app.use(cors());
app.use(bodyParser.json());

// Define endpoint to improve English text
app.post('/improveEnglish', async (req, res) => {
    // Get the text to improve from the request body
    const text = req.body.text;
    try {
        // Call function to improve English text
        const improvedText = await improveEnglish(text, 0.3);
        // Send the improved text as JSON response
        res.json({ improvedText });
    } catch (error) {
        // Handle errors
        console.error("Failed to improve text:", error);
        res.status(500).send("Failed to process the text.");
    }
});

// Define endpoint to improve English text creatively
app.post('/improveEnglishCreative', async (req, res) => {
    // Get the text to improve from the request body
    const text = req.body.text;
    try {
        // Call function to improve English text creatively
        const creativeText = await improveEnglish(text, 0.7);
        // Send the creatively improved text as JSON response
        res.json({ improvedText: creativeText });
    } catch (error) {
        // Handle errors
        console.error("Failed to improve text creatively:", error);
        res.status(500).send("Failed to process the creative text.");
    }
});
app.post('/addCommentsToCode', async (req, res) => {
    const code = req.body.code;
    try {
        const commentedCode = await generateComments(code);
        res.json({ commentedCode });
    } catch (error) {
        console.error('Error adding comments to code:', error);
        res.status(500).send('Failed to add comments to code.');
    }
});


// Function to improve English text using OpenAI API
async function improveEnglish(text, temperature) {
    // Set request headers
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };
    // Set request data
    const data = {
        model: 'davinci-002', 
        prompt: `Rewrite the following sentence with correct grammar and improved style, keeping the length similar: "${text}"`,
        temperature,
        max_tokens: text.split(" ").length + 10,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0
    };

    try {
        // Make a POST request to the OpenAI API
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error(`Invalid response from OpenAI: ${JSON.stringify(response.data)}`);
        }
        // Extract and process the improved text
        let improvedText = response.data.choices[0].text.trim();
        improvedText = addPunctuation(capitalizeFirstLetter(improvedText));
        return improvedText;
    } catch (error) {
        // Handle errors
        console.error("Detailed API error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to add punctuation to the end of a string if necessary
function addPunctuation(str) {
    const lastChar = str.charAt(str.length - 1);
    if (!/[.!?]/.test(lastChar)) {
        return str + '.';
    }
    return str;
}

async function generateComments(code) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };
    const data = {
        model: 'davinci-002', 
        prompt: `Add comments to the following code:\n${code}`,
        temperature: 0.5,
        max_tokens: 150
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error('Failed to generate comments for code.');
        }
        const commentedCode = response.data.choices[0].text.trim();
        return commentedCode;
    } catch (error) {
        console.error('Error generating comments:', error);
        throw new Error('Failed to generate comments for code.');
    }
}


// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
