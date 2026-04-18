# Research: Dashboard Scroll-Jump Investigation

**Feature**: 025-dashboard-scroll-jump
**Phase**: 0 (Investigation)
**Status**: Scaffold — findings will be populated during `/speckit.implement`

## Purpose

This document records the investigation of the four root-cause hypotheses from GitHub issue #234 per the clarification-session commitment (Q1, Option C: exhaustively investigate before fixing). Each hypothesis below will be confirmed or ruled out with concrete evidence. Fix decisions in Phase 1 derive from these findings — nothing is implemented until every hypothesis has a documented Decision.

## Environment

- Primary verification device: Android with visible navigation bar (Samsung, per original bug report) — to be filled with exact model + OS version.
- Secondary devices (smoke-test only): Android with gesture navigation, iOS with home indicator.
- Build: local dev build of the feature branch from current monorepo main.

## Reproduction baseline

**To be filled in** — exact steps that reliably reproduce the bug on the primary device, including: cold-start procedure (force close vs clean install), network condition (if any), and first-observed frame of the clipped TopNav. Attach a "before" screen recording here.

---

## Hypothesis 1 — SafeArea inset measurement timing

**Source**: Issue #234 investigation notes; `react-native-safe-area-context` emits `{top: 0, ...}` on first render before resolving to the real inset on the next frame.

**Method**:
- Instrument with a temporary `useEffect` that logs `useSafeAreaInsets()` values on each render during the first ~10 frames.
- Capture which component consumes the inset for initial positioning.

**Decision**: _TBD — confirmed / ruled out / partial contributor_

**Rationale**: _TBD_

**Alternatives considered**: _TBD_

**Evidence**: _TBD — link to log snippet or code-pointer_

---

## Hypothesis 2 — ScrollView content-height race (primary suspect)

**Source**: Issue #234 investigation notes; Android `ScrollView` is known to accumulate non-zero scroll offsets when content height grows progressively below the viewport. Confirmed by reading `apps/mobile/app/(tabs)/index.tsx` — `TopNav` is currently rendered **inside** the `ScrollView` (line ~185), so any scroll drift pushes it above the viewport.

**Method**:
- Read current layout: `ScrollView` wraps a `View` wrapping `TopNav` + all sections.
- Instrument `onScroll` to log offset-y during the cold-start load sequence.
- Test fix: move `TopNav` **outside** the `ScrollView` (sibling at `StarryBackground` level) and re-record.

**Decision**: _TBD — strongly expected to be confirmed as primary cause_

**Rationale**: _TBD_

**Alternatives considered**: _TBD (e.g., `FlatList` with sticky header, `Animated.ScrollView` with offset clamping, etc.)_

**Evidence**: _TBD — attach "before" and "after-fix" recordings_

---

## Hypothesis 3 — StatusBar `backgroundColor` interaction

**Source**: Issue #234 investigation notes; `app/_layout.tsx` line ~266 sets `backgroundColor={isDark ? lightTheme.background : darkTheme.background}`.

**Clarification Q2 boundary**: Treat the existing pattern as intentional visual separation (status-bar contrast strip). Investigate ONLY whether applying/toggling the background during dark-mode init causes a measurable status-bar-region layout hiccup that the ScrollView compensates for. Do NOT rewrite the config unless evidence demands it.

**Method**:
- Capture screen recordings in both light and dark mode with the current config.
- Measure whether the layout drift correlates with the moment `StatusBar` applies.
- Temporarily remove `backgroundColor` prop and re-record — does the jump still occur?

**Decision**: _TBD — confirmed / ruled out / partial contributor_

**Rationale**: _TBD_

**Alternatives considered**: _TBD (e.g., moving `StatusBar` into each screen's own layout, etc.)_

**Evidence**: _TBD_

---

## Hypothesis 4 — Expo Router Tabs scene-measurement race

**Source**: Issue #234 investigation notes; on first mount, `Tabs` scene area may be sized without accounting for the tab bar, then shrink once the tab bar measures.

**Method**:
- Instrument the dashboard root `View`'s `onLayout` to log height across the first several frames.
- Correlate with scroll offset from Hypothesis 2's instrumentation.
- Test whether the scroll drift aligns in time with scene-area resize.

**Decision**: _TBD — confirmed / ruled out / partial contributor_

**Rationale**: _TBD_

**Alternatives considered**: _TBD_

**Evidence**: _TBD_

---

## Findings-driven decisions

| ID | Question | Decision | Rationale |
|---|---|---|---|
| FD-1 | Is the primary fix to move `TopNav` outside `ScrollView`? | _TBD_ | _TBD_ |
| FD-2 | Does any hypothesis beyond #2 independently cause visible symptoms? | _TBD_ | _TBD_ |
| FD-3 | Is a defensive `scrollTo({y:0})` guard needed on "all sections loaded"? | _TBD — default no_ | _Only if FD-1 proves insufficient._ |
| FD-4 | Does the fix require changes to `app/(tabs)/_layout.tsx`? | _TBD — default no_ | _TBD_ |

## Exit gate for Phase 0

All four hypotheses must have a documented **Decision** with **Evidence**, and FD-1 through FD-4 must have concrete answers, before any implementation task under Phase 1 begins.
