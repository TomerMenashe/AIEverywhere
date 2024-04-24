chrome.runtime.onInstalled.addListener(() => {
    // Ensure context menus are created only once
    chrome.contextMenus.removeAll(() => {
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
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.selectionText) {
        const temperature = info.menuItemId === "improveEnglishCreative" ? 0.5 : 0.2;
        improveTextUsingAPI(info.selectionText, tab.id, temperature);
    }
});

async function improveTextUsingAPI(text, tabId, temperature) {
    const endpoint = `http://localhost:3000/${temperature > 0.5 ? 'improveEnglishCreative' : 'improveEnglish'}`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        if (!response.ok) {
            throw new Error(`Failed to improve text. Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        replaceSelectedText(data.improvedText, tabId);
    } catch (error) {
        console.error('Error improving text:', error);
        sendErrorToTab(tabId, "Failed to improve text. Please try again later.");
    }
}

function replaceSelectedText(improvedText, tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: replaceText,
        args: [improvedText]
    });
}

function replaceText(newText) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
}

function sendErrorToTab(tabId, message) {
    chrome.tabs.sendMessage(tabId, { type: "error", text: message });
}
