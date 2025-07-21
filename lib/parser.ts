import tools from "data-text:./tools.ts"

export interface Tool {
  name: string
  description: string
  parameters: {
    name: string
    type: string
  }[]
}

export const parseTools = (): Tool[] => {
  const toolBlocks = tools.split("/**").slice(1)
  const parsedTools: Tool[] = []

  for (const block of toolBlocks) {
    const lines = block.split("\n").filter((line) => line.trim().startsWith("*"))
    if (lines.length === 0) continue

    const tool: Partial<Tool> = { parameters: [] }
    let section: string | null = null

    for (const line of lines) {
      const trimmedLine = line.trim().substring(1).trim()
      if (trimmedLine.startsWith("@tool")) {
        tool.name = trimmedLine.split(" ")[1]
      } else if (trimmedLine.startsWith("@description")) {
        tool.description = trimmedLine.split(" ").slice(1).join(" ")
      } else if (trimmedLine.startsWith("@param")) {
        const [, name, type] = trimmedLine.split(" ")
        tool.parameters.push({ name, type })
      }
    }

    if (tool.name) {
      parsedTools.push(tool as Tool)
    }
  }

  return parsedTools
} 