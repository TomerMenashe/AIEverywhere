/**
 * Sets up the necessary modules and middleware for the Express application.
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

/**
 * Initializes the Express application and sets the port number.
 */
const app = express();
const port = 3000;

/**
 * Sets the API key and endpoint URL for the OpenAI API.
 */
const OPENAI_API_KEY = 'sk-proj-iWgMsC1oo6HlffQ39uAPT3BlbkFJ6eVOZidz9D0aiJ8m92Rc';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Applies middleware for CORS and JSON body parsing to the application.
 */
app.use(cors());
app.use(bodyParser.json());


/**
 * API endpoint to improve English text using the OpenAI API.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
app.post('/improveEnglish', async (req, res) => {
    // Get the text to improve from the request body
    const text = req.body.text;
    try {
        const improvedText = await improveEnglish(text, 0.3);
        // Send the improved text as JSON response
        res.json({ improvedText });

    } catch (error) {
        // Handle errors
        console.error("Failed to improve text:", error);
        res.status(500).send("Failed to process the text.");
    }
});

/**
 * API endpoint to creatively enhance English text using the OpenAI API.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
app.post('/improveEnglishCreative', async (req, res) => {
     // Get the text to improve from the request body
    const text = req.body.text; 
    const creativityLevel = req.body.creativityLevel || 0.7; // Default to a higher creativity level

    try {
        const creativeText = await generateCreativeText(text, creativityLevel);
        // Send the improved text as JSON response
        res.json({ improvedText });

    } catch (error) {
        // Handle errors
        console.error('Failed to generate creative text:', error);
        res.status(500).send('Error in text generation');
    }
});

/**
 * API endpoint to add comments to code using the OpenAI API.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
app.post('/addCommentsToCode', async (req, res) => {
    // Get the text to improve from the request body
    const code = req.body.code;
    if (!code) {
        res.status(400).send("Code is required.");
        return;
    }
    try {
        const commentedCode = await generateComments(code); 
        // Send the improved text as JSON response
        res.json({ commentedCode });

    } catch (error) {
        // Handle errors
        console.error('Error adding comments to code:', error);
        res.status(500).send('Failed to add comments to code.');
    }
});


/**
 * API endpoint to summarize text using the OpenAI API.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
app.post('/summarizeText', async (req, res) => {
     // Get the text to improve from the request body
    const text = req.body.text;
    if (!text) {
        res.status(400).send("Text is required.");
        return;
    }
    try {
        const summarizedText = await summarizeText(text); 
        // Send the improved text as JSON response
        res.json({ summarizedText });

    } catch (error) {
        // Handle errors
        console.error('Error summarizing text:', error);
        res.status(500).send('Failed to summarize text.');
    }
});


/**
 * API endpoint to generate a quiz based on provided text using the OpenAI API.
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 */
app.post('/AIQuiz', async (req, res) => {
    // Get the text to improve from the request body
    const text = req.body.text;
    if (!text) {
        res.status(400).send("Text is required.");
        return;
    }
    try {
        const generatedQuiz = await AIQuiz(text); 
        // Send the improved text as JSON response
        res.json({ generatedQuiz });

    } catch (error) {
        // Handle errors
        console.error('Error generating quiz:', error);
        res.status(500).send('Failed to summarize text.');
    }
});


/**
 * A function to improve English text by communicating with the OpenAI API.
 * @param {string} text - The text to be improved.
 * @param {number} [temperature=0.5] - The creativity level for the text improvement.
 * @returns {Promise<string>} The improved text.
 */
async function improveEnglish(text, temperature = 0.5) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to specify how the text should be processed
    const data = {
        model: 'gpt-4',  
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
            return improvedText; 
        } else {
            throw new Error('No valid response from OpenAI');
        }
    } catch (error) {
        console.error("API Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}



/**
 * A function to generate creative text by communicating with the OpenAI API.
 * @param {string} text - The text to enhance creatively.
 * @param {number} [temperature=0.7] - The creativity level for the text enhancement.
 * @returns {Promise<string>} The creatively enhanced text.
 */
async function generateCreativeText(text, temperature = 0.7) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to specify how the text should be processed
    const data = {
        model: 'gpt-4', 
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


/**
 * A function to add comments to code by communicating with the OpenAI API.
 * @param {string} code - The code to be commented.
 * @param {number} [temperature=0.2] - The level of detail in the comments.
 * @returns {Promise<string>} The code with added comments.
 */
async function generateComments(code, temperature = 0.2) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to guide the AI on how to process the code
    const data = {
        model: 'gpt-4',  
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
        max_tokens: 1000  
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const commentedCode = response.data.choices[0].message.content.trim();
            return commentedCode; 
        } else {
            throw new Error('No valid response from OpenAI');
        }
    } catch (error) {
        console.error("API Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}


/**
 * A function to summarize text by communicating with the OpenAI API.
 * @param {string} text - The text to be summarized.
 * @param {number} [temperature=0.5] - The precision of the summary.
 * @returns {Promise<string>} The summarized text.
 */
async function summarizeText(text, temperature = 0.5) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to guide the AI on how to process the text
    const data = {
        model: 'gpt-3.5-turbo',  
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
        max_tokens: 1500  
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const summarizedText = response.data.choices[0].message.content.trim();
            return summarizedText; 
        } else {
            throw new Error('No valid response from OpenAI');
        }
    } catch (error) {
        console.error("API Error:", error.response ? JSON.stringify(error.response.data) : error.message);
        throw new Error('Failed to fetch data from the OpenAI API.');
    }
}


/**
 * A function to generate a quiz from text by communicating with the OpenAI API.
 * @param {string} text - The text to create a quiz from.
 * @param {number} [temperature=0.5] - The creativity level for the quiz generation.
 * @returns {Promise<string>} The generated quiz.
 */
async function AIQuiz(text, temperature = 0.5) {
    const headers = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // Include a system message as a prompt to guide the AI on how to process the text
    const data = {
        model: 'gpt-3.5-turbo', 
        messages: [
            {
                role: "system",
                content: "Generate a 10-question multiple-choice quiz based on the provided text. Each question should have four answer options. Clearly format each question with a number followed by a period and end with a question mark. Highlight the correct answer by surrounding it with double asterisks '**' before and after. Ensure that the correct answer appears only once and is formatted correctly. Each question and its answers should be on new lines, and separate each question with a blank line for clarity. Format the correct answer so that it can be directly used in HTML to be highlighted in green without further processing.:"
            },
            {
                role: "user",
                content: text
            }
        ],
        temperature,
        max_tokens: 3000  
    };

    try {
        const response = await axios.post(OPENAI_API_URL, data, { headers });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const generatedQuiz = response.data.choices[0].message.content.trim();
            return generatedQuiz; 
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
