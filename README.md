# CLINIC M370 SMART CARE DASHBOARD

**ระบบข้อมูลอัจฉริยะเพื่อการติดตามและดูแลผู้ป่วยโรคเรื้อรัง**  
“เห็นข้อมูลไว รู้ความเสี่ยงเร็ว ติดตามต่อเนื่อง”

Candy Care healthcare analytics dashboard with vivid teal, blue, violet, pink and tangerine accents. Built with **Svelte 5 + SvelteKit 2 + TypeScript + ECharts + Lucide** and a **static-only / aggregate-only** data model.

## Features
- Responsive Thai UI, colorful rounded KPI cards, per-menu icon colors and readable white data tables
- Executive overview: DM and COPD target status, satisfaction, service cycle time
- DM (12 indicators) and COPD (4): trends, per-year status, searchable tables
- Service volume (14 clinics): **VISIT** and **unique HN within each clinic** kept separate. No cross-clinic patient total
- Experience: satisfaction and cycle-time trends
- Native JS `Intl` for formatting; years as Thai Buddhist Era (พ.ศ.)
- ECharts trend, comparison, donut and horizontal bar charts
- Trend chart modal with previous/next, Escape, focus return and preserved table scroll position
- Combined search and pass/fail filters; page and Buddhist fiscal year persisted in the URL
- No CSV or print buttons, and no Excel Snapshot badge in the top bar
- Reduced-motion support and styled chart tooltips; original values and targets remain unchanged
- Data provenance, limitations, empty/missing-value rules, no patient records
- Cycle Time threshold `≤90` is a documented interpretation of the Excel goal `90 นาที`, **not a verified original comparator**
- No backend, patient API, database credentials or scheduled refresh; chart/summary is a static Excel snapshot

## Local development (Windows CMD)

From the extracted directory, run:

```cmd
npm ci
npm run verify:data
node scripts/verify-sites.mjs
npm run check
npm run build
npm run dev
```

Open the Vite URL shown in CMD (usually http://localhost:5173).

### Project structure

```text
src/routes/+page.svelte           Dashboard UI and interactions
src/app.css                       Original Vibrant v1.3 baseline
src/candy.css                     Active Candy Care theme
src/sites.css                     Responsive and interaction improvements
src/lib/ux.ts                     Status, filters, view URL and chart labels
src/lib/chart-presentation.ts     Chart styles without changing data
src/lib/components/EChart.svelte Client-side charts
src/lib/dashboard.ts              Data model and deterministic goal evaluation
src/lib/data/metrics.json         Aggregate-only validated Excel snapshot
scripts/verify-data.mjs           Smoke checks/data invariants
svelte.config.js                  adapter-static / no backend
```

## How to update future data (ปี 2570 เป็นต้นไป)

1. Collect and validate the new Excel indicator workbook in your trusted hospital environment.
2. Export **aggregate-only** year-keyed records to `src/lib/data/metrics.json`. Keep the same JSON schema and update `metadata.snapshotDate`. Do **not** export the patient-level DM Remission file.
3. Keep numeric goal comparators exactly as defined in the validated source. Do not infer patient cohorts, SQL rules or aggregate HN across clinics.
4. Run `npm run verify:data`, `npm run check`, `npm run build`; visually compare key metrics to the Excel source.
5. Save a private preview/version in ChatGPT Sites. Publish only after hospital authorization and Site runtime compatibility verification.

## ChatGPT Sites publication

The static SvelteKit build is deployed on ChatGPT Sites. Latest design release: **Version 4 — Candy Care**.

Live Site: https://clinic-m370-smart-care.pongsakorn-j29.chatgpt.site

This repository preserves GitHub Pages support through `BASE_PATH=/370SMARTCARE`. The existing GitHub Actions workflow remains manually triggered; uploading source does not deploy a new Pages build automatically.

Validation reports: `docs/CANDY_CARE_VALIDATION_TH.md` (latest), `docs/UX_UPDATE_VALIDATION_TH.md`, `docs/PASTEL_THEME_VALIDATION_TH.md` and `docs/SITES_VALIDATION_TH.md`. Older reports and standalone previews describe historical versions.

Before publishing data updates, validate aggregate data and clinical definitions against the approved source. Keep missing values as missing.

## Privacy & release gate

This version includes only dashboard-level aggregate indicators from `ข้อมูลตัวชี้วัดโรคเรื้อรัง งบ69 ครบถ้วน.xlsx`. It excludes `ข้อมูล DM remission.xlsx` patient rows and unverified clinical remission classifications. Values 2569 are a snapshot; it is not claimed that the fiscal reporting period is officially closed. **Never publish any PHI, HN, CID, patient-level labs or hospital database credentials to Sites.** Select a private/approved viewing audience.

Reference for design and frontend approach: https://github.com/zinggirlworld/ncd-dashboard-nkp-beta. Not a copy of the NCD dataset or its clinical SQL definitions.
