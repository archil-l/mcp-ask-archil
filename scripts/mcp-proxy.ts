#!/usr/bin/env npx ts-node
/**
 * Local proxy server for MCP Inspector to connect to AWS IAM-authenticated Lambda Function URL
 *
 * This proxy:
 * 1. Accepts requests from MCP Inspector on localhost (no auth)
 * 2. Signs requests with AWS SigV4 credentials
 * 3. Forwards them to the Lambda function URL
 * 4. Streams responses back to the inspector
 */

import express from "express";
import { SignatureV4 } from "@smithy/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { HttpRequest } from "@smithy/protocol-http";

const TARGET_URL =
  process.env.MCP_TARGET_URL ||
  "https://ldlv3xoi43ix4krzy6gtf2skau0rfjrk.lambda-url.us-east-1.on.aws";
const REGION = process.env.AWS_REGION || "us-east-1";
const PORT = parseInt(process.env.PORT || "3001", 10);

const app = express();
app.use(express.raw({ type: "*/*", limit: "10mb" }));

// Create SigV4 signer
const signer = new SignatureV4({
  credentials: defaultProvider(),
  region: REGION,
  service: "lambda",
  sha256: Sha256,
});

// Proxy middleware for all requests
app.use(async (req, res) => {
  try {
    const targetUrl = new URL(req.path, TARGET_URL);

    // Parse the body
    let body: string | undefined;
    if (req.body && Buffer.isBuffer(req.body) && req.body.length > 0) {
      body = req.body.toString("utf-8");
    }

    console.log(`[PROXY] ${req.method} ${targetUrl.pathname}`);
    if (body) {
      console.log(
        `[PROXY] Body: ${body.substring(0, 200)}${body.length > 200 ? "..." : ""}`,
      );
    }

    // Create the HTTP request for signing
    const httpRequest = new HttpRequest({
      method: req.method,
      protocol: "https:",
      hostname: targetUrl.hostname,
      path: targetUrl.pathname + targetUrl.search,
      headers: {
        host: targetUrl.hostname,
        "content-type": req.headers["content-type"] || "application/json",
        accept: req.headers["accept"] || "application/json, text/event-stream",
      },
      body: body,
    });

    // Sign the request
    const signedRequest = await signer.sign(httpRequest);

    // Make the request using fetch
    const response = await fetch(targetUrl.toString(), {
      method: signedRequest.method,
      headers: signedRequest.headers as Record<string, string>,
      body: body,
    });

    console.log(`[PROXY] Response status: ${response.status}`);

    // Copy response headers
    response.headers.forEach((value, key) => {
      // Skip certain headers that shouldn't be forwarded
      if (
        !["content-encoding", "transfer-encoding", "connection"].includes(
          key.toLowerCase(),
        )
      ) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);

    // Check if it's a streaming response
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/event-stream") && response.body) {
      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          console.log(`[PROXY] Streaming chunk: ${chunk.substring(0, 100)}...`);
          res.write(chunk);
        }
      } finally {
        reader.releaseLock();
      }
      res.end();
    } else {
      // Non-streaming response
      const responseBody = await response.text();
      console.log(
        `[PROXY] Response body: ${responseBody.substring(0, 200)}${responseBody.length > 200 ? "..." : ""}`,
      );
      res.send(responseBody);
    }
  } catch (error) {
    console.error("[PROXY] Error:", error);
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: `Proxy error: ${error instanceof Error ? error.message : String(error)}`,
      },
      id: null,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 MCP Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Target: ${TARGET_URL}`);
  console.log(`   Region: ${REGION}`);
  console.log(`\n📝 Use with MCP Inspector:`);
  console.log(
    `   npx @modelcontextprotocol/inspector --cli http://localhost:${PORT}/mcp --method streamable-http\n`,
  );
});
