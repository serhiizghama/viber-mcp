import { ViberApiError, ViberNetworkError } from "../errors.js";
import type { ToolResult } from "./index.js";

/**
 * Single place where a thrown error becomes an MCP tool error result,
 * so every tool reports failures in the same, diagnosable shape.
 */
export function formatToolError(err: unknown): ToolResult {
  let text: string;

  if (err instanceof ViberApiError) {
    text = `Viber API error ${err.status}: ${err.statusMessage}`;
  } else if (err instanceof ViberNetworkError) {
    text = err.message;
  } else if (err instanceof Error) {
    text = err.message;
  } else {
    text = "Unknown error";
  }

  return { content: [{ type: "text", text }], isError: true };
}
