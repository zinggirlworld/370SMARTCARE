<script lang="ts">
  import { ClipboardCheck, UsersRound, HeartHandshake, Info, UserRoundMinus } from 'lucide-svelte';
  import summary from '$lib/data/dm-remission.json';
  const stopped = summary.statuses.find(s => s.id === 'stopped')!.count;
  const exited = summary.statuses.filter(s => ['lost', 'transferred'].includes(s.id)).reduce((sum, s) => sum + s.count, 0);
  const percent = (count: number) => (100 * count / summary.totalRecords).toFixed(2);
  const cards = [
    { label: 'รายการในทะเบียนทั้งหมด', value: summary.totalRecords, detail: 'ยอดตามต้นฉบับ ยังไม่หักรายการซ้ำ', theme: 'mint', icon: UsersRound },
    { label: 'รายการคงเหลือ', value: summary.remainingRecords, detail: 'ทั้งหมด − Loss FU − ย้ายการรักษา', theme: 'blue', icon: HeartHandshake },
    { label: 'หยุดยาเกิน 3 เดือน', value: stopped, detail: 'สถานะที่บันทึก ยังไม่ยืนยัน remission', theme: 'lilac', icon: ClipboardCheck },
    { label: 'Loss FU / ย้ายการรักษา', value: exited, detail: 'Loss FU 8 + ย้ายการรักษา 18 รายการ', theme: 'peach', icon: UserRoundMinus }
  ];
</script>

