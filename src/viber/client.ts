import type { Config } from "../config.js";
import { ViberApiError, ViberNetworkError } from "../errors.js";
import type {
  AccountInfoResponse,
  BroadcastMessageRequest,
  BroadcastResponse,
  ContactMessageRequest,
  FileMessageRequest,
  GetOnlineRequest,
  GetUserDetailsRequest,
  LocationMessageRequest,
  MessageResponse,
  OnlineStatusResponse,
  PictureMessageRequest,
  Sender,
  SetWebhookRequest,
  TextMessageRequest,
  UrlMessageRequest,
  UserDetailsResponse,
  ViberResponse,
  VideoMessageRequest,
  WebhookResponse,
} from "./types.js";

function errorName(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "name" in err) {
    const { name } = err as { name?: unknown };
    return typeof name === "string" ? name : undefined;
  }
  return undefined;
}

/**
 * Node's `fetch` reports transport failures as a bare "fetch failed" TypeError
 * and hides the useful detail (ECONNREFUSED, ENOTFOUND, ...) in `cause`.
 */
function networkReason(err: unknown): string {
  const cause = err instanceof Error ? err.cause : undefined;

  if (typeof cause === "object" && cause !== null) {
    const { code, message } = cause as { code?: unknown; message?: unknown };
    if (typeof code === "string" && code.length > 0) {
      return code;
    }
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  if (err instanceof Error && err.message.length > 0) {
    return err.message;
  }

  return String(err);
}

export class ViberClient {
  private readonly authToken: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly defaultSender: Sender;

  constructor(config: Readonly<Config>) {
    this.authToken = config.authToken;
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.requestTimeoutMs;
    this.defaultSender = {
      name: config.senderName,
      avatar: config.senderAvatar,
    };
  }

  private async request<TReq, TRes extends ViberResponse>(
    endpoint: string,
    body: TReq,
  ): Promise<TRes> {
    const url = `${this.baseUrl}/${endpoint}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Viber-Auth-Token": this.authToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      if (errorName(err) === "TimeoutError") {
        throw new ViberNetworkError(
          `Viber API ${endpoint} timed out after ${this.timeoutMs}ms`,
          endpoint,
          err,
        );
      }
      throw new ViberNetworkError(
        `Network error calling Viber API ${endpoint}: ${networkReason(err)}`,
        endpoint,
        err,
      );
    }

    if (!response.ok) {
      throw new ViberApiError(
        response.status,
        `HTTP ${response.status} ${response.statusText}`,
        endpoint,
      );
    }

    const data = (await response.json()) as TRes;

    if (data.status !== 0) {
      throw new ViberApiError(data.status, data.status_message, endpoint);
    }

    return data;
  }

  private buildSender(
    nameOverride?: string,
    avatarOverride?: string,
  ): Sender {
    return {
      name: nameOverride ?? this.defaultSender.name,
      avatar: avatarOverride ?? this.defaultSender.avatar,
    };
  }

  async sendMessage(input: {
    receiver: string;
    text: string;
    sender_name?: string;
    sender_avatar?: string;
    tracking_data?: string;
  }): Promise<MessageResponse> {
    return this.request<TextMessageRequest, MessageResponse>("send_message", {
      receiver: input.receiver,
      type: "text",
      sender: this.buildSender(input.sender_name, input.sender_avatar),
      text: input.text,
      tracking_data: input.tracking_data,
    });
  }

  async sendPicture(input: {
    receiver: string;
    media: string;
    text?: string;
    thumbnail?: string;
    sender_name?: string;
    sender_avatar?: string;
  }): Promise<MessageResponse> {
    return this.request<PictureMessageRequest, MessageResponse>(
      "send_message",
      {
        receiver: input.receiver,
        type: "picture",
        sender: this.buildSender(input.sender_name, input.sender_avatar),
        media: input.media,
        text: input.text,
        thumbnail: input.thumbnail,
      },
    );
  }

  async sendVideo(input: {
    receiver: string;
    media: string;
    size: number;
    duration?: number;
    thumbnail?: string;
    sender_name?: string;
    sender_avatar?: string;
  }): Promise<MessageResponse> {
    return this.request<VideoMessageRequest, MessageResponse>("send_message", {
      receiver: input.receiver,
      type: "video",
      sender: this.buildSender(input.sender_name, input.sender_avatar),
      media: input.media,
      size: input.size,
      duration: input.duration,
      thumbnail: input.thumbnail,
    });
  }

  async sendFile(input: {
    receiver: string;
    media: string;
    size: number;
    file_name: string;
    sender_name?: string;
    sender_avatar?: string;
  }): Promise<MessageResponse> {
    return this.request<FileMessageRequest, MessageResponse>("send_message", {
      receiver: input.receiver,
      type: "file",
      sender: this.buildSender(input.sender_name, input.sender_avatar),
      media: input.media,
      size: input.size,
      file_name: input.file_name,
    });
  }

  async sendUrl(input: {
    receiver: string;
    media: string;
    sender_name?: string;
    sender_avatar?: string;
  }): Promise<MessageResponse> {
    return this.request<UrlMessageRequest, MessageResponse>("send_message", {
      receiver: input.receiver,
      type: "url",
      sender: this.buildSender(input.sender_name, input.sender_avatar),
      media: input.media,
    });
  }

  async sendLocation(input: {
    receiver: string;
    latitude: number;
    longitude: number;
    sender_name?: string;
    sender_avatar?: string;
  }): Promise<MessageResponse> {
    return this.request<LocationMessageRequest, MessageResponse>(
      "send_message",
      {
        receiver: input.receiver,
        type: "location",
        sender: this.buildSender(input.sender_name, input.sender_avatar),
        location: { lat: input.latitude, lon: input.longitude },
      },
    );
  }

  async sendContact(input: {
    receiver: string;
    name: string;
    phone_number: string;
    sender_name?: string;
    sender_avatar?: string;
  }): Promise<MessageResponse> {
    return this.request<ContactMessageRequest, MessageResponse>(
      "send_message",
      {
        receiver: input.receiver,
        type: "contact",
        sender: this.buildSender(input.sender_name, input.sender_avatar),
        contact: { name: input.name, phone_number: input.phone_number },
      },
    );
  }

  async broadcastMessage(input: {
    receivers: string[];
    text: string;
    sender_name?: string;
    sender_avatar?: string;
  }): Promise<BroadcastResponse> {
    return this.request<BroadcastMessageRequest, BroadcastResponse>(
      "broadcast_message",
      {
        broadcast_list: input.receivers,
        type: "text",
        sender: this.buildSender(input.sender_name, input.sender_avatar),
        text: input.text,
      },
    );
  }

  async getAccountInfo(): Promise<AccountInfoResponse> {
    return this.request<Record<string, never>, AccountInfoResponse>(
      "get_account_info",
      {},
    );
  }

  async getUserDetails(id: string): Promise<UserDetailsResponse> {
    return this.request<GetUserDetailsRequest, UserDetailsResponse>(
      "get_user_details",
      { id },
    );
  }

  async getOnline(ids: string[]): Promise<OnlineStatusResponse> {
    return this.request<GetOnlineRequest, OnlineStatusResponse>("get_online", {
      ids,
    });
  }

  async setWebhook(input: {
    url: string;
    event_types?: string[];
    send_name?: boolean;
    send_photo?: boolean;
  }): Promise<WebhookResponse> {
    return this.request<SetWebhookRequest, WebhookResponse>("set_webhook", {
      url: input.url,
      event_types: input.event_types,
      send_name: input.send_name,
      send_photo: input.send_photo,
    });
  }

  async removeWebhook(): Promise<WebhookResponse> {
    return this.request<SetWebhookRequest, WebhookResponse>("set_webhook", {
      url: "",
    });
  }
}
