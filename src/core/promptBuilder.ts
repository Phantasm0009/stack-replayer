import type { BugReplayInput, BugReplayResult, ParsedErrorLog } from "../types.js";
import { getTopUserFrame } from "./logParser.js";

/**
 * Build a heuristic replay result without using AI.
 * This provides basic functionality when no LLM is configured.
 */
export function buildHeuristicReplay(
  parsed: ParsedErrorLog,
  input: BugReplayInput
): Omit<BugReplayResult, "sandboxResult"> {
  const topFrame = getTopUserFrame(parsed);

  // Build explanation
  const explanation = buildExplanation(parsed, topFrame);

  // Build reproduction steps
  const reproductionSteps = buildReproductionSteps(parsed, topFrame, input);

  // Build replay script
  const replayScript = buildReplayScript(parsed, topFrame, input);

  // Build suggested fix (basic)
  const suggestedFix = buildSuggestedFix(parsed, topFrame);

  return {
    explanation,
    reproductionSteps,
    replayScript,
    suggestedFix,
  };
}

function buildExplanation(
  parsed: ParsedErrorLog,
  topFrame: ReturnType<typeof getTopUserFrame>
): string {
  const errorName = parsed.errorName ?? "Error";
  const errorMessage = parsed.errorMessage ?? "Unknown error";
  const location = topFrame
    ? `${topFrame.filePath}:${topFrame.line ?? "?"}`
    : "unknown location";

  return `${errorName} occurred: "${errorMessage}"\n\nThis error was thrown at ${location}${
    topFrame?.functionName ? ` in function "${topFrame.functionName}"` : ""
  }.\n\nThe error likely indicates a runtime issue in your code. Review the stack trace and the code at the specified location for potential bugs.`;
}

function buildReproductionSteps(
  _parsed: ParsedErrorLog,
  topFrame: ReturnType<typeof getTopUserFrame>,
  input: BugReplayInput
): string[] {
  const steps: string[] = [];

  if (input.projectRoot) {
    steps.push(`Navigate to project directory: ${input.projectRoot}`);
  }

  if (input.metadata?.recentCommands && input.metadata.recentCommands.length > 0) {
    steps.push(
      `Run the command that triggered the error: ${input.metadata.recentCommands[0]}`
    );
  } else {
    steps.push("Run the application or script that triggered this error");
  }

  if (topFrame?.filePath) {
    steps.push(
      `Execute the code path that reaches ${topFrame.filePath}:${topFrame.line ?? "?"}`
    );
  }

  steps.push("Observe the error occurring with the same stack trace");

  return steps;
}

function buildReplayScript(
  parsed: ParsedErrorLog,
  topFrame: ReturnType<typeof getTopUserFrame>,
  _input: BugReplayInput
): string {
  const errorName = parsed.errorName ?? "Error";
  const errorMessage = parsed.errorMessage ?? "Unknown error";

  // Build a basic replay script
  const lines: string[] = [
    "#!/usr/bin/env node",
    "",
    "/**",
    " * Auto-generated replay script",
    " * This script attempts to reproduce the error heuristically.",
    " */",
    "",
  ];

  // If we have a top frame with a file path, try to import it
  if (topFrame?.filePath && !topFrame.filePath.startsWith("<")) {
    lines.push(`// Attempting to load the module where the error occurred`);
    lines.push(`try {`);
    lines.push(`  const module = await import('${topFrame.filePath}');`);
    
    if (topFrame.functionName && !topFrame.functionName.includes("<")) {
      lines.push(`  // Attempting to call the function where the error occurred`);
      lines.push(`  if (typeof module.${topFrame.functionName} === 'function') {`);
      lines.push(`    await module.${topFrame.functionName}();`);
      lines.push(`  }`);
    }
    
    lines.push(`} catch (err) {`);
    lines.push(`  console.error('Replay error:', err);`);
    lines.push(`  process.exit(1);`);
    lines.push(`}`);
  } else {
    // Fallback: just throw the same error
    lines.push(`// No specific file/function identified, throwing the same error type`);
    lines.push(`throw new ${errorName}('${errorMessage.replace(/'/g, "\\'")}');`);
  }

  return lines.join("\n");
}

function buildSuggestedFix(
  parsed: ParsedErrorLog,
  topFrame: ReturnType<typeof getTopUserFrame>
): string {
  const errorName = parsed.errorName ?? "Error";
  const suggestions: string[] = [];

  // Provide error-type specific suggestions
  if (errorName === "TypeError") {
    suggestions.push(
      "- Check for null/undefined values before accessing properties or calling methods",
      "- Verify that variables have the expected type",
      "- Add type guards or null checks"
    );
  } else if (errorName === "ReferenceError") {
    suggestions.push(
      "- Ensure the variable or function is defined before use",
      "- Check for typos in variable names",
      "- Verify imports are correct"
    );
  } else if (errorName === "SyntaxError") {
    suggestions.push(
      "- Review the syntax at the error location",
      "- Check for missing brackets, parentheses, or quotes",
      "- Ensure proper use of async/await or Promises"
    );
  } else {
    suggestions.push(
      "- Review the code at the error location",
      "- Add error handling (try/catch)",
      "- Check input validation"
    );
  }

  if (topFrame?.filePath) {
    suggestions.push(
      `- Examine ${topFrame.filePath}:${topFrame.line ?? "?"} for the root cause`
    );
  }

  return suggestions.join("\n");
}
