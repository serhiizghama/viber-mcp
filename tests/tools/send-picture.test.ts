import { describe, it, expect } from "vitest";
import { sendPictureTool } from "../../src/tools/send-picture.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("send_picture tool", () => {
  it("returns success with message_token", async () => {
    const result = await sendPictureTool.handler(
      { receiver: "user-1", media: "https://example.com/img.jpg" },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Picture sent");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(6, "receiver not found", "send_message"));
    const result = await sendPictureTool.handler(
      { receiver: "bad", media: "https://example.com/img.jpg" },
      client,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Viber API error 6");
  });
});
