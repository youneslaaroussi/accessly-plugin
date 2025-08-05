import type { PlasmoMessaging } from "@plasmohq/messaging"

interface ToolExecutionRecord {
  id: string
  toolName: string
  parameters: Record<string, any>
  success: boolean
  result?: any
  error?: string
  startTime: number
  endTime: number
  duration: number
}

// In-memory store for tool execution history
const executionHistory: Map<string, ToolExecutionRecord> = new Map()
const maxHistorySize = 1000 // Keep last 1000 executions

export function recordToolExecution(record: ToolExecutionRecord) {
  executionHistory.set(record.id, record)
  
  // Clean up old records if we exceed max size
  if (executionHistory.size > maxHistorySize) {
    const oldestKey = executionHistory.keys().next().value
    executionHistory.delete(oldestKey)
  }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("electronToolStatus handler called with:", req.body)
    
    const { action, executionId, limit } = req.body
    
    switch (action) {
      case 'history': {
        // Get execution history
        const history = Array.from(executionHistory.values())
          .sort((a, b) => b.startTime - a.startTime) // Most recent first
          .slice(0, limit || 50) // Default to last 50 executions
        
        res.send({
          result: "Tool execution history retrieved",
          data: {
            total: executionHistory.size,
            history
          }
        })
        break
      }
      
      case 'stats': {
        // Get execution statistics
        const executions = Array.from(executionHistory.values())
        const successful = executions.filter(e => e.success).length
        const failed = executions.length - successful
        const avgDuration = executions.length > 0 
          ? executions.reduce((sum, e) => sum + e.duration, 0) / executions.length 
          : 0
        
        // Tool usage breakdown
        const toolUsage = new Map<string, { count: number, success: number, avgDuration: number }>()
        executions.forEach(exec => {
          const existing = toolUsage.get(exec.toolName) || { count: 0, success: 0, avgDuration: 0 }
          existing.count++
          if (exec.success) existing.success++
          existing.avgDuration = (existing.avgDuration * (existing.count - 1) + exec.duration) / existing.count
          toolUsage.set(exec.toolName, existing)
        })
        
        const toolStats = Object.fromEntries(
          Array.from(toolUsage.entries()).map(([tool, stats]) => [
            tool, 
            {
              ...stats,
              successRate: stats.count > 0 ? (stats.success / stats.count) * 100 : 0
            }
          ])
        )
        
        const stats = {
          overview: {
            total: executions.length,
            successful,
            failed,
            success_rate: executions.length > 0 ? (successful / executions.length) * 100 : 0,
            avg_duration: Math.round(avgDuration),
            last_24h: executions.filter(e => e.startTime > Date.now() - 24 * 60 * 60 * 1000).length,
            last_hour: executions.filter(e => e.startTime > Date.now() - 60 * 60 * 1000).length
          },
          by_tool: toolStats,
          recent_failures: executions
            .filter(e => !e.success)
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, 10)
            .map(e => ({
              tool: e.toolName,
              error: e.error,
              timestamp: e.startTime,
              parameters: e.parameters
            }))
        }
        
        res.send({
          result: "Tool execution statistics retrieved",
          data: stats
        })
        break
      }
      
      case 'get': {
        // Get specific execution by ID
        if (!executionId) {
          throw new Error("executionId is required for 'get' action")
        }
        
        const execution = executionHistory.get(executionId)
        if (!execution) {
          res.send({
            result: "Execution not found",
            data: null
          })
        } else {
          res.send({
            result: "Execution details retrieved",
            data: execution
          })
        }
        break
      }
      
      case 'clear': {
        // Clear execution history
        const clearedCount = executionHistory.size
        executionHistory.clear()
        
        res.send({
          result: `Cleared ${clearedCount} execution records`,
          data: { cleared: clearedCount }
        })
        break
      }
      
      case 'health': {
        // Get system health status
        const now = Date.now()
        const recent = Array.from(executionHistory.values())
          .filter(e => e.startTime > now - 5 * 60 * 1000) // Last 5 minutes
        
        const recentSuccess = recent.filter(e => e.success).length
        const recentFailures = recent.length - recentSuccess
        
        const health = {
          status: recentFailures === 0 ? 'healthy' : recentFailures < recent.length * 0.2 ? 'warning' : 'error',
          recent_executions: recent.length,
          recent_failures: recentFailures,
          recent_success_rate: recent.length > 0 ? (recentSuccess / recent.length) * 100 : 100,
          memory_usage: {
            stored_executions: executionHistory.size,
            max_capacity: maxHistorySize,
            usage_percentage: (executionHistory.size / maxHistorySize) * 100
          },
          timestamp: now
        }
        
        res.send({
          result: "System health status",
          data: health
        })
        break
      }
      
      default:
        throw new Error(`Unknown action: ${action}. Available actions: history, stats, get, clear, health`)
    }
    
  } catch (error) {
    console.error("Error in electronToolStatus handler:", error)
    res.send({ 
      error: error.message,
      result: "Tool status request failed"
    })
  }
}

export default handler 