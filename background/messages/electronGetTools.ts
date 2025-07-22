import type { PlasmoMessaging } from "@plasmohq/messaging"
import { parseTools } from "~lib/parser"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("electronGetTools handler called - returning available tools")
    
    // Parse tools from the tools.ts documentation
    const parsedTools = parseTools()
    
    // Also provide a simple list of available tool names
    const availableToolNames = [
      'capturePage', 'captureHTML', 'highlight', 'clickAt', 'scrollPage', 'scrollBy', 'scrollTo', 
      'scrollIntoView', 'goTo', 'back', 'forward', 'reload', 'closeTab', 'listen', 'waitForSelector',
      'storeFact', 'getFact', 'getAllFacts', 'deleteFact'
    ]
    
    // Organize tools by category
    const toolCategories = {
      visual: ['capturePage', 'captureHTML', 'highlight'],
      action: ['clickAt', 'scrollPage', 'scrollBy', 'scrollTo', 'scrollIntoView'],
      navigation: ['goTo', 'back', 'forward', 'reload', 'closeTab'],
      sensory: ['listen', 'waitForSelector'],
      memory: ['storeFact', 'getFact', 'getAllFacts', 'deleteFact']
    }
    
    const toolsInfo = {
      total: availableToolNames.length,
      available: availableToolNames,
      detailed: parsedTools,
      categories: toolCategories,
      examples: {
        clickAt: { x: 100, y: 200 },
        highlight: { selector: ".button" },
        scrollPage: { direction: "down", speed: "medium" },
        captureHTML: { selector: "body", depth: 2 },
        goTo: { url: "https://example.com" },
        storeFact: { key: "user_preference", value: "dark_theme" },
        listen: { seconds: 5 }
      }
    }
    
    console.log(`📋 Returning ${toolsInfo.total} available tools to Electron app`)
    
    res.send({
      result: "Available tools retrieved successfully",
      tools: toolsInfo
    })
    
  } catch (error) {
    console.error("Error getting tools list:", error)
    res.send({ 
      error: error.message,
      result: "Failed to get tools list"
    })
  }
}

export default handler 