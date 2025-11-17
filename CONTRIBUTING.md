# Contributing Guidelines

Thank you for your interest in contributing to the Test Automation Foundation! This document provides guidelines and best practices for contributing to this project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Writing Tests](#writing-tests)
5. [Pull Request Process](#pull-request-process)
6. [Getting Help](#getting-help)

## Getting Started

### Prerequisites

Before contributing, make sure you have:
- Completed the [setup instructions](./docs/SETUP.md)
- Read the [architecture documentation](./docs/ARCHITECTURE.md)
- Understood the [test strategy](./docs/TEST_STRATEGY.md)

### First Contribution

Good first contributions:
- Fix a typo in documentation
- Add missing test case
- Improve error messages
- Add code comments

Look for issues tagged with `good-first-issue` in the repository.

## Development Workflow

### 1. Create a Branch

```bash
# Update your main branch
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming Convention**:
- `feature/` - New functionality
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### 2. Make Your Changes

- Write clean, readable code
- Follow existing patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run all tests
npm test

# Run specific test file you modified
npm run test:posts  # or relevant test
```

### 4. Commit Your Changes

**Commit Message Format**:
```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

**Example**:
```
feat: add pagination support for posts API

- Add query parameter tests for limit and offset
- Update test data factory with pagination helpers
- Add documentation for pagination testing

Closes #123
```

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# Fill out the PR template
```

## Code Standards

### JavaScript Style Guide

**General Principles**:
- Use meaningful variable names
- Keep functions small and focused
- Prefer async/await over callbacks
- Use const by default, let when needed
- Never use var

**Example**:
```javascript
// ✅ Good
const getUserById = async (userId) => {
  const response = await request.get(`/users/${userId}`);
  return response.json();
};

// ❌ Bad
var getUser = function(id) {
  return request.get('/users/' + id).then(function(r) {
    return r.json();
  });
};
```

### Test Writing Standards

**1. Test Naming**:
```javascript
// ✅ Good - Describes what and expected outcome
test('GET /posts/{id} - should return 404 for non-existent post', async ({ request }) => {
  // ...
});

// ❌ Bad - Vague and unclear
test('test post error', async ({ request }) => {
  // ...
});
```

**2. Test Structure** (AAA Pattern):
```javascript
test('should create new post', async ({ request }) => {
  // Arrange - Set up test data
  const newPost = TestDataFactory.createPost({
    title: 'Test Post'
  });
  
  // Act - Perform the action
  const response = await request.post('/posts', {
    data: newPost
  });
  
  // Assert - Verify the outcome
  expect(response.status()).toBe(201);
  const created = await response.json();
  expect(created.title).toBe(newPost.title);
});
```

**3. Test Independence**:
```javascript
// ✅ Good - Each test is independent
test('should retrieve post', async ({ request }) => {
  const response = await request.get('/posts/1');
  expect(response.status()).toBe(200);
});

test('should update post', async ({ request }) => {
  const response = await request.put('/posts/1', {
    data: { title: 'Updated' }
  });
  expect(response.status()).toBe(200);
});

// ❌ Bad - Tests depend on each other
let createdPostId;

test('should create post', async ({ request }) => {
  const response = await request.post('/posts', { data: {...} });
  const post = await response.json();
  createdPostId = post.id; // Don't do this!
});

test('should retrieve created post', async ({ request }) => {
  const response = await request.get(`/posts/${createdPostId}`);
  // This will fail if first test fails
});
```

**4. Clear Assertions**:
```javascript
// ✅ Good - Clear, specific assertions
expect(response.status()).toBe(200);
expect(post.title).toBe('Expected Title');
expect(Array.isArray(posts)).toBeTruthy();

// ❌ Bad - Vague or multiple concepts
expect(response.status() === 200 && post.title.length > 0).toBeTruthy();
```

### Documentation Standards

**Code Comments**:
```javascript
/**
 * Creates a new post with the given data
 * 
 * @param {Object} postData - The post data
 * @param {number} postData.userId - User ID
 * @param {string} postData.title - Post title
 * @param {string} postData.body - Post body
 * @returns {Promise<Object>} Created post object
 */
async function createPost(postData) {
  // Implementation
}
```

**README Updates**:
- Keep README current with features
- Update examples when changing APIs
- Add troubleshooting entries for common issues

## Writing Tests

### Test Checklist

Before submitting tests, ensure:
- [ ] Test has clear, descriptive name
- [ ] Test is independent (doesn't rely on other tests)
- [ ] Test follows AAA pattern (Arrange, Act, Assert)
- [ ] Test includes both positive and negative scenarios
- [ ] Test data uses factory methods
- [ ] Assertions are specific and meaningful
- [ ] Test runs successfully locally
- [ ] Test passes in CI

### Test Coverage Guidelines

**When Adding New Endpoints**:
```javascript
// Minimum tests required:
- GET /{resource}
- GET /{resource}/{id}
- POST /{resource}
- PUT /{resource}/{id}
- DELETE /{resource}/{id}
- Error handling (404, 400)
- Data validation
```

**When Adding New Features**:
- Add happy path test
- Add error case tests
- Add edge case tests
- Update integration tests if needed

### Performance Considerations

**Keep Tests Fast**:
```javascript
// ✅ Good - Uses parallel execution
const responses = await Promise.all([
  request.get('/posts/1'),
  request.get('/posts/2'),
  request.get('/posts/3')
]);

// ❌ Bad - Sequential requests
const response1 = await request.get('/posts/1');
const response2 = await request.get('/posts/2');
const response3 = await request.get('/posts/3');
```

**Avoid Unnecessary Waits**:
```javascript
// ✅ Good - No arbitrary waits
const response = await request.get('/posts/1');

// ❌ Bad - Arbitrary wait
await page.waitForTimeout(1000);
const response = await request.get('/posts/1');
```

## Pull Request Process

### Before Creating a PR

1. **Ensure all tests pass**:
   ```bash
   npm test
   ```

2. **Run linter**:
   ```bash
   npm run lint
   ```

3. **Update documentation** if needed

4. **Add tests** for new functionality

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] All existing tests pass
- [ ] New tests added
- [ ] Tested locally

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Self-reviewed code
```

### Review Process

1. **Automated Checks**: CI/CD must pass
2. **Code Review**: At least one approval required
3. **Testing**: QA team validates if needed
4. **Merge**: Squash and merge preferred

### After Merge

- Delete your feature branch
- Monitor CI for any issues
- Update related documentation
- Celebrate! 🎉

## Getting Help

### Resources

- **Documentation**: Check docs/ directory first
- **Examples**: Look at existing tests for patterns
- **Architecture**: See ARCHITECTURE.md for design decisions

### Contact

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create a GitHub Issue
- **Quick Help**: Ask in team Slack channel

### Common Questions

**Q: How do I run a single test?**
```bash
npx playwright test tests/api/posts.spec.js --grep "specific test name"
```

**Q: How do I debug a failing test?**
```bash
npm run test:debug
# Or
npx playwright test --debug
```

**Q: Should I update test data factory or create inline data?**
- Use factory for standard, reusable data
- Use inline for test-specific, one-off data

**Q: When should I add a new test file vs adding to existing?**
- New file: New resource or major feature area
- Existing file: Additional tests for covered resource

## Code of Conduct

### Our Standards

- Be respectful and professional
- Provide constructive feedback
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards others

### Examples

**✅ Good Feedback**:
"This test could be more robust if we also check for the response headers. Here's an example: ..."

**❌ Poor Feedback**:
"This test is wrong."

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Appreciated in team meetings! 🙏

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to better quality and testing practices! 🚀
