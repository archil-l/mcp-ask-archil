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

export function registerGetArchilsWorkExperienceApp(server: McpServer): void {
  const resourceUri = "ui://get-archils-work-experience";

  registerAppTool(
    server,
    "get-archils-work-experience",
    {
      title: "Archil's Work Experience",
      description:
        "Renders an interactive overview of Archil Lelashvili's professional work experience: his current role as Frontend Engineer II on the Sortation Insights team at Amazon Robotics (agentic systems, dashboard tooling), and his previous work at Quickbase (UI infrastructure, design system, accessibility). Includes screenshots and details of key features he shipped. Use this when the visitor asks about Archil's work history, career, job experience, or what he has built professionally.",
      inputSchema: {},
      _meta: { ui: { resourceUri } },
    },
    async (): Promise<CallToolResult> => ({
      content: [
        {
          type: "text",
          text: "Displaying Archil's work experience.",
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
        path.join(DIST_DIR, "get-archils-work-experience-app.html"),
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
