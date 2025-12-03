import { mkdir, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

/**
 * Create a temporary directory with a unique name
 */
export async function createTempDir(): Promise<string> {
  const uniqueId = randomBytes(8).toString("hex");
  const tempPath = join(tmpdir(), `ai-bug-replayer-${uniqueId}`);
  await mkdir(tempPath, { recursive: true });
  return tempPath;
}

/**
 * Write content to a file (creates directory if needed)
 */
export async function writeFileContent(
  filePath: string,
  content: string
): Promise<void> {
  await writeFile(filePath, content, "utf-8");
}

/**
 * Remove a directory recursively
 */
export async function removeDir(dirPath: string): Promise<void> {
  try {
    await rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    // Ignore errors during cleanup
  }
}
