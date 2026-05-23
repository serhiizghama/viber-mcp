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
