export class DayKeeperApiError extends Error {
  readonly statusCode: number;
  readonly details: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "DayKeeperApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function formatErrorForLLM(error: unknown): string {
  if (error instanceof DayKeeperApiError) {
    switch (error.statusCode) {
      case 400:
        return `Invalid request: ${error.message}`;
      case 401:
        return "Authentication failed. Check your DAY_KEEPER_API_KEY configuration.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return `${error.message} The resource may have been deleted.`;
      case 409:
        return `Conflict: ${error.message}`;
      case 429:
        return "Rate limited by the Day Keeper API. Please wait a moment and try again.";
      default:
        if (error.statusCode >= 500) {
          return `The Day Keeper API is temporarily unavailable (HTTP ${error.statusCode}). Please try again.`;
        }
        return error.message;
    }
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return "The request to the Day Keeper API timed out. Please try again.";
    }
    return `Unexpected error: ${error.message}`;
  }

  return "An unknown error occurred.";
}
