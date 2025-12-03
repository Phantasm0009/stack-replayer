import OpenAI from "openai";
import type { LlmClient, BugReplayInput, BugReplayResult } from "../../types.js";
import type { ParsedErrorLog } from "../logParser.js";
import { SYSTEM_PROMPT, buildUserPrompt, parseLlmResponse } from "./LlmClient.js";

export interface OpenAiLlmClientOptions {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

/**
 * LLM client for OpenAI API
 */
export class OpenAiLlmClient implements LlmClient {
  private client: OpenAI;
  private model: string;

  constructor(opts: OpenAiLlmClientOptions) {
    this.client = new OpenAI({
      apiKey: opts.apiKey,
      baseURL: opts.baseURL,
    });
    this.model = opts.model ?? "gpt-4o-mini";
  }

  async generateReplay(
    parsed: ParsedErrorLog,
    input: BugReplayInput
  ): Promise<Omit<BugReplayResult, "sandboxResult">> {
    const userPrompt = buildUserPrompt(parsed, input);

    const completion = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return parseLlmResponse(content);
  }
}
