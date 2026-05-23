import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { resolve } from "node:path";

describe("MCP server integration", () => {
  it("responds to tools/list with all 13 tools", async () => {
    const serverPath = resolve(import.meta.dirname, "../dist/index.js");
    const transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      env: { ...process.env, VIBER_AUTH_TOKEN: "fake-token" },
    });

    const client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(transport);

    try {
      const { tools } = await client.listTools();
      const toolNames = tools.map((t) => t.name);

      expect(toolNames).toHaveLength(13);
      expect(toolNames).toContain("send_message");
      expect(toolNames).toContain("send_picture");
      expect(toolNames).toContain("send_video");
      expect(toolNames).toContain("send_file");
      expect(toolNames).toContain("send_url");
      expect(toolNames).toContain("send_location");
      expect(toolNames).toContain("send_contact");
      expect(toolNames).toContain("broadcast_message");
      expect(toolNames).toContain("get_account_info");
      expect(toolNames).toContain("get_user_details");
      expect(toolNames).toContain("get_online");
      expect(toolNames).toContain("set_webhook");
      expect(toolNames).toContain("remove_webhook");
    } finally {
      await client.close();
    }
  }, 15000);
});
