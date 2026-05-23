import type { ViberClient } from "../../src/viber/client.js";
import type {
  AccountInfoResponse,
  BroadcastResponse,
  MessageResponse,
  OnlineStatusResponse,
  UserDetailsResponse,
  WebhookResponse,
} from "../../src/viber/types.js";

const messageResponse: MessageResponse = {
  status: 0,
  status_message: "ok",
  message_token: 999888,
};

const broadcastResponse: BroadcastResponse = {
  status: 0,
  status_message: "ok",
  message_token: 111222,
  failed_list: [],
};

const accountInfoResponse: AccountInfoResponse = {
  status: 0,
  status_message: "ok",
  id: "bot-id",
  name: "TestBot",
  uri: "testbot",
  icon: "",
  background: "",
  category: "test",
  subcategory: "",
  location: { lat: 0, lon: 0 },
  country: "UA",
  webhook: "https://example.com/hook",
  event_types: ["message"],
  subscribers_count: 42,
  members: [],
};

const userDetailsResponse: UserDetailsResponse = {
  status: 0,
  status_message: "ok",
  message_token: 123,
  user: {
    id: "user-1",
    name: "Test User",
    avatar: "",
    country: "UA",
    language: "uk",
    primary_device_os: "Android",
    api_version: 10,
    viber_version: "21.0",
    mcc: 255,
    mnc: 1,
    device_type: "phone",
  },
};

const onlineStatusResponse: OnlineStatusResponse = {
  status: 0,
  status_message: "ok",
  users: [
    { id: "user-1", online_status: 1, online_status_message: "online" },
  ],
};

const webhookResponse: WebhookResponse = {
  status: 0,
  status_message: "ok",
  event_types: ["message", "delivered"],
};

export function createMockClient(): ViberClient {
  return {
    sendMessage: async () => messageResponse,
    sendPicture: async () => messageResponse,
    sendVideo: async () => messageResponse,
    sendFile: async () => messageResponse,
    sendUrl: async () => messageResponse,
    sendLocation: async () => messageResponse,
    sendContact: async () => messageResponse,
    broadcastMessage: async () => broadcastResponse,
    getAccountInfo: async () => accountInfoResponse,
    getUserDetails: async () => userDetailsResponse,
    getOnline: async () => onlineStatusResponse,
    setWebhook: async () => webhookResponse,
    removeWebhook: async () => webhookResponse,
  } as unknown as ViberClient;
}

export function createErrorClient(error: Error): ViberClient {
  const thrower = async () => { throw error; };
  return {
    sendMessage: thrower,
    sendPicture: thrower,
    sendVideo: thrower,
    sendFile: thrower,
    sendUrl: thrower,
    sendLocation: thrower,
    sendContact: thrower,
    broadcastMessage: thrower,
    getAccountInfo: thrower,
    getUserDetails: thrower,
    getOnline: thrower,
    setWebhook: thrower,
    removeWebhook: thrower,
  } as unknown as ViberClient;
}
