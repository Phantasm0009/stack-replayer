# Quick Reference - stack-replayer

## Installation

```bash
npm install stack-replayer
```

## Basic Usage

```javascript
import { replayBug } from "stack-replayer";

const result = await replayBug(errorStack);
```

## Environment Variables

```bash
# OpenAI
export AI_BUG_REPLAYER_PROVIDER=openai
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini  # optional

# Ollama (local)
export AI_BUG_REPLAYER_PROVIDER=ollama
export OLLAMA_MODEL=llama3  # optional
export OLLAMA_BASE_URL=http://localhost:11434  # optional
```

## CLI Commands

```bash
# From file
stack-replayer --log error.log

# From stdin
cat error.log | stack-replayer

# Execute replay script
stack-replayer --log error.log --run

# JSON output
stack-replayer --log error.log --json

# With project root
stack-replayer --log error.log --root /path/to/project
```

## API Examples

### Simple
```javascript
import { replayBug } from "stack-replayer";

try {
  // code that throws
} catch (err) {
  const result = await replayBug(err.stack);
  console.log(result.explanation);
}
```

### With Options
```javascript
const result = await replayBug(errorLog, {
  dryRun: true,
  projectRoot: process.cwd(),
  metadata: {
    nodeVersion: process.version,
    os: process.platform
  }
});
```

### Custom LLM Client
```javascript
import { AiBugReplayer, OpenAiLlmClient } from "stack-replayer";

const replayer = new AiBugReplayer({
  llmClient: new OpenAiLlmClient({
    apiKey: "sk-...",
    model: "gpt-4o-mini"
  })
});

const result = await replayer.replay({ errorLog });
```

## Result Structure

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

## Development

```bash
# Install
npm install

# Build
npm run build

# Test
npm test

# Type check
npm run typecheck

# Watch mode
npm run dev
```
