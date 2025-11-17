# Setup & Installation Guide

This guide will help you set up the test automation framework on your local machine and in CI/CD environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Running Tests](#running-tests)
4. [CI/CD Setup](#cicd-setup)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or higher
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`

- **npm**: Version 9.x or higher (comes with Node.js)
  - Verify installation: `npm --version`

- **Git**: Latest version
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

### System Requirements

- **OS**: macOS, Linux, or Windows 10+
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: ~500MB for dependencies and test artifacts

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/test-automation-foundation.git
cd test-automation-foundation
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# Install Playwright browsers
npx playwright install
```

This will install:
- Playwright test framework
- Chromium, Firefox, and WebKit browsers
- ESLint and code quality tools

### 3. Verify Installation

```bash
# Run a quick test to verify setup
npm test -- tests/api/posts.spec.js --grep "GET /posts - should retrieve all posts"
```

If successful, you should see test output with passing tests.

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific test file
npm run test:posts
npm run test:users
npm run test:comments

# Run integration tests
npm run test:integration

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug
```

### Advanced Test Execution

```bash
# Run tests with specific tag
npx playwright test --grep "@critical"

# Run tests in parallel with 4 workers
npx playwright test --workers=4

# Run tests with specific timeout
npx playwright test --timeout=60000

# Run failed tests only
npx playwright test --last-failed

# Update snapshots (if using visual testing)
npx playwright test --update-snapshots
```

### Viewing Reports

```bash
# Generate and open HTML report
npm run test:report

# Or manually
npx playwright show-report
```

The HTML report includes:
- Test execution timeline
- Failed test details with screenshots
- Performance metrics
- Trace viewer for debugging

## CI/CD Setup

### GitHub Actions (Included)

The repository includes a `.github/workflows/ci.yml` file that runs automatically on:
- Push to `main` or `develop` branches
- Pull requests
- Scheduled daily runs (3 AM UTC)
- Manual workflow dispatch

### Setting Up in Other CI/CD Systems

#### Jenkins

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Report') {
            steps {
                publishHTML([
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Test Report'
                ])
            }
        }
    }
}
```

#### GitLab CI

```yaml
test:
  image: mcr.microsoft.com/playwright:latest
  script:
    - npm ci
    - npx playwright install
    - npm test
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 30 days
```

#### CircleCI

```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: mcr.microsoft.com/playwright:latest
    steps:
      - checkout
      - run: npm ci
      - run: npx playwright install
      - run: npm test
      - store_artifacts:
          path: playwright-report
      - store_test_results:
          path: test-results
```

## Environment Configuration

### Environment Variables

Create a `.env` file for local configuration (optional):

```bash
# API Configuration
BASE_URL=https://jsonplaceholder.typicode.com
API_TIMEOUT=30000

# Test Configuration
HEADLESS=true
WORKERS=4

# CI Configuration
CI=false
```

### Playwright Configuration

The `playwright.config.js` file controls test behavior:

```javascript
// Key configurations
timeout: 30000,              // Test timeout
retries: process.env.CI ? 2 : 0,  // Retry failed tests in CI
workers: process.env.CI ? 2 : undefined,  // Parallel workers
```

Modify these values based on your needs.

## Development Workflow

### 1. Before Making Changes

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Run tests to ensure everything works
npm test
```

### 2. While Developing Tests

```bash
# Use UI mode for interactive development
npm run test:ui

# Run specific test file you're working on
npx playwright test tests/api/your-test.spec.js --headed

# Use debug mode to step through tests
npm run test:debug
```

### 3. Before Committing

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run all tests
npm test

# Verify CI configuration
# (push to a feature branch first to test CI)
```

## Troubleshooting

### Common Issues

#### 1. Playwright browsers not installed

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**:
```bash
npx playwright install
```

#### 2. Port already in use

**Error**: Test server fails to start

**Solution**:
```bash
# Find and kill process using the port
lsof -ti:3000 | xargs kill -9
```

#### 3. Tests timing out

**Error**: `Test timeout of 30000ms exceeded`

**Solution**:
- Increase timeout in `playwright.config.js`
- Check network connectivity
- Verify API endpoint is responsive

#### 4. Permission errors on Linux/macOS

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $USER ~/.npm
sudo chown -R $USER /usr/local/lib/node_modules
```

#### 5. SSL/Certificate errors

**Error**: `certificate has expired`

**Solution**:
```javascript
// In playwright.config.js
use: {
  ignoreHTTPSErrors: true
}
```

### Getting Help

If you encounter issues:

1. Check the [Playwright Documentation](https://playwright.dev/)
2. Review existing issues in the repository
3. Run tests with `DEBUG=pw:api` for verbose logging
4. Contact the QA team or create an issue

## Next Steps

After setup:

1. Read the [Architecture Documentation](./ARCHITECTURE.md)
2. Review the [Test Strategy](./TEST_STRATEGY.md)
3. Explore tests in UI mode: `npm run test:ui`
4. Try modifying a test and running it

## Maintenance

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update Playwright
npm install -D @playwright/test@latest
npx playwright install
```

### Cleaning Up

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Playwright cache
npx playwright install --force

# Remove test artifacts
rm -rf test-results/ playwright-report/
```
