import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { x, y } = req.body

    if (x === undefined || y === undefined) {
      throw new Error("x and y coordinates are required")
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    const clickAtPoint = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y) as HTMLElement
      if (element) {
        element.click()
        return `Clicked at coordinates (${x}, ${y}) on element: ${element.tagName}`
      } else {
        throw new Error(`No element found at coordinates (${x}, ${y})`)
      }
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: clickAtPoint,
      args: [parseInt(x, 10), parseInt(y, 10)]
    })

    const result = results[0]?.result || `Clicked at coordinates (${x}, ${y})`
    console.log(result)
    res.send({ result })
    
  } catch (error) {
    console.error("Error clicking at coordinates:", error)
    res.send({ error: error.message })
  }
}

export default handler 