// Local proof: invoke the built native streaming Lambda handler with mock
// Function URL v2 events. Shims the `awslambda` global that streamHandle needs.
import { pathToFileURL } from "node:url";

class Collector {
  constructor() {
    this.chunks = [];
    this.meta = null;
    this.ended = false;
  }
  write(chunk) {
    if (chunk != null) this.chunks.push(Buffer.from(chunk));
    return true;
  }
  end() {
    this.ended = true;
  }
  body() {
    return Buffer.concat(this.chunks).toString("utf8");
  }
}

globalThis.awslambda = {
  streamifyResponse: (fn) => fn, // hand back the inner fn so we can call it directly
  HttpResponseStream: {
    from: (stream, metadata) => {
      stream.meta = metadata;
      return stream;
    },
  },
};

const mod = await import(
  pathToFileURL("./dist/mcp-lambda/index.js").href
);
const handler = mod.handler ?? mod.default?.handler ?? mod.default;
if (typeof handler !== "function") {
  throw new Error("handler export not found; keys=" + Object.keys(mod));
}

function fnUrlEvent(payload) {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: "/mcp",
    rawQueryString: "",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    requestContext: {
      http: {
        method: "POST",
        path: "/mcp",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "poc",
      },
      domainName: "poc.lambda-url.us-east-1.on.aws",
    },
    body: JSON.stringify(payload),
    isBase64Encoded: false,
  };
}

function parseBody(body) {
  if (body.includes("data:")) {
    return body
      .split(/\r?\n/)
      .filter((l) => l.startsWith("data:"))
      .map((l) => {
        const d = l.slice(5).trim();
        try {
          return JSON.parse(d);
        } catch {
          return d;
        }
      });
  }
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

async function call(label, payload) {
  const stream = new Collector();
  await handler(fnUrlEvent(payload), stream, { awsRequestId: "poc" });
  const status = stream.meta?.statusCode;
  const ct = stream.meta?.headers?.["content-type"];
  const parsed = parseBody(stream.body());
  console.log(`\n### ${label} -> status=${status} content-type=${ct}`);
  console.log(JSON.stringify(parsed, null, 2));
  return { status, parsed };
}

await call("initialize", {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "poc", version: "1.0.0" },
  },
});
await call("tools/list", { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
await call("tools/call add-numbers", {
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: { name: "add-numbers", arguments: { a: 2, b: 3 } },
});

// MCP App resource read (reads the vite-built HTML from dist/mcp-lambda/)
{
  const stream = new Collector();
  await handler(
    fnUrlEvent({
      jsonrpc: "2.0",
      id: 4,
      method: "resources/read",
      params: { uri: "ui://get-resume" },
    }),
    stream,
    { awsRequestId: "poc" },
  );
  const msgs = parseBody(stream.body());
  const contents = msgs?.[0]?.result?.contents?.[0];
  console.log(
    `\n### resources/read ui://get-resume -> status=${stream.meta?.statusCode}`,
  );
  console.log(
    JSON.stringify(
      {
        uri: contents?.uri,
        mimeType: contents?.mimeType,
        htmlBytes: contents?.text?.length ?? 0,
        htmlHead: contents?.text?.slice(0, 60),
      },
      null,
      2,
    ),
  );
}
