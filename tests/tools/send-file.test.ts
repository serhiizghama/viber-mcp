import { describe, it, expect } from "vitest";
import { sendFileTool } from "../../src/tools/send-file.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("send_file tool", () => {
  it("returns success with message_token", async () => {
    const result = await sendFileTool.handler(
      { receiver: "user-1", media: "https://example.com/doc.pdf", size: 2048, file_name: "doc.pdf" },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("File sent");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(6, "receiver not found", "send_message"));
    const result = await sendFileTool.handler(
      { receiver: "bad", media: "https://example.com/doc.pdf", size: 2048, file_name: "doc.pdf" },
      client,
    );
    expect(result.isError).toBe(true);
  });
});
