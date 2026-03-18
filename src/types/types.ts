import type {
  McpServer,
  ToolCallback,
  RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  ZodRawShapeCompat,
  AnySchema,
} from "@modelcontextprotocol/sdk/server/zod-compat.js";

export interface ToolDefinition {
  name: string;
  register(server: McpServer): RegisteredTool;
}

export function defineTool<InputArgs extends ZodRawShapeCompat | AnySchema>(
  name: string,
  config: {
    title?: string;
    description?: string;
    inputSchema?: InputArgs;
  },
  cb: ToolCallback<InputArgs>,
): ToolDefinition {
  return {
    name,
    register: (server) => server.registerTool(name, config, cb),
  };
}
