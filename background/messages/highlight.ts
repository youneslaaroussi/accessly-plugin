import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("highlight handler called with params:", req.body)
    
    const { selector } = req.body
    
    if (!selector) {
      throw new Error("selector is required")
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    // Define the highlight function
    const highlightElements = (selector: string) => {
      const elements = document.querySelectorAll(selector)
      
      if (elements.length === 0) {
        throw new Error(`No elements found for selector: ${selector}`)
      }
      
      // Store original styles and highlight elements
      const originalStyles: any[] = []
      elements.forEach((element: Element, index: number) => {
        const htmlElement = element as HTMLElement
        // Store original background and transition
        originalStyles[index] = {
          backgroundColor: htmlElement.style.backgroundColor,
          transition: htmlElement.style.transition,
          boxShadow: htmlElement.style.boxShadow
        }
        
        // Apply highlight styles
        htmlElement.style.transition = 'all 0.3s ease'
        htmlElement.style.backgroundColor = '#ffff00'
        htmlElement.style.boxShadow = '0 0 10px rgba(255, 255, 0, 0.7)'
      })
      
      // Remove highlight after 2 seconds
      setTimeout(() => {
        elements.forEach((element: Element, index: number) => {
          const htmlElement = element as HTMLElement
          htmlElement.style.backgroundColor = originalStyles[index].backgroundColor
          htmlElement.style.boxShadow = originalStyles[index].boxShadow
          
          // Remove transition after a short delay to allow fade out
          setTimeout(() => {
            htmlElement.style.transition = originalStyles[index].transition
          }, 300)
        })
      }, 2000)
      
      return elements.length
    }
    
    // Execute the script using chrome.scripting.executeScript
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: highlightElements,
      args: [selector]
    })
    
    const elementsCount = results[0]?.result || 0
    console.log(`Highlighted ${elementsCount} elements matching "${selector}"`)
    res.send({ result: `Highlighted ${elementsCount} elements matching "${selector}"` })
  } catch (error) {
    console.error("Error highlighting element:", error)
    res.send({ error: error.message })
  }
}

export default handler 