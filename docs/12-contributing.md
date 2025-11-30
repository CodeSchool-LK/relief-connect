# Contributing

Thank you for your interest in contributing to Relief Connect! This document provides guidelines and instructions for contributing.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Clear title** describing the bug
- **Description** of the issue
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment** (OS, Node version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:

- **Clear title** describing the feature
- **Detailed description** of the feature
- **Use case** explaining why it's needed
- **Possible implementation** (if you have ideas)

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a Pull Request**

---

## Development Setup

See the [Development Guide](11-development.md) for detailed setup instructions.

Quick setup:

```bash
# Clone your fork
git clone https://github.com/your-username/relief-connect.git
cd relief-connect

# Install dependencies
yarn install

# Build shared library
yarn shared:build

# Start development servers
yarn api:dev    # Terminal 1
yarn web:dev    # Terminal 2
```

---

## Code Style

### TypeScript

- Use strict TypeScript
- Prefer interfaces over types
- Use explicit return types
- Avoid `any` type

### Naming Conventions

- **Files**: kebab-case for utilities, PascalCase for components
- **Variables/Functions**: camelCase
- **Classes/Components**: PascalCase
- **Constants**: UPPER_SNAKE_CASE

### Code Formatting

- Use Prettier (if configured)
- Follow ESLint rules
- Maximum line length: 100 characters
- Use 2 spaces for indentation

### Example

```typescript
// Good
interface UserProfile {
  id: number;
  username: string;
  email?: string;
}

function getUserProfile(userId: number): Promise<UserProfile> {
  return userService.getById(userId);
}

// Bad
function getUserProfile(userId) {
  return userService.getById(userId);
}
```

---

## Git Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-user-profile` - New features
- `fix/resolve-login-bug` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/reorganize-services` - Refactoring
- `test/add-auth-tests` - Tests

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT refresh token support

fix(api): resolve database connection timeout

docs(readme): update installation instructions

refactor(services): reorganize user service methods
```

### Pull Request Process

1. **Update your fork:**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request:**
   - Go to GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template
   - Submit for review

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Type checking passes (`yarn type-check`)
- [ ] Linting passes (`yarn api:lint`, `yarn web:lint`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventions
- [ ] No console.logs or debug code
- [ ] No commented-out code
- [ ] Environment variables documented (if new)

---

## Code Review

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, PR will be merged

### Review Criteria

- Code quality and style
- Functionality and correctness
- Test coverage
- Documentation
- Performance considerations
- Security implications

### Responding to Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes
- Update PR with changes
- Thank reviewers for their time

---

## Testing

### Writing Tests

- Write tests for new features
- Update tests for bug fixes
- Aim for good coverage
- Test edge cases

### Running Tests

```bash
# All tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:coverage
```

---

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex logic
- Explain "why" not just "what"
- Keep comments up-to-date

### Example

```typescript
/**
 * Authenticates a user and returns JWT tokens
 * @param username - User's username
 * @param password - User's password
 * @returns Promise with user data and tokens
 * @throws {Error} If credentials are invalid
 */
async function login(username: string, password: string): Promise<AuthResponse> {
  // Implementation
}
```

### Updating Documentation

- Update README if needed
- Update API docs for new endpoints
- Update guides for workflow changes
- Keep examples current

---

## Areas for Contribution

### High Priority

- **Bug Fixes**: Fix reported issues
- **Documentation**: Improve docs
- **Tests**: Add test coverage
- **Performance**: Optimize slow queries
- **Security**: Security improvements

### Feature Ideas

- Real-time updates (WebSockets)
- Mobile app
- Advanced search
- Analytics dashboard
- Email notifications
- SMS integration
- Offline support

### Good First Issues

Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`
- `bug`

---

## Questions?

### Getting Help

- Check existing documentation
- Search closed issues
- Ask in discussions
- Create a question issue

### Communication

- Be respectful and professional
- Provide context in issues/PRs
- Respond to feedback promptly
- Thank contributors

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Publishing others' private information

### Enforcement

Violations may result in:
- Warning
- Temporary ban
- Permanent ban

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md (if maintained)
- Credited in release notes
- Appreciated by the community!

---

## Thank You!

Your contributions make Relief Connect better for everyone. Thank you for taking the time to contribute!

---

[← Back to README](../README.md) | [Previous: Development](11-development.md)

