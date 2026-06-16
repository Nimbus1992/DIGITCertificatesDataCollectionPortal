# Implementation Plan

## 1. Inbox — 5 breached applications
- In `src/lib/reportsMock.ts` (or wherever mock apps are seeded in `src/lib/store.ts`), add 5 new mock applications with `currentStageId` values that represent SLA-breached items. Reuse existing breached-stage logic (`src/lib/sla.ts`) so they show as breached in the inbox list.
- Spread them across stages currently shown in the inbox with `createdAt` dates old enough to trip the SLA badge.

## 2. Dashboard KPIs — Mon–Sun current week
File: `src/routes/_authenticated/dashboard.tsx`
- Compute current ISO week range (Monday 00:00 → Sunday 23:59 local).
- Filter apps by `createdAt` within that range for "Total Applications".
- "Approved" = apps with `currentStageId === "issued"` AND `licenseIssuedAt` (or latest history entry to issued) within this week.
- "Rejected" = apps with `currentStageId === "rejected"` AND the rejection history entry within this week.
- "Pending Review" stays role-scoped queue count (unchanged), OR redefine as pending-this-week = total − approved − rejected. **Decision: keep total = pending + approved + rejected within the week** so the three reconcile.
- Update labels to reflect "this week" subtext under each metric card.

## 3. Documents tab — black "All documents verified"
File: `src/routes/_authenticated/inbox.$appId.tsx` (Documents tab section)
- Find the success banner / line that says "All documents verified" and change its text color class from the current success/green token to `text-foreground` (black in light mode).

## 4. License PDF download (top-right of application detail)
File: `src/routes/_authenticated/inbox.$appId.tsx`
- Locate the existing top-right "Download" button.
- Install `jspdf` and `qrcode` (dynamic import in click handler to avoid SSR issues — same pattern as xlsx fix).
- On click, generate a PDF containing:
  - City of Cape Town logo (`src/assets/cape-town-logo.png`, embedded as data URL)
  - Title "Business License"
  - License number, issue date, expiry date (validity)
  - Business: name, owner (applicantName), address, category
  - QR code encoding a verification URL (e.g. `https://employee.digitcertificates.online/verify/{licenseNumber}`)
- Filename: `license-{licenseNumber or appId}.pdf`.
- Only enable the button when the application has been issued (has `licenseNumber`); otherwise keep current behavior or disable.

## Technical notes
- Dynamic `await import("jspdf")` and `await import("qrcode")` inside the click handler to keep them out of the SSR bundle.
- Logo embedding: import the PNG as URL, fetch → blob → base64 at click time, then `doc.addImage(...)`.
- Week math: small helper `getWeekRange(now)` returning `{start, end}` (Mon 00:00 to next Mon 00:00).
- All changes are frontend/presentation only. No schema or backend changes.
