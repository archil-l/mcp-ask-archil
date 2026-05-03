# mcp-ask-archil

MCP server powering the tools and interactive apps on [ask.archil.io](https://ask.archil.io). Deployed as an AWS Lambda function, it exposes standard MCP tools and **MCP Apps** — tools that render interactive HTML UIs directly in the conversation.

## Available Tools

| Tool                           | Type      | Description                                                                   |
| ------------------------------ | --------- | ----------------------------------------------------------------------------- |
| `add-numbers`                  | Tool      | Add two numbers (demo tool)                                                   |
| `get-resume`                   | MCP App   | Interactive PDF resume viewer (fetches PDF from S3)                           |
| `get-architecture`             | MCP App   | Animated architecture diagram explaining how ask.archil.io is built           |
| `get-archils-work-experience`  | MCP App   | Interactive overview of Archil's professional work experience and projects    |

## MCP Apps

MCP Apps are tool + resource pairs. When called, the tool returns a `resourceUri` pointing to a self-contained single-file HTML bundle. The MCP host fetches that resource and renders it in a sandboxed iframe connected via AppBridge/PostMessageTransport.

**Pattern:**
1. `registerAppTool()` — registers the tool with `_meta.ui.resourceUri` metadata
2. `registerAppResource()` — serves the compiled HTML bundle as an MCP resource
3. The React app inside uses `useApp` from `@modelcontextprotocol/ext-apps/react` to receive tool results and communicate with the host

Each app is built with Vite + React + Tailwind + `vite-plugin-singlefile` into a single self-contained `.html` file in `dist/mcp-lambda/`.

## Project Structure

```
src/
├── handler.ts                  # Express HTTP server (Lambda Web Adapter)
├── server.ts                   # MCP server — registers all tools + apps
├── tools/                      # Standard MCP tools
│   ├── get-alerts.ts
│   ├── get-forecast.ts
│   └── add-numbers.ts
├── apps/                       # MCP Apps (tool + resource + React UI)
│   ├── get-resume/
│   │   ├── get-resume-app.ts   # Server: registerAppTool + registerAppResource
│   │   ├── vite.config.ts
│   │   ├── get-resume-app.html
│   │   └── src/get-resume-app.tsx
│   ├── get-architecture/
│   │   ├── get-architecture-app.ts
│   │   ├── vite.config.ts
│   │   ├── get-architecture-app.html
│   │   └── src/get-architecture-app.tsx
│   └── get-archils-work-experience/
│       ├── get-archils-work-experience-app.ts
│       ├── vite.config.ts
│       ├── get-archils-work-experience-app.html
│       └── src/get-archils-work-experience-app.tsx
├── types/types.ts              # defineTool factory
├── components/                 # Shared React components (pdf-viewer, ui/)
├── styles/globals.css          # Shared Tailwind styles
└── utils/helpers.ts
cdk/                            # AWS CDK infrastructure
scripts/mcp-proxy.ts            # Local dev: proxies MCP Inspector → Lambda
dist/mcp-lambda/                # Build output (bundled JS + HTML apps)
```

## Build Commands

```bash
npm run build                        # Full build: typecheck + apps + esbuild + CDK synth
npm run build:apps                   # Build all MCP App HTML bundles
npm run build:app:get-resume                   # Build resume app only
npm run build:app:get-architecture             # Build architecture app only
npm run build:app:get-archils-work-experience  # Build work experience app only
npm run typecheck                    # TypeScript type check (no emit)
npm run dev                          # Watch apps + start MCP proxy for local dev
npm run deploy                       # Deploy to AWS (prod)
```

## Deployment

The server runs as a Node 24 AWS Lambda function using the Lambda Web Adapter. The MCP endpoint is at `/mcp` (POST, StreamableHTTP transport).

Infrastructure is defined in `cdk/` and deployed with AWS CDK.
