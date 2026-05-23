import { describe, it, expect } from "vitest";
import { sendMessageTool } from "../../src/tools/send-message.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("send_message tool", () => {
  it("returns success with message_token", async () => {
    const result = await sendMessageTool.handler(
      { receiver: "user-1", text: "Hello!" },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("message_token=999888");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(6, "receiver not found", "send_message"));
    const result = await sendMessageTool.handler(
      { receiver: "bad", text: "hi" },
      client,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Viber API error 6");
  });

  it("returns isError on generic error", async () => {
    const client = createErrorClient(new Error("network failure"));
    const result = await sendMessageTool.handler(
      { receiver: "x", text: "hi" },
      client,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("network failure");
  });
});
