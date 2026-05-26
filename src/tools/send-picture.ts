import { z } from "zod";
import { ViberApiError } from "../errors.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const sendPictureTool: ToolDefinition = {
  name: "send_picture",
  description: "Send a JPEG or PNG image with an optional caption to a Viber user. Use when sharing visual content such as photos, screenshots, or diagrams. Do not use for videos or documents — use send_video or send_file instead. Returns message_token for delivery tracking.",
  inputSchema: {
    receiver: z.string().describe("Viber user ID of the receiver"),
    media: z.string().url().describe("Public URL of the image (JPEG/PNG, ≤1MB iOS / ≤3MB Android)"),
    text: z.string().max(120).optional().describe("Caption, ≤120 chars"),
    thumbnail: z.string().url().optional().describe("Thumbnail URL"),
    sender_name: z.string().max(28).optional().describe("Display name override (≤28 chars)"),
    sender_avatar: z.string().url().optional().describe("Avatar URL override"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.sendPicture(input as Parameters<ViberClient["sendPicture"]>[0]);
      return {
        content: [{ type: "text", text: `Picture sent. message_token=${result.message_token}` }],
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
