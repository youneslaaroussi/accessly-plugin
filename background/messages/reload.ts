import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("reload handler called with params:", req.body)
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    await chrome.tabs.reload(tab.id)
    
    console.log("Tab reloaded successfully")
    res.send({ result: "Page reloaded successfully" })
  } catch (error) {
    console.error("Error reloading page:", error)
    res.send({ error: error.message })
  }
}

export default handler 