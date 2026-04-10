import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import fs from "node:fs/promises"
import path from "node:path"

const DIST_DIR = path.join(import.meta.dirname, "dist")

/**
 * Registers the get-resume MCP App (tool + resource) on the given server.
 */
export function registerQuickStartApp(server: McpServer): void {
  const resourceUri = "ui://get-quick-start"

  registerAppTool(
    server,
    "get-time",
    {
      title: "Get Time",
      description: "Returns the current server time.",
      inputSchema: {},
      _meta: { ui: { resourceUri } }, // Links this tool to its UI resource
    },
    async () => {
      const time = new Date().toISOString()
      return { content: [{ type: "text", text: time }] }
    }
  )

  // Register the resource, which returns the bundled HTML/JavaScript for the UI.
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8"
      )

      return {
        contents: [
          { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      }
    }
  )
}
