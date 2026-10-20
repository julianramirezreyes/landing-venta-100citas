# Purchase Buttons

## Objective
Restore reliable purchase navigation and make the bottom purchase CTA appear as soon as the page is scrolled, on both mobile and desktop, while preserving modal priority and access to final-page content.

## Problem
The landing page contains seven Hotmart purchase anchors, but they disappear from the live DOM. The injected public Hotmart widget removes anchors whose URLs contain `hotmart.com` after its health check fails. The bottom dock also appears only after `scrollY > 700`, only while the offer section remains more than 40% of the viewport below the top, and only on viewports at or below 680px.

## Why
Users need dependable direct checkout links, and the purchase action should remain easy to reach throughout the page on all viewport sizes.

## Scope and Authorization
Authorized changes are limited to purchase-link/widget behavior, the fixed purchase CTA behavior and styles, focused behavior tests, and this feature document. Preserve all existing Spanish copy and checkout URLs exactly. No unrelated work, remote deployment, push, PR, merge, credentials, or installs.

Expected paths:
- `index.html` — remove the Hotmart widget dependency injection; preserve direct checkout URLs.
- `js/main.js` — make dock visibility follow `scrollY > 0` without offer-position gating.
- Existing relevant stylesheet(s) — make the dock visible on all viewport sizes and ensure final content is not blocked; preserve modal z-order.
- `tests/*.test.cjs` — focused behavior tests using Node's built-in test runner and the real initialization/scroll-handler behavior.
- `odd/tasks/purchase-buttons.md` — task, proof, and commit record.

## Accepted Design
1. Keep purchase anchors as direct Hotmart checkout links; do not use a popup/widget.
2. Remove the widget script injection from `index.html` and only clean up obsolete widget-specific CSS if inspection proves it is necessary for this behavior.
3. Show the fixed bottom purchase CTA whenever `scrollY > 0`, on desktop and mobile; hide it at the top. It remains available at the price/footer, stays below modal overlays, and must not obscure final content.
4. Preserve exact checkout URL values, including `V108076592A`, `checkoutMode=2`, and `off=3jpxud41`.

## Constraints
- Strict TDD is enabled by the user-provided project instructions: observe RED before implementation, then GREEN and REFACTOR.
- Repository is a static site with no existing `package.json`, test directory, or configured test runner. Node `v24.21.0` is available; use its built-in runner with `node --test tests/*.test.cjs` (confirm wildcard behavior once tests exist).
- Planned verification: `node --test tests/*.test.cjs`, `node --check js/main.js`, and `git diff --check`.
- Manual browser verification is parent-owned and should use the existing local preview at `http://127.0.0.1:4173/`; leave its existing process running.
- RDD is globally off (read-only status confirmed by parent); do not run review START or toggle review mode.
- Engram mirror is pending because Engram returned an ambiguous workspace; preserve this repository document and do not call memory tools.
- No worktree: use the current checkout so preview updates are visible.

## Tasks and Progress

### T1 — Restore dependable direct checkout links
- [x] Add a behavior test that catches the widget removing direct purchase anchors after its health-check failure.
- [x] Remove the widget import/injection while preserving every direct checkout URL exactly; removed obsolete Hotmart-only anchor classes and the inline style override, with ordinary `.buy` styles retained.
- [x] Run focused tests and checks.
- Route: delegated direct writer; preparation and multi-file implementation trigger.
- Rollback boundary: revert only T1's test, `index.html` widget-removal change, any strictly necessary widget-specific CSS cleanup, and this task's progress/evidence.
- Commit: `7893b7d850f067e5942ad0f1713a665f4041aadf` (`fix(purchase-buttons): restore direct checkout links`).
- Verification evidence: `node --test tests/*.test.cjs` — RED before source edits (1 failed; all seven anchors were removed by the simulated failed widget load), GREEN after source edits (1 passed); `node --check js/main.js` — passed (exit 0); `git diff --check` — passed (exit 0).

### T2 — Keep the fixed purchase CTA available after the first scroll
- [x] Add behavior tests for hidden-at-top and visible-after-any-positive-scroll behavior, including desktop and mobile viewport sizes.
- [x] Remove the offer-position and mobile-only gates; keep the dock under modal overlays and avoid blocking final-page content (the existing footer bottom padding already provides space beyond the dock; modal z-index remains above the dock).
- [x] Run focused tests and checks.
- [x] Verify the live page in desktop and mobile browser viewports, including top, first scroll, footer, and modal layering.
- Route: delegated direct writer; multi-file implementation and test-preparation triggers.
- Rollback boundary: revert only T2's test, dock behavior/style changes, and this task's progress/evidence.
- Commit: `592446d9479ca804e325fa9210cb9ffef54417e2` (`fix(purchase-buttons): show docked CTA after scrolling`).
- Verification evidence: `node --test tests/*.test.cjs` — RED before implementation (first-scroll CTA test failed on mobile viewport while the dock stayed off), GREEN after implementation (2 passed); independent verifier and parent spot test each passed 2/2; `node --check js/main.js` — passed (exit 0); `git diff --check` — passed (exit 0). Parent browser verification passed at `http://127.0.0.1:4173/` after cache-bypass reload: desktop 1280×900 and mobile 390×844 both show the dock hidden at scrollY 0 and visible at the first scroll; at the footer it remains visible without obscuring the final link; mobile has no horizontal overflow; modal z-index 70 remains above dock z-index 45; no runtime errors or warnings were observed. All seven `a[data-buy]` elements retain `https://pay.hotmart.com/V108076592A?checkoutMode=2&off=3jpxud41`. No live checkout or purchase was attempted. A regular reload initially served stale JS/CSS; `Page.reload(ignoreCache:true)` loaded the current local files without source changes. Viewport override was reset and the existing user tab was left open on the local page, slightly scrolled with the dock visible. Screenshots: `/home/julian/.codex/visualizations/2026/10/20/01a15710-8fa1-7562-8aa9-b8d33cec1a28/purchase-desktop.jpg` and `/home/julian/.codex/visualizations/2026/10/20/01a15710-8fa1-7562-8aa9-b8d33cec1a28/purchase-mobile.jpg`.

## Acceptance Criteria
- All seven source purchase anchors remain usable direct links with their original destination values and no widget-driven removal.
- The fixed purchase CTA is hidden at `scrollY === 0`, appears for any `scrollY > 0`, and works at mobile and desktop viewport sizes.
- The CTA remains available around price/footer content, is below modal overlays, and does not block the final content.
- Tests exercise actual page initialization and scroll behavior through a minimal DOM boundary; do not use source-text grep assertions.
- Planned verification commands and parent browser verification pass; checkout execution itself was not tested.
- Each task closes with its own Conventional Commit including relevant tests and task-document evidence.

## Baseline and Delivery
- Repository root: `/home/julian/proyectos/verdad-entre-dos/landing-venta-100citas`
- Baseline branch: `master`
- Baseline commit: `5ecd1af0f9355329afc15e4b9b3270a9715b8e22`
- Feature branch: `fix/purchase-buttons`
- Forecast: under 400 authored changed lines across two small work units; if an honest forecast exceeds 400, stop and inform the parent before committing rather than shrinking tests.
- Delivery strategy: `ask-on-risk`.
- Native read-only assessment for `5ecd1af..592446d` (committed slice): risk `medium` / `executable_change`, 257 authored lines, `review_due: false` / `under_budget`. RDD is globally off; delivery status is `disabled/unmanaged`. No review consent or START was requested or run.
- PR/merge/push/deployment: not authorized.
