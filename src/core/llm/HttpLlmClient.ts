import type { LlmClient, BugReplayInput, BugReplayResult } from "../../types.js";
import type { ParsedErrorLog } from "../logParser.js";
import { SYSTEM_PROMPT, buildUserPrompt, parseLlmResponse } from "./LlmClient.js";

export interface HttpLlmClientOptions {
  baseUrl: string;
  apiKey?: string;
  model?: string;
  /**
   * Custom function to map our request to the HTTP body
   */
  requestMapper?: (parsed: ParsedErrorLog, input: BugReplayInput) => unknown;
  /**
   * Custom function to extract content from the HTTP response
   */
  responseMapper?: (data: unknown) => string;
}

/**
 * Generic HTTP LLM client for OpenAI-compatible APIs
 */
export class HttpLlmClient implements LlmClient {
  private options: HttpLlmClientOptions;

  constructor(opts: HttpLlmClientOptions) {
    this.options = opts;
  }

  async generateReplay(
    parsed: ParsedErrorLog,
    input: BugReplayInput
  ): Promise<Omit<BugReplayResult, "sandboxResult">> {
    const userPrompt = buildUserPrompt(parsed, input);

    // Build request body using custom mapper or default
    const requestBody = this.options.requestMapper
      ? this.options.requestMapper(parsed, input)
      : {
          model: this.options.model ?? "gpt-3.5-turbo",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.options.apiKey) {
      headers["Authorization"] = `Bearer ${this.options.apiKey}`;
    }

    const res = await fetch(this.options.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      throw new Error(`HTTP LLM error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as any;

    // Extract content using custom mapper or default
    const content = this.options.responseMapper
      ? this.options.responseMapper(data)
      : data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from HTTP LLM");
    }

    return parseLlmResponse(content);
  }
}
