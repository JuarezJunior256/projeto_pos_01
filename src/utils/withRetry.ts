import OpenAI from "openai";

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable =
        error instanceof OpenAI.RateLimitError ||
        error instanceof OpenAI.APIConnectionError ||
        error instanceof OpenAI.APIConnectionTimeoutError ||
        (error instanceof OpenAI.APIError &&
          (error.status === 429 || error.status >= 500));

      if (!isRetryable || attempt === retries) {
        throw error;
      }

      const exponentialDelay = Math.pow(2, attempt) * delay; // Exponential backoff
      console.warn(
        `Attempt ${attempt} failed. Retrying in ${exponentialDelay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, exponentialDelay));
    }
  }

  throw new Error(
    "This should never be reached, but TypeScript requires a return statement.",
  );
}
