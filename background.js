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
        else if (info.menuItemId === "addComments" && info.selectionText) {
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

async function addCommentsToCode(code, prompt, tabId) {
    try {
        const response = await fetch('http://localhost:3000/addCommentsToCode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, prompt: prompt })
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

    function replaceCodeInPage(commentedCode) {
        // Find the code element in the page (you might need to adjust this selector based on your page structure)
        const codeElement = document.querySelector('pre code');
        
        if (codeElement) {
            // Replace the content of the code element with the commented code
            codeElement.textContent = commentedCode;
        } else {
            console.error('Error replacing code: Code element not found.');
        }
    }
    
}








