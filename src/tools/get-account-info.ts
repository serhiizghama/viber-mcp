import { z } from "zod";
import { formatToolError } from "./format-error.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const getAccountInfoTool: ToolDefinition = {
  name: "get_account_info",
  description: "Retrieve bot account details: name, URI, icon, subscriber count, webhook URL, and subscribed event types. Use to verify bot configuration or check subscriber count. No parameters required. Returns full account configuration object.",
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  inputSchema: {},
  async handler(_input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.getAccountInfo();
      return {
        content: [{ type: "text", text: `Account: ${result.name} (${result.subscribers_count} subscribers)` }],
        structuredContent: result,
      };
    } catch (err) {
      return formatToolError(err);
    }
  },
};

void z;
