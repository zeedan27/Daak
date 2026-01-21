# AGENTS.md — Daak (Crime Reporting & Emergency Response) Agent Instructions

You are an agent working inside the **Daak** project.
Goal: Convert the provided **TypeScript police module** into the existing **Daak Next.js App Router** project using **JavaScript (no TypeScript)**, **React**, and **global CSS**. Do NOT break desktop UI. Mobile changes must be done via media queries only.

---

## 0) Non-negotiables
- ✅ Use **Next.js App Router** structure (routes via folders + `page.js`).
- ✅ **JavaScript only** (NO `.ts`, `.tsx`, TypeScript types, interfaces).
- ✅ Any React file that uses hooks/state/events must include `"use client";`.
- ✅ Use existing Firebase utilities under `src/firebase/*` (do NOT add Firebase CDN scripts).
- ✅ Preserve desktop/tablet UI as-is. **Only change mobile** using:
  - `@media (max-width: 700px) { ... }`
- ✅ All images/logos/backgrounds must be stored in:
  - `public/assets/...`
  - and referenced as `/assets/...`
- ✅ Do not introduce CSS Modules. Do not style `body` in page CSS.

---

## 1) CSS rules (STRICT)
- Global CSS strategy:
  - `src/styles/globals.css` contains ONLY resets, fonts, variables, and neutral body styles.
  - Page/component styles must be scoped under a UNIQUE ROOT wrapper class.
- Every page must have a unique wrapper:
  - Example: `.police-page { ... }`
- Absolutely no naked selectors like:
  - `h1 {}`, `.card {}` (unless inside `.police-page ...`)
- Absolutely no `body {}` in page CSS.
- If new CSS is needed:
  - Create `src/styles/<feature>.css` and scope everything under the root wrapper class.
- Ensure the CSS file is imported via `src/app/layout.js` (NOT inside `globals.css`).

---

## 2) File placement rules (Daak project)
- Routes live here:
  - `src/app/<route>/page.js`
- Shared React components live here:
  - `src/components/...` (create if it doesn't exist)
- Styles live here:
  - `src/styles/...`
- Firebase stays here:
  - `src/firebase/firebase.js`
  - `src/firebase/auth.js`
  - (and any existing Firestore helpers you find)

---

## 3) Conversion scope: Police module (IMPORTANT)
The **TypeScript police implementation is located in a folder named**: _tsx_src_police/


This folder exists **beside** the Daak `src/` directory (NOT inside it).

You MUST:
- Read police-related files ONLY from `_tsx_src_police`
- Convert relevant `.tsx` components to **JavaScript (.js)**
- Adapt them into Daak’s **Next.js App Router structure**

---

## 4) What to convert from `_tsx_src_police`
Convert ONLY the police-related logic and UI:

- `PoliceDashboard.tsx` → Daak police dashboard page/components
- `CrimeReports.tsx` → Police crime report review panel
- `SOSMonitor.tsx` → Police SOS monitoring panel
- `CrimeHeatmap.tsx` → Police view of heatmap (reuse Daak heatmap logic if applicable)
- `Sidebar.tsx` / `MobileNav.tsx` → Police navigation adapted to Daak

DO NOT migrate:
- shadcn/ui TypeScript components
- Vite-specific configs
- Tailwind configs from `_tsx_src_police`
- Any `.ts`, `.tsx`, or utility files that only exist to support TypeScript

Rebuild minimal UI using JSX + global CSS instead.

---

## 5) Target structure inside Daak
Police features must be created inside Daak as follows:

### Routes
- `src/app/police/page.js` → Police dashboard (main entry)

(Optional if needed)
- `src/app/police/reports/page.js`
- `src/app/police/sos/page.js`
- `src/app/police/heatmap/page.js`

### Components
- `src/components/police/PoliceDashboard.js`
- `src/components/police/CrimeReportsPanel.js`
- `src/components/police/SOSMonitorPanel.js`
- `src/components/police/PoliceSidebar.js`
- `src/components/police/PoliceMobileNav.js`

### Styles
- `src/styles/police.css`
  - ALL selectors must be under `.police-page { ... }`

---

## 6) Firebase + database change policy (CRITICAL)
You do NOT have access to the Firebase console.

If new data structures are required, you MUST:
1) Assume reasonable schema in frontend code
2) Add a section titled:

   **MANUAL FIREBASE CHANGES REQUIRED**

3) Clearly list:
   - Collections to create/update
   - Fields to add
   - Indexes required
   - Security rule considerations

❌ Never claim Firebase was updated  
✅ Always instruct the user to apply changes manually

---

## 7) Authentication & authorization
- Police routes may require role-based access
- If police roles do NOT exist yet:
  - Implement UI-side checks only
  - Show “Unauthorized” state
  - List required role fields or custom claims under  
    **MANUAL FIREBASE CHANGES REQUIRED**

---

## 8) Output requirements (MANDATORY)
For every task you complete, output:
- File paths created/edited
- Full file contents (no partial snippets)
- Short explanation of what was done
- A **MANUAL FIREBASE CHANGES REQUIRED** section (if applicable)

---

## 9) Naming & wording
- Use **“create”** instead of “convert” in comments or commit messages.

---

## 10) Stop conditions
If a referenced file does not exist in Daak:
- Find the closest equivalent
- Adapt intelligently
- Do NOT ask questions unless absolutely blocked
