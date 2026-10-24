# CLINIC M370 SMART CARE DASHBOARD — Soft Bloom UX/UI v1.1

เวอร์ชันนี้เป็น **UX/UI visual refinement** ของ SvelteKit Starter เดิม ไม่ได้สร้างระบบใหม่และไม่ได้เปลี่ยนตัวเลข เกณฑ์ หรือการคำนวณ

## เปลี่ยนเฉพาะ 3 ไฟล์หลัก

- `src/app.css` — Soft Bloom pastel theme, typography, responsive layouts, accessible focus states, concise mobile hero, readable tables, subtle motion.
- `src/routes/+page.svelte` — UI labels/icons, KPI supplementary status and progress accessibility, navigation behavior on mobile, horizontally scrollable tables.
- `src/lib/dashboard.ts` — chart colors, legible axis/threshold labels ONLY. Metric functions (`getValue`, `isPass`, `counts`, `exportCsv`) unchanged.

## สิ่งที่ยังคงเดิม

- ทุกค่าใน `src/lib/data/metrics.json` **เหมือนต้นฉบับทุกไบต์**; ไม่แตะ Excel ต้นฉบับ
- ข้อมูลกลุ่ม DM, COPD, Experience, Workload; การแยก VISIT กับ HN; เกณฑ์ `>` `<` `≥` `≤` `=`
- หน้าต่างๆ ตาราง ค้นหา กราฟ ควบคุมปีงบประมาณ และส่งออก CSV
- ไม่เพิ่ม dependency ใด ๆ และไม่เพิ่มข้อมูล HN/CID/PHI ลงเว็บ

## วิธีวางทับ (Windows CMD)

1. **สำรองโปรเจกต์เดิม** หรือ commit การเปลี่ยนแปลงก่อน โดยเฉพาะหากปรับโค้ดเพิ่มเองภายหลัง
2. แตก `CLINIC_M370_Soft_Bloom_OVERWRITE_ONLY.zip` และคัดลอกโฟลเดอร์ `src` ภายใน ZIP ไปยัง **root ของโปรเจกต์เดิม** เลือก Replace files (จะเปลี่ยน 3 ไฟล์เท่านั้น)
3. เปิด CMD ใน root โปรเจกต์ แล้วรัน:

```cmd
npm install
npm run verify:data
npm run check
npm run build
npm run dev
```

4. เปิด URL ที่ CMD แสดง (โดยปกติ http://localhost:5173) ตรวจหน้า Overview, DM, COPD, Workload, Experience, Data governance ทั้ง Desktop และ Mobile
5. หากวางทับโปรเจกต์ก่อนหน้าที่ยังไม่ปรับแก้อะไร ใช้ `CLINIC_M370_Soft_Bloom_FULL_PROJECT.zip` แทนได้

**อย่าวาง ZIP ทับโดยไม่สำรอง หากมีการแก้ไฟล์ `+page.svelte`/`dashboard.ts` เพิ่มเองหลังจาก Starter รุ่นก่อน** เพราะจะทับการแก้ไขเหล่านั้น

## ตรวจจริงในสภาพแวดล้อมจัดทำ

- `node scripts/verify-data.mjs`: PASS (DM 12, COPD 4, Experience 2, Workload 14)
- `metrics.json`: SHA-256 ตรงกับไฟล์ใน Starter ต้นทาง (`0dd0f82a2e6a5ec02e3affae19eb4ad051e108039115e45c8094fa53c98e3aab`)
- CSS parse: PASS (289 stylesheet rules; 0 parse errors)
- Manual source diff: only styles, visible copy, access labels, mobile sidebar reset, chart palette and font sizes
- `npm run check` / `npm run build` / Svelte runtime visual QA: **ยังไม่ตรวจผ่าน** เนื่องจาก registry.npmjs.org ใช้งานไม่ได้จากสภาพแวดล้อมนี้ (`EAI_AGAIN`). กรุณารัน 2 คำสั่งนี้บนเครื่องท่านก่อนเผยแพร่
- ไฟล์ `preview/Soft_Bloom_Visual_Preview.html` เป็นตัวอย่างภาพนิ่งของหน้า Overview เพื่อดูสี/จัดวาง ไม่ใช่การ build SvelteKit; กราฟเป็นภาพประกอบเท่านั้น

## ข้อควรระวังเกี่ยวกับข้อมูล

- Cycle Time `90 นาที` จาก Excel เดิมไม่มีเครื่องหมายเปรียบเทียบที่ชัดเจน จึงระบุว่า “เป้าหมายเบื้องต้น” ไม่ใช้เป็นผลประเมินทางการจนยืนยันนิยาม
- ข้อมูลภาพรวมในเว็บเป็น snapshot จาก Excel ไม่ใช่ Real-time
- ห้ามนำ HN/CID/ชื่อผู้ป่วยหรือ DM Remission รายบุคคลขึ้นเว็บไซต์สาธารณะ
- การจะนำขึ้น ChatGPT Sites ต้องตรวจความเข้ากันได้ของ runtime, preview, สิทธิ์แชร์, และ data exposure ในสภาพแวดล้อมจริงก่อน
