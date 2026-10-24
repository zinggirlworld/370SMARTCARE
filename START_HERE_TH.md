# เริ่มต้น CLINIC M370 SMART CARE DASHBOARD

**ชื่อที่หน่วยงานอนุมัติ:** CLINIC M370 SMART CARE DASHBOARD  
**คำอธิบาย:** ระบบข้อมูลอัจฉริยะเพื่อการติดตามและดูแลผู้ป่วยโรคเรื้อรัง  
**สโลแกน:** “เห็นข้อมูลไว รู้ความเสี่ยงเร็ว ติดตามต่อเนื่อง”

## ใน ZIP นี้มีอะไร

- SvelteKit 5 + TypeScript พร้อมไฟล์ `package.json` และ static adapter
- หน้า Dashboard แบบ responsive โทน Mint/Blue/Lavender/Peach พร้อม Lucide icons และ ECharts
- 6 เมนู: ภาพรวม / DM / COPD / ปริมาณงาน / คุณภาพบริการ / คำอธิบายข้อมูล
- ข้อมูลสรุปจากไฟล์ Excel ที่ตรวจเทียบแล้ว **192 ค่า** โดยไม่มีข้อมูลผู้ป่วยรายบุคคล
- กราฟแนวโน้ม ตารางค้นหา ตัวเลือกปี พ.ศ. ส่งออก CSV และพิมพ์รายงาน
- ไฟล์ตัวอย่าง HTML (`preview/`) จากชุด Dashboard เดิมเพื่อเปิดดูแนวทางได้ทันที แม้ยังไม่ได้ติดตั้ง Node.js
- เอกสารแนวทาง ChatGPT Sites ที่ `DEPLOY_CHATGPT_SITES.md`

## เริ่มใน Windows CMD

1. แตก ZIP ไปไว้ เช่น `D:\Projects\clinic-m370-sveltekit`
2. เปิด CMD ที่โฟลเดอร์โครงการ
3. ติดตั้ง Node.js LTS รุ่นที่เข้ากันได้ (Node 22+ สำหรับชุด dependency นี้)
4. รัน

```cmd
npm install
npm run verify:data
npm run check
npm run build
npm run dev
```

5. เปิดเว็บที่ URL ที่ CMD แสดง (โดยทั่วไป `http://localhost:5173`)

> **หมายเหตุเรื่องหลักฐาน:** ชุดไฟล์นี้ผ่านการตรวจเทียบ Excel 192 ค่าและ `node scripts/verify-data.mjs` ในสภาพแวดล้อมจัดทำ แต่ยังไม่ผ่าน `npm run check`/`npm run build` จริง เนื่องจากการติดตั้ง dependency ในสภาพแวดล้อมจัดทำไม่สำเร็จ ต้องรันทดสอบก่อนเผยแพร่

## นำเข้า ChatGPT Sites

1. เปิด ChatGPT ผ่าน **Work** แล้วระบุ `@Sites` และอัปโหลด ZIP
2. ใช้ข้อความคำสั่งใน `DEPLOY_CHATGPT_SITES.md`
3. ให้ Sites ตรวจว่าใช้งานโปรเจกต์ SvelteKit ได้หรือไม่; ถ้าไม่ ให้ปรับเป็น runtime ที่รองรับโดยรักษา UI/data rules
4. ตรวจ private preview และข้อมูลปี 2569 ก่อนเผยแพร่
5. อย่าเผยแพร่ข้อมูลผู้ป่วยรายบุคคล, DM Remission, HN, CID, secrets, หรือการเข้าถึง HIS/SSB ผ่าน Sites

ข้อมูลชุดนี้เป็น snapshot จาก Excel **ไม่ใช่ข้อมูลสด** และการแสดงผลไม่ใช่การรับรองความถูกต้องของนิยามทางคลินิก
