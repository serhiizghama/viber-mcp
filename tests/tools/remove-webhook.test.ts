import { describe, it, expect } from "vitest";
import { removeWebhookTool } from "../../src/tools/remove-webhook.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("remove_webhook tool", () => {
  it("returns success message", async () => {
    const result = await removeWebhookTool.handler({}, createMockClient());
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toBe("Webhook removed.");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(2, "invalid token", "set_webhook"));
    const result = await removeWebhookTool.handler({}, client);
    expect(result.isError).toBe(true);
  });
});
