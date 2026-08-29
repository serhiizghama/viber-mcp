import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ViberClient } from "../src/viber/client.js";
import { ViberApiError, ViberNetworkError } from "../src/errors.js";
import type { Config } from "../src/config.js";

const TEST_CONFIG: Readonly<Config> = Object.freeze({
  authToken: "test-token-abc123",
  senderName: "TestBot",
  senderAvatar: undefined,
  baseUrl: "https://chatapi.viber.com/pa",
  requestTimeoutMs: 15_000,
});

function mockFetchSuccess(data: unknown): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function mockFetchReject(error: unknown): void {
  vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(error);
}

function mockFetchHttpError(status: number): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(null, { status, statusText: "Server Error" }),
  );
}

describe("ViberClient", () => {
  let client: ViberClient;

  beforeEach(() => {
    client = new ViberClient(TEST_CONFIG);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sendMessage", () => {
    it("sends correct request with URL, headers, and body", async () => {
      mockFetchSuccess({
        status: 0,
        status_message: "ok",
        message_token: 123456,
      });

      const result = await client.sendMessage({
        receiver: "user123",
        text: "Hello!",
      });

      expect(result.message_token).toBe(123456);

      const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0];
      const [url, options] = fetchCall;

      expect(url).toBe("https://chatapi.viber.com/pa/send_message");
      expect(options?.method).toBe("POST");

      const headers = options?.headers as Record<string, string>;
      expect(headers["X-Viber-Auth-Token"]).toBe("test-token-abc123");
      expect(headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(options?.body as string) as Record<string, unknown>;
      expect(body).toEqual({
        receiver: "user123",
        type: "text",
        sender: { name: "TestBot", avatar: undefined },
        text: "Hello!",
        tracking_data: undefined,
      });
    });

    it("uses sender overrides when provided", async () => {
      mockFetchSuccess({
        status: 0,
        status_message: "ok",
        message_token: 789,
      });

      await client.sendMessage({
        receiver: "user123",
        text: "Hi",
        sender_name: "CustomBot",
        sender_avatar: "https://example.com/avatar.png",
      });

      const body = JSON.parse(
        vi.mocked(globalThis.fetch).mock.calls[0][1]?.body as string,
      ) as Record<string, unknown>;

      expect(body.sender).toEqual({
        name: "CustomBot",
        avatar: "https://example.com/avatar.png",
      });
    });
  });

  describe("error handling", () => {
    it("throws ViberApiError on HTTP error", async () => {
      mockFetchHttpError(500);

      await expect(
        client.sendMessage({ receiver: "x", text: "hi" }),
      ).rejects.toThrow(ViberApiError);
    });

    it("throws ViberApiError on non-zero Viber status", async () => {
      mockFetchSuccess({
        status: 6,
        status_message: "receiver not found",
      });

      await expect(
        client.sendMessage({ receiver: "x", text: "hi" }),
      ).rejects.toThrow(ViberApiError);
    });
  });

  describe("getAccountInfo", () => {
    it("sends request with no body content", async () => {
      mockFetchSuccess({
        status: 0,
        status_message: "ok",
        id: "bot123",
        name: "TestBot",
        uri: "testbot",
        icon: "",
        background: "",
        category: "",
        subcategory: "",
        location: { lat: 0, lon: 0 },
        country: "UA",
        webhook: "",
        event_types: [],
        subscribers_count: 10,
        members: [],
      });

      const result = await client.getAccountInfo();
      expect(result.subscribers_count).toBe(10);

      const [url] = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(url).toBe("https://chatapi.viber.com/pa/get_account_info");
    });
  });

  describe("setWebhook", () => {
    it("sends webhook URL", async () => {
      mockFetchSuccess({
        status: 0,
        status_message: "ok",
        event_types: ["message", "delivered"],
      });

      const result = await client.setWebhook({
        url: "https://example.com/webhook",
        event_types: ["message", "delivered"],
      });

      expect(result.event_types).toEqual(["message", "delivered"]);
    });
  });

  describe("removeWebhook", () => {
    it("sends empty URL to remove webhook", async () => {
      mockFetchSuccess({
        status: 0,
        status_message: "ok",
        event_types: [],
      });

      await client.removeWebhook();

      const body = JSON.parse(
        vi.mocked(globalThis.fetch).mock.calls[0][1]?.body as string,
      ) as Record<string, unknown>;
      expect(body.url).toBe("");
    });
  });

  describe("network failures", () => {
    it("wraps a connection failure in ViberNetworkError with the cause code", async () => {
      mockFetchReject(
        Object.assign(new TypeError("fetch failed"), {
          cause: Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:9"), {
            code: "ECONNREFUSED",
          }),
        }),
      );

      const promise = client.sendMessage({ receiver: "user123", text: "Hi" });

      await expect(promise).rejects.toThrow(ViberNetworkError);
      await expect(promise).rejects.toThrow(/ECONNREFUSED/);
      await expect(promise).rejects.toThrow(/send_message/);
    });

    it("falls back to the cause message when there is no code", async () => {
      mockFetchReject(
        Object.assign(new TypeError("fetch failed"), {
          cause: new Error("bad port"),
        }),
      );

      await expect(
        client.sendMessage({ receiver: "user123", text: "Hi" }),
      ).rejects.toThrow(/Network error calling Viber API send_message: bad port/);
    });

    it("reports the configured timeout on TimeoutError", async () => {
      mockFetchReject(
        Object.assign(new Error("The operation was aborted due to timeout"), {
          name: "TimeoutError",
        }),
      );

      const promise = client.getAccountInfo();

      await expect(promise).rejects.toThrow(ViberNetworkError);
      await expect(promise).rejects.toThrow(
        /Viber API get_account_info timed out after 15000ms/,
      );
    });

    it("preserves the original error as cause", async () => {
      const original = new TypeError("fetch failed");
      mockFetchReject(original);

      await expect(
        client.sendMessage({ receiver: "user123", text: "Hi" }),
      ).rejects.toMatchObject({ cause: original, endpoint: "send_message" });
    });
  });
});
