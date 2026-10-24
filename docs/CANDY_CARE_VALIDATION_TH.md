# Candy Care — ตรวจสอบการปรับสีสดใส

ปรับตามคำขอให้สีฉูดฉาดและน่ารักขึ้น โดยรักษาโครงสร้างและการทำงานเดิมของเว็บไซต์

## สิ่งที่เปลี่ยน

- ใช้ `src/candy.css` แทนธีม pastel ที่ layout: แบนเนอร์ไล่สี teal–blue–violet–pink, การ์ด mint/sky/lilac/tangerine และไอคอนพื้นสีประจำเมนู
- ตัวเลขสีเข้มและพื้นตารางสีขาว รักษาป้ายสถานะผ่าน/ไม่ผ่านที่เขียนชัดเจน
- เปลี่ยนสี ECharts ให้สดขึ้นเท่านั้น คง target range, tooltip, animation/reduced-motion จากเวอร์ชันก่อน
- ไม่เพิ่ม dependency, แหล่งข้อมูล, การเชื่อมต่อ หรือข้อมูลส่วนบุคคล

## ผลตรวจ

- `npm run check`: 0 errors; 3 warnings เดิม (scroll region tabindex 2 จุดและ dialog autofocus)
- `npm run verify:data` และ `node scripts/verify-sites.mjs`: ผ่าน รวม hash ของ metrics.json, dashboard.ts และ app.css ที่ตรง ZIP, นิยาม/ค่าเป้าหมาย/ข้อมูล และ 22 chart options ไม่เปลี่ยนค่าหรือเติมศูนย์
- Production build ด้วย Sites helper และ adapter-static: ผ่าน; คำเตือนขนาด chunk ECharts เดิมยังมี
- Browser QA production build: 24/24 กรณี (6 หน้า × viewport 360, 390, 768, 1440) ไม่มี root horizontal overflow, chart error หรือ chart loading ค้าง
- ปี 2565: DM 6/12, COPD 0/3, ความพึงพอใจ 80%, Cycle Time 193 นาที ตรงข้อมูลเดิม
- ตัวกรอง DM ไม่ผ่าน: 7/12 รายการ
- Modal desktop/mobile: ปุ่มก่อนหน้า/ถัดไปใช้งานได้; mobile dialog clientWidth เท่ากับ scrollWidth 327px; Escape ปิดแล้วคืน scrollTop 776px และปุ่มต้นทางรับ focus
- ไม่พบ application-origin error ใน console ที่ตรวจ; มีข้อความจาก browser extension ซึ่งไม่ใช่แอป

การตรวจนี้เป็นการตรวจการแสดงผลและการทำงานใน browser ไม่ใช่การรับรอง accessibility ทุกเกณฑ์หรือการรับรองนิยามทางคลินิก ข้อจำกัดข้อมูลยังแสดงใน Data Governance ตามเดิม

เตรียมเผยแพร่ไปยัง Site เดิม โดยคง audience สาธารณะตามคำสั่งผู้ใช้ก่อนหน้า
