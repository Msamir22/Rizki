# Implementation Plan - ESLint Configuration Review & Mobile Type Resolution Fix

This plan covers the review of the ESLint configuration and the resolution of
the persistent type-checking errors in the mobile application.

## User Requirements

- **Strong Typing**: Review and prune rules while ensuring type safety to reduce
  production errors.
- **Consistent Styling**: Maintain rules that enforce Tailwind CSS usage and
  project-specific patterns.
- **Zero Errors**: Resolve the thousands of `no-unsafe-*` errors in the mobile
  app.

## Proposed Changes

### 1. ESLint Configuration Review (`.eslintrc.json`)

#### A. Enable Critical Type-Safety Rules

The following rules were previously `off` but are essential for preventing
runtime production errors:

- `@typescript-eslint/no-floating-promises`: Detects unhandled async rejections.
- `@typescript-eslint/no-misused-promises`: Prevents passing async functions
  where sync ones are expected.
- `@typescript-eslint/await-thenable`: Ensures `await` is only used on Promises.
- `@typescript-eslint/no-unnecessary-type-assertion`: Keeps code clean and
  type-safe.

#### B. Prune or Adjust "Noisy" Rules

- **`react-native/all`**: This plugin's "all" configuration is often too
  aggressive for projects using Tailwind/NativeWind. We will shift to more
  specific rules to reduce false positives.
- **`@typescript-eslint/naming-convention`**: Already refined to allow
  `PascalCase` for React components.
- **`import/no-unresolved`**: Ensure it's correctly configured for the monorepo
  structure.

#### C. Project-Specific Patterns

- Retain `no-restricted-syntax` rules for `isDark` and hex colors to ensure the
  UI remains declarative and follows the design system.

### 2. Fix Mobile Type Resolution

The `no-unsafe-*` errors are caused by the TypeScript parser failing to resolve
types in the mobile app, causing it to default to `any`.

- **Action**: Update `parserOptions` to use a more robust project discovery or
  fix the relative paths.
- **Action**: Synchronize `import/resolver` settings with the explicit `project`
  paths.
- **Action**: Verify if `apps/mobile/node_modules` or parent `node_modules`
  conflict is affecting resolution.

## Verification Plan

1. Apply configuration changes to `.eslintrc.json`.
2. Run `npx eslint --ext .ts,.tsx --quiet "apps/mobile/app/(tabs)/accounts.tsx"`
   to verify that `no-unsafe-*` errors are resolved.
3. Run a full workspace lint to ensure no regressions in the API or packages.
4. Report the finalized rule set and its benefits to the user.
