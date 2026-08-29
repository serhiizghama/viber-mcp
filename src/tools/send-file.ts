import { z } from "zod";
import { formatToolError } from "./format-error.js";
import type { ToolDefinition, ToolResult } from "./index.js";
import type { ViberClient } from "../viber/client.js";

export const sendFileTool: ToolDefinition = {
  name: "send_file",
  description: "Send a file attachment (≤50MB) to a Viber user via public URL. Use for PDFs, documents, or spreadsheets. Forbidden extensions: exe, bat, vbs, cmd. Requires file size in bytes and filename with extension; ask the user if unknown. Returns message_token for delivery tracking.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: {
    receiver: z.string().describe("Viber user ID of the receiver"),
    media: z.string().url().describe("Public URL of the file (≤50MB; forbidden: exe, bat, vbs, cmd, etc.)"),
    size: z.number().int().positive().describe("File size in bytes. Ask the user to provide this if not known."),
    file_name: z.string().max(256).describe("File name with extension (e.g. report.pdf)"),
    sender_name: z.string().max(28).optional().describe("Display name override (≤28 chars)"),
    sender_avatar: z.string().url().optional().describe("Avatar URL override"),
  },
  async handler(input: Record<string, unknown>, client: ViberClient): Promise<ToolResult> {
    try {
      const result = await client.sendFile(input as Parameters<ViberClient["sendFile"]>[0]);
      return {
        content: [{ type: "text", text: `File sent. message_token=${result.message_token}` }],
        structuredContent: result,
      };
    } catch (err) {
      return formatToolError(err);
    }
  },
};
