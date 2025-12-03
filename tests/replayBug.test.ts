import { describe, it, expect } from "vitest";
import { replayBug } from "../src/index";

describe("replayBug (no-AI mode)", () => {
  it("should analyze a simple error without AI", async () => {
    const errorLog = `TypeError: Cannot read property 'name' of null
    at getUserName (/home/user/app.js:15:20)
    at main (/home/user/app.js:5:3)`;

    const result = await replayBug(errorLog, { dryRun: true });

    expect(result.explanation).toContain("TypeError");
    expect(result.explanation).toContain("Cannot read property 'name' of null");
    expect(result.reproductionSteps).toBeInstanceOf(Array);
    expect(result.reproductionSteps.length).toBeGreaterThan(0);
    expect(result.replayScript).toContain("#!/usr/bin/env node");
    expect(result.suggestedFix).toBeDefined();
    expect(result.sandboxResult).toBeUndefined(); // dry-run mode
  });

  it("should provide error-specific suggestions", async () => {
    const errorLog = `ReferenceError: foo is not defined
    at test (/app.js:1:1)`;

    const result = await replayBug(errorLog, { dryRun: true });

    expect(result.suggestedFix).toContain("variable");
  });

  it("should handle errors with metadata", async () => {
    const errorLog = `Error: File not found
    at readConfig (/app.js:10:5)`;

    const result = await replayBug(errorLog, {
      dryRun: true,
      projectRoot: "/home/user/project",
      metadata: {
        nodeVersion: "18.0.0",
        os: "linux",
      },
    });

    expect(result.explanation).toBeDefined();
    expect(result.replayScript).toBeDefined();
  });
});
