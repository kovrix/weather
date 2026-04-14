const FETCH_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

export async function fetchJson<T>(url: string): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        lastError = new Error(
          "Request timed out. Please check your connection.",
        );
      } else {
        lastError =
          error instanceof Error ? error : new Error(String(error));
      }

      // Don't retry on HTTP errors — only on network/timeout failures
      if (lastError.message.startsWith("Request failed with status")) {
        throw lastError;
      }
    }
  }

  throw lastError!;
}
