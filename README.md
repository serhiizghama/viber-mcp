<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Viber_logo_2018_%28without_text%29.svg" width="80" alt="Viber" />
  <br/>
  <strong>viber-mcp</strong>
</p>

<p align="center">
  Model Context Protocol server for the Viber Bot API
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@serhii.zghama/viber-mcp"><img src="https://img.shields.io/npm/v/%40serhii.zghama%2Fviber-mcp" alt="npm version" /></a>
  <a href="https://github.com/serhiizghama/viber-mcp/actions/workflows/ci.yml"><img src="https://github.com/serhiizghama/viber-mcp/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/serhiizghama/viber-mcp"><img src="https://img.shields.io/github/stars/serhiizghama/viber-mcp?style=social" alt="GitHub stars" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node.js >= 20" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript strict" /></a>
</p>

---

The first MCP server for [Viber](https://www.viber.com/). Connect any MCP-compatible client -- Claude Desktop, Claude Code, Cursor, Windsurf, and others -- to the [Viber Bot REST API](https://developers.viber.com/docs/api/rest-bot-api/) and control your Viber bot through natural language.

Viber has over 1 billion registered users, particularly strong in Ukraine, Eastern Europe, Greece, and Southeast Asia. This server gives AI assistants full access to the bot API: send messages, media, files, broadcast to groups, manage webhooks, and query user data.

## How it works

```
┌──────────────────────┐         stdio           ┌──────────────────────┐
│                      │  ◄───────────────────►  │                      │
│   MCP Client         │    JSON-RPC over        │   viber-mcp          │
│                      │    stdin/stdout         │                      │
│   - Claude Desktop   │                         │   13 tools           │
│   - Claude Code      │                         │   Zod validation     │──── HTTPS ───►  Viber API
│   - Cursor           │                         │   Error handling     │                 chatapi.viber.com
│   - Any MCP client   │                         │   Typed responses    │
│                      │                         │                      │
└──────────────────────┘                         └──────────────────────┘
```

## Quick start

Try it instantly -- no install required:

```bash
VIBER_AUTH_TOKEN=your-token npx @serhii.zghama/viber-mcp
```

Or install globally:

```bash
npm install -g @serhii.zghama/viber-mcp
```

## Setup

### Claude Desktop

Add to your config file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "viber": {
      "command": "npx",
      "args": ["-y", "@serhii.zghama/viber-mcp"],
      "env": {
        "VIBER_AUTH_TOKEN": "your-bot-token-here",
        "VIBER_SENDER_NAME": "MyBot"
      }
    }
  }
}
```

> **Windows note:** Replace `"command": "npx"` with `"command": "cmd"` and `"args"` with `["/c", "npx", "-y", "@serhii.zghama/viber-mcp"]`.

Restart Claude Desktop. The Viber tools will appear in the tools menu.

### Claude Code

```bash
claude mcp add viber-mcp -e VIBER_AUTH_TOKEN=your-bot-token-here -- npx -y @serhii.zghama/viber-mcp
```

### Cursor

Open **Settings > MCP Servers**, click **+ Add**, and paste:

```json
{
  "viber": {
    "command": "npx",
    "args": ["-y", "@serhii.zghama/viber-mcp"],
    "env": {
      "VIBER_AUTH_TOKEN": "your-bot-token-here"
    }
  }
}
```

### VS Code (Copilot)

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "viber": {
      "command": "npx",
      "args": ["-y", "@serhii.zghama/viber-mcp"],
      "env": {
        "VIBER_AUTH_TOKEN": "your-bot-token-here"
      }
    }
  }
}
```

## Tools

13 tools covering the full Viber Bot API surface:

### Messaging

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `send_message` | Send a text message | `receiver`, `text` (up to 7000 chars) |
| `send_picture` | Send an image with optional caption | `receiver`, `media` (URL), `text` (caption) |
| `send_video` | Send a video | `receiver`, `media` (URL), `size` (bytes) |
| `send_file` | Send a file attachment | `receiver`, `media` (URL), `size`, `file_name` |
| `send_url` | Send a clickable link | `receiver`, `media` (URL, max 2000 chars) |
| `send_location` | Send GPS coordinates | `receiver`, `latitude`, `longitude` |
| `send_contact` | Send a contact card | `receiver`, `name`, `phone_number` |
| `broadcast_message` | Broadcast to up to 300 users | `receivers` (array), `text` |

