/**
 * Example: Using stack-replayer programmatically with custom LLM client
 * 
 * Run with: node examples/custom-client.mjs
 */

import { AiBugReplayer } from "../dist/index.js";

// Example: Custom LLM client that uses mock analysis
class MockLlmClient {
  async generateReplay(parsed, input) {
    return {
      explanation: `🤖 Mock AI Analysis:\n\nDetected ${parsed.errorName || 'Error'}: ${parsed.errorMessage || 'Unknown'}\n\nThis is a mock AI response. In a real scenario, this would be enhanced analysis from an LLM.`,
      reproductionSteps: [
        "Mock step 1: Set up environment",
        "Mock step 2: Run the failing code",
        "Mock step 3: Observe the error"
      ],
      replayScript: `#!/usr/bin/env node\n\n// Mock AI-generated replay script\nconsole.log("This would attempt to reproduce: ${parsed.errorMessage}");`,
      suggestedFix: "Mock AI suggests: Add proper null checks and error handling.",
      suggestedPatch: `--- a/file.js\n+++ b/file.js\n@@ -1,1 +1,3 @@\n-const value = obj.prop;\n+if (obj && obj.prop) {\n+  const value = obj.prop;\n+}`,
      suggestedTest: `test('should handle null safely', () => {\n  expect(() => safeAccess(null)).not.toThrow();\n});`
    };
  }
}

async function main() {
  console.log("🔧 Custom LLM Client Example\n");
  console.log("=".repeat(60));
  
  // Create replayer with custom client
  const replayer = new AiBugReplayer({
    llmClient: new MockLlmClient(),
    dryRun: true
  });
  
  // Sample error log
  const errorLog = `TypeError: Cannot read property 'value' of undefined
    at processData (/app/processor.js:42:18)
    at main (/app/index.js:10:5)`;
  
  console.log("\n📝 Error Log:");
  console.log(errorLog);
  console.log("\n" + "=".repeat(60));
  
  // Analyze
  const result = await replayer.replay({
    errorLog,
    metadata: {
      nodeVersion: "20.0.0",
      os: "linux"
    }
  });
  
  console.log("\n" + result.explanation);
  console.log("\n🔄 Reproduction Steps:");
  result.reproductionSteps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });
  
  if (result.suggestedFix) {
    console.log("\n💡 Suggested Fix:");
    console.log(result.suggestedFix);
  }
  
  if (result.suggestedPatch) {
    console.log("\n📝 Suggested Patch:");
    console.log(result.suggestedPatch);
  }
  
  if (result.suggestedTest) {
    console.log("\n🧪 Suggested Test:");
    console.log(result.suggestedTest);
  }
  
  console.log("\n✅ Analysis complete!");
}

main().catch(console.error);
