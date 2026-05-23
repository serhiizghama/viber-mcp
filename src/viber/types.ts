export interface Sender {
  readonly name: string;
  readonly avatar?: string;
}

export interface TextMessageRequest {
  readonly receiver: string;
  readonly type: "text";
  readonly sender: Sender;
  readonly text: string;
  readonly tracking_data?: string;
}

export interface PictureMessageRequest {
  readonly receiver: string;
  readonly type: "picture";
  readonly sender: Sender;
  readonly media: string;
  readonly text?: string;
  readonly thumbnail?: string;
}

export interface VideoMessageRequest {
  readonly receiver: string;
  readonly type: "video";
  readonly sender: Sender;
  readonly media: string;
  readonly size: number;
  readonly duration?: number;
  readonly thumbnail?: string;
}

export interface FileMessageRequest {
  readonly receiver: string;
  readonly type: "file";
  readonly sender: Sender;
  readonly media: string;
  readonly size: number;
  readonly file_name: string;
}

export interface UrlMessageRequest {
  readonly receiver: string;
  readonly type: "url";
  readonly sender: Sender;
  readonly media: string;
}

export interface LocationMessageRequest {
  readonly receiver: string;
  readonly type: "location";
  readonly sender: Sender;
  readonly location: {
    readonly lat: number;
    readonly lon: number;
  };
}

export interface ContactMessageRequest {
  readonly receiver: string;
  readonly type: "contact";
  readonly sender: Sender;
  readonly contact: {
    readonly name: string;
    readonly phone_number: string;
  };
}

export interface BroadcastMessageRequest {
  readonly broadcast_list: readonly string[];
  readonly type: "text";
  readonly sender: Sender;
  readonly text: string;
}

export interface SetWebhookRequest {
  readonly url: string;
  readonly event_types?: readonly string[];
  readonly send_name?: boolean;
  readonly send_photo?: boolean;
}

export interface GetUserDetailsRequest {
  readonly id: string;
}

export interface GetOnlineRequest {
  readonly ids: readonly string[];
}

export interface ViberResponse {
  readonly status: number;
  readonly status_message: string;
}

export interface MessageResponse extends ViberResponse {
  readonly message_token: number;
}

export interface BroadcastResponse extends ViberResponse {
  readonly message_token: number;
  readonly failed_list?: ReadonlyArray<{
    readonly receiver: string;
    readonly status: number;
    readonly status_message: string;
  }>;
}

export interface AccountInfoResponse extends ViberResponse {
  readonly id: string;
  readonly name: string;
  readonly uri: string;
  readonly icon: string;
  readonly background: string;
  readonly category: string;
  readonly subcategory: string;
  readonly location: {
    readonly lat: number;
    readonly lon: number;
  };
  readonly country: string;
  readonly webhook: string;
  readonly event_types: readonly string[];
  readonly subscribers_count: number;
  readonly members: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly avatar: string;
    readonly role: string;
  }>;
}

export interface UserDetailsResponse extends ViberResponse {
  readonly message_token: number;
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly avatar: string;
    readonly country: string;
    readonly language: string;
    readonly primary_device_os: string;
    readonly api_version: number;
    readonly viber_version: string;
    readonly mcc: number;
    readonly mnc: number;
    readonly device_type: string;
  };
}

export interface OnlineStatusResponse extends ViberResponse {
  readonly users: ReadonlyArray<{
    readonly id: string;
    readonly online_status: number;
    readonly online_status_message: string;
    readonly last_online?: number;
  }>;
}

export interface WebhookResponse extends ViberResponse {
  readonly event_types: readonly string[];
}
