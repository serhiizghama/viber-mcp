import { describe, it, expect } from "vitest";
import { sendContactTool } from "../../src/tools/send-contact.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("send_contact tool", () => {
  it("returns success with message_token", async () => {
    const result = await sendContactTool.handler(
      { receiver: "user-1", name: "John", phone_number: "+380501234567" },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Contact sent");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(6, "receiver not found", "send_message"));
    const result = await sendContactTool.handler(
      { receiver: "bad", name: "John", phone_number: "+380501234567" },
      client,
    );
    expect(result.isError).toBe(true);
  });
});
