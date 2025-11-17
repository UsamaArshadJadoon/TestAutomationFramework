# Quick Start Guide

Get up and running with the test automation framework in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed

## Installation

```bash
# 1. Clone the repository
git clone [your-repo-url]
cd test-automation-foundation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install

# 4. Verify installation
npm test -- tests/api/posts.spec.js --grep "GET /posts - should retrieve all posts"
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
npm run test:posts      # Posts API tests
npm run test:users      # Users API tests  
npm run test:comments   # Comments API tests
npm run test:integration # Integration tests
```

### Interactive Mode
```bash
npm run test:ui  # Best for exploring and developing tests
```

### View Reports
```bash
npm run test:report  # Opens HTML report in browser
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Interactive test explorer |
| `npm run test:headed` | See tests run in browser |
| `npm run test:debug` | Debug mode |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix code issues |

## Project Structure

```
tests/
├── api/              # API endpoint tests
│   ├── posts.spec.js
│   ├── users.spec.js
│   └── comments.spec.js
├── integration/      # Cross-resource tests
│   └── workflows.spec.js
└── helpers/          # Reusable utilities
    └── testData.js
```

## Writing Your First Test

1. Create a new test file in `tests/api/`:
```bash
touch tests/api/albums.spec.js
```

2. Add a basic test:
```javascript
const { test, expect } = require('@playwright/test');

test('GET /albums - should retrieve all albums', async ({ request }) => {
  const response = await request.get('/albums');
  
  expect(response.status()).toBe(200);
  const albums = await response.json();
  expect(Array.isArray(albums)).toBeTruthy();
});
```

3. Run your test:
```bash
npx playwright test tests/api/albums.spec.js
```

## Next Steps

1. ✅ **Explore**: Run `npm run test:ui` to see all tests
2. 📚 **Learn**: Read `docs/ARCHITECTURE.md` for design patterns
3. 🎯 **Strategy**: Check `docs/TEST_STRATEGY.md` for approach
4. 🤝 **Contribute**: See `CONTRIBUTING.md` for guidelines

## Getting Help

- 📖 Full setup guide: [docs/SETUP.md](./docs/SETUP.md)
- 🏗️ Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- 📋 Test strategy: [docs/TEST_STRATEGY.md](./docs/TEST_STRATEGY.md)
- 🔧 Troubleshooting: See SETUP.md troubleshooting section

## Common Issues

**Tests failing?**
```bash
# Make sure you have the latest dependencies
npm install
npx playwright install
```

**Linting errors?**
```bash
# Auto-fix most issues
npm run lint:fix
```

**Need to debug?**
```bash
# Use debug mode
npm run test:debug
```

## Success!

If all tests pass, you're ready to go! 🎉

Try running the interactive UI mode to explore:
```bash
npm run test:ui
```
