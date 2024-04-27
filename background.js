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
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.selectionText) {
        try {
            if (info.menuItemId === "summarizeText") {
                const summary = await summarizeText(info.selectionText);
                sendTextToTab(tab.id, summary);
            } else if (info.menuItemId === "improveEnglish" || info.menuItemId === "improveEnglishCreative") {
                const temperature = info.menuItemId === "improveEnglishCreative" ? 0.5 : 0.2;
                await improveTextUsingAPI(info.selectionText, tab.id, temperature);
            } else if (info.menuItemId === "addComments") {
                await addCommentsToCode(info.selectionText, tab.id);
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
        console.error('Error summarizing text:', error);
        return null;
    }
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

function sendTextToTab(tabId, text) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: displayText,
        args: ['summery', text]
    });

    function displayText(title, text) {
        // Create a new <div> element to display the title, text, and cancel button
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '50%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
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
        // Append the <h2> element to the <div>
        div.appendChild(titleElement);

        // Create a <p> element to display the text
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        paragraph.style.fontSize = '16px'; // Font size for the text
        paragraph.style.color = '#666'; // Slightly darker text color
        paragraph.style.marginBottom = '20px'; // Spacing between text and button
        // Append the <p> element to the <div>
        div.appendChild(paragraph);

        // Create a <button> element for the cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
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
        cancelButton.style.margin = '0 auto'; // Center the button
        // Hover effect
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
        // Append the cancel button to the <div>
        div.appendChild(cancelButton);

        // Append the <div> to the body
        document.body.appendChild(div);
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



    









