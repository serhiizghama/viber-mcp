# viber-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that exposes the [Viber REST Bot API](https://developers.viber.com/docs/api/rest-bot-api/) as MCP tools. Any MCP-compatible client — Claude Desktop, Claude Code, Cursor, and others — can drive a Viber bot through natural language. This is the first public MCP server for Viber.

## Features

13 tools covering the full Viber Bot API:

- `send_message` — Send a text message
- `send_picture` — Send an image with optional caption
- `send_video` — Send a video
- `send_file` — Send a file attachment
- `send_url` — Send a clickable URL
- `send_location` — Send GPS coordinates
- `send_contact` — Send a contact card
- `broadcast_message` — Send to up to 300 users at once
- `get_account_info` — Read bot account configuration
- `get_user_details` — Fetch a user's profile
- `get_online` — Check online status of up to 100 users
- `set_webhook` — Register a webhook URL
- `remove_webhook` — Disable the current webhook

## Prerequisites

- **Node.js** 20 or later
- **Viber bot token** — obtain from the [Viber Admin Panel](https://partners.viber.com/)

## Install

### Global install

```bash
npm install -g viber-mcp
```

### Run without installing

```bash
npx viber-mcp
```

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "viber": {
      "command": "npx",
      "args": ["-y", "viber-mcp"],
      "env": {
        "VIBER_AUTH_TOKEN": "your-bot-token-here",
        "VIBER_SENDER_NAME": "MyBot"
      }
    }
  }
}
```

Restart Claude Desktop. The Viber tools will appear in the tools menu.

### Claude Code

```bash
claude mcp add viber-mcp -e VIBER_AUTH_TOKEN=your-bot-token-here -- npx -y viber-mcp
```

## Tool Reference

| Tool | Description | Docs |
|------|-------------|------|
| `send_message` | Send a text message | [Reference](docs/API_REFERENCE.md#send_message) |
| `send_picture` | Send an image with optional caption | [Reference](docs/API_REFERENCE.md#send_picture) |
| `send_video` | Send a video | [Reference](docs/API_REFERENCE.md#send_video) |
| `send_file` | Send a file attachment | [Reference](docs/API_REFERENCE.md#send_file) |
| `send_url` | Send a clickable URL | [Reference](docs/API_REFERENCE.md#send_url) |
| `send_location` | Send GPS coordinates | [Reference](docs/API_REFERENCE.md#send_location) |
| `send_contact` | Send a contact card | [Reference](docs/API_REFERENCE.md#send_contact) |
| `broadcast_message` | Send to up to 300 users | [Reference](docs/API_REFERENCE.md#broadcast_message) |
| `get_account_info` | Read bot account configuration | [Reference](docs/API_REFERENCE.md#get_account_info) |
| `get_user_details` | Fetch a user's profile | [Reference](docs/API_REFERENCE.md#get_user_details) |
| `get_online` | Check online status | [Reference](docs/API_REFERENCE.md#get_online) |
| `set_webhook` | Register a webhook URL | [Reference](docs/API_REFERENCE.md#set_webhook) |
| `remove_webhook` | Disable the webhook | [Reference](docs/API_REFERENCE.md#remove_webhook) |

## Configuration

Environment variables, read once at startup:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VIBER_AUTH_TOKEN` | yes | — | Bot auth token from Viber Admin Panel |
| `VIBER_SENDER_NAME` | no | `"Bot"` | Default sender display name (max 28 chars) |
| `VIBER_SENDER_AVATAR` | no | — | Default sender avatar URL |
| `VIBER_BASE_URL` | no | `https://chatapi.viber.com/pa` | API base URL (override for testing) |
| `VIBER_REQUEST_TIMEOUT_MS` | no | `15000` | Per-request timeout in milliseconds |

## Development

```bash
git clone https://github.com/serhiizghama/viber-mcp.git
cd viber-mcp
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

Run the dev server with file watching:

```bash
VIBER_AUTH_TOKEN=your-token pnpm dev
```

## Roadmap

Post-v0.1.0 features, contributions welcome:

- **Rich media / carousels** — `send_rich_media` tool with carousel support
- **Keyboards** — interactive keyboard buttons on messages
- **Webhook receiver** — sibling package for incoming message handling via HTTP
- **Stickers** — `send_sticker` tool
- **HTTP transport** — Streamable HTTP for remote MCP deployments

## License

[MIT](LICENSE) -- Serhii Zghama
