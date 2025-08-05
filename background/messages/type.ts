import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { selector, text } = req.body

    if (!selector) {
      throw new Error("Selector is required")
    }

    if (text === undefined || text === null) {
      throw new Error("Text is required")
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    const typeIntoElement = (selector: string, text: string) => {
      const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement
      
      if (!element) {
        throw new Error(`No element found matching selector: ${selector}`)
      }

      // Check if it's a valid input element
      const isValidInput = element.tagName === 'INPUT' || 
                          element.tagName === 'TEXTAREA' || 
                          element.contentEditable === 'true' ||
                          element.hasAttribute('contenteditable')

      if (!isValidInput) {
        throw new Error(`Element matching selector "${selector}" is not a valid input element (found: ${element.tagName})`)
      }

      // Focus the element first
      element.focus()

      // Clear existing content for input/textarea elements
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = text
        
        // Trigger input events
        element.dispatchEvent(new Event('input', { bubbles: true }))
        element.dispatchEvent(new Event('change', { bubbles: true }))
      } else if (element.contentEditable === 'true' || element.hasAttribute('contenteditable')) {
        // Handle contenteditable elements
        element.textContent = text
        
        // Trigger input events for contenteditable
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }

      return {
        tagName: element.tagName,
        className: element.className || '',
        id: element.id || '',
        typedText: text,
        textLength: text.length,
        success: true
      }
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: typeIntoElement,
      args: [selector, String(text)]
    })

    const result = results[0]?.result
    console.log(`Typed text into element matching "${selector}":`, result)
    res.send({ result })
    
  } catch (error) {
    console.error("Error typing into element:", error)
    res.send({ error: error.message })
  }
}

export default handler