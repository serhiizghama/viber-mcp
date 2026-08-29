import { z } from "zod";
import { formatToolError } from "./format-error.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const removeWebhookTool: ToolDefinition = {
  name: "remove_webhook",
  description: "Disable the currently registered webhook, stopping all incoming Viber event callbacks. Use when decommissioning the bot or before switching endpoints via set_webhook. No parameters required.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  inputSchema: {},
  async handler(_input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.removeWebhook();
      return {
        content: [{ type: "text", text: "Webhook removed." }],
        structuredContent: result,
      };
    } catch (err) {
      return formatToolError(err);
    }
  },
};

void z;
