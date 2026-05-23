import { describe, it, expect } from "vitest";
import { broadcastMessageTool } from "../../src/tools/broadcast-message.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";
import type { ViberClient } from "../../src/viber/client.js";

describe("broadcast_message tool", () => {
  it("returns success with message_token", async () => {
    const result = await broadcastMessageTool.handler(
      { receivers: ["u1", "u2"], text: "Hello all!" },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Broadcast sent");
  });

  it("surfaces partial failures from failed_list", async () => {
    const client = {
      ...createMockClient(),
      broadcastMessage: async () => ({
        status: 0,
        status_message: "ok",
        message_token: 555,
        failed_list: [
          { receiver: "u2", status: 6, status_message: "not subscribed" },
        ],
      }),
    } as unknown as ViberClient;

    const result = await broadcastMessageTool.handler(
      { receivers: ["u1", "u2"], text: "Hello" },
      client,
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Failed:");
    expect(result.content[0].text).toContain("not subscribed");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(2, "invalid token", "broadcast_message"));
    const result = await broadcastMessageTool.handler(
      { receivers: ["u1"], text: "hi" },
      client,
    );
    expect(result.isError).toBe(true);
  });
});
