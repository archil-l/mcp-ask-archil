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
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import path from "node:path";

// Works both from source (.ts) and compiled (dist/)
const __dirname = path.dirname(__filename);
const DIST_DIR = __filename.endsWith(".ts")
  ? path.join(__dirname, "dist")
  : __dirname;

const s3Client = new S3Client({});

/**
 * Fetches the resume PDF from S3 and returns it as base64
 */
async function fetchResumePdf(): Promise<string> {
  const bucketName =
    process.env.RESUME_BUCKET_NAME || "mcp-ask-archil-bucket-prod";
  const pdfKey = process.env.RESUME_PDF_KEY || "archil-l-resume.pdf";

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: pdfKey,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error("No body in S3 response");
  }

  const bytes = await response.Body.transformToByteArray();
  return Buffer.from(bytes).toString("base64");
}

/**
 * Registers the get-resume MCP App (tool + resource) on the given server.
 */
export function registerGetResumeApp(server: McpServer): void {
  const resourceUri = "ui://get-resume";

  // Register the tool with UI metadata
  registerAppTool(
    server,
    "get-resume",
    {
      title: "Archil's Resume",
      description:
        "Displays Archil Lelashvili's resume as an interactive PDF viewer.",
      inputSchema: {},
      _meta: { ui: { resourceUri } },
    },
    async (): Promise<CallToolResult> => {
      try {
        const pdfBase64 = await fetchResumePdf();
        return {
          content: [
            {
              type: "text",
              text: "Resume PDF loaded successfully. Displaying in viewer.",
            },
          ],
          structuredContent: {
            pdfBase64,
            filename: "archil-l-resume.pdf",
          },
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: `Failed to load resume: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Register the resource that serves the HTML UI
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "get-resume-app.html"),
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
