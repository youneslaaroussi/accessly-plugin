import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("scrollTo handler called with params:", req.body)
    
    const { x, y } = req.body
    
    if (x === undefined || y === undefined) {
      throw new Error("x and y coordinates are required")
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    const scrollToPosition = (x: number, y: number) => {
      window.scrollTo(x, y)
      return `Scrolled to (${x}, ${y})`
    }
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrollToPosition,
      args: [parseInt(x), parseInt(y)]
    })
    
    console.log(`Scrolled to coordinates (${x}, ${y})`)
    res.send({ result: `Scrolled to coordinates (${x}, ${y})` })
  } catch (error) {
    console.error("Error scrolling to coordinates:", error)
    res.send({ error: error.message })
  }
}

export default handler 