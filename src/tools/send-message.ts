import { z } from "zod";
import { ViberApiError } from "../errors.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const sendMessageTool: ToolDefinition = {
  name: "send_message",
  description: "Send a text message to a Viber user",
  inputSchema: {
    receiver: z.string().describe("Viber user ID of the receiver (obtained from a previous incoming event)"),
    text: z.string().min(1).max(7000).describe("Message text, up to 7000 characters"),
    sender_name: z.string().max(28).optional().describe("Display name override (≤28 chars). Defaults to VIBER_SENDER_NAME env var."),
    sender_avatar: z.string().url().optional().describe("Avatar URL override. Defaults to VIBER_SENDER_AVATAR env var."),
    tracking_data: z.string().max(4096).optional().describe("Opaque data echoed back in delivery callbacks"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.sendMessage(input as Parameters<ViberClient["sendMessage"]>[0]);
      return {
        content: [{ type: "text", text: `Message sent. message_token=${result.message_token}` }],
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
