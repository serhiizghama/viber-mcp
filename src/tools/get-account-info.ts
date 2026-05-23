import { z } from "zod";
import { ViberApiError } from "../errors.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const getAccountInfoTool: ToolDefinition = {
  name: "get_account_info",
  description: "Get the Viber bot account configuration including subscriber count and member list",
  inputSchema: {},
  async handler(_input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.getAccountInfo();
      return {
        content: [{ type: "text", text: `Account: ${result.name} (${result.subscribers_count} subscribers)` }],
        structuredContent: result,
      };
    } catch (err) {
      const msg = err instanceof ViberApiError
        ? `Viber API error ${err.status}: ${err.statusMessage}`
        : err instanceof Error ? err.message : "Unknown error";
      return { content: [{ type: "text", text: msg }], isError: true };
    }
  },
};

void z;
