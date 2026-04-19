import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";

const __dirname = path.dirname(__filename);
const DIST_DIR = __filename.endsWith(".ts")
  ? path.join(__dirname, "dist")
  : __dirname;

export function registerGetArchitectureApp(server: McpServer): void {
  const resourceUri = "ui://get-architecture";

  registerAppTool(
    server,
    "get-architecture",
    {
      title: "How This Is Built",
      description:
        "Shows an interactive diagram of ask.archil.io: the two AWS Lambda functions, the MCP server, Claude AI, and how they connect. Use this when the user asks how the site works or how it was built.",
      inputSchema: {},
      _meta: { ui: { resourceUri } },
    },
    async (): Promise<CallToolResult> => ({
      content: [
        {
          type: "text",
          text: "Displaying interactive architecture diagram for ask.archil.io.",
        },
      ],
    }),
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "get-architecture-app.html"),
        "utf-8",
      );
      return {
        contents: [
          { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );
}
