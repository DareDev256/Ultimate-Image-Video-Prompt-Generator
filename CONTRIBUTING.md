# Contributing to Ultimate Image Prompt Generator

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Quick Start

```bash
# Fork and clone
git clone https://github.com/YOUR-USERNAME/Ultimate-Image-Video-Prompt-Generator.git
cd Ultimate-Image-Video-Prompt-Generator/web

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
.
├── web/                    # Next.js frontend (main application)
│   ├── src/app/           # App Router pages and API routes
│   ├── src/components/    # React components
│   ├── src/context/       # React Context providers
│   ├── src/hooks/         # Custom React hooks
│   └── src/lib/           # Utilities and data
├── src/                   # CLI tool (Bun)
├── scripts/               # Data processing scripts
└── docs/                  # Design documents
```

## Development Guidelines

### Code Style

- **TypeScript** - All new code should be TypeScript
- **Formatting** - Use your editor's default formatter (Prettier recommended)
- **Naming** - camelCase for variables/functions, PascalCase for components/types
- **Comments** - Write self-documenting code; add comments only for "why", not "what"

### Component Guidelines

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use Tailwind CSS for styling (no separate CSS files)

### API Routes

- Validate all inputs
- Return consistent error responses with `{ error: string }` structure
- Use appropriate HTTP status codes
- Log errors server-side with `console.error`

## Types of Contributions

### Bug Reports

Open an issue with:
- Clear title describing the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

### Feature Requests

Open an issue with:
- Clear description of the feature
- Use case / problem it solves
- Any implementation ideas (optional)

### Code Contributions

1. **Check existing issues** - Look for open issues or create one first
2. **Fork the repository**
3. **Create a branch** - `git checkout -b feature/your-feature-name`
4. **Make your changes** - Keep commits focused and atomic
5. **Test your changes** - Manually test all affected functionality
6. **Submit a PR** - Use the PR template

### Prompt Contributions

We welcome additions to the inspiration gallery! To contribute prompts:

1. Fork the repository
2. Add prompts to the appropriate JSON file in `web/public/data/`
3. Follow the existing format
4. Include proper tags for searchability
5. Submit a PR

## Pull Request Process

1. **Title** - Use conventional commits format: `feat:`, `fix:`, `docs:`, etc.
2. **Description** - Explain what changes were made and why
3. **Screenshots** - Include before/after screenshots for UI changes
4. **Testing** - Describe how you tested the changes
5. **Size** - Keep PRs focused; split large changes into smaller PRs

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Changes tested locally
- [ ] No console errors or warnings
- [ ] UI changes are responsive

## Local Development Tips

### Testing API Routes

The API routes require API keys. For development:
- Copy `.env.example` to `.env.local`
- Add your API keys (not required for UI development)
- Use the free tier to test without keys

### Hot Reloading

Next.js automatically reloads on file changes. If you encounter issues:
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

### Debugging

- Check browser console for client-side errors
- Check terminal for server-side errors
- Use React DevTools for component inspection

## Questions?

- Open a GitHub Discussion for general questions
- Open an Issue for bugs or feature requests
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
