import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getAlertsTool } from "./tools/get-alerts.js"
import { getForecastTool } from "./tools/get-forecast.js"
import { addNumbersTool } from "./tools/add-numbers.js"
import { registerGetResumeApp } from "./apps/get-resume/get-resume-app.js"
import { registerQuickStartApp } from "./apps/quickstart/server.js"

export function createMCPServer() {
  // Create server instance
  const server = new McpServer({
    name: "mcp-ask-archil",
    version: "1.0.0",
  })

  // Register all tools
  const tools = [getAlertsTool, getForecastTool, addNumbersTool]
  tools.forEach((tool) => tool.register(server))

  // Register MCP Apps (tools + resources with UI)
  registerGetResumeApp(server)
  registerQuickStartApp(server)

  return server
}
