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
      title: "ask.archil.io — Architecture Deep Dive",
      description:
        "Renders an interactive architecture diagram explaining how ask.archil.io works end-to-end: the React SSR frontend, two AWS Lambda functions (web app + LLM streaming), Claude Haiku 4.5 via the Anthropic API, the MCP server that extends Claude with tools and interactive apps, guest JWT authentication, and the full request lifecycle from browser to AI and back. Use this whenever the visitor asks how the site is built, what technologies it uses, or how the AI integration works.",
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
