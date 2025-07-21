import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("capturePage handler called with params:", req.body)
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const screenshotUrl = await chrome.tabs.captureVisibleTab(tab.windowId)
    
    console.log("Screenshot captured successfully")
    res.send({ result: screenshotUrl })
  } catch (error) {
    console.error("Error capturing page:", error)
    res.send({ error: error.message })
  }
}

export default handler 