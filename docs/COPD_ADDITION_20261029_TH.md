# เพิ่มตัวชี้วัด COPD จากภาพ 29 ต.ค. 2569

## Source และการตีความคอลัมน์

ใช้ภาพ `image(20261029-031200).png` (หัวตาราง) ร่วมกับ `image(20261029-031228).png` (แถว 28–29) ตามผู้ใช้ส่ง ไม่ได้เชื่อม HIS/SSB และไม่มีข้อมูลรายบุคคล

หัวตาราง: C=2564, D=2565, E=2566, F=2567, G=2568, H=2569, I=2570, J=2571, K=2572, L=2573, M=2574

| ตัวชี้วัด | 2564 | 2565 | 2566 | 2567 | เกณฑ์ |
|---|---:|---:|---:|---:|---|
| อัตราการกำเริบเฉียบพลันในผู้ป่วยอายุ 40 ปีขึ้นไป | 35.86 | 27.49 | 31.26 | 29.62 | <30% |
| ผู้ป่วย COPD ได้รับยา ICS/LABA, LAMA ตามข้อบ่งชี้ | 75.19 | 80.54 | 82.64 | 88.89 | ≥90% |

ค่าคอลัมน์ G:K เป็นข้อความเกณฑ์ ไม่ใช่ผลจริง จึงเก็บผลจริงปี 2568–2569 เป็น null และไม่นับผ่าน/ไม่ผ่าน ส่วนแผน 2570–2572 แสดงเป้าหมายตามภาพ ปี 2573–2574 ไม่มีค่าจึงเป็น null ไม่ขยายเป้าหมายเอง

## ขอบเขต

- COPD เพิ่มจาก 4 เป็น 6 รายการ พร้อม modal, search/filter และ overview count อัตโนมัติ
- เพิ่มตารางแผนเป้าหมาย 2570–2574 ในหน้า COPD แยกจากผลการดำเนินงาน ไม่เพิ่มปีอนาคตเข้า year selector ของผลจริง
- เก็บ provenance ใน `src/lib/data/copd-additions-source.json`
- เก็บ JSON ก่อนเพิ่มใน `scripts/fixtures/metrics-before-copd-addition.json`; assertion ตรวจ hash ต้นฉบับและ deep equality ของข้อมูลเดิมทุกส่วนหลังถอด 2 รายการใหม่
- สูตร/นิยาม/ค่าเป้าหมายเดิมใน dashboard.ts, ข้อมูลเดิม และธีม Candy Care ไม่เปลี่ยน
- คงการจัดการ accessibility warnings ที่มีอยู่ใน GitHub (keyboard scroll regions และ native dialog focus)

## Verification

- `npm run verify:data`: ผ่าน, DM12/COPD6/Experience2/Workload14
- `node scripts/verify-sites.mjs`: ผ่าน ข้อมูลเดิม, ข้อมูลใหม่ 8 ค่า, missing-vs-zero, strict <30 และ inclusive ≥90, 24 chart options และ target/outcome separation
- `npm run check`: 0 errors / 0 warnings
- Production build ผ่าน; เหลือคำเตือน ECharts chunk >500KB เดิม ไม่มี dependency เพิ่ม
- Browser: 6 หน้าบน desktop ผ่าน ไม่มี chart failure/loading ค้าง; หน้า COPD ที่ viewport 360/768/1440 ไม่ล้น root, ตารางผล 6 แถวและตารางเป้าหมาย 2 แถว
- ปี 2567: กำเริบ 29.62% ผ่าน / ยา 88.89% ไม่ผ่าน; ปี 2569 สองรายการใหม่ไม่มีข้อมูล; fail filter แสดง 3/6; ค้น ICS แสดง 1/6
- Modal แสดงประวัติจริง 4 ปีและขาด 2 ปี, next จากรายการ5ไปรายการ6และหยุดที่ท้ายได้, previous ใช้ได้; Escape คืน scrollTop 606px เท่าเดิม
- Mobile modal clientWidth=scrollWidth=327px, canvas1, busy0; ไม่พบ application-origin console error ใน log ที่ตรวจ

ข้อจำกัด: Source ใหม่เป็นภาพตาราง จึงไม่เพิ่มเติมนิยาม cohort/ตัวตั้ง/ตัวหารหรือสร้างผลปีที่ยังไม่มี การตรวจครั้งนี้ไม่ใช่การรับรองความถูกต้องของนิยามทางคลินิก
