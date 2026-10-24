# CLINIC M370 | Vibrant Focus v1.3

## สิ่งที่เปลี่ยน
- เอาป้าย Snapshot จาก Excel และปุ่ม CSV/พิมพ์ บนแถบด้านบนออกตามคำขอ (และลบ handler ดาวน์โหลดในหน้านี้)
- เก็บตัวเลือกปีงบประมาณไว้
- เปลี่ยนสีหลักเป็น Emerald / Royal Blue / Violet / Coral / Orange อย่างมีลำดับชั้น โดยคงพื้นหลังอ่อนสำหรับการอ่านตาราง
- เพิ่มเน้นชัดที่ Hero, แถบเมนูที่เลือก, KPI, mini-stats, กราฟ, สถานะผ่าน/ไม่ผ่าน, รายละเอียดข้อมูล
- กราฟ Trend Modal จาก v1.2 ยังทำงานในตำแหน่งเดิม
- `dashboard.ts` เปลี่ยนเฉพาะ `palette` สำหรับ ECharts ไม่มีการเปลี่ยนการคำนวณ/เกณฑ์/ข้อมูล

## ตรวจสอบและข้อจำกัด
- `src/lib/data/metrics.json` คงเดิมแบบ byte-for-byte
- ตรวจจำนวน KPI/ข้อมูลผ่าน `npm run verify:data`
- ต้องรัน `npm run check` และ `npm run build` ในเครื่องที่ติดตั้ง dependencies สำเร็จก่อนเผยแพร่จริง
- ที่มาข้อมูลยังดูได้จากหน้า “คำอธิบายข้อมูล” และข้อความเตือนใต้ Dashboard; ป้ายด้านบนถูกเอาออกเฉพาะ UI ตาม requirement

## วิธีใช้
1. สำรองโปรเจกต์ v1.2 ของเดิม
2. แตก ZIP `OVERWRITE_ONLY` แล้วนำ `src` วางทับ root ของโปรเจกต์เดิม
3. เปิด CMD (Command Prompt) ใน root โปรเจกต์
4. รัน `npm run verify:data && npm run check && npm run build && npm run dev`
5. ตรวจปีงบประมาณ, เมนู, modal, data caveat, การแสดงผล Mobile และตัวเลข KPI
