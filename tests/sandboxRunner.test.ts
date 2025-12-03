import { describe, it, expect } from "vitest";
import { runInSandbox } from "../src/core/sandboxRunner";

describe("sandboxRunner", () => {
  it("should execute a successful script", async () => {
    const script = `
console.log("Hello from sandbox");
process.exit(0);
    `.trim();

    const result = await runInSandbox(script);

    expect(result.exitCode).toBe(0);
    expect(result.success).toBe(true);
    expect(result.stdout).toContain("Hello from sandbox");
  });

  it("should capture script errors", async () => {
    const script = `
throw new Error("Test error");
    `.trim();

    const result = await runInSandbox(script);

    expect(result.exitCode).not.toBe(0);
    expect(result.success).toBe(false);
    expect(result.reproduced).toBe(true);
    expect(result.stderr).toContain("Test error");
  });

  it("should handle syntax errors", async () => {
    const script = `
this is not valid javascript!!!
    `.trim();

    const result = await runInSandbox(script);

    expect(result.success).toBe(false);
    expect(result.stderr.length).toBeGreaterThan(0);
  });
});
