# API Reference

Complete reference for all 13 tools exposed by `viber-mcp`.

All tools validate inputs with Zod schemas. Invalid inputs return a validation error before reaching the Viber API. On Viber API errors, tools return `isError: true` with a human-readable message.

---

## send_message

Send a text message to a Viber user.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receiver` | string | yes | Viber user ID of the receiver |
| `text` | string (1-7000 chars) | yes | Message text |
| `sender_name` | string (max 28) | no | Display name override. Defaults to `VIBER_SENDER_NAME` env var |
| `sender_avatar` | string (URL) | no | Avatar URL override. Defaults to `VIBER_SENDER_AVATAR` env var |
| `tracking_data` | string (max 4096) | no | Opaque data echoed back in delivery callbacks |

### Example input

```json
{
  "receiver": "user123abc",
  "text": "Hello from Claude!"
}
```

### Example success response

```
Message sent. message_token=5912661846655238145
```

### Common errors

| Status | Message | Cause |
|--------|---------|-------|
| 1 | invalidUrl | Webhook not set |
| 3 | invalidToken | Bad `VIBER_AUTH_TOKEN` |
| 6 | receiverNotRegistered | User ID does not exist or is not subscribed |

---

## send_picture

Send an image with optional caption to a Viber user.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receiver` | string | yes | Viber user ID |
| `media` | string (URL) | yes | Public URL of the image (JPEG/PNG, max 1MB iOS / 3MB Android) |
| `text` | string (max 120) | no | Caption |
| `thumbnail` | string (URL) | no | Thumbnail URL |
| `sender_name` | string (max 28) | no | Display name override |
| `sender_avatar` | string (URL) | no | Avatar URL override |

### Example input

```json
{
  "receiver": "user123abc",
  "media": "https://example.com/photo.jpg",
  "text": "Check this out"
}
```

### Example success response

```
Picture sent. message_token=5912661846655238146
```

### Common errors

Same as `send_message`, plus media URL must be publicly accessible.

---

## send_video

Send a video to a Viber user.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receiver` | string | yes | Viber user ID |
| `media` | string (URL) | yes | Public URL of the video (MP4/H.264, max 26MB, max 180s) |
| `size` | integer (positive) | yes | Video size in bytes |
| `duration` | integer (1-180) | no | Video duration in seconds |
| `thumbnail` | string (URL) | no | Thumbnail URL |
| `sender_name` | string (max 28) | no | Display name override |
| `sender_avatar` | string (URL) | no | Avatar URL override |

### Example input

```json
{
  "receiver": "user123abc",
  "media": "https://example.com/clip.mp4",
  "size": 10485760
}
```

### Example success response

```
Video sent. message_token=5912661846655238147
```

### Common errors

Same as `send_message`. Video must be MP4/H.264 and within size/duration limits.

---

## send_file

Send a file attachment to a Viber user.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receiver` | string | yes | Viber user ID |
| `media` | string (URL) | yes | Public URL of the file (max 50MB) |
| `size` | integer (positive) | yes | File size in bytes |
| `file_name` | string (max 256) | yes | File name with extension |
| `sender_name` | string (max 28) | no | Display name override |
| `sender_avatar` | string (URL) | no | Avatar URL override |

### Example input

```json
{
  "receiver": "user123abc",
  "media": "https://example.com/report.pdf",
  "size": 204800,
  "file_name": "report.pdf"
}
```

### Example success response

```
File sent. message_token=5912661846655238148
```

### Common errors

