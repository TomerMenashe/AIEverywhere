chrome.runtime.onInstalled.addListener(() => {
    // Remove all existing context menus
    chrome.contextMenus.removeAll(function() {
        // Check for errors during removal
        if (chrome.runtime.lastError) {
            console.error('Error removing context menus:', chrome.runtime.lastError);
        } else {
            // After successful removal, create new context menus
            chrome.contextMenus.create({
                id: "improveEnglish",
                title: "Improve English",
                contexts: ["selection"]
            });
            chrome.contextMenus.create({
                id: "improveEnglishCreative",
                title: "Improve English - Creative",
                contexts: ["selection"]
            });
            chrome.contextMenus.create({
                id: "addComments",
                title: "Add Comments to Code",
                contexts: ["selection"]
            });
            chrome.contextMenus.create({
                id: "summarizeText",
                title: "Summarize to a Single Paragraph",
                contexts: ["selection"]
            });
            chrome.contextMenus.create({
                id: "AIQuiz",
                title: "AI Quiz of a paragraph",
                contexts: ["selection"]
            });
        }
    });
});


/**
 * Handles clicks on context menu items.
 * @param {object} info - Information about the item clicked.
 * @param {object} tab - The tab where the click occurred.
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.selectionText) {
        try {
            if (info.menuItemId === "summarizeText") {
                const summary = await summarizeText(info.selectionText);
                sendTextToTab(tab.id, summary, 'Summery');
            } else if (info.menuItemId === "improveEnglish" || info.menuItemId === "improveEnglishCreative") {
                const temperature = info.menuItemId === "improveEnglishCreative" ? 0.5 : 0.2;
                const improvedText = await improveTextUsingAPI(info.selectionText, tab.id, temperature);
                sendTextToTab(tab.id, improvedText, 'Improved Text', true);
            } else if (info.menuItemId === "addComments") {
                await addCommentsToCode(info.selectionText, tab.id);
            } else if (info.menuItemId === "AIQuiz") {
                const quiz = await AIQuizGenerator(info.selectionText, tab.id);
                displayQuiz(tab.id, quiz, 'Quiz',);

            }

        } catch (error) {
            console.error('Error processing request:', error);
            sendErrorToTab(tab.id, "Failed to process request. Please try again later.");
        }
    }
});

/**
 * Improves English text by utilizing an external API based on a given "temperature" setting.
 * @param {string} text - The text to improve.
 * @param {number} tabId - The ID of the browser tab to interact with.
 * @param {number} temperature - The creativity level for the text improvement.
 * @returns {Promise<string>} The improved text.
 */
async function improveTextUsingAPI(text, tabId, temperature) {
    // Endpoint for the OpenAI API
    const endpoint = `http://localhost:3000/${temperature > 0.5 ? 'improveEnglishCreative' : 'improveEnglish'}`;
    try {
        // Make a POST request to the OpenAI API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        if (!response.ok) {
            throw new Error(`Failed to improve text. Server responded with status: ${response.status}`);
        }
        // Parse the response JSON
        const data = await response.json();
        return data.improvedText;

    } catch (error) {
        // Handle errors
        console.error('Error improving text:', error);
        sendErrorToTab(tabId, "Failed to improve text. Please try again later.");
        return null;
    }
}


/**
 * Adds comments to the code by sending it to a server.
 * @param {string} code - The source code to comment.
 * @param {number} tabId - The ID of the browser tab where the code is displayed.
 */
async function addCommentsToCode(code, tabId) {
    const endpoint = `http://localhost:3000/addCommentsToCode`; // Correct endpoint on your server
    try {
        // Make a POST request to the OpenAI API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code }) // Send only the code; the server decides the prompt
        });
        
        if (!response.ok) {
            throw new Error(`Failed to add comments to code. Server responded with status: ${response.status}`);
        }
         // Parse the response JSON
        const data = await response.json();
        replaceCodeInPage(data.commentedCode, tabId);
        
    } catch (error) {
        // Handle errors
        console.error('Error adding comments to code:', error);
        sendErrorToTab(tabId, 'Failed to add comments to code.');
    }
}


/**
 * Summarizes the selected text by sending it to a server.
 * @param {string} text - The text to be summarized.
 * @returns {Promise<string>} The summarized text.
 */
