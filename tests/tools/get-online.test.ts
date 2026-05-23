import { describe, it, expect } from "vitest";
import { getOnlineTool } from "../../src/tools/get-online.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("get_online tool", () => {
  it("returns online status summary", async () => {
    const result = await getOnlineTool.handler(
      { ids: ["user-1"] },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("online");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(2, "invalid token", "get_online"));
    const result = await getOnlineTool.handler({ ids: ["x"] }, client);
    expect(result.isError).toBe(true);
  });
});
