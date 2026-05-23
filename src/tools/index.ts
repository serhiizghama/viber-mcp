import { z } from "zod";
import type { ViberClient } from "../viber/client.js";

export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodType>;
  handler: (
    input: Record<string, unknown>,
    client: ViberClient,
  ) => Promise<ToolResult>;
}

export { sendMessageTool } from "./send-message.js";
export { sendPictureTool } from "./send-picture.js";
export { sendVideoTool } from "./send-video.js";
export { sendFileTool } from "./send-file.js";
export { sendUrlTool } from "./send-url.js";
export { sendLocationTool } from "./send-location.js";
export { sendContactTool } from "./send-contact.js";
export { broadcastMessageTool } from "./broadcast-message.js";
export { getAccountInfoTool } from "./get-account-info.js";
export { getUserDetailsTool } from "./get-user-details.js";
export { getOnlineTool } from "./get-online.js";
export { setWebhookTool } from "./set-webhook.js";
export { removeWebhookTool } from "./remove-webhook.js";

import { sendMessageTool } from "./send-message.js";
import { sendPictureTool } from "./send-picture.js";
import { sendVideoTool } from "./send-video.js";
import { sendFileTool } from "./send-file.js";
import { sendUrlTool } from "./send-url.js";
import { sendLocationTool } from "./send-location.js";
import { sendContactTool } from "./send-contact.js";
import { broadcastMessageTool } from "./broadcast-message.js";
import { getAccountInfoTool } from "./get-account-info.js";
import { getUserDetailsTool } from "./get-user-details.js";
import { getOnlineTool } from "./get-online.js";
import { setWebhookTool } from "./set-webhook.js";
import { removeWebhookTool } from "./remove-webhook.js";

export const tools: ReadonlyArray<ToolDefinition> = [
  sendMessageTool,
  sendPictureTool,
  sendVideoTool,
  sendFileTool,
  sendUrlTool,
  sendLocationTool,
  sendContactTool,
  broadcastMessageTool,
  getAccountInfoTool,
  getUserDetailsTool,
  getOnlineTool,
  setWebhookTool,
  removeWebhookTool,
];
