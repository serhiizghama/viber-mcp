import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pkg = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../package.json"), "utf8"),
) as { version: string };

/** `process.env` may hold undefined values; the transport wants plain strings. */
function buildEnv(overrides: Record<string, string>): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) {
      env[key] = value;
    }
  }
  return { ...env, ...overrides };
}

describe("MCP server integration", () => {
  let client: Client;

  beforeAll(async () => {
    const serverPath = resolve(import.meta.dirname, "../dist/index.js");
    const transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      env: buildEnv({ VIBER_AUTH_TOKEN: "fake-token" }),
    });

    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(transport);
  }, 15000);

  afterAll(async () => {
    await client.close();
  });

  it("responds to tools/list with all 13 tools", async () => {
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
  }, 15000);

  it("exposes annotations for read-only and destructive tools", async () => {
    const { tools } = await client.listTools();
    const byName = new Map(tools.map((t) => [t.name, t]));

    const accountInfo = byName.get("get_account_info");
    expect(accountInfo?.annotations?.readOnlyHint).toBe(true);
    expect(accountInfo?.annotations?.openWorldHint).toBe(true);

    const sendMessage = byName.get("send_message");
    expect(sendMessage?.annotations?.readOnlyHint).toBe(false);
    expect(sendMessage?.annotations?.destructiveHint).toBe(false);

    const removeWebhook = byName.get("remove_webhook");
    expect(removeWebhook?.annotations?.destructiveHint).toBe(true);
    expect(removeWebhook?.annotations?.idempotentHint).toBe(true);
  }, 15000);

  it("reports the package.json version to clients", () => {
    expect(client.getServerVersion()?.version).toBe(pkg.version);
  });
});
