export interface Config {
  readonly authToken: string;
  readonly senderName: string;
  readonly senderAvatar: string | undefined;
  readonly baseUrl: string;
  readonly requestTimeoutMs: number;
}

export function loadConfig(): Readonly<Config> {
  const authToken = process.env.VIBER_AUTH_TOKEN;
  if (!authToken) {
    throw new Error(
      "VIBER_AUTH_TOKEN environment variable is required. " +
        "Get one from the Viber Admin Panel.",
    );
  }

  const config: Config = {
    authToken,
    senderName: process.env.VIBER_SENDER_NAME ?? "Bot",
    senderAvatar: process.env.VIBER_SENDER_AVATAR ?? undefined,
    baseUrl:
      process.env.VIBER_BASE_URL ?? "https://chatapi.viber.com/pa",
    requestTimeoutMs: Number(process.env.VIBER_REQUEST_TIMEOUT_MS) || 15_000,
  };

  return Object.freeze(config);
}
