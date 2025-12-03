/**
 * stack-replayer - Turn cryptic error logs into reproducible bugs
 */

// Export types
export type {
  BugReplayInput,
  BugReplayResult,
  SandboxResult,
  AiBugReplayerOptions,
  LlmClient,
  ParsedErrorLog,
  StackFrame,
} from "./types.js";

// Export LLM clients
export { OpenAiLlmClient } from "./core/llm/OpenAiLlmClient.js";
export type { OpenAiLlmClientOptions } from "./core/llm/OpenAiLlmClient.js";
export { OllamaLlmClient } from "./core/llm/OllamaLlmClient.js";
export type { OllamaLlmClientOptions } from "./core/llm/OllamaLlmClient.js";
export { HttpLlmClient } from "./core/llm/HttpLlmClient.js";
export type { HttpLlmClientOptions } from "./core/llm/HttpLlmClient.js";

// Export utilities
export { parseErrorLog, getTopUserFrame } from "./core/logParser.js";
export { autoDetectLlmClientFromEnv } from "./config.js";

import type {
  BugReplayInput,
  BugReplayResult,
  AiBugReplayerOptions,
} from "./types.js";
import { parseErrorLog } from "./core/logParser.js";
import { buildHeuristicReplay } from "./core/promptBuilder.js";
import { runInSandbox } from "./core/sandboxRunner.js";
import { autoDetectLlmClientFromEnv } from "./config.js";

/**
 * Main class for bug replay orchestration
 */
export class AiBugReplayer {
  private readonly llmClient;
  private readonly dryRun: boolean;

  constructor(options: AiBugReplayerOptions = {}) {
    this.llmClient = options.llmClient ?? autoDetectLlmClientFromEnv();
    this.dryRun = options.dryRun ?? false;
  }

  /**
   * Analyze and replay a bug from an error log
   */
  async replay(input: BugReplayInput): Promise<BugReplayResult> {
    const parsed = parseErrorLog(input.errorLog);

    let baseResult: Omit<BugReplayResult, "sandboxResult">;

    if (!this.llmClient) {
      // No-AI mode: use heuristic builder
      baseResult = buildHeuristicReplay(parsed, input);
    } else {
      // AI mode: use LLM to generate better results
      baseResult = await this.llmClient.generateReplay(parsed, input);
    }

    let sandboxResult: BugReplayResult["sandboxResult"] | undefined = undefined;

    if (!this.dryRun) {
      sandboxResult = await runInSandbox(
        baseResult.replayScript,
        input.projectRoot
      );
    }

    return { ...baseResult, sandboxResult };
  }
}

/**
 * Convenience function to replay a bug with minimal setup
 * 
 * @example
 * ```ts
 * import { replayBug } from "stack-replayer";
 * 
 * try {
 *   // some code that throws
 * } catch (err) {
 *   const result = await replayBug(err.stack ?? String(err));
 *   console.log(result.explanation);
 * }
 * ```
 */
export async function replayBug(
  errorLog: string,
  options?: Partial<AiBugReplayerOptions> & {
    projectRoot?: string;
    metadata?: BugReplayInput["metadata"];
  }
): Promise<BugReplayResult> {
  const replayer = new AiBugReplayer({
    llmClient: options?.llmClient,
    dryRun: options?.dryRun,
  });

  return replayer.replay({
    errorLog,
    projectRoot: options?.projectRoot,
    metadata: options?.metadata,
  });
}
