# CLINIC M370 SMART CARE DASHBOARD

**ระบบข้อมูลอัจฉริยะเพื่อการติดตามและดูแลผู้ป่วยโรคเรื้อรัง**  
“เห็นข้อมูลไว รู้ความเสี่ยงเร็ว ติดตามต่อเนื่อง”

Professional pastel healthcare analytics dashboard inspired by the existing NCD SvelteKit dashboard. Built with **SvelteKit 5 + TypeScript + ECharts + Lucide** and a **static-only / aggregate-only** data model.

## Features
- Responsive Thai UI, mint/sky/lavender/peach healthcare design, accessible icons and pastel KPI cards
- Executive overview: DM and COPD target status, satisfaction, service cycle time
- DM (12 indicators) and COPD (4): trends, per-year status, searchable tables
- Service volume (14 clinics): **VISIT** and **unique HN within each clinic** kept separate. No cross-clinic patient total
- Experience: satisfaction and cycle-time trends
- Native JS `Intl` for formatting; years as Thai Buddhist Era (พ.ศ.)
- ECharts trend, comparison, donut and horizontal bar charts
- UTF-8 BOM CSV export; formula injection defense when opened in Excel; print/PDF CSS
- Data provenance, limitations, empty/missing-value rules, no patient records
- Cycle Time threshold `≤90` is a documented interpretation of the Excel goal `90 นาที`, **not a verified original comparator**
- No backend, patient API, database credentials or scheduled refresh; chart/summary is a static Excel snapshot

## Local development (Windows CMD)

From the extracted directory, run:

```cmd
npm install
npm run verify:data
npm run check
npm run build
npm run dev
```

Open the Vite URL shown in CMD (usually http://localhost:5173).

### Project structure

```text
src/routes/+page.svelte           Dashboard UI and interactions
src/app.css                       Pastel design system / responsive layout
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

ChatGPT Sites can create websites and accept **compatible** local projects, but it does **not** guarantee arbitrary SvelteKit runtime support. Static adaptation is prepared here, not certified. Use **Work > @Sites** to load the project, ask for **compatibility verification**, and review/save a draft version before deploying. If Sites cannot deploy the project shape directly, ask Sites to adapt the UI and aggregate JSON to a supported static starter preserving the logic and visual behavior.

See `DEPLOY_CHATGPT_SITES.md` for detailed steps and a prompt to paste.

## Privacy & release gate

This version includes only dashboard-level aggregate indicators from `ข้อมูลตัวชี้วัดโรคเรื้อรัง งบ69 ครบถ้วน.xlsx`. It excludes `ข้อมูล DM remission.xlsx` patient rows and unverified clinical remission classifications. Values 2569 are a snapshot; it is not claimed that the fiscal reporting period is officially closed. **Never publish any PHI, HN, CID, patient-level labs or hospital database credentials to Sites.** Select a private/approved viewing audience.

Reference for design and frontend approach: https://github.com/zinggirlworld/ncd-dashboard-nkp-beta. Not a copy of the NCD dataset or its clinical SQL definitions.
