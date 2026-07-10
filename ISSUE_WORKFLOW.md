# Issue Fix Workflow — SOP

This document defines the standard operating procedure for how bugs and feature requests move from **Planned → For Review** using Claude Code as the implementing agent.

---

## Labels

| Label | Meaning |
|---|---|
| `Planned` | Issue is scoped and ready to be picked up |
| `In Progress` | Claude is actively working on it |
| `For Review` | Fix is implemented, tested, and pushed — awaiting human sign-off on localhost |
| `Done` | Human has confirmed the fix and closed the issue |

---

## Roles

- **Product Owner (you)** — writes issues, tests on localhost, closes when satisfied
- **Claude** — reads issues, writes test cases, implements fixes, runs QA, updates labels

---

## Step-by-Step SOP

### Step 1 — Pick Up a Planned Issue

Claude reads all open issues labelled `Planned` from GitHub:

```
GET /repos/{owner}/{repo}/issues?state=open&labels=Planned
```

For each issue Claude reads:
- Title
- Description / acceptance criteria
- Any linked screenshots or comments

Claude then updates the label from `Planned` → `In Progress` before touching any code.

---

### Step 2 — Write Test Cases

Before writing a single line of code, Claude documents **what success looks like** as a set of test cases. These are written directly into a comment on the GitHub issue in the following format:

```
## Test Cases

### TC-01: [Short description]
- **Given**: [starting state]
- **When**: [action taken]
- **Then**: [expected outcome]
- **Pass criteria**: [what to check on localhost]

### TC-02: ...
```

Test cases cover:
- The primary happy path described in the issue
- Edge cases (empty state, long text, missing data)
- Regression — existing adjacent features still work

Claude does **not** begin implementation until test cases are written.

---

### Step 3 — Implement the Fix

Claude makes the required code changes:

- Reads all relevant source files before editing
- Follows existing patterns and conventions in the codebase
- Makes the smallest change that satisfies the test cases — no scope creep
- Runs TypeScript type-check after edits (`./node_modules/.bin/tsc --noEmit`)
- Verifies the Vite dev server picks up the change cleanly (no HMR errors)

---

### Step 4 — QA Against Test Cases

Claude manually walks through each test case against the running dev server and records results in a QA report comment on the issue:

```
## QA Report

| Test Case | Result | Notes |
|---|---|---|
| TC-01: [description] | ✅ Pass | — |
| TC-02: [description] | ✅ Pass | — |
| TC-03: [description] | ⚠️ Partial | [what was observed] |
```

If any test case fails, Claude fixes the issue and re-runs QA before proceeding.  
Claude does **not** move an issue to `For Review` with a failing test case.

---

### Step 5 — Push and Move to For Review

Once all test cases pass:

1. Commit with message referencing the issue: `Fix #N: [title summary]`
2. Push to `main`
3. Update issue label from `In Progress` → `For Review`
4. Post a final comment on the issue summarising:
   - What was changed and which files
   - How to verify on localhost (which step/page to navigate to)
   - Any known limitations or follow-up items

---

### Step 6 — Human Review

1. Open **http://localhost:5174** and navigate to the affected area
2. Walk through the test cases listed in the issue comments
3. If satisfied → close the issue (GitHub auto-moves to `Done`)
4. If changes are needed → reopen the issue, add a comment describing what failed, and set label back to `Planned`

---

## How to File a Good Issue

For Claude to pick up and fix an issue efficiently, issues should include:

- **Title**: Short and specific (e.g., *"Branding page: logo upload not persisting on save"*)
- **Description**: What is the current behaviour vs. what is expected
- **Affected area**: Which step/page/component (e.g., Step 2 — Branding)
- **Acceptance criteria**: A plain-English list of what done looks like
- **Label**: Set to `Planned` when ready

Screenshots or screen recordings are helpful but not required.

---

## Token Setup

Claude uses the GitHub REST API directly with a Personal Access Token (PAT) scoped to `repo`.  
Store the token securely — do not commit it to the repository.  
Regenerate at: **https://github.com/settings/tokens**

---

## Quick Reference — Label Update API Call

```bash
curl -s -X PATCH \
  -H "Authorization: token YOUR_PAT" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/OWNER/REPO/issues/NUMBER" \
  -d '{"labels":["In Progress"]}'
```
