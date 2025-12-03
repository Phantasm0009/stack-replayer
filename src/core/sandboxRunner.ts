import { join } from "path";
import type { SandboxResult } from "../types.js";
import { createTempDir, writeFileContent, removeDir } from "../utils/fs.js";
import { execCommand } from "../utils/childProcess.js";

/**
 * Run a replay script in a sandboxed environment
 */
export async function runInSandbox(
  replayScript: string,
  projectRoot?: string
): Promise<SandboxResult> {
  let tempDir: string | undefined;

  try {
    // Create temp directory
    tempDir = await createTempDir();

    // Write replay script
    const scriptPath = join(tempDir, "replay.mjs");
    await writeFileContent(scriptPath, replayScript);

    // Execute the script
    const result = await execCommand("node", [scriptPath], {
      cwd: projectRoot ?? tempDir,
      timeout: 30000, // 30 second timeout
    });

    // Determine if the bug was reproduced
    // If the script exits with non-zero code or has stderr, consider it reproduced
    const reproduced = result.exitCode !== 0 || result.stderr.length > 0;

    return {
      success: result.exitCode === 0,
      reproduced,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };
  } catch (err) {
    return {
      success: false,
      reproduced: false,
      stdout: "",
      stderr: err instanceof Error ? err.message : String(err),
      exitCode: null,
    };
  } finally {
    // Cleanup temp directory
    if (tempDir) {
      await removeDir(tempDir);
    }
  }
}
