import { describe, it, expect } from "vitest";
import { getAccountInfoTool } from "../../src/tools/get-account-info.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("get_account_info tool", () => {
  it("returns account name and subscriber count", async () => {
    const result = await getAccountInfoTool.handler({}, createMockClient());
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("TestBot");
    expect(result.content[0].text).toContain("42 subscribers");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(2, "invalid token", "get_account_info"));
    const result = await getAccountInfoTool.handler({}, client);
    expect(result.isError).toBe(true);
  });
});