<section class="remission" aria-labelledby="remission-title">
  <div class="section-heading"><div><span class="section-kicker">DM REMISSION FOLLOW-UP</span><h2 id="remission-title">ติดตาม DM Remission <span class="muted">ปีงบประมาณ {summary.fiscalYear}</span></h2><p class="muted-note">ข้อมูลสรุปสถานะการติดตามจากทะเบียน • หน่วยนับ: รายการ</p></div><span class="panel-chip">ข้อมูลเฉพาะปี 2569</span></div>
  <aside class="data-notice" aria-label="ข้อควรทราบในการอ่านข้อมูล"><Info size={22}/><div><strong>สถานะหยุดยาไม่เท่ากับการยืนยัน DM Remission</strong><p>พบรหัสผู้ป่วยซ้ำ {summary.duplicateIdentifierExcess} รายการ จึงใช้ยอดตามทะเบียนและไม่ตีความยอดรวมเป็นจำนวนผู้ป่วยไม่ซ้ำ ข้อมูลชุดนี้ยังไม่ยืนยันผล remission ทางคลินิก</p></div></aside>
  <div class="kpi-grid">
    {#each cards as card}<div class={`kpi ${card.theme}`}><div class="kpi-label"><span>{card.label}</span><div class="icon-circle"><card.icon size={20}/></div></div><strong>{card.value}<span> รายการ</span></strong><p>{card.detail}</p></div>{/each}
  </div>
  <section class="panel" aria-labelledby="remission-chart-title">
    <div class="panel-heading"><div><span class="panel-badge mint-text">FOLLOW-UP STATUS</span><h3 id="remission-chart-title">สถานะการติดตาม 7 กลุ่ม</h3><p>ร้อยละของ {summary.totalRecords} รายการทั้งหมด • ทุกแถวมีสถานะเดียว</p></div></div>
    <figure aria-describedby="remission-chart-caption">
      <div class="bars" role="img" aria-label="กราฟแท่งแนวนอนสถานะการติดตาม ค่าตัวเลขทั้งหมดอยู่ในตารางสรุปด้านล่าง">
        {#each summary.statuses as status}
          <div class="bar-row"><span>{status.label}</span><div class="bar-track"><div class="bar-fill" style={`width:${percent(status.count)}%`}></div></div><strong>{status.count} <small>({percent(status.count)}%)</small></strong></div>
        {/each}
        <div class="bar-axis" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div>
      </div>
      <figcaption id="remission-chart-caption">แกนร้อยละ 0–100% ใช้ฐาน 89 รายการ ไม่ใช่อัตรา remission</figcaption>
    </figure>
  </section>
  <div class="section-heading tighter"><div><span class="section-kicker">AGGREGATE SUMMARY</span><h3>ตารางสรุปสถานะ</h3></div></div>
  <div class="table-shell"><table><caption>สถานะตามทะเบียน ปีงบประมาณ 2569 — ร้อยละคำนวณจาก 89 รายการ</caption><thead><tr><th scope="col">สถานะ</th><th scope="col">จำนวนรายการ</th><th scope="col">ร้อยละ</th></tr></thead><tbody>
    {#each summary.statuses as status}<tr><th scope="row">{status.label}</th><td class="number-cell">{status.count}</td><td class="number-cell">{percent(status.count)}%</td></tr>{/each}
  </tbody><tfoot><tr><th scope="row">รวม</th><td class="number-cell">{summary.totalRecords}</td><td class="number-cell">100.00%</td></tr></tfoot></table></div>
  <section class="panel limitations" aria-labelledby="remission-limitations"><h3 id="remission-limitations">แหล่งข้อมูลและข้อจำกัด</h3><ul>
    <li>อ้างอิงชีต “{summary.source.sheet}” ตารางสรุปแถว {summary.source.summaryRow} ตรวจยอดเทียบกับรายการต้นทางแล้ว โดยไม่แสดงข้อมูลรายบุคคล</li>
    <li>คงเหลือ 63 = 89 − Loss FU 8 − ย้ายการรักษา 18 รายการ ไม่ใช้ยอดนี้แทนจำนวนผู้ป่วยไม่ซ้ำ</li>
    <li>มีค่า HbA1c เป็นตัวเลข {summary.numericHba1cRecords} จาก {summary.totalRecords} รายการ ช่องว่างไม่ถือเป็นศูนย์หรือผลปกติ</li>
    <li>ไม่มีวันที่ตรวจ HbA1c และวันที่หยุดยาที่ใช้ตรวจสอบระยะเวลา จึงไม่คำนวณจำนวนหรืออัตรา confirmed remission</li>
    <li>ไม่ระบุวันที่ตัดยอดและยังไม่ยืนยันการปิดปีงบประมาณ 2569 ไม่มีข้อมูลย้อนหลังสำหรับหน้านี้</li>
    <li>สถานะ “ไม่มียา” และ “หยุดยา&gt;3เดือน” แสดงแยกตามต้นฉบับ ร้อยละปัดเศษสองตำแหน่ง</li>
  </ul></section>
</section>

<style>
  .remission { min-width:0; }
  .data-notice { display:flex; gap:12px; padding:18px; margin-bottom:20px; background:#fff7e8; color:#70421b; border:1px solid #ebcd9e; border-radius:18px; }
  .data-notice :global(svg) { flex-shrink:0; }
  .data-notice p { margin:6px 0 0; line-height:1.7; }
  figure { margin:0; }
  .bars { display:grid; gap:18px; padding:12px 0; }
  .bar-row { display:grid; grid-template-columns:minmax(170px,1fr) minmax(100px,2fr) 125px; align-items:center; gap:14px; font-size:14px; }
  .bar-track { height:18px; border-radius:6px; background:#e7f4f1; }
  .bar-fill { height:100%; background:#008576; border-radius:6px; }
  .bar-row strong { text-align:right; color:#25464b; }
  .bar-row small { font-size:12px; }
  .bar-axis { display:flex; justify-content:space-between; margin-left:calc((100% - 153px)/3 + 14px); margin-right:139px; font-size:12px; color:#526676; }
  figcaption { margin:12px 0; color:#526676; font-size:13px; }
  table { width:100%; min-width:0; table-layout:fixed; }
  th:first-child { width:52%; overflow-wrap:anywhere; }
  th, td { padding:14px 12px; white-space:normal; }
  caption { padding:12px; text-align:left; color:#526676; }
  tfoot { font-weight:700; background:#ecf9f5; }
  .limitations { margin-top:24px; }
  .limitations ul { padding-left:22px; line-height:1.8; color:#41596a; }
  .limitations li + li { margin-top:8px; }
  @media(max-width:740px) {
    .bar-row { grid-template-columns:minmax(0,1fr) auto; gap:8px; }
    .bar-track { grid-row:2; grid-column:1 / -1; }
    .bar-axis { margin:0; }
    th,td { padding:12px 8px; font-size:13px; }
    .data-notice { padding:14px; }
  }
</style>
