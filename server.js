// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// Create express app
const app = express();
const port = 3000;

// Set OpenAI API key and endpoint
const OPENAI_API_KEY = 'sk-proj-iWgMsC1oo6HlffQ39uAPT3BlbkFJ6eVOZidz9D0aiJ8m92Rc';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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
    const text = req.body.text; // Original text to enhance
    const creativityLevel = req.body.creativityLevel || 0.7; // Default to a higher creativity level

    try {
        const creativeText = await generateCreativeText(text, creativityLevel);
        res.json({ creativeText });
    } catch (error) {
        console.error('Failed to generate creative text:', error);
        res.status(500).send('Error in text generation');
    }
});
app.post('/addCommentsToCode', async (req, res) => {
    const code = req.body.code;
    if (!code) {
        res.status(400).send("Code is required.");
        return;
    }
    try {
        const commentedCode = await generateComments(code); // Your function to call OpenAI
        res.json({ commentedCode });
    } catch (error) {
        console.error('Error adding comments to code:', error);
        res.status(500).send('Failed to add comments to code.');
    }
});



async function improveEnglish(text, temperature = 0.5) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to specify how the text should be processed
    const data = {
        model: 'gpt-4',  // Ensure this is the correct chat model identifier
        messages: [
            {
                role: "system",
                content: "Rewrite the following sentence with correct grammar, ensuring clarity and proper style, as a grammar correction tool would:"
            },
            {
                role: "user",
                content: text
            }
        ],
        temperature,
        max_tokens: 512
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const improvedText = response.data.choices[0].message.content.trim();
            return improvedText; // Returns only the improved sentence
        } else {
            throw new Error('No valid response from OpenAI');
        }
    } catch (error) {
        console.error("API Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}




async function generateCreativeText(text, temperature = 0.7) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to specify how the text should be processed
    const data = {
        model: 'gpt-4',  // Ensure this is the correct chat model identifier
        messages: [
            {
                role: "system",
                content: "Rewrite the following sentence with correct grammar, ensuring clarity and proper style, as a grammar correction tool would:"
            },
            {
                role: "user",
                content: text
            }
        ],
        temperature,
        max_tokens: 512
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const improvedText = response.data.choices[0].message.content.trim();
            return improvedText; // Returns only the improved sentence
        } else {
            throw new Error('No valid response from OpenAI');
        }
    } catch (error) {
        console.error("API Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}




async function generateComments(code, temperature = 0.5) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to guide the AI on how to process the code
    const data = {
        model: 'gpt-4',  // Ensure this is the correct chat model identifier
        messages: [
            {
                role: "system",
                content: "Provide professional comments for this code as a professional programmer would:"
            },
            {
                role: "user",
                content: code
            }
        ],
        temperature,
        max_tokens: 512  // Adjust max_tokens if necessary based on the expected length of comments
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const commentedCode = response.data.choices[0].message.content.trim();
            return commentedCode; // Returns only the commented code
        } else {
            throw new Error('No valid response from OpenAI');
        }
    } catch (error) {
        console.error("API Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}





// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