Same as `send_message`. Some file extensions are forbidden by Viber (see [Viber docs](https://developers.viber.com/docs/api/rest-bot-api/#file-message)).

---

## send_url

Send a clickable URL to a Viber user.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receiver` | string | yes | Viber user ID |
| `media` | string (URL, max 2000) | yes | The URL to send |
| `sender_name` | string (max 28) | no | Display name override |
| `sender_avatar` | string (URL) | no | Avatar URL override |

### Example input

```json
{
  "receiver": "user123abc",
  "media": "https://example.com/article"
}
```

### Example success response

```
URL sent. message_token=5912661846655238149
```

### Common errors

Same as `send_message`.

---

## send_location

Send GPS coordinates to a Viber user.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receiver` | string | yes | Viber user ID |
| `latitude` | number (-90 to 90) | yes | Latitude |
| `longitude` | number (-180 to 180) | yes | Longitude |
| `sender_name` | string (max 28) | no | Display name override |
| `sender_avatar` | string (URL) | no | Avatar URL override |

### Example input

```json
{
  "receiver": "user123abc",
  "latitude": 50.4501,
  "longitude": 30.5234
}
```

### Example success response

```
Location sent. message_token=5912661846655238150
```

### Common errors

Same as `send_message`.

---

## send_contact

Send a contact card to a Viber user.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receiver` | string | yes | Viber user ID |
| `name` | string (max 28) | yes | Contact name |
| `phone_number` | string (max 18) | yes | Contact phone number |
| `sender_name` | string (max 28) | no | Display name override |
| `sender_avatar` | string (URL) | no | Avatar URL override |

### Example input

```json
{
  "receiver": "user123abc",
  "name": "John Doe",
  "phone_number": "+380501234567"
}
```

### Example success response

```
Contact sent. message_token=5912661846655238151
```

### Common errors

Same as `send_message`.

---

## broadcast_message

Send the same text message to up to 300 Viber users at once.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receivers` | string[] (1-300) | yes | Array of Viber user IDs |
| `text` | string (1-7000 chars) | yes | Message text |
| `sender_name` | string (max 28) | no | Display name override |
| `sender_avatar` | string (URL) | no | Avatar URL override |

### Example input

```json
{
  "receivers": ["user1", "user2", "user3"],
  "text": "Important announcement!"
}
```

### Example success response

```
Broadcast sent. message_token=5912661846655238152
```

If some deliveries fail, the response includes details:

```
Broadcast sent. message_token=5912661846655238152. Failed: user3: not subscribed
```

### Common errors

Same as `send_message`. Partial failures are reported in the response text, not as errors.

---

## get_account_info

Get the Viber bot account configuration including subscriber count and member list. Takes no arguments.

### Input

No parameters.

### Example input

```json
{}
```

### Example success response

```
Account: MyBot (1250 subscribers)
```

The structured response includes: `id`, `name`, `uri`, `icon`, `category`, `country`, `webhook`, `event_types`, `subscribers_count`, and `members` (up to 50 most recent).

### Common errors

| Status | Message | Cause |
|--------|---------|-------|
| 3 | invalidToken | Bad `VIBER_AUTH_TOKEN` |

---

## get_user_details

Fetch profile details of a Viber user.

Viber rate-limits this endpoint to 2 calls per 12 hours per user. Cache results when possible.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Viber user ID |

### Example input

```json
{
  "id": "user123abc"
}
```

### Example success response

```
User: John Doe, country=UA
```

The structured response includes: `id`, `name`, `avatar`, `country`, `language`, `primary_device_os`, `api_version`, `viber_version`, `device_type`.

### Common errors

| Status | Message | Cause |
|--------|---------|-------|
| 12 | tooManyRequests | Rate limit exceeded (2 calls/12h per user) |
| 6 | receiverNotRegistered | User ID does not exist |

---

## get_online

Check online status of up to 100 Viber users.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | string[] (1-100) | yes | Array of Viber user IDs |

### Example input

```json
{
  "ids": ["user1", "user2"]
}
```

### Example success response

```
Online status: user1: online, user2: offline
```

The structured response includes per-user: `id`, `online_status`, `online_status_message`, and optionally `last_online` (Unix timestamp).

### Common errors

Same as `get_account_info`.

---

## set_webhook

Register a webhook URL for receiving Viber events.

### Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string (URL) | yes | HTTPS URL with valid CA-issued SSL cert |
| `event_types` | string[] | no | Event types to receive. Defaults to all if omitted. Values: `delivered`, `seen`, `failed`, `subscribed`, `unsubscribed`, `conversation_started`, `message` |
| `send_name` | boolean | no | Include sender name in callbacks |
| `send_photo` | boolean | no | Include sender photo in callbacks |

### Example input

```json
{
  "url": "https://myserver.com/viber-webhook",
  "event_types": ["message", "subscribed"]
}
```

### Example success response

```
Webhook set. Events: message, subscribed
```

### Common errors

| Status | Message | Cause |
|--------|---------|-------|
| 1 | invalidUrl | URL is not HTTPS or SSL cert is invalid |
| 3 | invalidToken | Bad `VIBER_AUTH_TOKEN` |

---

## remove_webhook

Disable the currently registered webhook. Takes no arguments.

### Input

No parameters.

### Example input

```json
{}
```

### Example success response

```
Webhook removed.
```

### Common errors

Same as `get_account_info`.
