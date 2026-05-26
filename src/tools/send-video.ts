import { z } from "zod";
import { ViberApiError } from "../errors.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const sendVideoTool: ToolDefinition = {
  name: "send_video",
  description: "Send an MP4 video (≤26MB, ≤180s) to a Viber user via public URL. Requires the file size in bytes — ask the user to provide it if unknown.",
  inputSchema: {
    receiver: z.string().describe("Viber user ID of the receiver"),
    media: z.string().url().describe("Public URL of the video (MP4/H.264, ≤26MB, ≤180s)"),
    size: z.number().int().positive().describe("Video size in bytes. Ask the user to provide this if not known."),
    duration: z.number().int().positive().max(180).optional().describe("Video duration in seconds (≤180)"),
    thumbnail: z.string().url().optional().describe("Thumbnail URL"),
    sender_name: z.string().max(28).optional().describe("Display name override (≤28 chars)"),
    sender_avatar: z.string().url().optional().describe("Avatar URL override"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.sendVideo(input as Parameters<ViberClient["sendVideo"]>[0]);
      return {
        content: [{ type: "text", text: `Video sent. message_token=${result.message_token}` }],
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
