# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.2.x   | ✅        |
| < 0.2   | ❌        |

## Reporting a Vulnerability

Please **do not** report security issues through public GitHub issues.

Instead, use one of the following channels:

- **GitHub private vulnerability reporting** (preferred): [Report a vulnerability](https://github.com/serhiizghama/viber-mcp/security/advisories/new)
- **Email**: zmrser@gmail.com with the subject line `[SECURITY] viber-mcp`

Please include a description of the issue, steps to reproduce, and the affected version. You can expect an initial response within 72 hours.

## Token Handling

This MCP server controls a Viber bot, so the bot token deserves care:

- The token is read from the `VIBER_AUTH_TOKEN` environment variable at startup and is never written to disk.
- Requests are sent to the official Viber endpoint (`https://chatapi.viber.com/pa`) over HTTPS. The endpoint can be overridden via `VIBER_BASE_URL` — only do this if you fully trust the target.
- The token is not logged and is never included in MCP tool responses.

If you find any behavior that contradicts the above, please report it as a vulnerability.

## Out of Scope

- Vulnerabilities in the Viber Bot API itself — report those to [Rakuten Viber](https://www.viber.com/).
- Issues that require a compromised local environment (e.g. an attacker who can already read your process environment).
