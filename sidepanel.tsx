import React, { useState, useEffect } from "react"
import { parseTools } from "./lib/parser"
import type { Tool } from "./lib/parser"
import { sendToBackground } from "@plasmohq/messaging"
import "./style.css"

const Popup = () => {
  const [tools, setTools] = useState<Tool[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [params, setParams] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const parsedTools = parseTools()
    setTools(parsedTools)
  }, [])

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool)
    setParams({})
  }

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({
      ...params,
      [e.target.name]: e.target.value
    })
  }

  const handleRunTool = async () => {
    if (!activeTool) return
    
    const log = `Running tool: ${activeTool.name} with params: ${JSON.stringify(
      params
    )}`
    setLogs([...logs, log])
    
    console.log("Popup: Sending message to background", {
      name: activeTool.name,
      body: params
    })
    
    try {
      // Use Plasmo's sendToBackground function
      const response = await sendToBackground({
        name: activeTool.name as any,
        body: params
      })
      
      console.log("Popup: Received response", response)
      
      if (response.error) {
        console.log("Popup: Tool error", response.error)
        setLogs(prev => [...prev, `Error: ${response.error}`])
      } else if (response.result) {
        console.log("Popup: Tool result", response.result)
        
        // For screenshots, display them as images
        if (activeTool.name === 'capturePage' && typeof response.result === 'string' && response.result.startsWith('data:image')) {
          setLogs(prev => [...prev, `Screenshot captured: ${response.result.substring(0, 50)}...`])
          // Create and display the image
          const img = document.createElement('img')
          img.src = response.result
          img.style.maxWidth = '200px'
          img.style.border = '1px solid #666'
          img.style.marginTop = '4px'
          
          // Add image to logs container
          setTimeout(() => {
            const logsContainer = document.querySelector('.logs-container')
            if (logsContainer) {
              logsContainer.appendChild(img)
            }
          }, 100)
        } 
        // For audio recordings, display them as playable audio elements
        else if (activeTool.name === 'listen' && typeof response.result === 'string' && response.result.startsWith('data:audio')) {
          const duration = response.duration || 'unknown'
          const size = response.size || 'unknown'
          setLogs(prev => [...prev, `Audio captured: ${duration}s (${size} bytes)`])
          
          // Create and display the audio player
          const audio = document.createElement('audio')
          audio.src = response.result
          audio.controls = true
          audio.style.width = '100%'
          audio.style.marginTop = '4px'
          audio.style.border = '1px solid #666'
          audio.style.borderRadius = '4px'
          
          // Add audio player to logs container
          setTimeout(() => {
            const logsContainer = document.querySelector('.logs-container')
            if (logsContainer) {
              logsContainer.appendChild(audio)
            }
          }, 100)
        } else {
          setLogs(prev => [...prev, `Result: ${JSON.stringify(response.result)}`])
        }
      } else {
        console.log("Popup: No response received")
        setLogs(prev => [...prev, `No response received`])
      }
    } catch (error) {
      console.error("Popup: Error sending message", error)
      setLogs(prev => [...prev, `Error: ${error.message}`])
    }
  }

  return (
    <div className="w-96 p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Accessly Tool Runner</h1>
      <div className="flex">
        <div className="w-1/3 pr-2">
          <h2 className="text-lg font-semibold mb-2">Tools</h2>
          <ul>
            {tools.map((tool) => (
              <li
                key={tool.name}
                className={`cursor-pointer p-2 rounded ${
                  activeTool?.name === tool.name
                    ? "bg-blue-500"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => handleToolClick(tool)}>
                {tool.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 pl-2 border-l border-gray-700">
          {activeTool ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">
                {activeTool.name}
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                {activeTool.description}
              </p>
              {activeTool.parameters.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Parameters</h3>
                  {activeTool.parameters.map((param) => (
                    <div key={param.name} className="mb-2">
                      <label className="block text-sm text-gray-400">
                        {param.name} ({param.type})
                      </label>
                      <input
                        type="text"
                        name={param.name}
                        onChange={handleParamChange}
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
        <h2 className="text-lg font-semibold mb-2">Logs</h2>
        <div className="h-48 bg-black p-2 rounded overflow-y-auto logs-container">
          {logs.map((log, i) => (
            <div key={i} className="font-mono text-sm">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Popup