async function summarizeText(text) {
    console.log("Sending request to server to summarize text.");
    const endpoint = 'http://localhost:3000/summarizeText';
    try {
        // Make a POST request to the OpenAI API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        if (!response.ok) {
            throw new Error(`Failed to summarize text. Server responded with status: ${response.status}`);
        }
        // Parse the response JSON
        const data = await response.json();
        return data.summarizedText; 

    } catch (error) {
        // Handle errors
        sendErrorToTab(tabId, 'Failed to summeraize text.');
        return null;
    }
}


/**
 * Generates a quiz based on the provided text by sending it to a server.
 * @param {string} text - The text from which the quiz is generated.
 * @returns {Promise<string>} The generated quiz.
 */
async function AIQuizGenerator(text) {
    console.log("Sending request to server to summarize text.");
    const endpoint = 'http://localhost:3000/AIQuiz';
    try {
        // Make a POST request to the OpenAI API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        if (!response.ok) {
            throw new Error(`Failed to summarize text. Server responded with status: ${response.status}`);
        }
        // Parse the response JSON
        const data = await response.json();
        return data.generatedQuiz;

    } catch (error) {
        // Handle errors
        sendErrorToTab(tabId, 'Failed to generat quiz.');
        return null;
    }
}


/**
 * Formats a raw quiz text into a structured HTML format suitable for display.
 * The function processes quiz content, where questions are separated by blank lines,
 * and correct answers are highlighted in green. Each question is made bold.
 * 
 * @param {string} quizText - The raw text of the quiz, where questions are separated by blank lines.
 * @returns {string} The HTML-formatted string of the quiz, ready for display.
 */
 function formatQuizText(quizText) {
    // Split the text into individual questions based on blank lines
    const questions = quizText.split(/\n\s*\n/);
    let formattedQuiz = [];

    questions.forEach(question => {
        if (question.trim().length > 0) {
            // Split each question into lines for processing
            const lines = question.split('\n');
            formattedQuiz.push('<b>' + lines[0] + '</b><br>');  // Bold the question line

            lines.slice(1).forEach(line => {
                // Check if the line contains the correct answer marked by asterisks
                if (line.includes('**')) {
                    // Format the correct answer in green and remove the asterisks
                    line = line.replace(/\*\*(.*?)\*\*/g, '<span style="color: green; font-weight: bold;">$1</span>');
                }
                formattedQuiz.push(line + '<br>');
            });

            formattedQuiz.push('<hr>'); // Add a horizontal line for separation
        }
    });

    return formattedQuiz.join('');
}





/**
 * Displays the formatted quiz text in a specific browser tab.
 * @param {number} tabId - The ID of the browser tab where the quiz will be displayed.
 * @param {string} quizText - The raw quiz text to be formatted and displayed.
 */
function displayQuiz(tabId, quizText) {
    const formattedQuizText = formatQuizText(quizText);
    chrome.scripting.executeScript({
        target: { tabId },
        function: displayText,
        args: ['Quiz', formattedQuizText] // Using the modified displayText function
    });
}


/**
 * Sends an error message to a specified tab.
 * @param {number} tabId - The ID of the browser tab where the error will be shown.
 * @param {string} message - The error message to display.
 */
function sendErrorToTab(tabId, message) {
    // Use the Chrome scripting API to run a script in the specified tab
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: showAlert,
        args: [message] 
    });

    // This function will show the poping alert
    function showAlert(message) {
        alert("Error: " + message);  
    }
}


/**
 * Sends text to a specified tab, optionally showing an "Insert" button.
 * @param {number} tabId - The ID of the browser tab where the text will be sent.
 * @param {string} text - The text to send.
 * @param {string} title - The title to be displayed above the text.
 * @param {boolean} [showInsertButton=false] - Whether to show an "Insert" button that allows the text to be inserted into the page.
 */
function sendTextToTab(tabId, text, title, showInsertButton = false) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: displayText,
        args: [title, text, showInsertButton, tabId]
    });
}


/**
 * Displays text in a modal-like div over the webpage in the specified tab.
 * @param {string} title - The title for the displayed content.
 * @param {string} text - The text or HTML content to display.
 * @param {boolean} showInsertButton - Indicates whether an 'Insert' button should be shown to allow the user to insert text into the page.
 * @param {number} tabId - The browser tab ID where the content will be displayed.
 */
