# Google Sheets Data Guide — Product Progress Portal

Each tab must have a **header row** (Row 1). Data starts from Row 2.

---

## Executive Summary tab

Key–Value format. Column A = key name, Column B = value.

| Key | Value |
|-----|-------|
| Overall Status | Green / Amber / Red |
| Delivery Confidence | Green / Amber / Red |
| Budget Confidence | Green / Amber / Red |
| Timeline Confidence | Green / Amber / Red |
| OKRs On Track | 85 (number, %) |
| Milestones Completed | 12 (number) |
| Budget Utilized | 62 (number, %) |
| Roadmap Progress | 45 (number, %) |
| Success Metric Progress | 70 (number, %) |
| Biggest Win | Text |
| Biggest Risk | Text |
| Most Important Update | Text |
| Decisions Needed | Multi-line text (one item per line) |
| Leadership Support | Multi-line text |
| Escalations | Multi-line text |

---

## Product Overview tab

Key–Value format. Column A = key name, Column B = value.

| Key | Value |
|-----|-------|
| Problem | Text paragraph |
| Vision | Text paragraph |
| Objectives | Multi-line (one objective per line) |
| In Scope | Multi-line |
| Out of Scope | Multi-line |
| Target Users | Multi-line |
| Strategic Alignment | Multi-line |

---

## OKRs tab

Columns: Objective | Key Result | Target | Actual | Progress% | Status | TargetDate | Owner | Delayed? | Reason | Impact | Mitigation | Recovery Plan

- **Progress%**: number (0–100)
- **Status**: On Track / Delayed / Completed / At Risk
- **Delayed?**: Y or N

---

## Budget tab

Columns: Category | Workstream | Month | Budgeted | Consumed | Remaining | Forecast | Variance

- All monetary values as numbers (no currency symbols)
- **Month**: e.g. Jan-25, Feb-25

---

## Roadmap tab

Columns: Item | Description | Status | Confidence | Dependencies | Delivery Window | Quarter | Phase

- **Status**: Completed / In Progress / Upcoming / Delayed
- **Confidence**: Green / Amber / Red
- **Quarter**: e.g. Q1 FY26

---

## Metrics tab

Columns: MetricName | Category | Target | Actual | Trend | Period

- **Category**: Delivery or Outcome
- **Trend**: Up / Down / Stable

---

## Artifacts tab (Key Assets)

Columns: Title | Type | Owner | Date | Status | Link | Version | Reviewed By

- **Type**: Web Page / Deck / Git Link / Report / Pitch Deck / Prototype / PRD / Tech Design / Research / Meeting Notes / Decision Doc
- **Status**: Complete / In Progress / Draft / Review
- **Link**: full URL
- **Version** (Column G): optional — e.g. `v1.0`, `v2.1-beta`
- **Reviewed By** (Column H): optional — comma-separated names, e.g. `Tahera B., Ravi K.`

> Rows without columns G and H will display without version or reviewer information.

---

## Conversations tab

Columns: Organization | Owner | Objective | Stage | Latest Update | Next Step

- **Stage**: Discovery / Evaluation / Proposal / Pilot / Blocked / Closed

---

## Risks tab

Columns: Description | Severity | Probability | Impact | Owner | Mitigation | ETA | Status

- **Severity**: Critical / High / Medium / Low
- **Probability**: 1–5 (5 = most likely)
- **Impact**: 1–5 (5 = highest impact)

---

## Decisions tab

Columns: Decision | Date | Owner | Context | Tradeoff | Outcome | Status

- **Status**: Open / Pending / Closed
- **Date**: YYYY-MM-DD

---

## Changelog tab

Columns: Date | Change Type | Description | Section | Author

- **Change Type**: Milestone / Budget / Risk / Roadmap / Artifact / Conversation
- **Date**: YYYY-MM-DD
