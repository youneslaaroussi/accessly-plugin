// This is the background script.
// It will be responsible for orchestrating the tools.
// Tool handlers are now in the background/messages/ directory

// Open the side panel on the extension icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

console.log("Accessly background script loaded with side panel behavior")
