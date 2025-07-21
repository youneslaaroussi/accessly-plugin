import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { selector, timeout = 30000 } = req.body // Default timeout 30 seconds

    if (!selector) {
      throw new Error("Selector is required.")
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    const waitForElement = (selector: string, timeout: number) => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now()

        const observer = new MutationObserver(() => {
          if (document.querySelector(selector)) {
            observer.disconnect()
            resolve(`Element "${selector}" appeared.`)
          }
        })

        const checkElement = () => {
          if (document.querySelector(selector)) {
            resolve(`Element "${selector}" is already present.`)
          } else if (Date.now() - startTime > timeout) {
            observer.disconnect()
            reject(new Error(`Timeout waiting for element: ${selector}`))
          } else {
            requestAnimationFrame(checkElement)
          }
        }
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        })

        checkElement()
      })
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: waitForElement,
      args: [selector, parseInt(timeout, 10)]
    })
    
    const result = results[0]?.result || `Finished waiting for selector "${selector}"`
    console.log(result)
    res.send({ result })

  } catch (error) {
    console.error("Error waiting for selector:", error)
    res.send({ error: error.message })
  }
}

export default handler 