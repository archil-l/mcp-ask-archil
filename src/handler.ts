import { createMcpHandler } from "@modelcontextprotocol/server";
import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import { streamHandle } from "hono/aws-lambda";
import type { Hono } from "hono";
import "source-map-support/register.js";

import { createMCPServer } from "./server.js";

// Fresh MCP server per request (stateless). createMcpHandler serves both the
// 2025-era stateless transport and the modern (2026-07-28) envelope traffic.
const mcp = createMcpHandler(() => createMCPServer());

// host: "0.0.0.0" disables the localhost DNS-rebinding protection that
// createMcpHonoApp turns on by default — required behind a Lambda Function URL,
// whose Host header is the *.lambda-url.*.on.aws domain, not localhost.
type McpEnv = { Variables: { parsedBody?: unknown } };
const app = createMcpHonoApp({ host: "0.0.0.0" }) as unknown as Hono<McpEnv>;

app.all("/mcp", (c) =>
  mcp.fetch(c.req.raw, { parsedBody: c.get("parsedBody") }),
);

// Native streaming Lambda handler — consumes Function URL events directly (no
// Lambda Web Adapter, no HTTP server, no port) and streams the response body
// via Lambda RESPONSE_STREAM, so StreamableHTTP SSE flushes incrementally.
export const handler = streamHandle(app);
