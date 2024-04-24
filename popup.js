document.addEventListener('DOMContentLoaded', function() {
    const statusText = document.getElementById('statusText');
    // You can use messaging to communicate with the background script if needed
    chrome.runtime.sendMessage({command: "getStatus"}, function(response) {
        if (response && response.isActive) {
            statusText.textContent = "Extension is active.";
        } else {
            statusText.textContent = "Extension is inactive.";
        }
    });
});
