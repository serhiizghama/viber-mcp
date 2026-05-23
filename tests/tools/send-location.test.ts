import { describe, it, expect } from "vitest";
import { sendLocationTool } from "../../src/tools/send-location.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("send_location tool", () => {
  it("returns success with message_token", async () => {
    const result = await sendLocationTool.handler(
      { receiver: "user-1", latitude: 50.45, longitude: 30.52 },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Location sent");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(6, "receiver not found", "send_message"));
    const result = await sendLocationTool.handler(
      { receiver: "bad", latitude: 0, longitude: 0 },
      client,
    );
    expect(result.isError).toBe(true);
  });
});
