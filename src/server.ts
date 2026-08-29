import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ViberClient } from "./viber/client.js";
import { tools } from "./tools/index.js";

/**
 * Replaced at build time by tsup `define` with the package.json version.
 * Falls back when the source is loaded directly (tests, ts-node).
 */
const SERVER_VERSION =
  typeof __PKG_VERSION__ === "string" ? __PKG_VERSION__ : "0.0.0-dev";

export function buildServer(client: ViberClient): McpServer {
  const server = new McpServer({
    name: "viber-mcp",
    version: SERVER_VERSION,
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      async (input) => {
        return tool.handler(input as Record<string, unknown>, client);
      },
    );
  }

  return server;
}
