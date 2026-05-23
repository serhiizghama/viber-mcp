import { z } from "zod";
import { ViberApiError } from "../errors.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const sendContactTool: ToolDefinition = {
  name: "send_contact",
  description: "Send a contact card to a Viber user",
  inputSchema: {
    receiver: z.string().describe("Viber user ID of the receiver"),
    name: z.string().max(28).describe("Contact name"),
    phone_number: z.string().max(18).describe("Contact phone number"),
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
      const msg = err instanceof ViberApiError
        ? `Viber API error ${err.status}: ${err.statusMessage}`
        : err instanceof Error ? err.message : "Unknown error";
      return { content: [{ type: "text", text: msg }], isError: true };
    }
  },
};
