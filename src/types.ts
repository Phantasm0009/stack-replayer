/**
 * Input data for bug replay analysis
 */
export interface BugReplayInput {
  /** The raw error log or stack trace */
  errorLog: string;
  /** Optional project root directory for context */
  projectRoot?: string;
  /** Optional metadata about the environment */
  metadata?: {
    nodeVersion?: string;
    os?: string;
    recentCommands?: string[];
    commitHash?: string;
    [key: string]: unknown;
  };
}

/**
 * Result from bug replay analysis
 */
export interface BugReplayResult {
  /** Human-readable explanation of likely cause */
  explanation: string;
  /** Human-readable steps to reproduce */
  reproductionSteps: string[];
  /** Node.js script that attempts to reproduce the bug */
  replayScript: string;
  /** Explanation of a potential fix */
  suggestedFix?: string;
  /** Unified diff string for a patch */
  suggestedPatch?: string;
  /** Jest/Vitest-style test file */
  suggestedTest?: string;
  /** Result from sandbox execution (if not dry-run) */
  sandboxResult?: SandboxResult;
}

/**
 * Result from running the replay script in a sandbox
 */
export interface SandboxResult {
  /** Whether the sandbox execution completed without errors */
  success: boolean;
  /** Whether the bug was successfully reproduced */
  reproduced: boolean;
  /** Standard output from the replay script */
  stdout: string;
  /** Standard error from the replay script */
  stderr: string;
  /** Exit code from the replay script */
  exitCode: number | null;
}

/**
 * Configuration options for AiBugReplayer
 */
export interface AiBugReplayerOptions {
  /**
   * Optional LLM client.
   * If not provided, the library runs in "no-AI" mode:
   * - parses the log
   * - builds a simple replay script heuristically
   * - runs it (unless dryRun)
   */
  llmClient?: LlmClient;

  /**
   * If true, do NOT execute the generated replayScript.
   * Only return the script and explanation data.
   */
  dryRun?: boolean;
}

/**
 * Abstract interface for LLM providers
 */
export interface LlmClient {
  generateReplay(
    parsedLog: ParsedErrorLog,
    input: BugReplayInput
  ): Promise<Omit<BugReplayResult, "sandboxResult">>;
}

/**
 * Parsed error log structure
 */
export interface ParsedErrorLog {
  /** Original raw log */
  raw: string;
  /** Error name (e.g., "TypeError", "ReferenceError") */
  errorName?: string;
  /** Error message */
  errorMessage?: string;
  /** Parsed stack frames */
  frames: StackFrame[];
}

/**
 * Individual stack frame from an error
 */
export interface StackFrame {
  /** Function name if available */
  functionName?: string;
  /** File path */
  filePath?: string;
  /** Line number */
  line?: number;
  /** Column number */
  column?: number;
  /** Raw frame text */
  raw: string;
}
