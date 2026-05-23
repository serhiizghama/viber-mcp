import { describe, it, expect } from "vitest";
import { getUserDetailsTool } from "../../src/tools/get-user-details.js";
import { ViberApiError } from "../../src/errors.js";
import { createMockClient, createErrorClient } from "../helpers/mock-client.js";

describe("get_user_details tool", () => {
  it("returns user name and country", async () => {
    const result = await getUserDetailsTool.handler(
      { id: "user-1" },
      createMockClient(),
    );
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Test User");
    expect(result.content[0].text).toContain("country=UA");
  });

  it("returns isError on ViberApiError", async () => {
    const client = createErrorClient(new ViberApiError(12, "too many requests", "get_user_details"));
    const result = await getUserDetailsTool.handler({ id: "x" }, client);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Viber API error 12");
  });
});
