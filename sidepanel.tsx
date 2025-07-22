import React, { useState, useEffect } from "react"
import { parseTools } from "./lib/parser"
import type { Tool } from "./lib/parser"
import "./style.css"

const Popup = () => {
  const [tools, setTools] = useState<Tool[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [params, setParams] = useState<{ [key: string]: string }>({})
  const [wsStatus, setWsStatus] = useState({ connected: false, connecting: false })

  // --- API Calls to Background Script ---
  const callBackground = (message: any): Promise<any> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  }
  const syncLogs = async () => {
    const response: any = await callBackground({ type: 'get_logs' });
    if (response?.logs) setLogs(response.logs);
  }
  const updateWebSocketStatus = async () => {
    const status: any = await callBackground({ type: 'get_websocket_status' });
    setWsStatus(status || { connected: false, connecting: false });
  }
  const forceReconnect = () => callBackground({ type: 'force_websocket_reconnect' });
  const clearLogs = () => callBackground({ type: 'clear_logs' });
  const runToolViaBackground = (toolName: string, parameters: any) => {
    return callBackground({ type: 'run_tool', payload: { toolName, parameters } });
  }

  // --- Effects ---
  useEffect(() => {
    const parsedTools = parseTools()
    setTools(parsedTools)
    
    syncLogs()
    updateWebSocketStatus()
    
    const statusInterval = setInterval(updateWebSocketStatus, 2000)
    
    const handleBackgroundMessage = (message: any) => {
      if (message.type === 'websocket_status') {
        setWsStatus(prev => ({ ...prev, connected: message.status === 'connected' }))
      } else if (message.type === 'new_log') {
        setLogs(prev => [...prev, message.message])
      } else if (message.type === 'logs_cleared') {
        setLogs([])
      }
    }
    
    chrome.runtime.onMessage.addListener(handleBackgroundMessage)
    
    return () => {
      clearInterval(statusInterval)
      chrome.runtime.onMessage.removeListener(handleBackgroundMessage)
    }
  }, [])

  // --- Handlers ---
  const handleRunTool = async () => {
    if (!activeTool) return
    const response: any = await runToolViaBackground(activeTool.name, params);
    
    if (response?.result) {
      // For screenshots, display them as images
      if (activeTool.name === 'capturePage' && typeof response.result === 'string' && response.result.startsWith('data:image')) {
        const img = document.createElement('img')
        img.src = response.result
        img.style.maxWidth = '200px'
        img.style.border = '1px solid #666'
        img.style.marginTop = '4px'
        
        setTimeout(() => {
          const logsContainer = document.querySelector('.logs-container')
          if (logsContainer) logsContainer.appendChild(img)
        }, 100)
      } 
      // For audio recordings, display them as playable audio elements
      else if (activeTool.name === 'listen' && typeof response.result === 'string' && response.result.startsWith('data:audio')) {
        const audio = document.createElement('audio')
        audio.src = response.result
        audio.controls = true
        audio.style.width = '100%'
        audio.style.marginTop = '4px'
        
        setTimeout(() => {
          const logsContainer = document.querySelector('.logs-container')
          if (logsContainer) logsContainer.appendChild(audio)
        }, 100)
      }
    }
  }

  // --- Render ---
  return (
    <div className="w-96 p-4 bg-gray-900 text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Accessly</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            wsStatus.connecting ? 'bg-yellow-500 animate-pulse' :
            wsStatus.connected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <button
            onClick={forceReconnect}
            disabled={wsStatus.connecting}
            className={`text-xs px-2 py-1 rounded ${
              wsStatus.connecting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            {wsStatus.connecting ? 'Connecting...' : 'Retry'}
          </button>
        </div>
      </div>
      
      {/* WebSocket Status Panel */}
      <div className={`mb-4 p-3 rounded border-l-4 ${
        wsStatus.connected ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'
      }`}>
        <p className="font-semibold">
          {wsStatus.connecting ? '🔄 Connecting...' :
           wsStatus.connected ? '✅ Connected' : '❌ Disconnected'}
        </p>
        <p className="text-sm opacity-90">
          {wsStatus.connected 
            ? 'Ready for commands from Electron.'
            : 'Background script is trying to connect...'}
        </p>
      </div>

      <div className="flex">
        <div className="w-1/3 pr-2">
          <h2 className="text-lg font-semibold mb-2">Tools</h2>
          <ul>
            {tools.map((tool) => (
              <li
                key={tool.name}
                className={`cursor-pointer p-2 rounded ${
                  activeTool?.name === tool.name ? "bg-blue-500" : "hover:bg-gray-700"
                }`}
                onClick={() => { setActiveTool(tool); setParams({}) }}>
                {tool.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 pl-2 border-l border-gray-700">
          {activeTool ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">{activeTool.name}</h2>
              <p className="text-sm text-gray-400 mb-4">{activeTool.description}</p>
              {activeTool.parameters.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Parameters</h3>
                  {activeTool.parameters.map((param) => (
                    <div key={param.name} className="mb-2">
                      <label className="block text-sm text-gray-400">{param.name} ({param.type})</label>
                      <input
                        type="text"
                        name={param.name}
                        onChange={(e) => setParams({...params, [e.target.name]: e.target.value})}
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={handleRunTool}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                Run Tool
              </button>
            </div>
          ) : (
            <div className="text-gray-500">Select a tool to run</div>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Logs</h2>
          <button
            onClick={clearLogs}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded">
            Clear
          </button>
        </div>
        <div className="h-48 bg-black p-2 rounded overflow-y-auto logs-container">
          {logs.map((log, i) => (
            <div key={i} className="font-mono text-sm">{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Popup
