chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "improveEnglish",
        title: "Improve English",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "improveGrammar",
        title: "Improve English Grammar",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.selectionText) {
        switch(info.menuItemId) {
            case "improveEnglish":
                improveTextUsingAPI(info.selectionText, tab.id, "style");
                break;
            case "improveGrammar":
                improveTextUsingAPI(info.selectionText, tab.id, "grammar");
                break;
        }
    }
});

async function improveTextUsingAPI(text, tabId) {
    try {
        const response = await fetch('http://localhost:3000/improveEnglish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        if (!response.ok) {
            const errorDetails = await response.text();  // Retrieve text of the error response
            console.error(`Server responded with error: ${response.status} - ${errorDetails}`);
            throw new Error(`Network response was not ok: ${response.status} - ${errorDetails}`);
        }
        const data = await response.json();
        const improvedText = data.improvedText;
        replaceSelectedText(improvedText, tabId);
    } catch (error) {
        console.error('Error improving text:', error);
    }
}



function replaceSelectedText(improvedText, tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: (newText) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(newText));
        },
        args: [improvedText]
    });
}
