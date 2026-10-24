# Pastel theme — 24 ตุลาคม 2569

ปรับตามคำขอให้เน้นความสวยงามแบบพาสเทล อ่านสบาย กราฟและไอคอนกลมกลืนกัน ใช้ Site เดิมและคง audience สาธารณะ

## สิ่งที่เปลี่ยน

- เพิ่ม pastel.css เป็น theme override หลัง CSS เดิม: แบนเนอร์มิ้นต์/ฟ้า/ลาเวนเดอร์อ่อน ตัวอักษรเข้ม เมนูเลือกพื้นอ่อน การ์ดไล่สีบาง เงาและเส้นขอบเบาลง
- คง Lucide เดิม จัดพื้นหลังไอคอนและน้ำหนักเส้นให้สม่ำเสมอ คงป้ายและสีผ่าน/ไม่ผ่านที่อ่านแยกได้
- เพิ่ม chart-presentation.ts สำหรับตกแต่งสีเส้น/แท่ง/วงแหวน เส้นกริดและ Tooltip โดยไม่แก้ dashboard.ts หรือ metrics.json
- กราฟแนวโน้มมีพื้นที่ไล่สีจาง และช่วงแกนแสดงเส้นเป้าหมายเดิมได้ แม้เป้าหมายอยู่นอกช่วงผลที่สังเกต การเปลี่ยนช่วงแกนเป็นการนำเสนอ ไม่ใช่การเปลี่ยนข้อมูลหรือเกณฑ์
- กราฟเปลี่ยนค่าอย่างนุ่มนวล มีข้อความกำลังเตรียมกราฟระหว่างโหลด และปิด animation เมื่อ prefers-reduced-motion
- ไม่เพิ่ม dependency, รูปภาพภายนอก, web font, ข้อมูลสมมติ หรือบริการข้อมูล

## ผลตรวจจริงก่อนเผยแพร่

| การตรวจ | ผล |
| --- | --- |
| verify:data | ผ่าน ข้อมูลสรุปเดิมครบทุกกลุ่ม |
| verify-sites | ผ่าน hash ของ metrics.json, dashboard.ts และ app.css เดิม ตลอดจน status/filter/URL tests เดิม |
| Chart presentation | 22 chart options คงค่า ปี เส้นเป้าหมาย null/0 และไม่ mutate input; ปิด animation เมื่อ reduced motion |
| Target visibility | ทดสอบช่วงแกนกับเป้าหมายสูงกว่าผล (ตรวจเท้า 80) และต่ำกว่าผล (acute complication 5) ผ่าน |
| TypeScript/Svelte check | 0 errors; accessibility warnings เดิม 3 รายการ |
| Production build | adapter-static เขียน build สำเร็จ |
| Responsive | 24/24 ผ่าน: 6 หน้า ที่ 360,390,768,1440px ไม่มี root overflow, chart-load error หรือ loading ค้าง |
| Overview เปลี่ยนปี | 2565 แสดง 6/12, 0/3, 80%, 193 นาที; 2568 แสดง 6/12, 0/3, 81%, 195 นาที |
| Reload shared URL | Overview2568 reload แล้วยังคงหน้าและปีเดิม |
| Modal desktop | กราฟโหลดและเลื่อนรายการได้ Esc คืน scroll 233px |
| Modal mobile | dialogWidth=scrollWidth=357px ไม่ล้น; ก่อนหน้า/ถัดไปและปิดคืน scroll 748px |
| Browser errors | ไม่พบ error ของแอปในการทดสอบสุดท้าย แยก error ของ browser extension ออก |

สีข้อมูลหลักของกราฟ mint/blue/violet/rose ตรวจคำนวณ contrast กับพื้นขาวประมาณ 3.28–3.57:1 และใช้ตัวเลข/ป้ายสีเข้มประกอบ ไม่ใช่การรับรอง accessibility ทั้งระบบ

## สิ่งที่คงเดิม

ชื่อ คำอธิบาย สโลแกน ทั้ง 6 หน้า ตัวเลือกปี ตัวกรอง การค้นหา ลิงก์จำหน้า/ปี Modal และข้อมูลสรุปทั้งหมดคงเดิม ไม่มีปุ่ม CSV/พิมพ์/ป้าย Snapshot ที่ topbar ไม่มี HN/CID หรือข้อมูลผู้ป่วยรายบุคคล และไม่มี HIS/LAN connections

SHA-256 metrics.json: `0dd0f82a2e6a5ec02e3affae19eb4ad051e108039115e45c8094fa53c98e3aab`

คงคำเตือนเดิมเรื่อง ECharts chunk ขนาดใหญ่และ lucide-svelte deprecated ตรวจ responsive ด้วย Chrome viewport ไม่ใช่มือถือจริง และยังยึดข้อจำกัดนิยามข้อมูลตามหน้า Data Governance ไม่มีการรับรอง Excel/clinical definitions ใหม่

หน้าทดสอบ responsive เป็นไฟล์ชั่วคราว ไม่อยู่ใน deployment artifact
