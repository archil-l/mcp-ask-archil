import serverless from "serverless-http";
import express from "express";
import type { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import "source-map-support/register.js";
import server from "./server.js";

const app = express();
app.use(express.json());

app.post("/mcp", async (req: Request, res: Response) => {
  try {
    const transport: StreamableHTTPServerTransport =
      new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
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

// Start the server
const PORT = 3000;
app.listen(PORT, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});

// Handle server shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
});

const handler = serverless(app);

export default handler;
