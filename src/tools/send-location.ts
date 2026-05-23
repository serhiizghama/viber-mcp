import { z } from "zod";
import { ViberApiError } from "../errors.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const sendLocationTool: ToolDefinition = {
  name: "send_location",
  description: "Send GPS coordinates to a Viber user",
  inputSchema: {
    receiver: z.string().describe("Viber user ID of the receiver"),
    latitude: z.number().min(-90).max(90).describe("Latitude"),
    longitude: z.number().min(-180).max(180).describe("Longitude"),
    sender_name: z.string().max(28).optional().describe("Display name override (≤28 chars)"),
    sender_avatar: z.string().url().optional().describe("Avatar URL override"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.sendLocation(input as Parameters<ViberClient["sendLocation"]>[0]);
      return {
        content: [{ type: "text", text: `Location sent. message_token=${result.message_token}` }],
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
