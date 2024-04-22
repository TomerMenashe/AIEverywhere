chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "improve-english",
        title: "Improve English",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "improve-english") {
        const userText = info.selectionText;
        fetch('https://api.openai.com/v1/engines/davinci/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer sk-proj-SkYOclruXf31pxZXFqiQT3BlbkFJcW20zhBmwrLL92MwVV9P',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: "Improve this English: " + userText,
                max_tokens: 150
            })
        })
        .then(response => response.json())
        .then(data => {
            const improvedText = data.choices[0].text.trim();
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: replaceSelectedText,
                args: [improvedText]
            });
        })
        .catch(console.error);
    }
});

function replaceSelectedText(newText) {
    document.execCommand("insertText", false, newText);
}
