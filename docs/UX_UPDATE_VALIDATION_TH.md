# UX/UI Update — 24 ตุลาคม 2569

อัปเดต Site เดิมโดยคง audience สาธารณะตามคำสั่งผู้ใช้ รายงานนี้อัปเดตสถานะจากรายงานตรวจรับครั้งแรกซึ่งเก็บไว้เป็นประวัติ

## การปรับครบ 6 ข้อ

1. แยก “ไม่มีข้อมูล” เมื่อค่าขาดหาย ออกจาก “ไม่มีเกณฑ์” เมื่อมีข้อมูลแต่ไม่มีเป้าหมาย ใช้ทั้งตารางและ Modal เพิ่มคำอธิบายรายการที่ไม่ใช้ประเมินผล เช่น COPD มีเกณฑ์ 3 จากทั้งหมด 4 รายการ
2. การ์ดสรุปใช้ไอคอนแจ้งเตือนเมื่อมีรายการไม่ผ่าน ไม่แสดงเครื่องหมายถูกในกรณี COPD 0/3 คงสีประจำกลุ่มและสูตรเดิม
3. Overview คงแบนเนอร์เดิม หน้ารายละเอียดใช้แบนเนอร์ย่อและซ่อนภาพตกแต่ง คงชื่อทางการ คำอธิบาย และสโลแกน
4. กราฟวงแหวนแสดงจำนวนผ่าน/จำนวนที่ประเมินได้ตรงกลาง กราฟแท่ง screening แสดงค่าผลจริงพร้อมหน่วย โดยไม่เปลี่ยนข้อมูล/เกณฑ์
5. เพิ่มตัวกรอง ทั้งหมด / ไม่ผ่านเกณฑ์ / ผ่านเกณฑ์ ทำงานร่วมกับช่องค้นหา มีจำนวนผลลัพธ์, empty state, aria-pressed และ keyboard focus; Modal เดินตามรายการที่กรองอยู่
6. URL จำหน้าและปี เช่น `?page=dm&year=2565` รองรับ reload, ลิงก์ตรง, Back/Forward และ fallback สำหรับค่าที่ไม่รองรับ

การนำทางเป็น report-view state ภายใน static route เดียว ใช้ native History API โดยเก็บ metadata ของ host ไว้ และคืน state จาก URL ผ่าน popstate ไม่มี server route หรือการเชื่อมข้อมูลภายนอกเพิ่ม

## ผลตรวจ build สุดท้าย

| รายการ | ผล |
| --- | --- |
| npm run verify:data | ผ่าน |
| node scripts/verify-sites.mjs | ผ่าน hash baseline, missing-vs-zero, goal boundaries, privacy/topbar และ UX helpers |
| npm run check | 0 errors, 3 accessibility warnings เดิม |
| Production build | ผ่าน adapter-static เขียน build สำเร็จ |
| Responsive | ผ่าน 24/24: 6 หน้า × 360/390/768/1440px; root ไม่ล้นและไม่มี chart-load failure |
| DM filters ปี 2569 | ทั้งหมด 12 / ไม่ผ่าน 7 / ผ่าน 5 |
| Search + filter | เลือกผ่านเกณฑ์แล้วค้นหา Hypoglycemia เหลือ 1 รายการ |
| COPD | รายใหม่แสดงไม่มีเกณฑ์; ตัวกรองผ่านเกณฑ์แสดง empty state |
| URL + reload | DM2565 รีโหลดแล้วยังคงหน้า/ปี ผลตัวแรก 43.76% |
| Back/Forward | COPD2565 → Back DM2565 → Back DM2569 → Forward DM2565; UI ตรง URL |
| Modal desktop + filter | 7/7 ↔ 6/7, next disabled ที่ท้าย; Esc คืน scroll 375px |
| Modal mobile + filter | 7/7 ↔ 6/7; dialog ไม่ล้น; ปิดคืน scroll 748px และ focus ปุ่มเดิม |
| Console | ไม่พบ origin-app error ใน navigation test ของ build สุดท้าย; extension errors แยกต่างหาก |

ปัญหา history API ที่พบระหว่างพัฒนาถูกแก้ก่อนการตรวจสุดท้าย ไม่ได้เผยแพร่ build ที่มีปัญหานั้น

## ข้อมูลและข้อจำกัด

- metrics.json ตรง ZIP ทุกไบต์: SHA-256 `0dd0f82a2e6a5ec02e3affae19eb4ad051e108039115e45c8094fa53c98e3aab`
- dashboard.ts และ app.css คง hash เดิม เพิ่มเฉพาะ ux.ts และ override ใน sites.css
- ไม่เพิ่มข้อมูลสมมติ ไม่เปลี่ยน missing เป็น 0 ไม่มี CSV/พิมพ์/ป้าย Snapshot บน topbar ไม่มี patient records หรือ HIS/LAN connection
- Service Volume คงปี 2569 กับตารางย้อนหลังตามต้นฉบับ แนวโน้มยังแสดงทุกปี
- คงคำเตือน ECharts chunk ใหญ่และ lucide-svelte deprecated ไม่เปลี่ยน dependencies ในงานนี้
- Responsive ตรวจผ่าน viewport ใน Chrome ไม่ใช่อุปกรณ์ iOS/Android จริง
- ตรวจเทียบ ZIP/metrics.json ไม่ใช่การยืนยัน Excel หรือ clinical definitions ใหม่ ข้อจำกัดเรื่องวันปิดงวด นิยามหน่วยย้อนหลัง และ Cycle Time คงตามหน้า Data Governance
- หน้าทดสอบ responsive เป็นไฟล์ชั่วคราวและไม่อยู่ใน deployment artifact
