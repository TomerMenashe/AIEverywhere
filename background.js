// Add event listener to create context menus on extension installation
chrome.runtime.onInstalled.addListener(() => {
    // Remove all existing context menus
    chrome.contextMenus.removeAll(() => {
        // Create context menu items for each functionality
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
    });
});

// Add event listener for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.selectionText) {
        try {
            if (info.menuItemId === "summarizeText") {
                const summary = await summarizeText(info.selectionText);
                sendTextToTab(tab.id, summary,'Summery');
            } else if (info.menuItemId === "improveEnglish" || info.menuItemId === "improveEnglishCreative") {
                const temperature = info.menuItemId === "improveEnglishCreative" ? 0.5 : 0.2;
                await improveTextUsingAPI(info.selectionText, tab.id, temperature);
            } else if (info.menuItemId === "addComments") {
                await addCommentsToCode(info.selectionText, tab.id);
            }else if (info.menuItemId === "AIQuiz") {
                const quiz = await AIQuizGenerator(info.selectionText, tab.id);
                displayQuiz(tab.id, quiz, 'Quiz');

            }
            
        } catch (error) {
            console.error('Error processing request:', error);
            sendErrorToTab(tab.id, "Failed to process request. Please try again later.");
        }
    }
});

// Function to improve text using OpenAI API
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
        // Replace the selected text with the improved text
        replaceSelectedText(data.improvedText, tabId);
    } catch (error) {
        // Handle errors
        console.error('Error improving text:', error);
        sendErrorToTab(tabId, "Failed to improve text. Please try again later.");
    }
}

async function addCommentsToCode(code, tabId) {
    const endpoint = `http://localhost:3000/addCommentsToCode`; // Correct endpoint on your server
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code }) // Send only the code; the server decides the prompt
        });

        if (!response.ok) {
            throw new Error(`Failed to add comments to code. Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        replaceCodeInPage(data.commentedCode, tabId); // Ensure tabId is passed correctly here
    } catch (error) {
        console.error('Error adding comments to code:', error);
        sendErrorToTab(tabId, 'Failed to add comments to code.');
    }
}


// Function to summarize text
async function summarizeText(text) {
    console.log("Sending request to server to summarize text.");
    const endpoint = 'http://localhost:3000/summarizeText'; 
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        if (!response.ok) {
            throw new Error(`Failed to summarize text. Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        return data.summarizedText; // Ensure you are returning the correct field from the response
    } catch (error) {
        sendErrorToTab(tabId, 'Failed to summeraize text.');
        return null;
    }
}



async function AIQuizGenerator(text) {
    console.log("Sending request to server to summarize text.");
    const endpoint = 'http://localhost:3000/AIQuiz'; 
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        if (!response.ok) {
            throw new Error(`Failed to summarize text. Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        return data.generatedQuiz; // Ensure you are returning the correct field from the response
    } catch (error) {
        sendErrorToTab(tabId, 'Failed to generat quiz.');
        return null;
    }
}

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
                    // Remove asterisks and format the correct answer in green
                    line = line.replace(/\*\*/g, '');  // Remove all asterisks
                    formattedQuiz.push('<span style="color: green; font-weight: bold;">' + line + '</span><br>');
                } else {
                    formattedQuiz.push(line + '<br>');
                }
            });

            formattedQuiz.push('<hr>');  // Add a horizontal line for separation
        }
    });

    return formattedQuiz.join('');
}

// Function to display the formatted quiz text
function displayQuiz(tabId, quizText) {
    const formattedQuizText = formatQuizText(quizText);
    chrome.scripting.executeScript({
        target: { tabId },
        function: displayText,
        args: ['Quiz', formattedQuizText] // Using the modified displayText function
    });
}



function sendErrorToTab(tabId, message) {
    // Use the Chrome scripting API to run a script in the specified tab
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: showAlert,
        args: [message]  // Pass the error message to the function running in the tab
    });

    // This function will be injected and executed in the context of the specified tab
    function showAlert(message) {
        alert("Error: " + message);  // Display an alert with the error message
    }
}

function sendTextToTab(tabId, text,title) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: displayText,
        args: [title, text]
    });
}

function displayText(title, text) {
    // Create a new <div> element to display the title, text, and cancel button
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '10%';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.width = '80%';
    div.style.maxHeight = '80%';
    div.style.overflowY = 'auto'; // Enable vertical scrolling
    div.style.backgroundColor = '#f8f9fa'; // Light gray background
    div.style.padding = '20px';
    div.style.borderRadius = '8px'; // Rounded corners
    div.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'; // Shadow effect
    div.style.zIndex = '9999'; // Ensure it's on top

    // Create a <h2> element for the title
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.fontSize = '20px'; // Larger font size for the title
    titleElement.style.color = '#333'; // Darker text color
    titleElement.style.marginBottom = '10px'; // Spacing between title and text
    div.appendChild(titleElement); // Append the <h2> element to the <div>

    // Create a container for the text
    const textContainer = document.createElement('div');
    textContainer.style.maxHeight = 'calc(100% - 100px)'; // Allocate space for title and button
    textContainer.style.overflowY = 'auto'; // Enable vertical scrolling within the text container

    // Create a <div> element for the text, using innerHTML to interpret HTML if present
    const content = document.createElement('div');
    content.innerHTML = text; // Set content as HTML to allow HTML formatting
    content.style.fontSize = '16px'; // Font size for the text
    content.style.color = '#666'; // Slightly darker text color
    textContainer.appendChild(content); // Append the content <div> to the text container
    div.appendChild(textContainer); // Append the text container to the main <div>

    // Create a <button> element for the cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Close';
    cancelButton.style.backgroundColor = '#dc3545'; // Red background color
    cancelButton.style.color = '#fff'; // White text color
    cancelButton.style.border = 'none'; // No border
    cancelButton.style.padding = '10px 20px'; // Padding
    cancelButton.style.borderRadius = '4px'; // Rounded corners
    cancelButton.style.cursor = 'pointer'; // Pointer cursor
    cancelButton.style.transition = 'background-color 0.3s ease'; // Smooth hover effect
    cancelButton.style.fontWeight = 'bold'; // Bold text
    cancelButton.style.fontSize = '14px'; // Smaller font size
    cancelButton.style.outline = 'none'; // Remove focus outline
    cancelButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; // Shadow effect
    cancelButton.style.marginTop = '20px'; // Margin top for spacing
    // Hover effects
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.backgroundColor = '#c82333'; // Darker red on hover
    });
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.backgroundColor = '#dc3545'; // Original red on hover out
    });
    // Click event listener to remove the <div> element when cancel button is clicked
    cancelButton.onclick = function() {
        div.remove();
    };
    div.appendChild(cancelButton); // Append the cancel button to the <div>

    // Append the <div> to the body
    document.body.appendChild(div);
}




function replaceSelectedText(newText, tabId) {
    chrome.scripting.executeScript({
        target: { tabId },
        function: replaceText,
        args: [newText]
    });
}


function replaceText(newText) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create a container element to insert text
        const div = document.createElement('div');
        div.style.whiteSpace = 'pre-wrap'; // Preserves whitespace but wraps text

        // Split text into lines to handle natural breaks
        newText.split('\n').forEach(line => {
            const paragraph = document.createElement('p');
            paragraph.textContent = line;
            div.appendChild(paragraph);
        });

        // Insert the formatted text into the document
        range.insertNode(div);

        // Clear the selection to avoid visual confusion after inserting the text
        selection.removeAllRanges();
        selection.addRange(range);
    }
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
    const scriptToExecute = function(commentedCode) {
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




    









