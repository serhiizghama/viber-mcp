# Viber MCP Server — Implementation Plan

> **Audience:** the engineer (human or agent) who will implement this server.
> **Status:** ready for execution. Follow phases in order; each phase has a clear exit criterion.
> **Last updated:** 2026-05-24

---

## 1. Project Overview

`viber-mcp` is a Model Context Protocol (MCP) server that exposes the [Viber REST Bot API](https://developers.viber.com/docs/api/rest-bot-api/) as MCP tools, so any MCP-compatible client (Claude Desktop, Claude Code, Cursor, etc.) can drive a Viber bot through natural language.

There is currently **no public MCP server for Viber messenger** — Telegram and Discord each have multiple implementations; Viber has zero. This project fills that gap with a clean, well-typed, well-documented TypeScript implementation.

### Why it matters

- Viber has ~1B registered users, especially strong in Ukraine, Bulgaria, Greece, Belarus, SE Asia.
- Bot API is mature and well-documented.
- A polished MCP wrapper is small in scope (one HTTP API, ~10 tools) but high in utility.

---

## 2. Goals & Success Criteria

| Goal | Success metric |
|------|----------------|
| Working MCP server | `npx viber-mcp` starts over stdio and exposes all tools listed in §6 |
| Type safety | `tsc --strict` passes with zero `any`, all Viber API payloads typed |
| Validation | All tool inputs validated by Zod; bad inputs return tool execution errors, never crash |
| Documentation | README contains install + Claude Desktop config snippet + per-tool examples; `docs/` contains this plan and an API reference |
| Tests | Unit tests for the Viber client (mocked HTTP) cover all tools; ≥80% line coverage on `src/` |
| Distribution | Published to npm as `viber-mcp` with a working `bin` entry |
| Discoverability | Listed in at least 2 "awesome MCP" lists; README has copy-paste setup for Claude Desktop |

**Stretch:** GitHub Starstruck badge (16 stars) within 90 days of launch.

---

## 3. Technology Stack

| Concern | Choice | Notes |
|---------|--------|-------|
| Language | TypeScript 5.x, `strict: true` | No `any`, no `@ts-ignore` |
| Runtime | Node.js ≥ 20 LTS | Native `fetch`, native `crypto.webcrypto` for HMAC |
| MCP SDK | `@modelcontextprotocol/sdk` **v1.x** | v2 is alpha — do not use |
| Validation | `zod` ^3.23 | Tool input schemas |
| HTTP | Native `fetch` | No `axios`/`node-fetch` — keep dependency surface small |
| Test runner | `vitest` | Built-in mocking, ESM-native, fast |
| Linter / formatter | `eslint` + `prettier` (or `biome` — pick one and document) | Bundled in `pnpm lint` script |
| Build | `tsup` | Single CLI; emits ESM + CJS + `.d.ts` |
| Package manager | `pnpm` | Consistent with most modern TS repos |

**Do not** add: axios, dotenv (use process.env directly + a single helper), express, fastify, winston/pino (use `console.error` for the stdio transport — stderr never collides with the protocol channel on stdout).

---

## 4. Architecture

```
┌─────────────────────┐    stdio JSON-RPC   ┌─────────────────────────────┐
│  MCP Client         │ ──────────────────► │  viber-mcp server           │
│  (Claude Desktop,   │                     │                             │
│   Claude Code, etc.)│ ◄────────────────── │  ┌───────────────────────┐  │
└─────────────────────┘                     │  │ Tool registry         │  │
                                            │  │ (Zod schemas + impl)  │  │
                                            │  └──────────┬────────────┘  │
                                            │             │               │
                                            │  ┌──────────▼────────────┐  │
                                            │  │ ViberClient           │  │
                                            │  │ (typed fetch wrapper) │  │
                                            │  └──────────┬────────────┘  │
                                            └─────────────┼───────────────┘
                                                          │ HTTPS
                                                          ▼
                                              https://chatapi.viber.com/pa
```

**Layers:**

1. **Transport** — `StdioServerTransport` from the SDK. Single instance per process.
2. **Tool registry** — `src/tools/*.ts`; each file exports one or more tools with `{ name, description, inputSchema, handler }`. `src/index.ts` collects them and registers via `server.tool(...)`.
3. **Viber client** — `src/viber/client.ts`; one class wrapping the REST API. Owns the auth token, the base URL, retries, and error normalization. Pure transport — no MCP awareness.
4. **Types** — `src/viber/types.ts`; TypeScript interfaces mirroring Viber API request/response shapes.
5. **Errors** — `src/errors.ts`; one `ViberApiError` class carrying the Viber status code and message.

### Why this split

- **Tools never touch `fetch` directly.** Only `ViberClient` does. This keeps tools small (5–15 lines each) and makes the whole library testable by mocking one class.
- **Tools never throw to the SDK.** They catch `ViberApiError`, format a user-readable message, and return `{ content, isError: true }`. Uncaught throws would surface as protocol errors and be less useful to the LLM.

---

## 5. Project Structure

```
viber-mcp/
├── docs/
│   ├── IMPLEMENTATION_PLAN.md      ← this file
│   ├── API_REFERENCE.md            ← per-tool reference (produced in Phase 7)
│   └── EXAMPLES.md                 ← end-to-end usage examples
├── src/
│   ├── index.ts                    ← entrypoint: creates server, registers tools, connects transport
│   ├── server.ts                   ← builds the McpServer instance (separated for testability)
│   ├── config.ts                   ← env var parsing (VIBER_AUTH_TOKEN, etc.)
│   ├── errors.ts                   ← ViberApiError + error code map
│   ├── viber/
│   │   ├── client.ts               ← ViberClient class
│   │   ├── types.ts                ← API request/response types
│   │   └── errors.ts               ← Viber status code → message map
│   └── tools/
│       ├── index.ts                ← exports a flat array of all tools
│       ├── send-message.ts
│       ├── send-picture.ts
│       ├── send-file.ts
│       ├── send-video.ts
│       ├── send-url.ts
│       ├── send-location.ts
│       ├── send-contact.ts
│       ├── broadcast-message.ts
│       ├── get-account-info.ts
│       ├── get-user-details.ts
│       ├── get-online.ts
│       ├── set-webhook.ts
│       └── remove-webhook.ts
├── tests/
│   ├── viber-client.test.ts        ← mocks fetch, asserts request shape
│   ├── tools/*.test.ts             ← one file per tool
│   └── helpers/mock-fetch.ts
├── examples/
│   └── claude-desktop-config.json  ← copy-paste config snippet
├── .github/
│   └── workflows/
│       ├── ci.yml                  ← lint + typecheck + test on push/PR
│       └── publish.yml             ← npm publish on tagged release
├── .gitignore
├── .npmignore                      ← exclude tests/, examples/, docs/* except README
├── README.md
├── LICENSE                         ← MIT
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── eslint.config.js
```

---

## 6. Tool Specifications

All tools follow this contract:

- **Name** — lowercase with underscores; matches MCP convention used in popular servers.
- **Input** — Zod schema with `.describe()` on every field so the LLM understands the shape from `tools/list`.
- **Output** — On success: `{ content: [{ type: 'text', text: <human-readable summary> }], structuredContent: <raw Viber response> }`. On failure: same shape with `isError: true`.

| Tool | Viber endpoint | Purpose |
|------|----------------|---------|
| `send_message` | `POST /send_message` | Send a text message |
| `send_picture` | `POST /send_message` (type=picture) | Send an image with optional caption |
| `send_video` | `POST /send_message` (type=video) | Send a video |
| `send_file` | `POST /send_message` (type=file) | Send a file attachment |
| `send_url` | `POST /send_message` (type=url) | Send a clickable link |
| `send_location` | `POST /send_message` (type=location) | Send GPS coordinates |
| `send_contact` | `POST /send_message` (type=contact) | Send a contact card |
| `broadcast_message` | `POST /broadcast_message` | Send the same message to ≤300 receivers |
| `get_account_info` | `POST /get_account_info` | Read bot account configuration |
| `get_user_details` | `POST /get_user_details` | Fetch profile of one user (rate-limited by Viber: ≤2/12h per user) |
| `get_online` | `POST /get_online` | Online status of ≤100 users |
| `set_webhook` | `POST /set_webhook` | Register a webhook URL |
| `remove_webhook` | `POST /set_webhook` (empty url) | Disable webhook |

### 6.1 `send_message`

```ts
inputSchema: z.object({
  receiver: z.string().describe('Viber user ID of the receiver (obtained from a previous incoming event)'),
  text: z.string().min(1).max(7000).describe('Message text, up to 7000 characters'),
  sender_name: z.string().max(28).optional().describe('Display name override (≤28 chars). Defaults to VIBER_SENDER_NAME env var.'),
  sender_avatar: z.string().url().optional().describe('Avatar URL override. Defaults to VIBER_SENDER_AVATAR env var.'),
  tracking_data: z.string().max(4096).optional().describe('Opaque data echoed back in delivery callbacks'),
})
```

Maps directly to the Viber `text` message payload. The default `sender` is taken from env vars so the LLM does not have to repeat it on every call.

### 6.2 `send_picture`

```ts
inputSchema: z.object({
  receiver: z.string(),
  media: z.string().url().describe('Public URL of the image (JPEG/PNG, ≤1MB iOS / ≤3MB Android)'),
  text: z.string().max(120).optional().describe('Caption, ≤120 chars'),
  thumbnail: z.string().url().optional(),
  sender_name: z.string().max(28).optional(),
  sender_avatar: z.string().url().optional(),
})
```

### 6.3 `send_video`

```ts
inputSchema: z.object({
  receiver: z.string(),
  media: z.string().url().describe('Public URL of the video (MP4/H.264, ≤26MB, ≤180s)'),
  size: z.number().int().positive().describe('Video size in bytes'),
  duration: z.number().int().positive().max(180).optional(),
  thumbnail: z.string().url().optional(),
  sender_name: z.string().max(28).optional(),
  sender_avatar: z.string().url().optional(),
})
```

### 6.4 `send_file`

```ts
inputSchema: z.object({
  receiver: z.string(),
  media: z.string().url().describe('Public URL of the file (≤50MB; see Viber docs for forbidden extensions)'),
  size: z.number().int().positive(),
  file_name: z.string().max(256),
  sender_name: z.string().max(28).optional(),
  sender_avatar: z.string().url().optional(),
})
```

### 6.5 `send_url`

```ts
inputSchema: z.object({
  receiver: z.string(),
  media: z.string().url().max(2000).describe('The URL to send'),
  sender_name: z.string().max(28).optional(),
  sender_avatar: z.string().url().optional(),
})
```

### 6.6 `send_location`

```ts
inputSchema: z.object({
  receiver: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  sender_name: z.string().max(28).optional(),
  sender_avatar: z.string().url().optional(),
})
```

### 6.7 `send_contact`

```ts
inputSchema: z.object({
  receiver: z.string(),
  name: z.string().max(28),
  phone_number: z.string().max(18),
  sender_name: z.string().max(28).optional(),
  sender_avatar: z.string().url().optional(),
})
```

### 6.8 `broadcast_message`

```ts
inputSchema: z.object({
  receivers: z.array(z.string()).min(1).max(300).describe('Up to 300 receiver IDs'),
  text: z.string().min(1).max(7000),
  sender_name: z.string().max(28).optional(),
  sender_avatar: z.string().url().optional(),
})
```

**Implementation note:** Viber returns a `failed_list` in the response — surface it explicitly in the text content so the LLM can report partial failures.

### 6.9 `get_account_info`

```ts
inputSchema: z.object({})
```

No arguments. Returns bot configuration including subscribed user count, location, and member list (up to 50 most recent subscribers).

### 6.10 `get_user_details`

```ts
inputSchema: z.object({
  id: z.string().describe('Viber user ID. Note: Viber rate-limits this to 2 calls per 12h per user — cache results if possible.'),
})
```

### 6.11 `get_online`

```ts
inputSchema: z.object({
  ids: z.array(z.string()).min(1).max(100),
})
```

### 6.12 `set_webhook`

```ts
inputSchema: z.object({
  url: z.string().url().describe('HTTPS URL with valid CA-issued SSL cert'),
  event_types: z.array(z.enum([
    'delivered', 'seen', 'failed', 'subscribed', 'unsubscribed',
    'conversation_started', 'message',
  ])).optional().describe('Defaults to all events if omitted'),
  send_name: z.boolean().optional(),
  send_photo: z.boolean().optional(),
})
```

### 6.13 `remove_webhook`

```ts
inputSchema: z.object({})
```

Calls `set_webhook` with empty `url`. Convenience tool — clearer in tool-list than `set_webhook({ url: '' })`.

---

## 7. Configuration

Environment variables, parsed once in `src/config.ts`:

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VIBER_AUTH_TOKEN` | yes | — | Bot auth token; sent as `X-Viber-Auth-Token` header |
| `VIBER_SENDER_NAME` | no | `"Bot"` | Default `sender.name` when tools omit it |
| `VIBER_SENDER_AVATAR` | no | — | Default `sender.avatar` URL |
| `VIBER_BASE_URL` | no | `https://chatapi.viber.com/pa` | Override for testing/staging |
| `VIBER_REQUEST_TIMEOUT_MS` | no | `15000` | Per-request timeout via `AbortSignal.timeout()` |

On startup, `src/config.ts` MUST:
1. Read `VIBER_AUTH_TOKEN` and throw a clear error to stderr if missing (do not start the server).
2. Validate the token is non-empty.
3. Freeze the resulting config object.

---

## 8. Error Handling

### 8.1 ViberApiError

```ts
export class ViberApiError extends Error {
  constructor(
    public readonly status: number,        // Viber status code (e.g. 2, 6, 12)
    public readonly statusMessage: string, // Viber status_message
    public readonly endpoint: string,
  ) {
    super(`Viber API error ${status} at ${endpoint}: ${statusMessage}`);
    this.name = 'ViberApiError';
  }
}
```

### 8.2 Client-level handling

`ViberClient.request<T>()`:

1. Sends the request with the auth header + 15s timeout.
2. On HTTP non-2xx: throws `ViberApiError` with the HTTP status.
3. On HTTP 2xx with `status !== 0` in the body: throws `ViberApiError` with the Viber status.
4. On HTTP 2xx with `status === 0`: returns the typed body.

No retries by default — Viber's webhook has retries, but our REST calls are user-driven via MCP, so retrying silently would hide real problems from the LLM. If we add retry later, only retry on Viber status 12 (rate limit) with exponential backoff, and surface that we are retrying.

### 8.3 Tool-level handling

Every tool handler:

```ts
async (input) => {
  try {
    const result = await client.sendMessage(input);
    return {
      content: [{ type: 'text', text: `Message sent. message_token=${result.message_token}` }],
      structuredContent: result,
    };
  } catch (err) {
    const msg = err instanceof ViberApiError
      ? `Viber API error ${err.status}: ${err.statusMessage}`
      : err instanceof Error ? err.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: msg }],
      isError: true,
    };
  }
}
```

The LLM sees `isError: true` and can decide whether to retry, ask the user, or stop.

### 8.4 Logging

- Tool errors → `console.error(JSON.stringify({ level: 'error', tool, error, input: redacted }))`.
- Never log the auth token. The `redacted` helper must scrub `VIBER_AUTH_TOKEN` and any value matching the token pattern.
- Logs go to **stderr only** — stdout is the MCP protocol channel.

---

## 9. Implementation Phases

Each phase has a single owner-checkable exit criterion. Do not start phase N+1 until phase N's exit criterion passes.

### Phase 1 — Scaffolding (≈ 1 hour)

- `pnpm init`; set `"type": "module"`.
- Install deps: `@modelcontextprotocol/sdk`, `zod`. Dev: `typescript`, `vitest`, `tsup`, `eslint`, `prettier`, `@types/node`.
- Create `tsconfig.json` (strict, ESNext, NodeNext modules).
- Create `tsup.config.ts` (entry `src/index.ts`, format `esm`, target `node20`, shims for `__dirname` if needed).
- Create `vitest.config.ts`.
- Create `eslint.config.js` (flat config, recommended TS rules).
- Add npm scripts: `dev`, `build`, `start`, `test`, `lint`, `typecheck`.
- Add `bin` entry: `"bin": { "viber-mcp": "dist/index.js" }` with `#!/usr/bin/env node` shebang in `src/index.ts`.

**Exit:** `pnpm build && pnpm typecheck && pnpm lint` all pass on an empty `src/index.ts` containing only a placeholder.

### Phase 2 — Config + ViberClient (≈ 2 hours)

- Implement `src/config.ts`.
- Implement `src/errors.ts` with `ViberApiError`.
- Implement `src/viber/types.ts` — start with `TextMessageRequest`, `MessageResponse`, `AccountInfoResponse`, `UserDetailsResponse`. Add more as you go.
- Implement `src/viber/client.ts`:
  - Constructor takes `{ authToken, baseUrl, timeoutMs }`.
  - Private `request<TReq, TRes>(endpoint, body): Promise<TRes>`.
  - Public methods: `sendMessage`, `sendPicture`, `sendVideo`, `sendFile`, `sendUrl`, `sendLocation`, `sendContact`, `broadcastMessage`, `getAccountInfo`, `getUserDetails`, `getOnline`, `setWebhook`, `removeWebhook`.

**Exit:** unit test mocks `fetch`, calls `client.sendMessage({ receiver: 'x', text: 'hi' })`, asserts the outgoing request has the right URL, headers (`X-Viber-Auth-Token`), and JSON body.

### Phase 3 — Tool registry (≈ 3 hours)

- Implement `src/tools/index.ts` exporting `type Tool` and a flat `tools` array.
- Implement each tool file in `src/tools/` per §6. Keep handlers small — delegate to the client.
- In `src/server.ts`, write `buildServer(client: ViberClient): McpServer` that creates the server and registers each tool.
- In `src/index.ts`, wire it all together:

  ```ts
  #!/usr/bin/env node
  import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
  import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
  import { loadConfig } from './config.js';
  import { ViberClient } from './viber/client.js';
  import { buildServer } from './server.js';

  const config = loadConfig();
  const client = new ViberClient(config);
  const server = buildServer(client);
  await server.connect(new StdioServerTransport());
  ```

**Exit:** `node dist/index.js` with `VIBER_AUTH_TOKEN=fake` starts and stays alive on stdin; sending a `tools/list` JSON-RPC request returns all 13 tools.

### Phase 4 — Tests (≈ 3 hours)

- Unit tests for `ViberClient`: one test per method, mocking `fetch`, asserting both success and error paths.
- Unit tests for each tool: build a fake client, call the tool handler, assert the returned content shape (success and `isError: true` paths).
- Integration smoke test: spawn the built server as a child process, send `tools/list` over stdio, assert the response matches the registry.

**Exit:** `pnpm test` runs green; coverage ≥ 80%.

### Phase 5 — Local end-to-end with Claude Desktop (≈ 1 hour)

- Get a real Viber bot token from a test bot (note: since Feb 2024, new bots require commercial onboarding via Viber partners — if the implementer cannot obtain one, mark this phase as "deferred, awaiting token" and proceed).
- Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

  ```json
  {
    "mcpServers": {
      "viber": {
        "command": "node",
        "args": ["/absolute/path/to/viber-mcp/dist/index.js"],
        "env": {
          "VIBER_AUTH_TOKEN": "...",
          "VIBER_SENDER_NAME": "TestBot"
        }
      }
    }
  }
  ```

- Restart Claude Desktop, verify the tools appear, ask Claude to call `get_account_info` and `send_message` to a subscribed user.

**Exit:** real message arrives in Viber from a Claude-issued tool call. Capture a screenshot for README.

### Phase 6 — README (≈ 2 hours)

`README.md` must contain, in order:

1. One-paragraph pitch and a screenshot/GIF from Phase 5.
2. Feature list (bullet list of tools).
3. Prerequisites (Node 20+, Viber bot token).
4. Install: `npm install -g viber-mcp` and `npx viber-mcp` paths.
5. Claude Desktop setup: copy-paste JSON block.
6. Claude Code setup: `claude mcp add` command.
7. Per-tool one-line reference table linking to `docs/API_REFERENCE.md`.
8. Configuration table (env vars).
9. Development section (clone, install, build, test).
10. Roadmap (rich media, keyboards, carousels — see §12).
11. License (MIT).

**Exit:** a stranger can copy-paste the README, set their token, and have it running in Claude Desktop in under 5 minutes.

### Phase 7 — API_REFERENCE.md (≈ 1.5 hours)

Auto-generate or hand-write `docs/API_REFERENCE.md` with one section per tool: name, description, input schema as a table, example request, example success response, common errors. This is what an LLM with web access would read to learn the server.

**Exit:** every tool in §6 has a section in `API_REFERENCE.md`.

### Phase 8 — CI (≈ 1 hour)

- `.github/workflows/ci.yml`: matrix on Node 20 + 22, steps: `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- `.github/workflows/publish.yml`: trigger on `release.published`, run build, then `npm publish --access public` using `NODE_AUTH_TOKEN` from secrets.

**Exit:** CI green on `main`.

### Phase 9 — Publish v0.1.0 (≈ 30 minutes)

- Bump `package.json` to `0.1.0`.
- Add `LICENSE` (MIT, owner: Serhii Zghama).
- Tag `v0.1.0` and push; release workflow publishes to npm.
- Test the public install: `npx viber-mcp` in a fresh directory.

**Exit:** `npm view viber-mcp` shows the published version; `npx viber-mcp` works.

### Phase 10 — Promotion (out-of-scope for the implementing agent — Serhii to drive)

- Submit to "awesome MCP" lists.
- Reddit posts (`r/ClaudeAI`, `r/LocalLLaMA`, `r/viber`).
- Tweet with screenshot from Phase 5.

---

## 10. Coding Conventions

- **No `any`.** If a type is genuinely unknown, use `unknown` and narrow.
- **No `console.log`** anywhere — only `console.error` for diagnostics (stdout is reserved for the MCP protocol).
- **No comments** for code that names itself. Only comment a non-obvious WHY (e.g. "Viber rate-limits this to 2/12h per user — caller should cache").
- **No defensive programming** at boundaries the SDK already guards. Trust Zod-validated inputs.
- **Imports:** named imports only; no default exports except where the SDK requires them.
- **File size:** keep files under 150 lines. If a tool file grows past that, the abstraction is probably wrong.
- **Git commits:** follow the convention from `Serhii/CLAUDE.md` — `fix:` / `feat:` / `refactor:` / `test:` / `docs:` / `chore:` prefixes, English, no AI co-author tags, no emojis. Identity must be `serhiizghama / zmrser@gmail.com`.

---

## 11. Testing Strategy

| Layer | Tool | What we test |
|-------|------|--------------|
| `ViberClient` | vitest + `vi.spyOn(global, 'fetch')` | request URL, headers, body, response parsing, error mapping |
| Tools | vitest with a hand-rolled `FakeViberClient` | input validation, success output shape, error output shape (`isError: true`) |
| Server wiring | vitest child process | `tools/list` returns all 13 tools with correct schemas |
| Build artifact | vitest | `dist/index.js` is executable and starts under `VIBER_AUTH_TOKEN=fake` |

We **do not** hit the real Viber API in tests — that requires a live bot token and would make CI flaky. Phase 5 is the only manual end-to-end check.

---

## 12. Roadmap (post-v0.1.0)

Out of scope for v0.1 but documented in README so contributors can pick them up:

- **Rich media / carousels** — `send_rich_media` tool; non-trivial schema, deserves its own design pass.
- **Keyboards** — `send_keyboard` tool, or `keyboard` parameter added to existing send tools.
- **Webhook receiver** — a sibling package `viber-mcp-webhook` that runs an HTTP server, verifies the `X-Viber-Content-Signature` HMAC, and exposes incoming messages as MCP resources / prompts. Separate package because it changes the deployment model from "stdio CLI" to "always-on service".
- **Stickers** — `send_sticker` tool. Trivial once we have a sticker ID reference.
- **HTTP transport** — expose the server over Streamable HTTP for remote-MCP use cases.

---

## 13. Security Checklist

- [ ] Auth token only read from env, never from CLI args (would leak via `ps`).
- [ ] Auth token never echoed in logs or error messages.
- [ ] All tool inputs validated by Zod before reaching the client.
- [ ] All outgoing requests have a 15s timeout (`AbortSignal.timeout(15000)`).
- [ ] HTTPS-only base URL; reject `http://` if `VIBER_BASE_URL` is overridden to non-https unless `NODE_ENV=test`.
- [ ] No `eval`, no dynamic `require`, no `child_process` calls.
- [ ] Dependencies: only `@modelcontextprotocol/sdk` and `zod` at runtime. Run `pnpm audit` in CI.

---

## 14. References

- **Viber Bot REST API:** https://developers.viber.com/docs/api/rest-bot-api/
- **MCP TypeScript SDK:** https://github.com/modelcontextprotocol/typescript-sdk (use v1.x, `@modelcontextprotocol/sdk`)
- **MCP tools concept:** https://modelcontextprotocol.io/docs/concepts/tools
- **MCP spec (2025-06-18):** https://modelcontextprotocol.io/specification/2025-06-18

---

## 15. Definition of Done (for the implementing agent)

The project is ready for v0.1.0 release when **all** of the following are true:

1. `pnpm build && pnpm lint && pnpm typecheck && pnpm test` all pass locally and in CI.
2. All 13 tools from §6 are registered and respond correctly to mocked Viber responses.
3. README contains a working Claude Desktop config block and was tested on a fresh machine by following only the README (no insider knowledge).
4. `docs/API_REFERENCE.md` documents every tool.
5. The package is published to npm as `viber-mcp` and `npx viber-mcp` works in a clean environment.
6. No `any`, no `console.log`, no AI co-author tags in commits, no Claude/agent mentions in PR descriptions.

When done, hand off back to Serhii for the promotion phase (§9, Phase 10).
