import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import "source-map-support/register.js";

import { createMCPServer } from "./server.js";

const app = createMcpExpressApp({ host: "0.0.0.0" });

app.post("/mcp", async (request: Request, response: Response) => {
  try {
    const server = createMCPServer();

    const transport: StreamableHTTPServerTransport =
      new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

    await server.connect(transport);
    console.log("Server connected");
    await transport.handleRequest(request, response, request.body);
    console.log("MCP Request completed");
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!response.headersSent) {
      response.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32_603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req: Request, res: Response) => {
  console.log("Received GET MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32_000,
        message: "Method not allowed.",
      },
      id: null,
    }),
  );
});

app.delete("/mcp", async (req: Request, res: Response) => {
  console.log("Received DELETE MCP request");
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32_000,
        message: "Method not allowed.",
      },
      id: null,
    }),
  );
});

// Lambda Web Adapter expects the app to listen on PORT (default 8080)
// For local development, use PORT 3000
const PORT = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
});