function displayText(title, text, showInsertButton, tabId) {
    // Create a new <div> element to display the title, text, and cancel button
    let scriptExecuted = false;
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '5%';
    div.style.left = '20%';
    div.style.transform = 'translateX(-50% , -50%)';
    div.style.width = '45%';
    div.style.maxHeight = '60%';
    div.style.overflowY = 'auto'; 
    div.style.backgroundColor = '#f8f9fa'; 
    div.style.padding = '20px';
    div.style.borderRadius = '8px'; 
    div.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'; 
    div.style.zIndex = '9999'; 

    // Create a <h2> element for the title
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.fontSize = '20px'; 
    titleElement.style.color = '#333'; 
    titleElement.style.marginBottom = '10px'; 
    div.appendChild(titleElement); 

    // Create a container for the text
    const textContainer = document.createElement('div');
    textContainer.style.maxHeight = 'calc(100% - 100px)'; 
    textContainer.style.overflowY = 'auto'; 

    // Create a <div> element for the text, using innerHTML to interpret HTML if present
    const content = document.createElement('div');
    content.innerHTML = text; 
    content.style.fontSize = '16px'; 
    content.style.color = '#666'; 
    textContainer.appendChild(content); 
    div.appendChild(textContainer); 

     // Create a <button> element for the insert button & insert logic
    if (showInsertButton) {
        const insertButton = document.createElement('button');
        insertButton.textContent = 'Insert';
        insertButton.style.backgroundColor = '#28a745';
        insertButton.style.color = '#fff';
        insertButton.style.border = 'none';
        insertButton.style.padding = '10px 20px';
        insertButton.style.borderRadius = '4px';
        insertButton.style.cursor = 'pointer';
        insertButton.style.marginTop = '20px';
        insertButton.style.fontWeight = 'bold';
        insertButton.style.fontSize = '14px';
        insertButton.style.outline = 'none';
        insertButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        // Click event listener to insert the <div> element when insert button is clicked
        insertButton.onclick = function () {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();

                const div = document.createElement('div');
                div.style.whiteSpace = 'pre-wrap';

                text.split('\n').forEach(line => {
                    const paragraph = document.createElement('p');
                    paragraph.textContent = line;
                    div.appendChild(paragraph);
                });

                range.insertNode(div);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                console.log("No selection found"); 
            };
            div.remove();
        };

        div.appendChild(insertButton);
    }


    // Create a <button> element for the cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Close';
    cancelButton.style.backgroundColor = '#dc3545'; 
    cancelButton.style.color = '#fff'; 
    cancelButton.style.border = 'none'; 
    cancelButton.style.padding = '10px 20px'; 
    cancelButton.style.borderRadius = '4px'; 
    cancelButton.style.cursor = 'pointer';
    cancelButton.style.transition = 'background-color 0.3s ease'; 
    cancelButton.style.fontWeight = 'bold'; 
    cancelButton.style.fontSize = '14px';
    cancelButton.style.outline = 'none'; 
    cancelButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; 
    cancelButton.style.marginTop = '20px'; 

    // Hover effects
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.backgroundColor = '#c82333'; 
    });
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.backgroundColor = '#dc3545'; 
    });

    // Click event listener to remove the <div> element when cancel button is clicked
    cancelButton.onclick = function () {
        div.remove();
    };
    div.appendChild(cancelButton); // Append the cancel button to the <div>

    // Append the <div> to the body
    document.body.appendChild(div);
    return scriptExecuted;
}



/**
 * Replaces code within an HTML page in a specified browser tab.
 * @param {string} commentedCode - The new code with comments that will replace the existing code.
 * @param {number} tabId - The ID of the browser tab where the code replacement will occur.
 */
function replaceCodeInPage(commentedCode, tabId) {
    /**
     * This internal function will be executed in the context of the specified tab.
     * It uses the current selection to find and replace the contents of a code element.
     * @param {string} commentedCode - Code to inject into the code element found in the page.
     */
    const scriptToExecute = function (commentedCode) {
        // Obtain the current text selection in the window
        const selection = window.getSelection();
        let range;
        // If there is a selected range, use the first range to define the bounds
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
        }

        // Attempt to locate a parent element that is suitable for holding code (i.e., <pre> or <code>)
        const codeElement = range.commonAncestorContainer.closest('pre, code');

        if (codeElement) {
            // Directly replace the text content of the code element with the new code
            codeElement.textContent = commentedCode;
        } else {
            // Log an error to the console and alert the user if no appropriate code element is found
            console.error('Error replacing code: Suitable code element not found.');
            alert('Error: No suitable code element found for replacing text.');
        }
    };

    // Execute the above script in the tab identified by tabId
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: scriptToExecute,
        args: [commentedCode]
    },
    );
}
