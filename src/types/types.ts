import type {
  McpServer,
  ToolCallback,
  RegisteredTool,
  StandardSchemaWithJSON,
} from "@modelcontextprotocol/server";

export interface ToolDefinition {
  name: string;
  register(server: McpServer): RegisteredTool;
}

export function defineTool<
  InputArgs extends StandardSchemaWithJSON | undefined = undefined,
>(
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
