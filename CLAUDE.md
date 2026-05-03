# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

```bash
npm run build                        # Full build: typecheck + apps + esbuild + CDK synth
npm run build:apps                   # Build all MCP App HTML bundles
npm run build:app:get-resume                   # Build resume app only
npm run build:app:get-architecture             # Build architecture app only
npm run build:app:get-archils-work-experience  # Build work experience app only
npm run typecheck                    # TypeScript type check (no emit)
npm run dev                          # Watch all apps + start MCP proxy
npm run deploy                       # Deploy to prod (AWS CDK)
```

No automated tests — validate with `typecheck` and manual testing via MCP Inspector.

## Architecture

MCP server deployed as an AWS Lambda via the Lambda Web Adapter. MCP endpoint: POST `/mcp` (StreamableHTTP transport).

**Two tool types:**

### Standard Tools (`src/tools/`)

Use the `defineTool` factory from `src/types/types.ts`:

```typescript
export const myTool = defineTool("tool-name", {
  title: "...",
  description: "...",
  inputSchema: z.object({ ... }),
}, async (args) => ({
  content: [{ type: "text", text: "..." }],
}));
```

Register in `src/server.ts` by adding to the `tools` array.

### MCP Apps (`src/apps/`)

Tool + resource pairs that render interactive HTML iframes in the host. Follow the `get-resume` pattern:

1. **`{name}-app.ts`** — calls `registerAppTool()` + `registerAppResource()` from `@modelcontextprotocol/ext-apps/server`
   - Tool handler returns `content` text (and optionally `structuredContent` for data to pass to the UI)
   - Resource handler reads the compiled HTML from `dist/mcp-lambda/{name}-app.html`
2. **`vite.config.ts`** — copy from any existing app; reads `INPUT` env var, outputs to `../../../dist/mcp-lambda/`
3. **`{name}-app.html`** — minimal HTML entry; script points to `./src/{name}-app.tsx`
4. **`src/{name}-app.tsx`** — React app using `useApp` + `useHostStyles` from `@modelcontextprotocol/ext-apps/react`
5. **Add build script** in `package.json`: `"build:app:{name}": "cd src/apps/{name} && cross-env INPUT={name}-app.html vite build"`
6. **Add to `build:apps`** script and **register** in `src/server.ts`

**Key MCP Apps SDK hooks:**
- `app.ontoolinput` — called when tool is invoked (show loading state)
- `app.ontoolresult` — called with `CallToolResult` (render the data)
- `app.onteardown` — cleanup
- `useHostStyles(app, ctx)` — inherits host CSS variables (dark/light mode)
- `app.callServerTool(...)` — call another tool from within the app

## Key Files

| Purpose                      | Path                                           |
| ---------------------------- | ---------------------------------------------- |
| MCP server entry             | `src/handler.ts`                               |
| Server (tool registration)   | `src/server.ts`                                |
| Tool factory                 | `src/types/types.ts`                           |
| Resume app (server)          | `src/apps/get-resume/get-resume-app.ts`        |
| Resume app (React UI)        | `src/apps/get-resume/src/get-resume-app.tsx`   |
| Architecture app (server)    | `src/apps/get-architecture/get-architecture-app.ts` |
| Architecture app (React UI)  | `src/apps/get-architecture/src/get-architecture-app.tsx` |
| Work experience app (server) | `src/apps/get-archils-work-experience/get-archils-work-experience-app.ts` |
| Work experience app (React UI) | `src/apps/get-archils-work-experience/src/get-archils-work-experience-app.tsx` |
| Shared styles                | `src/styles/globals.css`                       |
| Local dev proxy              | `scripts/mcp-proxy.ts`                         |
| Build output (HTML apps)     | `dist/mcp-lambda/`                             |
| CDK infrastructure           | `cdk/`                                         |

## Path Alias

`@/*` → `src/*` (configured in Vite; used in MCP App React components)
