import { z } from "zod";
import { formatToolError } from "./format-error.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const sendContactTool: ToolDefinition = {
  name: "send_contact",
  description: "Send a contact card (name + phone number) to a Viber user. The recipient can save it directly to their phone contacts. Use when sharing a person's contact info. Returns message_token for delivery tracking.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    receiver: z.string().describe("Viber user ID of the receiver"),
    name: z.string().max(28).describe("Contact full name (≤28 chars)"),
    phone_number: z.string().max(18).describe("Phone number in international format (e.g. +380501234567)"),
    sender_name: z.string().max(28).optional().describe("Display name override (≤28 chars)"),
    sender_avatar: z.string().url().optional().describe("Avatar URL override"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.sendContact(input as Parameters<ViberClient["sendContact"]>[0]);
      return {
        content: [{ type: "text", text: `Contact sent. message_token=${result.message_token}` }],
        structuredContent: result,
      };
    } catch (err) {
      return formatToolError(err);
    }
  },
};
