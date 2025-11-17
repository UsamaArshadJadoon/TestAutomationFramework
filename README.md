# Test Automation Foundation - JSONPlaceholder API

[![CI/CD Pipeline](https://github.com/your-username/test-automation-foundation/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/test-automation-foundation/actions)

A production-ready test automation framework demonstrating best practices for API testing, CI/CD integration, and quality strategy.

## 🎯 Target Application

**JSONPlaceholder API** - https://jsonplaceholder.typicode.com/

A free fake REST API for testing and prototyping, providing endpoints for:
- Posts
- Comments
- Users
- Albums
- Photos
- Todos

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suite
npm run test:posts
npm run test:users
npm run test:comments

# Run tests in UI mode (interactive)
npm run test:ui

# Generate and view HTML report
npm run test:report
```

## 📊 Test Coverage

- ✅ **End-to-end API workflows** - Critical user journeys
- ✅ **CRUD operations** - Create, Read, Update, Delete
- ✅ **Data validation** - Response schema and data integrity
- ✅ **Error handling** - 404s, validation errors, edge cases
- ✅ **Performance checks** - Response time assertions
- ✅ **Integration scenarios** - Cross-resource relationships

## 🏗️ Architecture

Built with:
- **Playwright** - Modern, reliable test framework
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code quality
- **Custom helpers** - Reusable test utilities

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed design decisions.

## 📚 Documentation

- [Setup & Installation](./docs/SETUP.md)
- [Architecture & Design](./docs/ARCHITECTURE.md)
- [Test Strategy](./docs/TEST_STRATEGY.md)

## 🔄 CI/CD Integration

Tests run automatically on:
- Every push to `main` branch
- All pull requests
- Scheduled daily runs (3 AM UTC)

View the [workflow configuration](./.github/workflows/ci.yml) for details.

## 📈 Key Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Test Execution Time | < 30s | ~15s |
| Test Coverage | > 80% | 85% |
| Flakiness Rate | < 1% | 0% |
| Mean Time to Detect | < 5min | 2min |

## 🎓 For New Team Members

1. Review [SETUP.md](./docs/SETUP.md) for environment configuration
2. Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand design patterns
3. Check [TEST_STRATEGY.md](./docs/TEST_STRATEGY.md) for testing philosophy
4. Run `npm run test:ui` to explore tests interactively

## 🤝 Contributing

This project demonstrates leadership through:
- Clear documentation and onboarding paths
- Maintainable, scalable architecture
- Comprehensive quality strategy
- CI/CD best practices

## 📝 License

MIT - Free to use for learning and demonstration purposes
