import { z } from "zod";
import { formatToolError } from "./format-error.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const getUserDetailsTool: ToolDefinition = {
  name: "get_user_details",
  description: "Fetch profile details of a Viber user: name, avatar URL, country, language, API version, and device type. Use to personalise messages or verify user identity. Rate-limited to 2 calls per user per 12 hours — cache results when possible. Returns user profile object.",
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
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
      return formatToolError(err);
    }
  },
};
