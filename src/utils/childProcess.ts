import { spawn } from "child_process";

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

/**
 * Execute a command and capture output
 */
export async function execCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeout?: number;
  } = {}
): Promise<ExecResult> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd: options.cwd,
      shell: true,
      stdio: "pipe",
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    // Set timeout if provided
    let timeoutId: NodeJS.Timeout | undefined;
    if (options.timeout) {
      timeoutId = setTimeout(() => {
        proc.kill();
        resolve({
          stdout,
          stderr: stderr + "\n[Process killed due to timeout]",
          exitCode: null,
        });
      }, options.timeout);
    }

    proc.on("close", (code: number | null) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      resolve({
        stdout,
        stderr,
        exitCode: code,
      });
    });

    proc.on("error", (err: Error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      resolve({
        stdout,
        stderr: stderr + "\n" + err.message,
        exitCode: null,
      });
    });
  });
}
