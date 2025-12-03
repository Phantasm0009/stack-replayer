# stack-replayer - Project Overview

## 🎯 Project Status: ✅ Complete & Ready for Use

This is a production-ready npm package that turns cryptic error logs into reproducible bugs, replay scripts, and fix suggestions — with optional AI enhancement.

## 📁 Project Structure

```
stack-replayer/
├── src/
│   ├── core/
│   │   ├── llm/
│   │   │   ├── LlmClient.ts          # Base LLM interface & utilities
│   │   │   ├── OpenAiLlmClient.ts    # OpenAI integration
│   │   │   ├── OllamaLlmClient.ts    # Ollama (local) integration
│   │   │   └── HttpLlmClient.ts      # Generic HTTP client
│   │   ├── logParser.ts              # Error log parsing
│   │   ├── promptBuilder.ts          # Heuristic (no-AI) mode
│   │   └── sandboxRunner.ts          # Sandboxed script execution
│   ├── utils/
│   │   ├── fs.ts                     # File system utilities
│   │   └── childProcess.ts           # Process execution helpers
│   ├── types.ts                      # TypeScript type definitions
│   ├── config.ts                     # Auto-detection from env vars
│   ├── index.ts                      # Public API
│   └── cli.ts                        # CLI implementation
├── tests/
│   ├── logParser.test.ts             # Parser tests
│   ├── sandboxRunner.test.ts         # Sandbox tests
│   └── replayBug.test.ts             # Integration tests
├── examples/
│   ├── demo.mjs                      # Basic usage demo
│   ├── custom-client.mjs             # Custom LLM client example
│   ├── typescript-example.ts         # TypeScript usage
│   └── sample-error.log              # Sample error log for CLI
├── .github/workflows/
│   └── ci.yml                        # GitHub Actions CI
├── dist/                             # Build output (ESM)
├── package.json                      # Package configuration
├── tsconfig.json                     # TypeScript configuration
├── tsup.config.ts                    # Build configuration
├── vitest.config.ts                  # Test configuration
├── README.md                         # Main documentation
├── CONTRIBUTING.md                   # Contribution guidelines
├── LICENSE                           # MIT License
└── .gitignore                        # Git ignore rules
```

## ✨ Key Features

### Core Functionality
- ✅ Parse error logs and extract structured data
- ✅ Generate Node.js replay scripts
- ✅ Execute scripts in sandboxed environments
- ✅ Provide fix suggestions based on error types
- ✅ Works without any configuration (no-AI mode)

### Optional AI Enhancement
- ✅ OpenAI integration (GPT-4, GPT-3.5, etc.)
- ✅ Ollama integration (local, free)
- ✅ Generic HTTP client for custom providers
- ✅ Auto-detection from environment variables
- ✅ Pluggable LLM interface

### Developer Experience
- ✅ TypeScript with strict mode
- ✅ ESM modules
- ✅ CLI and library API
- ✅ Comprehensive tests (Vitest)
- ✅ Type definitions included
- ✅ GitHub Actions CI
- ✅ Example files

## 🚀 Quick Start

### Installation
```bash
npm install stack-replayer
```

### Basic Usage (No AI)
```typescript
import { replayBug } from "stack-replayer";

const result = await replayBug(errorLog);
console.log(result.explanation);
```

### Enable AI (OpenAI)
```bash
export AI_BUG_REPLAYER_PROVIDER=openai
export OPENAI_API_KEY=sk-...
```

### Enable AI (Ollama - Local)
```bash
export AI_BUG_REPLAYER_PROVIDER=ollama
```

### CLI Usage
```bash
# Install globally
npm install -g stack-replayer

# Use it
stack-replayer --log error.log
cat error.log | stack-replayer
stack-replayer --log error.log --run
```

## 🧪 Testing

```bash
# Run tests
npm test

# Type check
npm run typecheck

# Build
npm run build
```

**Test Results:** ✅ All 11 tests passing

## 📦 Build Output

The package builds to ESM format with:
- `dist/index.js` - Main library (15.28 KB)
- `dist/cli.js` - CLI entry point (17.15 KB)
- `dist/index.d.ts` - Type definitions
- Source maps included

## 🎯 Design Principles

1. **Zero Config** - Works immediately without setup
2. **Progressive Enhancement** - AI is optional, not required
3. **Privacy First** - Local AI option with Ollama
4. **Type Safe** - Full TypeScript support
5. **Extensible** - Easy to add new LLM providers
6. **Production Ready** - Tests, CI, proper error handling

## 🔌 API Surface

### Main Exports
- `replayBug()` - Convenience function
- `AiBugReplayer` - Main class
- `OpenAiLlmClient` - OpenAI integration
- `OllamaLlmClient` - Ollama integration
- `HttpLlmClient` - Generic HTTP client
- `parseErrorLog()` - Parse utility
- `autoDetectLlmClientFromEnv()` - Auto-detection

### Types
- `BugReplayInput`
- `BugReplayResult`
- `SandboxResult`
- `AiBugReplayerOptions`
- `LlmClient`
- `ParsedErrorLog`
- `StackFrame`

## 📊 Dependencies

### Runtime
- `commander` - CLI framework
- `openai` - OpenAI SDK

### Dev Dependencies
- `typescript` - Type checking
- `tsup` - Build tool
- `vitest` - Testing framework
- `@types/node` - Node.js types

## 🌟 What's Working

- ✅ Error log parsing (TypeScript, Node.js errors)
- ✅ Stack frame extraction
- ✅ Heuristic replay script generation
- ✅ Sandbox execution
- ✅ OpenAI integration
- ✅ Ollama integration
- ✅ Auto-detection from env vars
- ✅ CLI with pretty output
- ✅ JSON output mode
- ✅ TypeScript definitions
- ✅ All tests passing
- ✅ Build successful
- ✅ Examples working

## 🚧 Future Enhancements

- Browser error log support
- Python error log parsing
- More LLM providers (Anthropic, Gemini)
- Better heuristic mode
- Integration with error tracking services
- Automatic fix application

## 📝 License

MIT

## 👥 Contributing

See CONTRIBUTING.md for guidelines.

---

**Status**: Ready for npm publish! 🎉
