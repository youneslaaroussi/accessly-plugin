import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("capturePage handler called with params:", req.body)
    
    // Query for active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    console.log("Found tabs:", tabs.length)
    
    if (!tabs.length) {
      throw new Error("No active tab found")
    }
    
    const tab = tabs[0]
    console.log("Active tab:", tab.url, tab.id)
    
    // Check if tab has a valid URL that can be captured
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      throw new Error("Cannot capture screenshots of chrome:// or extension pages")
    }
    
    // Capture screenshot
    console.log("Attempting to capture screenshot...")
    const screenshotUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' })
    
    console.log("Screenshot captured successfully, size:", screenshotUrl.length)
    res.send({ result: screenshotUrl })
    
  } catch (error) {
    console.error("Error capturing page:", error)
    res.send({ error: error.message })
  }
}

export default handler 