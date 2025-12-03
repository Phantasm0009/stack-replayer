import type { LlmClient, BugReplayInput, BugReplayResult } from "../../types.js";
import type { ParsedErrorLog } from "../logParser.js";
import { SYSTEM_PROMPT, buildUserPrompt, parseLlmResponse } from "./LlmClient.js";

export interface OllamaLlmClientOptions {
  baseUrl?: string;
  model?: string;
}

/**
 * LLM client for Ollama (local LLM server)
 */
export class OllamaLlmClient implements LlmClient {
  private baseUrl: string;
  private model: string;

  constructor(opts: OllamaLlmClientOptions = {}) {
    this.baseUrl = opts.baseUrl ?? "http://localhost:11434";
    this.model = opts.model ?? "llama3";
  }

  async generateReplay(
    parsed: ParsedErrorLog,
    input: BugReplayInput
  ): Promise<Omit<BugReplayResult, "sandboxResult">> {
    const userPrompt = buildUserPrompt(parsed, input);

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        format: "json",
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const content =
      data?.message?.content ?? data?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from Ollama");
    }

    return parseLlmResponse(content);
  }
}
