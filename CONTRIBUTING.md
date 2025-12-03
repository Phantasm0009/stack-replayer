# Contributing to stack-replayer

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/stack-replayer.git
   cd stack-replayer
   ```
3. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

## Development Workflow

### Setup

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm typecheck
```

### Project Structure

```
stack-replayer/
├── src/
│   ├── core/           # Core functionality
│   │   ├── llm/        # LLM client implementations
│   │   ├── logParser.ts
│   │   ├── promptBuilder.ts
│   │   └── sandboxRunner.ts
│   ├── utils/          # Utility functions
│   ├── types.ts        # TypeScript type definitions
│   ├── config.ts       # Configuration and auto-detection
│   ├── index.ts        # Public API
│   └── cli.ts          # CLI implementation
├── tests/              # Test files
├── examples/           # Example usage
└── dist/               # Build output (generated)
```

## Making Changes

### Code Style

- Use **TypeScript** with strict mode
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small

### Commit Messages

Follow conventional commits:

```
feat: add support for Python error logs
fix: correct stack frame parsing for ESM modules
docs: update README with Anthropic example
test: add tests for OllamaLlmClient
chore: update dependencies
```

### Testing

All new features and bug fixes should include tests:

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage
```

Test files go in the `tests/` directory and use Vitest.

### Adding a New LLM Provider

1. Create a new file in `src/core/llm/`:
   ```typescript
   // src/core/llm/AnthropicLlmClient.ts
   import type { LlmClient } from "../../types.js";
   
   export class AnthropicLlmClient implements LlmClient {
     async generateReplay(parsed, input) {
       // Implementation
     }
   }
   ```

2. Export it from `src/index.ts`:
   ```typescript
   export { AnthropicLlmClient } from "./core/llm/AnthropicLlmClient.js";
   ```

3. Add auto-detection in `src/config.ts`:
   ```typescript
   if (provider === "anthropic") {
     return new AnthropicLlmClient({ ... });
   }
   ```

4. Add tests in `tests/`:
   ```typescript
   // tests/anthropicClient.test.ts
   ```

5. Update README with usage example

### Improving Error Parsing

To enhance error log parsing:

1. Add new patterns to `src/core/logParser.ts`
2. Add corresponding tests in `tests/logParser.test.ts`
3. Update type definitions if needed

### Improving Heuristic Mode

To improve no-AI mode analysis:

1. Edit `src/core/promptBuilder.ts`
2. Enhance `buildHeuristicReplay()` logic
3. Add tests to verify improvements

## Pull Request Process

1. **Create a branch**:
   ```bash
   git checkout -b feat/my-new-feature
   ```

2. **Make your changes**
3. **Test thoroughly**:
   ```bash
   pnpm typecheck
   pnpm test
   pnpm build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feat/my-new-feature
   ```

6. **Create a Pull Request** on GitHub

### PR Requirements

- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ New tests added for new features
- ✅ Documentation updated if needed
- ✅ Commit messages follow conventions
- ✅ Code is formatted consistently

## Areas for Contribution

### High Priority

- [ ] Support for more LLM providers (Anthropic, Google Gemini, etc.)
- [ ] Browser error log support
- [ ] Python error log parsing
- [ ] Better heuristic replay generation
- [ ] Improved stack frame parsing

### Medium Priority

- [ ] Integration with popular error tracking services
- [ ] Automatic fix application
- [ ] More sophisticated sandbox options
- [ ] Support for different test frameworks in generated tests

### Documentation

- [ ] More examples
- [ ] Video tutorials
- [ ] Blog posts
- [ ] Translation of README to other languages

## Questions?

Feel free to open an issue for:
- Questions about contributing
- Feature proposals
- Bug reports
- General discussion

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something useful together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
