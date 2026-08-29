# CLAUDE.md - Instructions for Claude Code in Mis Tarjetas

## Project Summary
- **App Name:** Mis Tarjetas (Personal Finance PWA & Local-First in MXN)
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Dexie.js (IndexedDB), Recharts, SheetJS, jsPDF.

## Commands
- Dev Server: `npx vite --host 0.0.0.0 --port 5173`
- Build: `npm run build` (`tsc -b && vite build`)

## Architecture & Code Standards
- **Strict Imports:** Use `import type { ... }` for TypeScript types (`verbatimModuleSyntax: true`).
- **UI Guidelines:** Mobile-First design, blue theme palette (`#0f172a`, `#1e3a8a`, `#2563eb`), touch-friendly buttons embedded inside cards without hover dependencies.
- **Business Rules:**
  - Income deposits allowed ONLY in liquid accounts (`debit`, `cash`, `savings`).
  - Loan amortization with manual payment marking.
  - Continuous calendar pre-population at `$0.00 MXN` for time series charts.
  - Confirmation prompt `confirm(...)` BEFORE deleting any record across all views.
  - Transactions tab renamed to "Movimientos" with view detail and edit support.
