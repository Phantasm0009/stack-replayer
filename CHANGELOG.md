# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-02

### Added
- Initial release of stack-replayer
- Error log parsing with stack frame extraction
- Heuristic (no-AI) mode for basic bug analysis
- Sandboxed replay script execution
- OpenAI LLM client integration
- Ollama (local) LLM client integration
- Generic HTTP LLM client for custom providers
- Auto-detection of LLM from environment variables
- CLI with `--log`, `--root`, `--run`, `--json` flags
- TypeScript support with full type definitions
- Comprehensive test suite with Vitest
- GitHub Actions CI workflow
- Example files demonstrating usage
- Documentation (README, CONTRIBUTING, QUICKREF)

### Features
- Zero-config usage (works without AI)
- Progressive AI enhancement
- Privacy-first with local LLM support
- Type-safe API
- Extensible LLM interface
- Error-specific fix suggestions
- Generated replay scripts
- Reproduction step generation
- Patch and test suggestions (AI mode)

### Supported
- Node.js 18+
- TypeScript 5+
- ESM modules
- OpenAI API
- Ollama
- Custom HTTP endpoints
