export class ViberApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusMessage: string,
    public readonly endpoint: string,
  ) {
    super(`Viber API error ${status} at ${endpoint}: ${statusMessage}`);
    this.name = "ViberApiError";
  }
}

/**
 * Raised when the request never produced an HTTP response: DNS failure,
 * connection refused, TLS problem, or the configured timeout elapsing.
 * The original failure is preserved in `cause`.
 */
export class ViberNetworkError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "ViberNetworkError";
  }
}
