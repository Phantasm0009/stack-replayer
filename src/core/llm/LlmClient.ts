import type { BugReplayInput, BugReplayResult } from "../../types.js";
import type { ParsedErrorLog } from "../logParser.js";

/**
 * Export the LlmClient interface for external use
 */
export type { LlmClient } from "../../types.js";

/**
 * Base prompt system message for all LLM clients
 */
export const SYSTEM_PROMPT = `
You are an expert software debugger.
Given an error log and some context, you will:
1. Explain the likely root cause.
2. List concise steps to reproduce the bug.
3. Generate a Node.js replay script that attempts to reproduce the bug.
4. Suggest a human-readable fix and, if possible, a patch diff.
5. Provide a Jest/Vitest-style test file that would catch this bug.

Respond in strict JSON with keys:
- explanation: string
- reproductionSteps: string[]
- replayScript: string
- suggestedFix: string
- suggestedPatch: string (optional, unified diff format)
- suggestedTest: string (optional, test file content)
`.trim();

/**
 * Build the user prompt from parsed log and input
 */
export function buildUserPrompt(
  parsed: ParsedErrorLog,
  input: BugReplayInput
): string {
  return `
Error log:
\`\`\`
${parsed.raw}
\`\`\`

Parsed frames:
${JSON.stringify(parsed.frames, null, 2)}

Metadata:
${JSON.stringify(input.metadata ?? {}, null, 2)}

Project root: ${input.projectRoot ?? "Not specified"}
`.trim();
}

/**
 * Parse LLM JSON response and ensure it matches our result structure
 */
export function parseLlmResponse(
  content: string
): Omit<BugReplayResult, "sandboxResult"> {
  const parsed = JSON.parse(content);

  return {
    explanation: parsed.explanation ?? "No explanation provided",
    reproductionSteps: Array.isArray(parsed.reproductionSteps)
      ? parsed.reproductionSteps
      : [],
    replayScript: parsed.replayScript ?? "// No replay script generated",
    suggestedFix: parsed.suggestedFix,
    suggestedPatch: parsed.suggestedPatch,
    suggestedTest: parsed.suggestedTest,
  };
}
