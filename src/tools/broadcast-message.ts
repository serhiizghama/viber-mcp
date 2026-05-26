import { z } from "zod";
import { ViberApiError } from "../errors.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const broadcastMessageTool: ToolDefinition = {
  name: "broadcast_message",
  description: "Send the same text message to up to 300 subscribed Viber users in a single API call. Use for announcements or bulk notifications. Do not use for personalised messages — call send_message individually instead. Partial failures are reported per-receiver. Returns message_token and failed_list.",
  inputSchema: {
    receivers: z.array(z.string()).min(1).max(300).describe("Array of Viber user IDs to message (1–300)"),
    text: z.string().min(1).max(7000).describe("Message text, up to 7000 characters"),
    sender_name: z.string().max(28).optional().describe("Display name override (≤28 chars)"),
    sender_avatar: z.string().url().optional().describe("Avatar URL override"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.broadcastMessage(input as Parameters<ViberClient["broadcastMessage"]>[0]);
      let text = `Broadcast sent. message_token=${result.message_token}`;
      if (result.failed_list && result.failed_list.length > 0) {
        const failures = result.failed_list
          .map((f) => `${f.receiver}: ${f.status_message}`)
          .join(", ");
        text += `. Failed: ${failures}`;
      }
      return { content: [{ type: "text", text }], structuredContent: result };
    } catch (err) {
      const msg = err instanceof ViberApiError
        ? `Viber API error ${err.status}: ${err.statusMessage}`
        : err instanceof Error ? err.message : "Unknown error";
      return { content: [{ type: "text", text: msg }], isError: true };
    }
  },
};
