/**
 * Example demonstrating stack-replayer usage
 * 
 * Run with: node examples/demo.mjs
 */

import { replayBug } from "../dist/index.js";

// Simulate an error
const simulateError = () => {
  try {
    const user = null;
    // This will throw a TypeError
    console.log(user.name);
  } catch (err) {
    return err;
  }
};

// Main demo
async function main() {
  console.log("🐛 AI Bug Replayer Demo\n");
  console.log("=".repeat(60));
  
  // Capture the error
  const error = simulateError();
  
  console.log("\n📝 Original Error:");
  console.log(error.stack);
  console.log("\n" + "=".repeat(60));
  
  // Analyze with stack-replayer (no-AI mode)
  console.log("\n🔍 Analyzing with stack-replayer (no-AI mode)...\n");
  
  const result = await replayBug(error.stack, {
    dryRun: true, // Don't execute the replay script
    projectRoot: process.cwd(),
    metadata: {
      nodeVersion: process.version,
      os: process.platform,
    }
  });
  
  // Display results
  console.log("📋 Explanation:");
  console.log(result.explanation);
  console.log("\n🔄 Reproduction Steps:");
  result.reproductionSteps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });
  
  console.log("\n💡 Suggested Fix:");
  console.log(result.suggestedFix);
  
  console.log("\n📜 Generated Replay Script:");
  console.log("-".repeat(60));
  console.log(result.replayScript);
  console.log("-".repeat(60));
  
  console.log("\n✅ Demo complete!");
  console.log("\nTo enable AI analysis, set environment variables:");
  console.log("  export AI_BUG_REPLAYER_PROVIDER=openai");
  console.log("  export OPENAI_API_KEY=sk-...");
  console.log("\nOr for local AI with Ollama:");
  console.log("  export AI_BUG_REPLAYER_PROVIDER=ollama");
}

main().catch(console.error);
