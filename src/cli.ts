#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "fs/promises";
import { replayBug } from "./index.js";

const program = new Command();

program
  .name("stack-replayer")
  .description("Turn cryptic error logs into reproducible bugs and fix suggestions")
  .version("1.0.0")
  .option("--log <path>", "Path to error log file (reads from stdin if omitted)")
  .option("--root <path>", "Project root directory")
  .option("--run", "Execute the replay script in sandbox (default: dry-run)")
  .option("--json", "Output JSON only (no pretty formatting)")
  .parse(process.argv);

const options = program.opts<{
  log?: string;
  root?: string;
  run?: boolean;
  json?: boolean;
}>();

async function main() {
  try {
    // Read error log from file or stdin
    let errorLog: string;

    if (options.log) {
      errorLog = await readFile(options.log, "utf-8");
    } else {
      // Read from stdin
      errorLog = await readStdin();
    }

    if (!errorLog.trim()) {
      console.error("Error: No error log provided");
      process.exit(1);
    }

    // Run the replay
    const result = await replayBug(errorLog, {
      projectRoot: options.root,
      dryRun: !options.run,
    });

    // Output results
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printPrettyOutput(result);
    }

    // Exit with non-zero if bug was not reproduced
    if (options.run && result.sandboxResult && !result.sandboxResult.reproduced) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    process.stdin.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    process.stdin.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });

    process.stdin.on("error", (err) => {
      reject(err);
    });

    // Resume stdin if paused
    process.stdin.resume();
  });
}

function printPrettyOutput(result: Awaited<ReturnType<typeof replayBug>>) {
  console.log("\n" + "=".repeat(80));
  console.log("STACK REPLAYER - Analysis Results");
  console.log("=".repeat(80) + "\n");

  console.log("📋 EXPLANATION:");
  console.log(result.explanation);
  console.log();

  if (result.reproductionSteps.length > 0) {
    console.log("🔄 REPRODUCTION STEPS:");
    result.reproductionSteps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step}`);
    });
    console.log();
  }

  if (result.suggestedFix) {
    console.log("💡 SUGGESTED FIX:");
    console.log(result.suggestedFix);
    console.log();
  }

  if (result.sandboxResult) {
    console.log("🔬 SANDBOX EXECUTION:");
    console.log(`  Success: ${result.sandboxResult.success}`);
    console.log(`  Reproduced: ${result.sandboxResult.reproduced}`);
    console.log(`  Exit Code: ${result.sandboxResult.exitCode}`);
    
    if (result.sandboxResult.stdout) {
      console.log("\n  STDOUT:");
      console.log("  " + result.sandboxResult.stdout.split("\n").join("\n  "));
    }
    
    if (result.sandboxResult.stderr) {
      console.log("\n  STDERR:");
      console.log("  " + result.sandboxResult.stderr.split("\n").join("\n  "));
    }
    console.log();
  }

  if (result.suggestedPatch) {
    console.log("📝 SUGGESTED PATCH:");
    console.log(result.suggestedPatch);
    console.log();
  }

  if (result.suggestedTest) {
    console.log("🧪 SUGGESTED TEST:");
    console.log(result.suggestedTest);
    console.log();
  }

  console.log("=".repeat(80));
}

main();
