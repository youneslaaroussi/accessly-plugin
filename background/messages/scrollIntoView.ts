import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("scrollIntoView handler called with params:", req.body)
    
    const { selector } = req.body
    
    if (!selector) {
      throw new Error("selector is required")
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    const scrollElementIntoView = (selector: string) => {
      const element = document.querySelector(selector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return `Scrolled element "${selector}" into view`
      } else {
        throw new Error(`Element not found: ${selector}`)
      }
    }
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrollElementIntoView,
      args: [selector]
    })
    
    const result = results[0]?.result || `Scrolled element "${selector}" into view`
    console.log(result)
    res.send({ result })
  } catch (error) {
    console.error("Error scrolling element into view:", error)
    res.send({ error: error.message })
  }
}

export default handler 