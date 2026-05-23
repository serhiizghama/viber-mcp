import { describe, it, expect } from "vitest";
import { sendUrlTool } from "../../src/tools/send-url.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("send_url tool", () => {
  it("returns success with message_token", async () => {
    const result = await sendUrlTool.handler(
      { receiver: "user-1", media: "https://example.com" },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("URL sent");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(6, "receiver not found", "send_message"));
    const result = await sendUrlTool.handler(
      { receiver: "bad", media: "https://example.com" },
      client,
    );
    expect(result.isError).toBe(true);
  });
});
