# Claude AI Assistant Guide for snapshot-fs

This document provides comprehensive context about the **snapshot-fs** project to help AI assistants work effectively with this codebase.

## Repository Overview

**snapshot-fs** is a TypeScript CLI tool and library for creating filesystem snapshots compatible with [memfs](https://npm.im/memfs), an in-memory filesystem. The tool converts directory trees to various snapshot formats (CBOR, Compact JSON, DirectoryJSON) and can export snapshots back to the filesystem.

### Project Characteristics

- **Project Type**: Node.js TypeScript library with CLI
- **Size**: Small-medium (~6 source files)
- **Languages**: TypeScript, JavaScript
- **Target Runtime**: Node.js v22.13.0+ or v24.0.0+
- **Build System**: tshy (dual CommonJS/ESM builds)
- **Package Manager**: npm with package-lock.json

## Build and Development Workflow

### Essential Commands (Always Run In This Order)

#### 1. Install Dependencies

```bash
npm ci --foreground-scripts
```

**CRITICAL**: Always use `npm ci` instead of `npm install`

- This automatically triggers `npm run build` via postinstall hook
- Takes ~20-30 seconds
- Required to ensure dependencies and build are in sync

#### 2. Build

```bash
npm run build
```

- Uses tshy to create dual builds in `dist/commonjs/` and `dist/esm/`
- Required before testing CLI or running manually
- Takes ~5 seconds

#### 3. Lint

```bash
npm run lint
```

- Runs `eslint` for source code quality
- Runs `knip` for dependency analysis
- Always passes in clean state
- Takes ~10-15 seconds

### Critical Test Issue

⚠️ **IMPORTANT**: The npm test scripts have a glob pattern bug that prevents tests from running via npm scripts.

**Working Test Commands**:

```bash
# Run individual test files (this works)
node --import tsx --test test/cli.test.ts test/snapshot.test.ts test/read.test.ts

# DO NOT USE these npm scripts - they fail with "Could not find" error:
# npm run test
# npm run test:ci
```

**Expected Test Behavior**:

- Some tests may fail due to Node.js version incompatibility (requires v22.13.0+)
- Tests use snapshot assertions that may be environment-dependent
- Functional tests pass for core snapshot creation/export functionality

### CLI Testing

The CLI is the main product. Test it manually after building:

```bash
# Create a snapshot
./dist/esm/cli.js --source ./test/fixture/text /tmp/snapshot.cjson

# Export a snapshot
./dist/esm/cli.js export /tmp/snapshot.cjson /tmp/output

# Test different formats
./dist/esm/cli.js --format cbor --source ./src /tmp/snapshot.cbor
./dist/esm/cli.js --format json --source ./src /tmp/snapshot.json
```

## Project Layout and Architecture

### Source Structure (`src/`)

- `cli.ts` - Main CLI application entry point with yargs
- `index.ts` - Main library exports
- `snapshot.ts` - Core snapshot creation logic
- `read.ts` - Snapshot reading/loading functionality
- `export.ts` - Export snapshots to filesystem
- `tree.ts` - Directory tree utilities

### Configuration Files

- `package.json` - Main config, scripts, dependencies
- `tsconfig.json` - TypeScript compiler config
- `.tshy/` - tshy build configurations (commonjs.json, esm.json, build.json)
- `eslint.config.js` - ESLint configuration
- `.config/tsconfig.eslint.json` - TypeScript config for ESLint

### Build Output (`dist/`)

- `dist/commonjs/` - CommonJS build output
- `dist/esm/` - ES modules build output
- Binary entry point: `dist/esm/cli.js`

### Test Structure (`test/`)

- `test/*.test.ts` - Test files (cli.test.ts, snapshot.test.ts, read.test.ts)
- `test/fixture/` - Test fixtures for binary and text files
- `test/*.snapshot` - Snapshot test files

## GitHub Workflows and CI

### Pre-commit Hooks (via husky)

- **pre-commit**: `npm run lint-staged` (runs ESLint + Prettier on staged files)
- **commit-msg**: `npm run lint-commit` (validates conventional commit format)

### GitHub Actions (`.github/workflows/`)

- **nodejs.yml**: Runs on push/PR, tests Node.js v22.15.0 and v24.0.1
  - Steps: checkout → setup Node.js → `npm ci --foreground-scripts` → `npm run lint` → `npm run test:ci`
- **publish.yml**: Automated publishing
- **release.yml**: Release automation with release-please

### Replicating CI Locally

```bash
npm ci --foreground-scripts  # Install + build
npm run lint                 # Lint sources and deps
# Skip npm run test:ci due to glob pattern issue
```

## Key Dependencies and Tools

### Runtime Dependencies

- `@jsonjoy.com/json-pack` - CBOR and Compact JSON support
- `memfs` - In-memory filesystem library
- `yargs` - CLI argument parsing
- `json-stable-stringify` - Deterministic JSON serialization

### Development Tools

- `tshy` - TypeScript dual build system (CommonJS + ESM)
- `tsx` - TypeScript execution for tests
- `eslint` + `typescript-eslint` - Linting
- `knip` - Dependency analysis
- `husky` + `lint-staged` - Git hooks
- `prettier` - Code formatting
- `c8` - Code coverage

## Common Pitfalls and Solutions

1. **Node.js Version**: Requires v22.13.0+. Current development environment may be incompatible.

2. **Test Running**: Use direct node command instead of npm scripts due to glob issue.

3. **Build Dependencies**: Always run `npm ci --foreground-scripts` to ensure dependencies and build are in sync.

4. **TypeScript Modules**: Project uses ES modules with `.js` extensions in imports (TypeScript convention).

5. **File Paths**: All source imports use `.js` extensions even though files are `.ts` (Node.js ES module requirement).

## Typical Development Workflow

When working on this project, follow this sequence:

1. **Setup**: `npm ci --foreground-scripts`
2. **Make Changes**: Edit files in `src/`
3. **Build**: `npm run build`
4. **Test**: `node --import tsx --test test/*.test.ts`
5. **Lint**: `npm run lint`
6. **Manual Test**: Test CLI functionality with `./dist/esm/cli.js`
7. **Commit**: Pre-commit hooks will run linting and formatting

## When to Search for More Information

These instructions are comprehensive and tested. Only search for additional information if:

- The documented commands fail with unexpected errors
- You need to understand implementation details not covered here
- The build or test environment has changed significantly

The repository is well-structured and the documented workflows are reliable when followed correctly.

## Notes for AI Assistants

- Always respect the build order: install → build → test/lint
- Don't suggest `npm install` - use `npm ci --foreground-scripts` instead
- Don't suggest `npm test` - use the direct node command shown above
- When editing TypeScript files, remember that imports use `.js` extensions
- The CLI is the primary interface - prioritize testing CLI functionality manually
- This is a small, well-maintained codebase - trust the documented workflows
