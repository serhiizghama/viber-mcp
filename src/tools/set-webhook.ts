import { z } from "zod";
import { formatToolError } from "./format-error.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const setWebhookTool: ToolDefinition = {
  name: "set_webhook",
  description: "Register or update the HTTPS webhook URL that Viber calls for incoming events (messages, subscriptions, delivery receipts). Call once during bot setup or when the URL changes. Replaces any existing webhook. Returns the confirmed list of subscribed event types.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema: {
    url: z.string().url().describe("HTTPS URL with valid CA-issued SSL cert"),
    event_types: z.array(z.enum([
      "delivered", "seen", "failed", "subscribed", "unsubscribed",
      "conversation_started", "message",
    ])).optional().describe("Defaults to all events if omitted"),
    send_name: z.boolean().optional().describe("Include sender name in callbacks"),
    send_photo: z.boolean().optional().describe("Include sender photo in callbacks"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.setWebhook(input as Parameters<ViberClient["setWebhook"]>[0]);
      return {
        content: [{ type: "text", text: `Webhook set. Events: ${result.event_types.join(", ")}` }],
        structuredContent: result,
      };
    } catch (err) {
      return formatToolError(err);
    }
  },
};
