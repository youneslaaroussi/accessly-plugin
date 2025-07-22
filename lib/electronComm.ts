// ElectronComm service for communicating with external Electron app
// Handles HTTP-based communication between Chrome extension and Electron app

interface ElectronCommConfig {
  host?: string
  port?: number
  timeout?: number
}

interface ElectronMessage {
  type: string
  data?: any
  timestamp?: number
}

interface ElectronResponse {
  success: boolean
  data?: any
  error?: string
}

interface ToolExecutionRequest {
  toolName: string
  parameters?: Record<string, any>
  executionId?: string
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

class ElectronComm {
  private host: string
  private port: number
  private timeout: number
  private baseUrl: string

  constructor(config: ElectronCommConfig = {}) {
    this.host = config.host || 'localhost'
    this.port = config.port || 3001
    this.timeout = config.timeout || 5000
    this.baseUrl = `http://${this.host}:${this.port}`
  }

  /**
   * Check if the Electron app is running and responding
   */
  async isConnected(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health', 'GET')
      return response.success
    } catch (error) {
      console.log('Electron app not connected:', error)
      return false
    }
  }

  /**
   * Send a message to the Electron app
   */
  async sendMessage(type: string, data?: any): Promise<ElectronResponse> {
    const message: ElectronMessage = {
      type,
      data,
      timestamp: Date.now()
    }

    try {
      return await this.makeRequest('/message', 'POST', message)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get data from the Electron app
   */
  async getData(endpoint: string): Promise<ElectronResponse> {
    try {
      return await this.makeRequest(endpoint, 'GET')
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send data to the Electron app
   */
  async postData(endpoint: string, data: any): Promise<ElectronResponse> {
    try {
      return await this.makeRequest(endpoint, 'POST', data)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Execute a tool via Electron app (convenience method)
   */
  async executeTool(toolName: string, parameters?: Record<string, any>, executionId?: string): Promise<ToolExecutionResponse> {
    const request: ToolExecutionRequest = {
      toolName,
      parameters: parameters || {},
      executionId
    }

    try {
      const response = await this.makeRequest('/extension/run-tool', 'POST', request)
      
      if (response.success && response.data?.execution) {
        return response.data.execution as ToolExecutionResponse
      } else {
        return {
          success: false,
          executionId: executionId || `exec_${Date.now()}`,
          toolName,
          error: response.error || 'Tool execution failed',
          timestamp: Date.now()
        }
      }
    } catch (error) {
      return {
        success: false,
        executionId: executionId || `exec_${Date.now()}`,
        toolName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  /**
   * Get available tools from the Chrome extension
   */
  async getAvailableTools(): Promise<any> {
    try {
      const response = await this.makeRequest('/extension/tools', 'GET')
      return response.success ? response.data : null
    } catch (error) {
      console.error('Failed to get available tools:', error)
      return null
    }
  }

  // Convenience methods for common tools

  /**
   * Click at specific coordinates
   */
  async clickAt(x: number, y: number): Promise<ToolExecutionResponse> {
    return this.executeTool('clickAt', { x, y })
  }

  /**
   * Scroll the page
   */
  async scrollPage(direction: 'up' | 'down', speed: 'slow' | 'medium' | 'fast' = 'medium'): Promise<ToolExecutionResponse> {
    return this.executeTool('scrollPage', { direction, speed })
  }

  /**
   * Navigate to a URL
   */
  async navigateToUrl(url: string): Promise<ToolExecutionResponse> {
    return this.executeTool('goTo', { url })
  }

  /**
   * Highlight an element
   */
  async highlightElement(selector: string): Promise<ToolExecutionResponse> {
    return this.executeTool('highlight', { selector })
  }

  /**
   * Capture HTML content
   */
  async captureHTML(selector?: string, depth?: number): Promise<ToolExecutionResponse> {
    return this.executeTool('captureHTML', { selector, depth })
  }

  /**
   * Store a fact/data
   */
  async storeFact(key: string, value: any): Promise<ToolExecutionResponse> {
    return this.executeTool('storeFact', { key, value })
  }

  /**
   * Get stored fact/data
   */
  async getFact(key: string): Promise<ToolExecutionResponse> {
    return this.executeTool('getFact', { key })
  }

  /**
   * Listen to page audio
   */
  async listenToPage(seconds: number = 5): Promise<ToolExecutionResponse> {
    return this.executeTool('listen', { seconds })
  }

  /**
   * Wait for an element to appear
   */
  async waitForElement(selector: string, timeout: number = 10000): Promise<ToolExecutionResponse> {
    return this.executeTool('waitForSelector', { selector, timeout })
  }

  /**
   * Make HTTP request to Electron app
   */
  private async makeRequest(endpoint: string, method: 'GET' | 'POST', data?: any): Promise<ElectronResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Accessly-Chrome-Extension'
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result as ElectronResponse
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  /**
   * Update connection settings
   */
  updateConfig(config: ElectronCommConfig) {
    if (config.host) this.host = config.host
    if (config.port) this.port = config.port
    if (config.timeout) this.timeout = config.timeout
    this.baseUrl = `http://${this.host}:${this.port}`
  }
}

// Export singleton instance
export const electronComm = new ElectronComm()

// Export types for use in other files
export type { 
  ElectronCommConfig, 
  ElectronMessage, 
  ElectronResponse, 
  ToolExecutionRequest, 
  ToolExecutionResponse 
} 