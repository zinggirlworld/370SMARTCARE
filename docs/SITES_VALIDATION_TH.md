# CLINIC M370 SMART CARE DASHBOARD — ตรวจรับก่อน Deploy

ตรวจวันที่ 24 ตุลาคม 2569 (Asia/Bangkok)

คำอธิบาย: ระบบข้อมูลอัจฉริยะเพื่อการติดตามและดูแลผู้ป่วยโรคเรื้อรัง

สโลแกน: “เห็นข้อมูลไว รู้ความเสี่ยงเร็ว ติดตามต่อเนื่อง”

## สถานะและความเข้ากันได้

สร้าง Sites project `appgprj_6adc281988f48191a5638465b6c7ed9b` แบบ Private เฉพาะเจ้าของ ไม่มีผู้ชมภายนอก ไม่เรียก Deploy และไม่เปิดสาธารณะ รายงานนี้เป็นส่วนหนึ่งของ source ที่จะ Save Version พร้อม static artifact เดียวกัน

SvelteKit เดิมใช้ adapter-static และ prerender อยู่แล้ว Build สร้าง `build/index.html` และ assets สำหรับ static hosting ของ Sites ได้ จึงคง Svelte 5 + TypeScript + ECharts โดยไม่ย้าย framework ไม่เพิ่ม backend ไม่เชื่อม HIS/SSB/LAN และไม่ต้องใช้ runtime secrets

Private QA Preview เปิดทดสอบผ่าน managed preview ของสภาพแวดล้อมนี้ ไม่ใช่ hosted Sites URL เครื่องมือ Save Version ไม่ได้สร้าง hosted preview URL โดยลำพัง ทุก hosted deployment URL ต้องผ่าน Deploy จึงคงสถานะไม่ Deploy ตามคำสั่งผู้ใช้ การทดสอบ hosting/access หลัง Deploy ยังไม่ได้ทำ

## สิ่งที่แก้ไข

| ไฟล์ | การแก้ไข | เหตุผล |
| --- | --- | --- |
| src/routes/+page.svelte | ระบุ `$state<Page>` และใช้ nullable-safe metric ID | แก้ TypeScript 3 diagnostics โดยคงพฤติกรรมเดิม |
| src/routes/+page.svelte | ไม่ต่อ `%` ซ้ำเมื่อ goal.label มีหน่วยแล้ว | แก้เป้าหมาย COPD แสดง `> 80%%` เป็น `> 80%` เฉพาะข้อความ |
| vite.config.ts | อนุญาต host `terminal.local` แบบระบุชื่อ | ใช้ managed preview; ไม่ใช้ allowedHosts แบบเปิดทั้งหมด |
| src/sites.css + src/routes/+layout.svelte | จัดกล่องสรุปให้ wrap และกำหนด min-width ที่ช่วง 741–1030px | แก้ Service Volume ล้นแนวนอนประมาณ 17px ที่หน้าจอ 768px |
| .openai/hosting.json | ระบุ Site ID และ static directory เป็น build | ให้ Sites ใช้ผล static export เดิม |
| package-lock.json | บันทึก dependencies ที่ติดตั้งสำเร็จ | ทำให้ติดตั้งซ้ำได้จากเวอร์ชันที่ตรวจจริง |
| scripts/verify-sites.mjs | เพิ่มการตรวจ parity, ขอบเขตเกณฑ์, null และ privacy schema | ตรวจโดยไม่แก้ไขชุดข้อมูลบนเว็บ |

ไฟล์ `src/lib/data/metrics.json`, `src/lib/dashboard.ts` และ `src/app.css` ตรงกับ ZIP ทุกไบต์ จึงคงตัวเลข นิยาม สูตรประเมิน เกณฑ์ และ Vibrant Healthcare v1.3 เดิม ไม่เพิ่มข้อมูลสมมติ ไม่เพิ่มปุ่ม CSV/พิมพ์/ป้าย Snapshot จาก Excel บน topbar

## ผลตรวจจริง

