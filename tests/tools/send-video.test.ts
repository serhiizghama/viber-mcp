import { describe, it, expect } from "vitest";
import { sendVideoTool } from "../../src/tools/send-video.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("send_video tool", () => {
  it("returns success with message_token", async () => {
    const result = await sendVideoTool.handler(
      { receiver: "user-1", media: "https://example.com/vid.mp4", size: 1024 },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Video sent");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(3, "invalid token", "send_message"));
    const result = await sendVideoTool.handler(
      { receiver: "bad", media: "https://example.com/vid.mp4", size: 1024 },
      client,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Viber API error 3");
  });
});
