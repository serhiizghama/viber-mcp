import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ViberClient } from "./viber/client.js";
import { tools } from "./tools/index.js";

export function buildServer(client: ViberClient): McpServer {
  const server = new McpServer({
    name: "viber-mcp",
    version: "0.1.0",
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (input) => {
        return tool.handler(input as Record<string, unknown>, client);
      },
    );
  }

  return server;
}
