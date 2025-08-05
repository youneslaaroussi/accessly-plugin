import type { PlasmoMessaging } from "@plasmohq/messaging"
import { sendToBackground } from "@plasmohq/messaging"
import { recordToolExecution } from "./electronToolStatus"

interface ToolExecutionRequest {
  toolName: string
  parameters?: Record<string, any>
  executionId?: string  // For tracking async responses
}

interface ToolExecutionResponse {
  success: boolean
  executionId: string
  toolName: string
  result?: any
  error?: string
  timestamp: number
  duration?: number
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("electronRunTool handler called with:", req.body)
    
    const { toolName, parameters = {}, executionId } = req.body as ToolExecutionRequest
    
    if (!toolName) {
      throw new Error("toolName is required")
    }
    
    // Generate execution ID if not provided
    const execId = executionId || `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()
    
    console.log(`🔧 Executing tool: ${toolName} with ID: ${execId}`)
    
    // List of available tools that can be executed
    const availableTools = [
      'capturePage', 'captureHTML', 'highlight', 'clickAt', 'scrollPage', 'scrollBy', 'scrollTo', 
      'scrollIntoView', 'goTo', 'back', 'forward', 'reload', 'closeTab', 'getTabs', 'listen', 'waitForSelector',
      'storeFact', 'getFact', 'getAllFacts', 'deleteFact'
    ]
    
    if (!availableTools.includes(toolName)) {
      throw new Error(`Tool '${toolName}' is not available. Available tools: ${availableTools.join(', ')}`)
    }
    
    try {
      // Execute the tool by calling its message handler
      const toolResponse = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({
          name: toolName,
          body: parameters
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve(response)
          }
        })
      })
      
      const duration = Date.now() - startTime
      
      const executionResponse: ToolExecutionResponse = {
        success: !toolResponse?.error,
        executionId: execId,
        toolName,
        result: toolResponse?.result || toolResponse,
        error: toolResponse?.error,
        timestamp: Date.now(),
        duration
      }
      
      // Record execution for tracking
      recordToolExecution({
        id: execId,
        toolName,
        parameters,
        success: executionResponse.success,
        result: executionResponse.result,
        error: executionResponse.error,
        startTime,
        endTime: Date.now(),
        duration
      })
      
      if (executionResponse.success) {
        console.log(`✅ Tool '${toolName}' executed successfully in ${duration}ms`)
      } else {
        console.log(`❌ Tool '${toolName}' failed: ${executionResponse.error}`)
      }
      
      res.send({
        result: "Tool execution completed",
        execution: executionResponse
      })
      
    } catch (toolError) {
      const duration = Date.now() - startTime
      
      const errorResponse: ToolExecutionResponse = {
        success: false,
        executionId: execId,
        toolName,
        error: toolError instanceof Error ? toolError.message : 'Unknown tool execution error',
        timestamp: Date.now(),
        duration
      }
      
      // Record failed execution for tracking
      recordToolExecution({
        id: execId,
        toolName,
        parameters,
        success: false,
        error: errorResponse.error,
        startTime,
        endTime: Date.now(),
        duration
      })
      
      console.log(`❌ Tool '${toolName}' execution failed: ${errorResponse.error}`)
      
      res.send({
        result: "Tool execution failed",
        execution: errorResponse
      })
    }
    
  } catch (error) {
    console.error("Error in electronRunTool handler:", error)
    res.send({ 
      error: error.message,
      result: "Invalid tool execution request"
    })
  }
}

export default handler 