| รายการ | ผล |
| --- | --- |
| npm run verify:data | ผ่าน DM 12 / COPD 4 / Experience 2 / Service Volume 14 รายการ |
| node scripts/verify-sites.mjs | ผ่าน hash baseline, ปี พ.ศ., การตัดสินเกณฑ์, null/zero, metadata, aggregate schema และ topbar |
| npm run check | 0 errors, 3 warnings เดิม |
| Sites build helper / Vite production build | ผ่าน adapter-static เขียน build สำเร็จ |
| Overview | แสดง DM 5/12, COPD 0/3, ความพึงพอใจ 81.47%, Cycle Time 209 นาที ในปี 2569 |
| เปลี่ยนปี Overview | 2564–2569; ค่ารวม สถานะ และ labels กราฟเปลี่ยนตามปี |
| ตัวเลข DM | เทียบ DOM 12 ตัวชี้วัด × 6 ปี = 72 ค่า ตรง metrics.json |
| ตัวเลข COPD | เทียบ DOM 4 ตัวชี้วัด × 6 ปี = 24 ค่า ตรง metrics.json |
| Patient Experience | เทียบ DOM 2 ตัวชี้วัด × 6 ปี = 12 ค่า ตรง metrics.json |
| Service Volume | เทียบรหัสคลินิกและตัวเลขย้อนหลัง/VISIT/HN ครบ 14 แถว ตรง metrics.json; ไม่รวม HN ข้ามคลินิก |
| Search DM | ค้นหา “ตรวจเท้า” ได้ 1 รายการ; คำที่ไม่พบแสดง empty state |
| Charts | Donut, screening bars, service bars และ experience trends render canvas; trend modal render line/target/history; ไม่พบ chart-load failure ในกรณีทดสอบ |
| Trend Modal | ก่อนหน้า/ถัดไปเปลี่ยนรายการและ disable ปลายรายการ; ปุ่มกลับ/ปิดและ Esc ปิดได้ คืน focus และ scroll |
| Scroll restoration | Desktop ตำแหน่งเปิดซ้ำ 693px → 693px หลังปิด; Mobile 435px → 435px หลังปิด |
| Responsive | 6 หน้า × 4 ขนาด = 24/24 ผ่าน: 360×800, 390×844, 768×1024, 1440×900; ไม่ล้นทั้งหน้า ตารางและเมนูมือถือเลื่อนภายในตามเดิม |
| เมนูย่อ/ขยาย | Desktop ย่อได้; กลับ mobile แล้ว labels คืนครบ 6 เมนู |
| Missing data | getValue คืน null เมื่อไม่มีค่า; num(null) เป็น “—”; null ใน trend ยังเป็น null; 0 เดิมยังเป็น 0 |
| Privacy | runtime source ใช้ aggregate-only JSON; ไม่มี patient-record schema, HN/CID รายบุคคล, ชื่อผู้ป่วย หรือ endpoint HIS/LAN |

Service Volume คงข้อมูลเฉพาะปี 2569 และตารางย้อนหลัง 2565–2568 ตามต้นฉบับ ตัวเลือกปีจึง disabled บนหน้านี้และ Data Governance แนวโน้มย้อนหลังแสดงทุกปีตามข้อมูลเดิม ไม่ตัดให้เหลือเฉพาะปีที่เลือก

## คำเตือนและข้อจำกัดที่คงไว้

- Svelte แจ้ง accessibility warnings 3 จุด: scrollable regions ที่ใช้ tabindex=0 สองแห่ง และ autofocus ปุ่มปิด native dialog หนึ่งแห่ง คงไว้เพื่อรักษาการเลื่อนด้วยคีย์บอร์ดและ focus behavior; ไม่ถือว่าเป็นการรับรอง accessibility ครบทุกเครื่องมือ
- ECharts chunk ประมาณ 1.12 MB ก่อน gzip (~370 KB gzip) มี warning เกิน 500 KB โหลดแบบ dynamic import ตามเดิม อาจเพิ่มเวลาโหลดครั้งแรกบนเครือข่ายช้า ยังไม่ได้ทดสอบความเร็วบนเครือข่ายโรงพยาบาล
- lucide-svelte@1.0.1 มี deprecated notice ให้ย้ายไป @lucide/svelte แต่ยังติดตั้ง/build/render ได้ คง dependency เดิมเพื่อเลี่ยง migration ที่ไม่จำเป็น
- Browser QA ใช้ Chrome ในสภาพแวดล้อมทดสอบและ iframe viewport ไม่ใช่การทดสอบบน iOS/Android hardware จริง ไม่พบ console error ของแอปในขั้นตอนที่ตรวจ; มี error จาก browser extension ซึ่งไม่ใช่ origin ของแอป
- ตรวจความถูกต้องเทียบ ZIP/metrics.json ที่ผู้ใช้กำหนดเป็น Source of Truth ไม่ได้อ้างว่าตรวจ Excel ต้นทางซ้ำ เพราะไม่ได้ใช้ workbook นั้นในคำขอนี้
- ข้อจำกัดข้อมูลเดิม: ยังต้องยืนยันวันปิดงวดปี 2569, นิยามหน่วยย้อนหลัง Service Volume และ Cycle Time “≤90 นาที” ที่ต้นฉบับระบุว่าเป็นการตีความเบื้องต้น ห้ามเปลี่ยนค่าเหล่านี้โดยพลการ
- ยังไม่ตรวจ runtime บน hosted Sites และการเข้าถึงในฐานะผู้ชม เนื่องจากผู้ใช้สั่งห้าม Deploy จนกว่าจะตัดสินใจ

## หลักฐานความคงเดิม

SHA-256 metrics.json: `0dd0f82a2e6a5ec02e3affae19eb4ad051e108039115e45c8094fa53c98e3aab`

SHA-256 dashboard.ts: `46f7f90f9232b0d362d9b170fc49d15cdd068864be7ea8b11d189a65b2c799a2`

SHA-256 app.css: `fb12c2b5e5ca3863b090822f005042fc9838eece5bbc0db6995df4a078ac9485`

หน้าทดสอบ responsive ภายในเป็นไฟล์ชั่วคราว ถูกนำออกจาก build ก่อน packaging ไม่เป็นส่วนหนึ่งของ deployment artifact

## ขั้นตอนถัดไปเมื่อผู้ใช้ตัดสินใจ

ใช้ saved version ที่ส่งมอบ ไม่สร้าง Site ซ้ำ และไม่เปลี่ยน audience โดยอัตโนมัติ หากผู้ใช้เลือก Deploy ให้ยึดสิทธิ์ Private เดิมก่อน เว้นแต่ผู้ใช้ระบุ audience ใหม่อย่างชัดเจน แล้วตรวจผล deployment และการเข้าถึงตาม audience นั้น
