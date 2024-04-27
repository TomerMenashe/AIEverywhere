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

// Define endpoint to summarize text
app.post('/summarizeText', async (req, res) => {
    const text = req.body.text;
    if (!text) {
        res.status(400).send("Text is required.");
        return;
    }
    try {
        const summarizedText = await summarizeText(text); // Your function to call OpenAI
        res.json({ summarizedText });
    } catch (error) {
        console.error('Error summarizing text:', error);
        res.status(500).send('Failed to summarize text.');
    }
});

app.post('/AIQuiz', async (req, res) => {
    const text = req.body.text;
    if (!text) {
        res.status(400).send("Text is required.");
        return;
    }
    try {
        const generatedQuiz = await AIQuiz(text); // Your function to call OpenAI
        res.json({ generatedQuiz });
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).send('Failed to summarize text.');
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




async function generateComments(code, temperature = 0.2) {
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
                content: "Given code , please add professional comments as a senior developer would. Focus on explaining complex logic, key decisions, and critical sections only. Ensure the comments are clear, concise, and informative, aiding any new developer in quickly understanding the code’s purpose and operation. The comments should adhere to best practices in coding and documentation:"
            },
            {
                role: "user",
                content: code
            }
        ],
        temperature,
        max_tokens: 1000  // Adjust max_tokens if necessary based on the expected length of comments
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

async function summarizeText(text, temperature = 0.5) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to guide the AI on how to process the text
    const data = {
        model: 'gpt-3.5-turbo',  // Ensure this is the correct chat model identifier
        messages: [
            {
                role: "system",
                content: "Summarize the following text into a single coherent paragraph:"
            },
            {
                role: "user",
                content: text
            }
        ],
        temperature,
        max_tokens: 1500  // Adjust max_tokens if necessary based on the expected length of the summary
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const summarizedText = response.data.choices[0].message.content.trim();
            return summarizedText; // Returns only the summarized text
        } else {
            throw new Error('No valid response from OpenAI');
        }
    } catch (error) {
        console.error("API Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}

async function AIQuiz(text, temperature = 0.5) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to guide the AI on how to process the text
    const data = {
        model: 'gpt-3.5-turbo',  // Ensure this is the correct chat model identifier
        messages: [
            {
                role: "system",
                content: "Generate a 10-question multiple-choice quiz based on the provided text. Each question should have four answer options. Clearly format each question with a number followed by a period and end with a question mark. Mark the correct answer by appending '**' befor and after the correct option and write it only once. Ensure that each question and its answers are on new lines, and separate each question with a blank line for clarity:"
            },
            {
                role: "user",
                content: text
            }
        ],
        temperature,
        max_tokens: 3000  // Adjust max_tokens if necessary based on the expected length of the summary
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const generatedQuiz = response.data.choices[0].message.content.trim();
            return generatedQuiz; // Returns only the summarized text
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
