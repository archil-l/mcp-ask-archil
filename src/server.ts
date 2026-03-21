import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getAlertsTool } from "./tools/get-alerts.js";
import { getForecastTool } from "./tools/get-forecast.js";

export function createMCPServer() {
  // Create server instance
  const server = new McpServer({
    name: "weather",
    version: "1.0.0",
  });

  // Register all tools
  const tools = [getAlertsTool, getForecastTool];
  tools.forEach((tool) => tool.register(server));

  return server;
}
