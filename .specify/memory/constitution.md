<!--
Sync Impact Report:
- Version change: Template -> 1.0.0
- Added Principles: Code Quality, Testing Standards, UX Consistency, Performance
- Templates Status:
  - plan-template.md: Compatible (Generic checks)
  - spec-template.md: Compatible
  - tasks-template.md: Compatible
-->
# Email Portal Constitution

## Core Principles

### I. Code Quality First
Code is read much more often than it is written. We prioritize maintainability and readability.
- **Strict Typing**: TypeScript `strict` mode is mandatory. Avoid `any` types; use `unknown` or specific types.
- **Linting & Formatting**: All code must pass ESLint and Prettier checks. No unused variables or dead code.
- **Modularity**: Follow separation of concerns. Logic should be separated from UI components where possible.
- **Documentation**: Code should be self-documenting. Use comments to explain "why" complex decisions were made, not "what" the code does.

### II. Testing Standards
Confidence in deployment comes from comprehensive automated testing.
- **Critical Paths**: Authentication, data mutation, and core business flows MUST have integration tests.
- **Unit Tests**: Complex utility functions and business logic isolated from UI must have unit tests.
- **Determinism**: Tests must be independent and deterministic. Flaky tests are treated as failures.
- **TDD**: Test-Driven Development is encouraged for complex logic.

### III. User Experience Consistency
The application should feel cohesive, responsive, and intuitive.
- **Design System**: All UI components MUST utilize the project's design system (Mantine/Tailwind) to ensure visual consistency.
- **Responsiveness**: All features MUST be fully responsive and functional on Mobile, Tablet, and Desktop devices.
- **Feedback**: Users MUST receive immediate feedback for actions (loading spinners, success toasts, error messages). Silent failures are unacceptable.
- **Accessibility**: Follow WCAG best practices. Semantic HTML is required.

### IV. Performance Requirements
Performance is a feature. Slow applications lose users.
- **Core Web Vitals**: Target 'Good' scores for LCP (< 2.5s), INP (< 200ms), and CLS (< 0.1).
- **Server-Side Efficiency**: Database queries must be optimized (use indexes, avoid N+1 queries).
- **Optimization**: Use Next.js Image optimization. Lazy load heavy components and libraries.
- **Login Speed**: Authentication flow should complete in under 2 seconds.

## Technology Standards

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS / Mantine
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js

## Development Workflow

- **Branching**: Use feature branches (`feat/`, `fix/`) derived from `main`.
- **Commits**: Follow Conventional Commits (e.g., `feat: add login`, `fix: resolve crash`).
- **Reviews**: All Pull Requests require at least one peer review.
- **CI/CD**: Tests and linting must pass before merging.

## Governance

This Constitution serves as the primary source of truth for engineering standards.
- **Supremacy**: These principles supersede ad-hoc decisions unless an exception is explicitly documented and approved.
- **Amendments**: Changes to this document require a Pull Request with team consensus.
- **Compliance**: All code reviews must verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2025-11-30 | **Last Amended**: 2025-11-30
