import type { LlmClient } from "./types.js";
import { OpenAiLlmClient } from "./core/llm/OpenAiLlmClient.js";
import { OllamaLlmClient } from "./core/llm/OllamaLlmClient.js";

/**
 * Auto-detect and create an LLM client from environment variables
 * 
 * Supported providers:
 * - openai: Set AI_BUG_REPLAYER_PROVIDER=openai and OPENAI_API_KEY
 * - ollama: Set AI_BUG_REPLAYER_PROVIDER=ollama (optionally OLLAMA_BASE_URL and OLLAMA_MODEL)
 * 
 * Returns undefined if no provider is configured or required env vars are missing
 */
export function autoDetectLlmClientFromEnv(): LlmClient | undefined {
  const provider = process.env.AI_BUG_REPLAYER_PROVIDER?.toLowerCase();

  if (!provider) {
    return undefined;
  }

  try {
    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn(
          "AI_BUG_REPLAYER_PROVIDER is set to 'openai' but OPENAI_API_KEY is not set"
        );
        return undefined;
      }

      return new OpenAiLlmClient({
        apiKey,
        model: process.env.OPENAI_MODEL,
        baseURL: process.env.OPENAI_BASE_URL,
      });
    }

    if (provider === "ollama") {
      return new OllamaLlmClient({
        baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
        model: process.env.OLLAMA_MODEL ?? "llama3",
      });
    }

    console.warn(`Unknown AI_BUG_REPLAYER_PROVIDER: ${provider}`);
    return undefined;
  } catch (err) {
    console.warn("Failed to create LLM client:", err);
    return undefined;
  }
}
