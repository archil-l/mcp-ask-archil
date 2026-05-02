import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { addNumbersTool } from "./tools/add-numbers.js";
import { registerGetResumeApp } from "./apps/get-resume/get-resume-app.js";
import { registerGetArchitectureApp } from "./apps/get-architecture/get-architecture-app.js";
import { registerGetArchilsWorkExperienceApp } from "./apps/get-archils-work-experience/get-archils-work-experience-app.js";

export function createMCPServer() {
  // Create server instance
  const server = new McpServer({
    name: "mcp-ask-archil",
    version: "1.0.0",
  });

  // Register all tools
  const tools = [addNumbersTool];
  tools.forEach((tool) => tool.register(server));

  // Register MCP Apps (tools + resources with UI)
  registerGetResumeApp(server);
  registerGetArchitectureApp(server);
  registerGetArchilsWorkExperienceApp(server);

  return server;
}
