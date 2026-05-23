import { z } from "zod";
import { ViberApiError } from "../errors.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const getUserDetailsTool: ToolDefinition = {
  name: "get_user_details",
  description: "Fetch profile details of a Viber user",
  inputSchema: {
    id: z.string().describe("Viber user ID. Note: Viber rate-limits this to 2 calls per 12h per user — cache results if possible."),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.getUserDetails(input.id as string);
      return {
        content: [{ type: "text", text: `User: ${result.user.name}, country=${result.user.country}` }],
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
