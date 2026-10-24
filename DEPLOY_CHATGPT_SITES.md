# Deploy checklist — ChatGPT Sites (2026)

## 1. Verify locally
In Windows CMD: `npm install`, `npm run verify:data`, `npm run check`, `npm run build`, `npm run dev`.
Inspect desktop/mobile behavior and compare key KPI numbers against the approved workbook. A build succeeding does not prove clinical/business definitions.

## 2. Create a private Sites version
Go to https://chatgpt.com/sites or start ChatGPT **Work** and mention `@Sites`. Attach this project ZIP, then paste:

> Create a **website** named "CLINIC M370 SMART CARE DASHBOARD" using the attached SvelteKit/TypeScript static project as reference. First check whether this project can produce deployment artifacts supported by ChatGPT Sites. Preserve all core dashboard features, Thai Buddhist-year selector, privacy boundaries, metric definitions, data quality warnings, professional pastel healthcare UI, and responsive behavior. If the SvelteKit static artifact is unsupported, migrate only the presentation and aggregate-only JSON to a supported Sites starter. **Do not** read or upload patient-level data or connect to hospital HIS/SSB. Run compatibility/build/functionality checks, then save a private preview/version **without deploying**. Ask for my explicit deployment approval after showing the verified preview.

## 3. Validate in preview
- Header/subtitle/tagline are exact.
- FY 2569: DM HbA1c<7 = 25.48; DM eye screening = 43.12; DM foot screening = 62.45; COPD Spirometry = 35.14; satisfaction = 81.47; cycle time = 209.
- DM target count: 5/12, COPD: 0/3 (the fourth COPD number is a count with no target).
- Year selector changes all metric charts/tables; missing data are shown as missing, not zero.
- No HN/CID/patient name/individual HbA1c in data or network requests.
- VISIT and HN not summed as unique patients across clinics.
- Mobile, keyboard, CSV and print/PDF behavior.

## 4. Publish only after approval
Sites deployment has two stages: save a version, then deploy. Review and restrict audience. Check published URL as an intended viewer. Every deploy replaces the live version; preserve a saved version for rollback. Sites is for aggregate statistics only, not PHI processing.

## Official docs
- https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites
- https://learn.chatgpt.com/docs/sites
- https://learn.chatgpt.com/docs/sites/creating-a-site
