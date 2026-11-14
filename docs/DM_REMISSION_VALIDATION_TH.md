# DM Remission — รายงานตรวจสอบก่อนเผยแพร่

ฐานงาน: GitHub main e36bf2614ac545b10e7c0b905cb369546f183810
สถานะ: เตรียมอัปโหลดซอร์สขึ้น GitHub ตามคำขอผู้ใช้ โดยยังไม่ Deploy
GitHub Pages workflow ใช้ workflow_dispatch เท่านั้น การอัปโหลดซอร์สไม่เริ่ม deployment อัตโนมัติ

## ข้อมูลและนิยาม

ใช้ไฟล์ Excel ที่ผู้ใช้แนบ ชีต สรุปงบ 69 โดยส่งออกเฉพาะ Aggregate JSON
ZIP 370dashboard เป็นซอร์สเก่า ไม่มีแพ็กเกจ DM Remission Ready For Codex จึงยึด main ล่าสุดตามคำขอ
ไม่ได้ใช้คำสั่ง overwrite ในเอกสาร ZIP เพื่อเขียนทับโครงการปัจจุบัน

- รายการต้นทางแถว 2–90: 89 รายการ ลำดับ 1–89 ครบ ทุกแถวมีสถานะเดียว
- สถานะ: หยุดยา >3 เดือน 8, ยาขนาดเท่าเดิม 34, ไม่มียา 2, ลดยา 13, เพิ่มยา 6, Loss FU 8, ย้ายรักษา 18
- คงเหลือ 63 = 89 − 8 − 18; เทียบผลรวมทั้งแถว 91 และตารางสรุปแถว 99 แล้ว
- HN ไม่ซ้ำ 88 ค่า มีรายการส่วนเกินจากการซ้ำ 1 รายการ ไม่ปรับยอดต้นฉบับเอง ใช้หน่วย “รายการ”
- HbA1c เป็นตัวเลข 63 รายการ ช่องว่าง 26 รายการ ไม่แทนช่องว่างด้วยศูนย์
- ไม่มีวันที่ตรวจ/วันที่หยุดยาเพียงพอให้ยืนยัน remission; confirmedRemissionRecords เป็น null ไม่ใช่ 0
- ปีงบประมาณ 2569 ตามต้นทาง ไม่มีวันที่ตัดยอดและไม่ยืนยันการปิดปี
- กราฟและตารางใช้ฐาน 89 รายการ ร้อยละสองตำแหน่ง ไม่ใช่อัตรา remission

## ไฟล์

เพิ่ม src/lib/data/dm-remission.json — เฉพาะยอดรวมและ metadata ที่อนุญาต
เพิ่ม src/lib/components/DMRemission.svelte — KPI 4 ใบ, horizontal bars, ตาราง, ข้อจำกัด
แก้ src/routes/+page.svelte — เพิ่มเมนู/หน้าและแสดงปี 2569 สำหรับหน้านี้
แก้ src/lib/ux.ts — เพิ่มชนิดหน้าและรองรับ URL remission โดยไม่เปลี่ยนการคำนวณเดิม
เพิ่ม scripts/aggregate-dm-remission.py — ส่งออก/ตรวจเทียบ workbook ภายนอก (ต้องมี openpyxl)
เพิ่ม scripts/verify-remission.mjs — ตรวจ schema, ยอด, null, ปีและ navigation
แก้ package.json — เพิ่มคำสั่ง verify และ verify-sites
แก้ .github/workflows/deploy-pages.yml — รัน verify และ verify-sites ก่อน build โดยคงการเริ่ม deployment แบบ manual
เพิ่ม docs/DM_REMISSION_VALIDATION_TH.md — รายงานนี้

## ผลที่รันจริง

- npm run verify: PASS ทั้งข้อมูลเดิมและ remission
- npm run verify-sites: PASS ข้อมูล, business logic, 24 chart cases และ regression เดิม
- npm run check: 0 errors, 0 warnings
- npm run build: PASS สร้าง static build; มีคำเตือน chunk >500 kB เช่นเดียวกับฐานเดิม
- python scripts/aggregate-dm-remission.py <external.xlsx> --check: PASS เทียบ aggregate กับ workbook
- BASE_PATH=/370SMARTCARE npm run build: PASS; ตรวจ assets base, relative resource paths และเมนูใน compiled bundle แล้ว
- git diff --check: PASS
- ตรวจ HN จากต้นทางกับ src และ build: ไม่พบ identifier จากต้นทาง ไม่พบ Excel ใน build
- dashboard.ts, metrics.json, copd-additions-source.json, app.css, candy.css, sites.css, chart-presentation.ts และ EChart.svelte เทียบกับ main แบบ byte-for-byte: เหมือนเดิม

## Responsive และ Accessibility

หน้าใหม่ใช้ kpi-grid เดิมและ breakpoint 740px; กราฟย้ายแท่งลงเต็มแถวบนมือถือ
ตารางใช้ fixed layout, หัวแถว/คอลัมน์มี scope, มี caption, มีตัวเลขแทนข้อมูลกราฟ
คำเตือนข้อมูลมีข้อความและหัวข้อ ไม่สื่อด้วยสีอย่างเดียว กราฟใหม่ไม่มี animation
Svelte accessibility diagnostics ผ่าน แต่ยังไม่ใช่การรับรอง accessibility ครบทุกข้อ

ยังไม่ได้ตรวจ runtime browser: เซสชันไม่มี cua_repl.js ตาม workflow ของ Sites จึงไม่ได้เปิด preview หรือใช้ browser ทางอื่นแทน
ต้องตรวจ 360/390/768/1440px, zoom 200%, keyboard navigation, sidebar collapse, Back/Forward และ screen reader ก่อน release

## Release gate

ห้าม Deploy: ยังรอ browser QA และการอนุญาตเผยแพร่ข้อมูลสรุปจากหน่วยงานตามคำขอผู้ใช้
ไม่เก็บ Excel รายบุคคลหรือ HN ใน repository/build; การอัปโหลดซอร์สและ aggregate ขึ้น GitHub เป็นไปตามคำขอผู้ใช้ครั้งล่าสุด โดยยังไม่สั่งเผยแพร่ GitHub Pages
