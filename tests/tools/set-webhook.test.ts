import { describe, it, expect } from "vitest";
import { setWebhookTool } from "../../src/tools/set-webhook.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("set_webhook tool", () => {
  it("returns event types on success", async () => {
    const result = await setWebhookTool.handler(
      { url: "https://example.com/webhook" },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Webhook set");
    expect(result.content[0].text).toContain("message");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(2, "invalid token", "set_webhook"));
    const result = await setWebhookTool.handler(
      { url: "https://example.com/webhook" },
      client,
    );
    expect(result.isError).toBe(true);
  });
});
