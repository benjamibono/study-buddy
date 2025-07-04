import OpenAI from "openai";

/**
 * Shared OpenAI client instance configured via OPENAI_API_KEY.
 * The client is created once and reused across the application
 * to benefit from internal HTTP keep-alive and connection pooling.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Lightweight exponential-backoff retry helper for chat completions.
 * Retries transient failures (e.g. rate limits) up to `retries` times.
 */
export async function chatCompletionWithRetry<
  T extends OpenAI.Chat.Completions.ChatCompletion
>(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  retries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return (await openai.chat.completions.create(params)) as T;
    } catch (error: any) {
      const isLastAttempt = attempt === retries - 1;
      if (isLastAttempt) throw error;

      // Simple exponential back-off before next retry.
      const delayMs = 2 ** attempt * 500;
      console.warn(`OpenAI request failed (attempt ${attempt + 1}/${retries}). Retrying in ${delayMs}ms…`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  // This point should never be reached.
  throw new Error("Exhausted retries calling OpenAI");
} 