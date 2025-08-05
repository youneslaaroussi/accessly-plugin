import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { selector } = req.body

    if (!selector) {
      throw new Error("Selector is required")
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    const clickAllElements = (selector: string) => {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>
      
      if (elements.length === 0) {
        throw new Error(`No elements found matching selector: ${selector}`)
      }

      const results = []
      elements.forEach((element, index) => {
        try {
          element.click()
          results.push({
            index,
            tagName: element.tagName,
            className: element.className || '',
            id: element.id || '',
            success: true
          })
        } catch (error) {
          results.push({
            index,
            tagName: element.tagName,
            className: element.className || '',
            id: element.id || '',
            success: false,
            error: error.message
          })
        }
      })

      return {
        totalElements: elements.length,
        successfulClicks: results.filter(r => r.success).length,
        failedClicks: results.filter(r => !r.success).length,
        results
      }
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: clickAllElements,
      args: [selector]
    })

    const result = results[0]?.result
    console.log(`Clicked all elements matching "${selector}":`, result)
    res.send({ result })
    
  } catch (error) {
    console.error("Error clicking all selector elements:", error)
    res.send({ error: error.message })
  }
}

export default handler