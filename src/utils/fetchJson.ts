const FETCH_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error("Request timed out. Please check your connection.")),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timeoutId),
  );
}

export async function fetchJson<T>(url: string): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }

    try {
      const response = await withTimeout(fetch(url), FETCH_TIMEOUT_MS);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(String(error));

      // Don't retry on HTTP errors — only on network/timeout failures
      if (lastError.message.startsWith("Request failed with status")) {
        throw lastError;
      }
    }
  }

  throw lastError!;
}
