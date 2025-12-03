import type { ParsedErrorLog, StackFrame } from "../types.js";

export type { ParsedErrorLog } from "../types.js";

/**
 * Parse an error log/stack trace into structured data
 */
export function parseErrorLog(errorLog: string): ParsedErrorLog {
  const lines = errorLog.split("\n");
  const frames: StackFrame[] = [];
  let errorName: string | undefined;
  let errorMessage: string | undefined;

  // Try to extract error name and message from first line
  // Common formats:
  // - "Error: message"
  // - "TypeError: message"
  // - "ReferenceError: message"
  const firstLine = lines[0]?.trim();
  if (firstLine) {
    const errorMatch = firstLine.match(/^(\w*Error):\s*(.+)$/);
    if (errorMatch) {
      errorName = errorMatch[1];
      errorMessage = errorMatch[2];
    } else {
      // Might just be a message
      errorMessage = firstLine;
    }
  }

  // Parse stack frames
  // Common formats:
  // - "    at functionName (file.js:10:5)"
  // - "    at file.js:10:5"
  // - "    at Object.<anonymous> (file.js:10:5)"
  // - "    at Module._compile (node:internal/modules/cjs/loader:1376:14)"
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and the error message line
    if (!trimmed || trimmed === firstLine) {
      continue;
    }

    // Try to match stack frame patterns
    const frame = parseStackFrame(trimmed);
    if (frame) {
      frames.push(frame);
    }
  }

  return {
    raw: errorLog,
    errorName,
    errorMessage,
    frames,
  };
}

/**
 * Parse a single stack frame line
 */
function parseStackFrame(line: string): StackFrame | null {
  // Pattern 1: "at functionName (file.js:10:5)"
  const pattern1 = /^at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/;
  const match1 = line.match(pattern1);
  if (match1) {
    return {
      functionName: match1[1]?.trim(),
      filePath: match1[2]?.trim(),
      line: parseInt(match1[3] ?? "0", 10),
      column: parseInt(match1[4] ?? "0", 10),
      raw: line,
    };
  }

  // Pattern 2: "at file.js:10:5"
  const pattern2 = /^at\s+(.+?):(\d+):(\d+)$/;
  const match2 = line.match(pattern2);
  if (match2) {
    return {
      filePath: match2[1]?.trim(),
      line: parseInt(match2[2] ?? "0", 10),
      column: parseInt(match2[3] ?? "0", 10),
      raw: line,
    };
  }

  // Pattern 3: "at functionName (file.js)"
  const pattern3 = /^at\s+(.+?)\s+\((.+?)\)$/;
  const match3 = line.match(pattern3);
  if (match3) {
    return {
      functionName: match3[1]?.trim(),
      filePath: match3[2]?.trim(),
      raw: line,
    };
  }

  // Pattern 4: Just "at something" - keep as raw
  if (line.startsWith("at ")) {
    return {
      raw: line,
    };
  }

  // Not a recognized stack frame
  return null;
}

/**
 * Get the top-most user stack frame (skip node internals)
 */
export function getTopUserFrame(parsed: ParsedErrorLog): StackFrame | undefined {
  return parsed.frames.find((frame) => {
    const filePath = frame.filePath ?? "";
    // Skip node internal modules
    return (
      !filePath.startsWith("node:") &&
      !filePath.startsWith("internal/") &&
      !filePath.includes("node_modules")
    );
  });
}
