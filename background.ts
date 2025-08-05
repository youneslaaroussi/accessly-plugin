// This is the background script.
// It will be responsible for orchestrating the tools.
// Tool handlers are now in the background/messages/ directory

import { parseTools } from "~lib/parser"
import { toolHandlers } from "./background/messages/toolHandlers"

// --- Keep-alive for Service Worker ---
// This prevents Chrome from terminating the service worker and dropping the WebSocket connection.
try {
  chrome.alarms.create("keep-alive", { periodInMinutes: 0.25 })
  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === "keep-alive") {
      // This empty listener is enough to keep the worker active.
    }
  });
} catch (error) {
  console.error("Failed to set up keep-alive alarm:", error)
}


// --- Centralized Logging ---
class BackgroundLogger {
  private logs: string[] = []
  private maxLogs = 1000

  log(message: string) {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    this.logs.push(logEntry)
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
    
    console.log(logEntry)
    
    chrome.runtime.sendMessage({ type: 'new_log', message: logEntry })
      .catch(() => { /* Ignore if no sidepanel is open */ });
  }

  getLogs = () => [...this.logs]
  clear = () => {
    this.logs = []
    chrome.runtime.sendMessage({ type: 'logs_cleared' })
      .catch(() => {});
  }
}
const logger = new BackgroundLogger()


// --- Generic Tool Runner ---
async function runTool(toolName: string, parameters: any): Promise<any> {
  logger.log(`🔧 Executing tool: ${toolName} with params: ${JSON.stringify(parameters)}`)
  try {
    const handler = toolHandlers[toolName];
    if (!handler) {
      throw new Error(`Tool '${toolName}' not found.`);
    }

    const result: any = await new Promise(async (resolve, reject) => {
      const res = { send: resolve };
      try {
        await handler({ name: toolName, body: parameters || {} } as any, res as any);
      } catch (error) {
        reject(error);
      }
    });

    // Enhanced logging for different result types
    if (result.error) {
      logger.log(`❌ Tool error for ${toolName}: ${result.error}`);
    } else if (result.result) {
      let logMsg = result.result;
      
      // Handle special result types
      if (toolName === 'capturePage' && typeof result.result === 'string' && result.result.startsWith('data:image')) {
        logMsg = `Screenshot captured (${Math.round(result.result.length / 1024)}KB)`;
      } else if (toolName === 'listen' && typeof result.result === 'string' && result.result.startsWith('data:audio')) {
        logMsg = `Audio captured (${Math.round(result.result.length / 1024)}KB)`;
      } else if (typeof result.result === 'object') {
        logMsg = JSON.stringify(result.result);
      }
      
      logger.log(`✅ Tool result for ${toolName}: ${logMsg}`);
    } else {
      logger.log(`✅ Tool completed: ${toolName}`);
    }

    return { success: !result.error, ...result };
  } catch (error) {
    logger.log(`❌ Tool execution failed for ${toolName}: ${error.message}`);
    return { success: false, error: error.message };
  }
}


// --- WebSocket Connection Manager ---
class BackgroundWebSocketManager {
  private ws: WebSocket | null = null
  private isConnecting = false
  private retryInterval = 5000
  private maxRetryInterval = 30000
  private currentRetryInterval = this.retryInterval

  constructor() { this.connect(); }

  private connect() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;
    this.isConnecting = true;
    logger.log("🔗 Attempting WebSocket connection...");

    try {
      this.ws = new WebSocket('ws://localhost:8080');
      this.ws.onopen = () => {
        logger.log("✅ WebSocket connected");
        this.isConnecting = false;
        this.currentRetryInterval = this.retryInterval;
        this.notifyUI("connected");
      };
      this.ws.onmessage = this.handleWsMessage;
      this.ws.onclose = this.handleWsClose;
      this.ws.onerror = this.handleWsError;
    } catch (error) {
      logger.log(`❌ Failed to create WebSocket: ${error.message}`);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleWsMessage = async (event: MessageEvent) => {
    try {
      const command = JSON.parse(event.data);
      logger.log(`📨 Received WebSocket command: ${command.toolName} (${command.commandId})`);
      
      if (!command.toolName) {
        logger.log(`❌ Invalid command - missing toolName`);
        return;
      }
      
      const result = await runTool(command.toolName, command.parameters || {});
      
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          commandId: command.commandId,
          success: result.success,
          result: result.result,
          error: result.error,
        }));
        logger.log(`📤 Sent WebSocket response for ${command.toolName}: ${result.success ? 'success' : 'error'}`);
      }
    } catch (error) {
      logger.log(`❌ Error processing WebSocket command: ${error.message}`);
    }
  }

  private handleWsClose = () => {
    logger.log("❌ WebSocket disconnected");
    this.ws = null;
    this.isConnecting = false;
    this.notifyUI("disconnected");
    this.scheduleReconnect();
  }

  private handleWsError = (error: Event) => {
    logger.log(`❌ WebSocket error`);
    this.isConnecting = false;
  }

  private scheduleReconnect = () => {
    logger.log(`🔄 Retrying WebSocket in ${this.currentRetryInterval / 1000}s...`);
    setTimeout(() => this.connect(), this.currentRetryInterval);
    this.currentRetryInterval = Math.min(this.currentRetryInterval * 1.5, this.maxRetryInterval);
  }

  private notifyUI = (status: "connected" | "disconnected") => {
    chrome.runtime.sendMessage({ type: 'websocket_status', status })
      .catch(() => {});
  }

  getStatus = () => ({
    connected: this.ws?.readyState === WebSocket.OPEN,
    connecting: this.isConnecting,
  })

  forceReconnect = () => {
    logger.log("🔄 Force reconnect triggered...");
    this.ws?.close();
  }
}
const wsManager = new BackgroundWebSocketManager();


// --- Centralized Message Listener ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'get_websocket_status':
      sendResponse(wsManager.getStatus());
      break;
    case 'force_websocket_reconnect':
      wsManager.forceReconnect();
      sendResponse({ success: true });
      break;
    case 'get_logs':
      sendResponse({ logs: logger.getLogs() });
      break;
    case 'clear_logs':
      logger.clear();
      sendResponse({ success: true });
      break;
    case 'run_tool':
      runTool(message.payload.toolName, message.payload.parameters)
        .then(sendResponse);
      return true; // Indicates async response
    default:
      // Not a message for us, or maybe for Plasmo's default router
      break;
  }
  return false;
});


// --- Initial Setup ---
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
logger.log("🚀 Accessly background script loaded.");
