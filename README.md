# stack-replayer

> Turn cryptic error logs into reproducible bugs, replay scripts, and fix suggestions — with optional AI.

![NPM Version](https://img.shields.io/npm/v/stack-replayer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔍 **Parse error logs** - Extract structured data from stack traces
- 🎯 **Generate replay scripts** - Create Node.js scripts that attempt to reproduce bugs
- 🤖 **Optional AI enhancement** - Use OpenAI, Ollama, or any LLM for smarter analysis
- 🔬 **Sandboxed execution** - Safely run replay scripts in isolated environments
- 💡 **Fix suggestions** - Get actionable recommendations to resolve issues
- 📝 **Patch generation** - AI can suggest code patches and tests (when enabled)
- 🚀 **Zero config** - Works immediately without any setup or API keys
- 📦 **CLI & Library** - Use as a command-line tool or import into your code

## Installation

```bash
npm install stack-replayer
# or
pnpm add stack-replayer
# or
yarn add stack-replayer
```

## Quick Start

### 1. Basic Usage (No AI, Zero Config)

The library works immediately without any configuration or API keys:

```typescript
import { replayBug } from "stack-replayer";

try {
  // Your code that might throw
  const user = null;
  console.log(user.name); // TypeError!
} catch (err) {
  const errorLog = err instanceof Error ? err.stack ?? String(err) : String(err);
  
  const result = await replayBug(errorLog);
  
  console.log(result.explanation);
  console.log(result.reproductionSteps);
  console.log(result.suggestedFix);
}
```

**Output:**
```
TypeError occurred: "Cannot read properties of null (reading 'name')"

This error was thrown at /home/user/app.js:5 in function "<anonymous>".

The error likely indicates a runtime issue in your code. Review the stack trace and the code at the specified location for potential bugs.
```

### 2. Enable AI with OpenAI (2 env vars, no code changes)

Set two environment variables and your analysis gets dramatically smarter:

```bash
export AI_BUG_REPLAYER_PROVIDER=openai
export OPENAI_API_KEY=sk-...
```

Then run the **same code** as above. The library automatically detects and uses OpenAI for enhanced analysis including:
- Root cause explanation
- Detailed reproduction steps  
- Better replay scripts
- Suggested fixes and patches
- Generated test cases

### 3. Enable AI with Ollama (Local, Free)

Run a local LLM with Ollama (completely free, no API keys):

```bash
# Install and start Ollama
ollama pull llama3
ollama serve &

# Configure environment
export AI_BUG_REPLAYER_PROVIDER=ollama
# Optional: export OLLAMA_MODEL=llama3
# Optional: export OLLAMA_BASE_URL=http://localhost:11434
```

Now your **same code** uses local AI with no external API calls or costs.

## CLI Usage

### Install globally:

```bash
npm install -g stack-replayer
```

### Read from a file:

```bash
stack-replayer --log error.log
```

### Read from stdin:

```bash
cat error.log | stack-replayer
```

### Execute the replay script:

```bash
stack-replayer --log error.log --run
```

### Specify project root:

```bash
stack-replayer --log error.log --root /path/to/project
```

### JSON output:

```bash
stack-replayer --log error.log --json > result.json
```

## API Reference

### `replayBug(errorLog, options?)`

Convenience function for one-line bug replay.

**Parameters:**
- `errorLog: string` - The error log or stack trace
- `options?: object`
  - `llmClient?: LlmClient` - Custom LLM client (overrides auto-detection)
  - `dryRun?: boolean` - If true, don't execute replay script (default: false)
  - `projectRoot?: string` - Project root directory
  - `metadata?: object` - Additional context (nodeVersion, os, etc.)

**Returns:** `Promise<BugReplayResult>`

```typescript
interface BugReplayResult {
  explanation: string;
  reproductionSteps: string[];
  replayScript: string;
  suggestedFix?: string;
  suggestedPatch?: string;
  suggestedTest?: string;
  sandboxResult?: {
    success: boolean;
    reproduced: boolean;
    stdout: string;
    stderr: string;
    exitCode: number | null;
  };
}
```

### `AiBugReplayer` Class

For more control, use the class directly:

```typescript
import { AiBugReplayer, OpenAiLlmClient } from "stack-replayer";

const replayer = new AiBugReplayer({
  llmClient: new OpenAiLlmClient({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini"
  }),
  dryRun: false
});

const result = await replayer.replay({
  errorLog: errorStack,
  projectRoot: "/path/to/project",
  metadata: {
    nodeVersion: process.version,
    os: process.platform
  }
});
```

## LLM Providers

### Built-in Providers

#### OpenAI

```typescript
import { OpenAiLlmClient } from "stack-replayer";

const client = new OpenAiLlmClient({
  apiKey: "sk-...",
  model: "gpt-4o-mini", // optional
  baseURL: "https://api.openai.com/v1" // optional
});
```

#### Ollama (Local)

```typescript
import { OllamaLlmClient } from "stack-replayer";

const client = new OllamaLlmClient({
  baseUrl: "http://localhost:11434",
  model: "llama3"
});
```

#### Generic HTTP (OpenAI-compatible)

```typescript
import { HttpLlmClient } from "stack-replayer";

const client = new HttpLlmClient({
  baseUrl: "https://your-api.com/v1/chat/completions",
  apiKey: "your-key",
  model: "your-model"
});
```

### Custom LLM Client

Implement the `LlmClient` interface:

```typescript
import { LlmClient, ParsedErrorLog, BugReplayInput } from "stack-replayer";

class MyCustomLlmClient implements LlmClient {
  async generateReplay(parsed: ParsedErrorLog, input: BugReplayInput) {
    // Your custom logic here
    return {
      explanation: "...",
      reproductionSteps: ["..."],
      replayScript: "...",
      suggestedFix: "..."
    };
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_BUG_REPLAYER_PROVIDER` | LLM provider: `openai` or `ollama` | None (no-AI mode) |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o-mini` |
| `OPENAI_BASE_URL` | Custom OpenAI endpoint | `https://api.openai.com/v1` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model to use | `llama3` |

## Examples

### Catch and analyze in production

```typescript
import { replayBug } from "stack-replayer";

process.on('uncaughtException', async (err) => {
  console.error('Uncaught exception:', err);
  
  const analysis = await replayBug(err.stack ?? String(err), {
    projectRoot: process.cwd(),
    metadata: {
      nodeVersion: process.version,
      os: process.platform,
      timestamp: new Date().toISOString()
    }
  });
  
  // Send to your logging service
  await sendToLoggingService({
    error: err,
    analysis: analysis.explanation,
    suggestedFix: analysis.suggestedFix
  });
});
```

### Analyze test failures

```typescript
import { replayBug } from "stack-replayer";

afterEach(async function() {
  if (this.currentTest?.state === 'failed') {
    const err = this.currentTest.err;
    if (err?.stack) {
      const analysis = await replayBug(err.stack);
      console.log('\n🔍 AI Analysis:');
      console.log(analysis.explanation);
      console.log('\n💡 Suggested Fix:');
      console.log(analysis.suggestedFix);
    }
  }
});
```

### Dry run (skip sandbox execution)

```typescript
const result = await replayBug(errorLog, { dryRun: true });
// Only get analysis and script, don't execute
console.log(result.replayScript);
```

## How It Works

### No-AI Mode (Default)

1. **Parse** the error log using regex patterns
2. **Extract** error type, message, and stack frames
3. **Identify** user code vs. node internals
4. **Generate** a basic replay script heuristically
5. **Execute** in sandbox (unless dry-run)
6. **Provide** generic fix suggestions based on error type

### AI Mode (Optional)

1. **Parse** the error log (same as above)
2. **Send** to LLM with structured prompt
3. **Receive** enhanced analysis:
   - Root cause explanation
   - Step-by-step reproduction
   - Smart replay script
   - Code patches
   - Test cases
4. **Execute** in sandbox (unless dry-run)

## Why stack-replayer?

- ✅ **Works immediately** - No setup, no config, no API keys required
- ✅ **Progressive enhancement** - Add AI when you want better results
- ✅ **Privacy-friendly** - Use Ollama for completely local processing
- ✅ **Framework agnostic** - Works with any Node.js code
- ✅ **Production ready** - TypeScript, tests, proper error handling
- ✅ **Extensible** - Bring your own LLM provider

## Requirements

- Node.js 18+
- TypeScript 5+ (for development)

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines and submit PRs.

## Roadmap

- [ ] Support for browser error logs
- [ ] Python error log parsing
- [ ] More LLM providers (Anthropic, Gemini, etc.)
- [ ] Better heuristic replay generation
- [ ] Automatic fix application
- [ ] Integration with issue trackers

## Credits

Built with ❤️ by the open source community.
