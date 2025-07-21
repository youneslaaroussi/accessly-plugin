import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("scrollPage handler called with params:", req.body)
    
    const { direction, speed } = req.body
    
    if (!direction || !["up", "down"].includes(direction)) {
      throw new Error("direction must be 'up' or 'down'")
    }
    
    if (!speed || !["slow", "medium", "fast"].includes(speed)) {
      throw new Error("speed must be 'slow', 'medium', or 'fast'")
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    const scrollPageContinuous = (direction: string, speed: string) => {
      // Define scroll distances and intervals based on speed
      const speedSettings = {
        slow: { distance: 50, interval: 100 },
        medium: { distance: 100, interval: 50 },
        fast: { distance: 200, interval: 25 }
      }
      
      const { distance, interval } = speedSettings[speed as keyof typeof speedSettings]
      const scrollDistance = direction === "down" ? distance : -distance
      
      let scrollCount = 0
      const maxScrolls = 20 // Scroll for about 2 seconds
      const scrollInterval = setInterval(() => {
        window.scrollBy(0, scrollDistance)
        scrollCount++
        if (scrollCount >= maxScrolls) {
          clearInterval(scrollInterval)
        }
      }, interval)
      
      return `Started scrolling ${direction} at ${speed} speed`
    }
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrollPageContinuous,
      args: [direction, speed]
    })
    
    const result = results[0]?.result || `Started scrolling ${direction} at ${speed} speed`
    console.log(result)
    res.send({ result })
  } catch (error) {
    console.error("Error scrolling page:", error)
    res.send({ error: error.message })
  }
}

export default handler 