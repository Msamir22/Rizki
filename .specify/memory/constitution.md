<!-- Sync Impact Report:
Version change: (none) → 1.0.0
List of modified principles: (none) → Code Quality Excellence, Test-First Development, User Experience Consistency, Performance Requirements, Security by Design, Privacy First, Mobile-Native Architecture
Added sections: Technical Standards, Development Workflow
Removed sections: (none)
Templates requiring updates: 
✅ plan-template.md (Constitution Check section)
✅ spec-template.md (Security/Privacy/Performance requirements)
✅ tasks-template.md (Mobile/Security task categories)
Follow-up TODOs: (none)
-->

# Astik Constitution

## Core Principles

### I. Code Quality Excellence
TypeScript strict mode mandatory across all packages. Code must maintain 95% type coverage, follow atomic design principles, and enforce consistent formatting with ESLint/Prettier. Component interfaces must be defined before implementation, and cyclomatic complexity must remain below 10 per function. All code must pass static analysis and security scanning before merge.

### II. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests must be written and verified to FAIL before implementation. Minimum 90% unit test coverage and 85% branch coverage required. All financial transaction flows must have end-to-end test coverage. Security testing following OWASP MASVS standards is mandatory for any feature handling user data or financial information.

### III. User Experience Consistency
WCAG 2.1 AA compliance required for all user interfaces. Egyptian UX patterns must be integrated including Arabic RTL support, visual-first design for literacy considerations, and the established Egyptian color palette (Nile Green, Astik Mint, Expense Red, Pharaonic Gold). Core functionality must be accessible with 6th-grade reading level maximum and support for system font scaling up to 200%.

### IV. Performance Requirements
Mobile apps must achieve <3 second cold start, <1 second warm start, and maintain 60 FPS during all interactions. Memory usage must not exceed 100MB during normal operation, and battery drain must remain <5% per hour of active use. API responses for critical operations must be <500ms, and core features must function offline without connectivity.

### V. Security by Design
OWASP MASVS compliance mandatory for all features. Multi-factor authentication with biometric support required for financial operations. All sensitive data must be encrypted at rest using iOS Keychain/Android Keystore and in transit using TLS 1.3 with certificate pinning. Apps must include root/jailbreak detection and anti-tampering measures. No sensitive data may be logged or stored unencrypted.

### VI. Privacy First
GDPR and CCPA compliance mandatory for all user data handling. Data minimization principles must be followed - collect only essential data for service delivery. Granular consent management with easy withdrawal options required. Automatic data deletion after retention periods and complete audit trails for all data access must be implemented. Users must have easy access to correct and delete their personal data.

### VII. Mobile-Native Architecture
Offline-first architecture with local-first data strategy mandatory. Core features must work without internet connectivity using optimistic updates and background synchronization. Intelligent delta sync with conflict resolution must be implemented for efficient bandwidth usage. State management must follow Redux Toolkit patterns with TypeScript strict typing and support for offline queuing of actions.

## Technical Standards

**Technology Stack Requirements**:
- TypeScript 5.4+ with strict mode enabled
- React Native with Expo for cross-platform development
- Supabase for backend services with PostgreSQL
- WatermelonDB for local offline storage
- Redux Toolkit for state management
- Jest + React Native Testing Library for testing
- Detox for end-to-end testing

**Database Standards**:
- All schemas must support offline synchronization
- Database migrations must be backward compatible
- Financial data must have audit trails
- User data must be encrypted at rest
- Schema versioning mandatory with automatic upgrades

**Security Standards**:
- OWASP MASVS Level 1+ compliance
- Certificate pinning for all API communications
- Biometric authentication for sensitive operations
- Rate limiting and brute force protection
- Code obfuscation for production builds
- Root/jailbreak detection

## Development Workflow

**Code Review Requirements**:
- All PRs require at least one maintainer approval
- Security review mandatory for financial features
- Performance review required for UI changes
- Accessibility review required for user-facing changes
- Constitution compliance check mandatory for all changes

**Testing Gates**:
- Unit tests must pass with 90%+ coverage
- Integration tests required for new features
- E2E tests required for transaction flows
- Security scans must pass without high vulnerabilities
- Performance benchmarks must be met before release

**Deployment Process**:
- Staging deployment mandatory for all features
- Production deployment requires constitution compliance validation
- Rollback procedures must be documented and tested
- Monitoring and alerting mandatory for production

## Governance

This constitution supersedes all other development practices and guidelines. Amendments require supermajority (2/3) approval from maintainers and must include version increments following semantic versioning. Template synchronizations are mandatory within 48 hours of constitution changes. Quarterly compliance reviews required to validate adherence to all principles. Any principle violations must be documented and resolved before merge.

**Version**: 1.0.0 | **Ratified**: 2026-01-26 | **Last Amended**: 2026-01-26