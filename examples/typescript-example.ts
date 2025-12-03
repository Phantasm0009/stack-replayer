/**
 * TypeScript Example: Using stack-replayer with proper types
 * 
 * Compile with: tsc examples/typescript-example.ts
 * Run with: node examples/typescript-example.js
 */

import { replayBug, type BugReplayResult } from "stack-replayer";

async function analyzeError(errorStack: string): Promise<void> {
  const result: BugReplayResult = await replayBug(errorStack, {
    dryRun: true,
    projectRoot: process.cwd(),
    metadata: {
      nodeVersion: process.version,
      os: process.platform,
    },
  });

  console.log("Explanation:", result.explanation);
  console.log("Steps:", result.reproductionSteps);
  
  if (result.suggestedFix) {
    console.log("Fix:", result.suggestedFix);
  }
}

// Example usage
const sampleError = `ReferenceError: foo is not defined
    at myFunction (/app/src/index.ts:10:5)
    at main (/app/src/index.ts:20:3)`;

analyzeError(sampleError).catch(console.error);
