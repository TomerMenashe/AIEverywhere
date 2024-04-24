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
    });
});

// Add event listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Check if text is selected
    if (info.selectionText) {
        // Handle Improve English context menu clicks
        if (info.menuItemId === "improveEnglish" || info.menuItemId === "improveEnglishCreative") {
            // Determine temperature based on the selected context menu item
            const temperature = info.menuItemId === "improveEnglishCreative" ? 0.5 : 0.2;
            // Call function to improve text using OpenAI API
            improveTextUsingAPI(info.selectionText, tab.id, temperature);
        } 
        // Handle Add Comments to Code context menu clicks
        else if (info.menuItemId === "addComments") {
            // Call function to add comments to selected code
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

function addCommentsToCode(selectedText, tabId) {
    // Send the selected code to the server to add comments
    fetch('http://localhost:3000/addCommentsToCode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: selectedText })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add comments to code');
        }
        return response.json();
    })
    .then(data => {
        // Integrate the comments into the original code
        const integratedCode = integrateComments(selectedText, data.commentedCode);
        
        // Replace the selected code with the integrated code
        replaceSelectedText(integratedCode, tabId);
    })
    .catch(error => {
        console.error('Error adding comments to code:', error);
        // Handle error
    });
}






// Function to replace the selected text in the browser tab
function replaceSelectedText(newText, tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: replaceText,
        args: [newText]
    });
}

// Function to send an error message to the browser tab
function sendErrorToTab(tabId, message) {
    chrome.tabs.sendMessage(tabId, { type: "error", text: message });
}

// Function to replace the selected text in the browser tab
function replaceText(newText) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
}

function integrateComments(originalCode, commentedCode) {
    const originalLines = originalCode.split('\n');
    const commentedLines = commentedCode.split('\n');

    // Loop through each line of the original code and add comments if available
    let integratedCode = '';
    for (let i = 0; i < originalLines.length; i++) {
        integratedCode += originalLines[i];
        if (commentedLines[i]) {
            // Add generated comments as additional lines
            integratedCode += '\n\n// ' + commentedLines[i];
        }
        integratedCode += '\n'; // Add a new line after each original line
    }

    // Join the lines back together to get the integrated code
    return integratedCode;
}