### Account & Users

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `get_account_info` | Get bot profile and subscriber count | _none_ |
| `get_user_details` | Fetch user profile (rate-limited: 2/12h per user) | `id` |
| `get_online` | Check online status of up to 100 users | `ids` (array) |

### Webhooks

| Tool | Description | Key parameters |
|------|-------------|----------------|
| `set_webhook` | Register a webhook URL | `url`, `event_types` (optional) |
| `remove_webhook` | Disable the current webhook | _none_ |

All tools validate inputs with Zod schemas before calling the Viber API. On errors, tools return human-readable messages with `isError: true` so the AI can decide how to proceed.

Full schema details and examples in [docs/API_REFERENCE.md](docs/API_REFERENCE.md).

## Configuration

Environment variables, read once at startup:

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `VIBER_AUTH_TOKEN` | **yes** | -- | Bot auth token from the [Viber Admin Panel](https://partners.viber.com/) |
| `VIBER_SENDER_NAME` | no | `Bot` | Default sender display name (max 28 chars) |
| `VIBER_SENDER_AVATAR` | no | -- | Default sender avatar URL |
| `VIBER_BASE_URL` | no | `https://chatapi.viber.com/pa` | API base URL override |
| `VIBER_REQUEST_TIMEOUT_MS` | no | `15000` | Per-request timeout in milliseconds |

### Getting a Viber bot token

1. Open the [Viber Admin Panel](https://partners.viber.com/)
2. Create a new bot account (or select an existing one)
3. Copy the token from the bot's settings page
4. Set it as `VIBER_AUTH_TOKEN` in your MCP client config

> **Note:** Since February 2024, new Viber bot accounts may require commercial onboarding through Viber partners. Existing bot tokens continue to work.

## Development

```bash
git clone https://github.com/serhiizghama/viber-mcp.git
cd viber-mcp
pnpm install
```

| Command | Description |
|---------|-------------|
| `pnpm build` | Build with tsup (ESM, Node 20+) |
| `pnpm dev` | Build with file watching |
| `pnpm typecheck` | Run TypeScript strict checks |
| `pnpm test` | Run vitest (43 tests) |

### Project structure

```
src/
  index.ts           -- Entrypoint: config -> client -> server -> stdio
  config.ts          -- Environment variable parsing
  errors.ts          -- ViberApiError class
  server.ts          -- MCP server builder with tool registration
  viber/
    client.ts        -- Typed HTTP client for the Viber REST API
    types.ts         -- Request/response TypeScript interfaces
  tools/
    send-message.ts  -- One file per tool, Zod schema + handler
    ...              -- 12 more tool files
tests/
  viber-client.test.ts   -- Client unit tests (mocked fetch)
  server.test.ts         -- Integration test (spawns server, queries tools/list)
  tools/*.test.ts        -- Per-tool success + error path tests
```

### Architecture decisions

- **Zero `console.log`** -- stdout is the MCP protocol channel; only `console.error` for diagnostics
- **Native `fetch`** -- no axios/node-fetch; minimal runtime dependencies
- **No retries** -- Viber REST calls are user-driven via MCP; silent retries would hide real problems from the AI
- **Zod validation** -- every tool input is validated before reaching the Viber API
- **Tools never throw** -- errors are caught and returned as `{ isError: true }` so the AI can handle them gracefully

## Roadmap

Future work -- contributions welcome:

- [ ] **Rich media / carousels** -- `send_rich_media` tool with carousel layout
- [ ] **Keyboards** -- interactive button keyboards on messages
- [ ] **Webhook receiver** -- sibling package for incoming events via HTTP
- [ ] **Stickers** -- `send_sticker` tool
- [ ] **HTTP transport** -- Streamable HTTP for remote MCP deployments

## License

[MIT](LICENSE) &copy; [Serhii Zghama](https://github.com/serhiizghama)
