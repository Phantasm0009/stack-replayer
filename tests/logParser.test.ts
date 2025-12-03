import { describe, it, expect } from "vitest";
import { parseErrorLog, getTopUserFrame } from "../src/core/logParser";

describe("parseErrorLog", () => {
  it("should parse a basic error with stack trace", () => {
    const errorLog = `TypeError: Cannot read property 'foo' of undefined
    at myFunction (/home/user/project/src/app.js:10:5)
    at main (/home/user/project/src/index.js:3:2)
    at Object.<anonymous> (/home/user/project/src/index.js:20:1)`;

    const parsed = parseErrorLog(errorLog);

    expect(parsed.errorName).toBe("TypeError");
    expect(parsed.errorMessage).toBe("Cannot read property 'foo' of undefined");
    expect(parsed.frames).toHaveLength(3);
    expect(parsed.frames[0]?.functionName).toBe("myFunction");
    expect(parsed.frames[0]?.filePath).toBe("/home/user/project/src/app.js");
    expect(parsed.frames[0]?.line).toBe(10);
    expect(parsed.frames[0]?.column).toBe(5);
  });

  it("should parse stack frames without function names", () => {
    const errorLog = `Error: Something went wrong
    at /home/user/project/test.js:5:10`;

    const parsed = parseErrorLog(errorLog);

    expect(parsed.errorName).toBe("Error");
    expect(parsed.frames).toHaveLength(1);
    expect(parsed.frames[0]?.filePath).toBe("/home/user/project/test.js");
    expect(parsed.frames[0]?.line).toBe(5);
    expect(parsed.frames[0]?.functionName).toBeUndefined();
  });

  it("should handle node internal frames", () => {
    const errorLog = `ReferenceError: x is not defined
    at foo (/home/user/app.js:1:1)
    at Module._compile (node:internal/modules/cjs/loader:1376:14)`;

    const parsed = parseErrorLog(errorLog);

    expect(parsed.frames).toHaveLength(2);
    expect(parsed.frames[1]?.filePath).toBe("node:internal/modules/cjs/loader");
  });
});

describe("getTopUserFrame", () => {
  it("should return the first non-internal frame", () => {
    const parsed = parseErrorLog(`Error: test
    at Module._compile (node:internal/modules/cjs/loader:1376:14)
    at userFunc (/home/user/app.js:10:5)
    at require (internal/module.js:20:3)`);

    const topFrame = getTopUserFrame(parsed);

    expect(topFrame).toBeDefined();
    expect(topFrame?.functionName).toBe("userFunc");
    expect(topFrame?.filePath).toBe("/home/user/app.js");
  });

  it("should skip node_modules", () => {
    const parsed = parseErrorLog(`Error: test
    at something (/home/user/node_modules/lib/index.js:5:1)
    at userFunc (/home/user/src/app.js:10:5)`);

    const topFrame = getTopUserFrame(parsed);

    expect(topFrame).toBeDefined();
    expect(topFrame?.filePath).toBe("/home/user/src/app.js");
  });
});
