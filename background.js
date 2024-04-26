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
    });
});

// Add event listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.selectionText) {
        if (info.menuItemId === "summarizeText") {
            // Call function to summarize text
            summarizeText(info.selectionText, tab.id);
        } else if (info.menuItemId === "improveEnglish" || info.menuItemId === "improveEnglishCreative") {
            const temperature = info.menuItemId === "improveEnglishCreative" ? 0.5 : 0.2;
            improveTextUsingAPI(info.selectionText, tab.id, temperature);
        } else if (info.menuItemId === "addComments") {
            addCommentsToCode(info.selectionText, tab.id);
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
    const endpoint = 'http://localhost:3000/summarizeText'; // Make sure this endpoint is correctly implemented on your server
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
        return data.summary;
    } catch (error) {
        console.error('Error summarizing text:', error);
        return null;
    }
}

// Function to display the summary in a popup
function displaySummaryInPopup(summary) {
    const popup = document.createElement('div');
    popup.id = 'summary-popup';
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.right = '20px';
    popup.style.padding = '10px';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid #ccc';
    popup.style.borderRadius = '5px';
    popup.style.zIndex = '10000';
    popup.textContent = summary || 'Failed to summarize text.';
    document.body.appendChild(popup);

    // Optionally, close the popup after a delay
    setTimeout(() => { popup.remove(); }, 10000); // Close after 10 seconds
}

// Add event listener for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.selectionText) {
        if (info.menuItemId === "summarizeText") {
            // Call function to summarize text
            const summary = await summarizeText(info.selectionText);
            displaySummaryInPopup(summary);
        }
    }
});


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

function replaceCodeInPage(commentedCode, tabId) {
    // Script to execute in the tab context
    const scriptToExecute = function(commentedCode) {
        // Get the current selection
        const selection = window.getSelection();
        let range;
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
        }

        // Try to find a parent element that can be considered a code container
        const codeElement = range.commonAncestorContainer.closest('pre, code');

        if (codeElement) {
            // Replace the content of the code element with the commented code
            codeElement.textContent = commentedCode;

            // Optionally, you can replace only the selected part of the code
            // This would be more complex and depends on your specific requirements
        } else {
            console.error('Error replacing code: Suitable code element not found.');
            alert('Error: No suitable code element found for replacing text.');
        }
    };

    // Execute the script in the specified tab
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: scriptToExecute,
        args: [commentedCode]
    }, (results) => {
        // Handle any errors that occur during execution
        if (chrome.runtime.lastError || results.length === 0 || !results[0].result) {
            console.error('Failed to replace code in page:', chrome.runtime.lastError || 'No results returned.');
        }
    });
}

    









