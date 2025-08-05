import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { selector } = req.body

    if (!selector) {
      throw new Error("Selector is required")
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    const clickElement = (selector: string) => {
      const element = document.querySelector(selector) as HTMLElement
      
      if (!element) {
        throw new Error(`No element found matching selector: ${selector}`)
      }

      element.click()
      
      return {
        tagName: element.tagName,
        className: element.className || '',
        id: element.id || '',
        textContent: element.textContent?.slice(0, 100) || '', // First 100 chars
        success: true
      }
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: clickElement,
      args: [selector]
    })

    const result = results[0]?.result
    console.log(`Clicked element matching "${selector}":`, result)
    res.send({ result })
    
  } catch (error) {
    console.error("Error clicking selector element:", error)
    res.send({ error: error.message })
  }
}

export default handler