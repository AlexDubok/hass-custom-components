# Home Assistant Custom Components

## Overview
This repository contains custom components for Home Assistant.

## Packages
- [Sprinkle](./packages/sprinkle/README.md): Custom Home Assistant card for smart irrigation control with Sonoff Zigbee valve

## Technology Stack
- **Frontend**: Built with the LitElement framework for modular and responsive web components.
- **Backend**: Home Assistant, managing device interactions, data retrieval, and automation.

## Development

### Prerequisites
- Node.js (v18 or later)
- Yarn (v4.9.1 or later)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

### Available Scripts
- `yarn test` - Run tests across all packages
- `yarn test:coverage` - Run tests with coverage reports
- `yarn build` - Build all packages
- `yarn type-check` - Run TypeScript type checking

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and delivery:

### Workflows

1. **CI** - Runs on every push to main and pull requests
   - Runs tests on multiple Node.js versions
   - Performs type checking
   - Generates test coverage reports

2. **Build** - Runs on every push to main and pull requests
   - Builds the project
   - Uploads build artifacts

3. **Release** - Runs when a tag is pushed
   - Creates a GitHub release
   - Builds and packages the project
   - Attaches the package to the release

4. **Cache** - Runs when dependency files change
   - Caches Yarn dependencies
   - Speeds up subsequent workflow runs

5. **Lint** - Runs on every push to main and pull requests
   - Placeholder for future linting setup
   - Ready to be configured with ESLint

