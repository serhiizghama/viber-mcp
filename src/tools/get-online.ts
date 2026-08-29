import { z } from "zod";
import { formatToolError } from "./format-error.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const getOnlineTool: ToolDefinition = {
  name: "get_online",
  description: "Check whether up to 100 Viber users are currently online. Returns per-user status: online, offline, or undisclosed. Use before sending time-sensitive messages to prioritise active users. Note: some users may hide their status via privacy settings.",
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  inputSchema: {
    ids: z.array(z.string()).min(1).max(100).describe("Array of Viber user IDs (max 100)"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.getOnline(input.ids as string[]);
      const summary = result.users
        .map((u) => `${u.id}: ${u.online_status_message}`)
        .join(", ");
      return {
        content: [{ type: "text", text: `Online status: ${summary}` }],
        structuredContent: result,
      };
    } catch (err) {
      return formatToolError(err);
    }
  },
};
