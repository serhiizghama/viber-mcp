import { z } from "zod";
import { formatToolError } from "./format-error.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const sendUrlTool: ToolDefinition = {
  name: "send_url",
  description: "Send a URL that renders as a tappable link with preview in Viber. Use when a link is the primary content of the message. Do not use if the URL is part of longer text — embed it in send_message text instead. Returns message_token for delivery tracking.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    receiver: z.string().describe("Viber user ID of the receiver"),
    media: z.string().url().max(2000).describe("URL to send (https://..., ≤2000 chars); displayed as a tappable link with preview"),
    sender_name: z.string().max(28).optional().describe("Display name override (≤28 chars)"),
    sender_avatar: z.string().url().optional().describe("Avatar URL override"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.sendUrl(input as Parameters<ViberClient["sendUrl"]>[0]);
      return {
        content: [{ type: "text", text: `URL sent. message_token=${result.message_token}` }],
        structuredContent: result,
      };
    } catch (err) {
      return formatToolError(err);
    }
  },
};
