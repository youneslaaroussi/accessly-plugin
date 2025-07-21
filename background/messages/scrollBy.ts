import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("scrollBy handler called with params:", req.body)
    
    const { dx, dy } = req.body
    
    if (dx === undefined || dy === undefined) {
      throw new Error("dx and dy values are required")
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    const scrollByOffset = (dx: number, dy: number) => {
      window.scrollBy(dx, dy)
      return `Scrolled by (${dx}, ${dy})`
    }
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrollByOffset,
      args: [parseInt(dx), parseInt(dy)]
    })
    
    console.log(`Scrolled by (${dx}, ${dy})`)
    res.send({ result: `Scrolled by (${dx}, ${dy})` })
  } catch (error) {
    console.error("Error scrolling by offset:", error)
    res.send({ error: error.message })
  }
}

export default handler 