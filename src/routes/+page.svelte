<script lang="ts">
  import { onMount, tick } from 'svelte';
  import {
    LayoutDashboard, HeartPulse, Wind, Stethoscope, Sparkles, BookOpenText, CalendarDays,
    ShieldCheck, ArrowUpRight, Activity, CheckCircle2, AlertCircle,
    Search, TrendingUp, UsersRound, Clock3, ChevronRight, Info, ClipboardCheck, HeartHandshake,
    Eye, Footprints, Smile, ChartNoAxesCombined, Database, House, PanelLeftClose, PanelLeftOpen, X, ChevronLeft
  } from 'lucide-svelte';
  import EChart from '$lib/components/EChart.svelte';
  import {
    data, years, latestYear, counts, getValue, isPass, num,
    trendOption, coverageOption, donutOption, workloadOption,
    type Metric, type Page
  } from '$lib/dashboard';

  type Nav = { page: Page; title: string; kicker: string };
  const nav: Nav[] = [
    { page:'overview', title:'ภาพรวมผู้บริหาร', kicker:'Overview' },
    { page:'dm', title:'เบาหวาน (DM)', kicker:'Diabetes' },
    { page:'copd', title:'โรคปอด COPD', kicker:'Respiratory' },
    { page:'workload', title:'ปริมาณงานบริการ', kicker:'Service volume' },
    { page:'experience', title:'คุณภาพบริการ', kicker:'Experience' },
    { page:'method', title:'คำอธิบายข้อมูล', kicker:'Data governance' }
  ];
  const highlightDM = [data.dm[1], data.dm[5], data.dm[6], data.dm[8]];
  let page: Page = $state('overview');
  let year = $state(latestYear);
  let search = $state('');
  let modalMetric = $state<Metric | null>(null);
  let trendDialog: HTMLDialogElement;
  let modalTrigger: HTMLButtonElement | null = null;
  let originalPageOverflow = '';
  let compactNav = $state(false);

  let dmStatus = $derived(counts(data.dm, year));
  let copdStatus = $derived(counts(data.copd, year));
  let groupRows = $derived(page==='copd'?data.copd:page==='experience'?data.experience:data.dm);
  let filteredRows = $derived(groupRows.filter((m) => m.name.toLocaleLowerCase('th').includes(search.toLocaleLowerCase('th'))));
  let modalIndex = $derived(modalMetric ? filteredRows.findIndex((m) => m.id === modalMetric.id) : -1);
  let currentNav = $derived(nav.find((n)=>n.page===page) ?? nav[0]);

  // Responsive navigation: a desktop-collapsed sidebar must never hide mobile labels.
  onMount(() => {
    const mobile = window.matchMedia('(max-width: 740px)');
    const resetMobileNav = () => { if (mobile.matches) compactNav = false; };
    resetMobileNav();
    mobile.addEventListener('change', resetMobileNav);
    return () => mobile.removeEventListener('change', resetMobileNav);
  });

  function go(next: Page) {
    page = next;
    search = '';
    if (typeof window !== 'undefined') window.scrollTo({top:0,behavior:'auto'});
  }
  // Native dialog preserves the table's scroll position and traps keyboard focus.
  async function openTrend(metric: Metric, trigger: HTMLButtonElement) {
    modalTrigger = trigger;
    modalMetric = metric;
    await tick(); // render chart container before opening the dialog
    if (!trendDialog || trendDialog.open) return;
    originalPageOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    trendDialog.showModal();
  }
  function closeTrend() {
    if (trendDialog?.open) trendDialog.close();
  }
  function handleTrendClosed() {
    document.body.style.overflow = originalPageOverflow;
    modalMetric = null;
    // The original button may be inside a horizontally scrollable table.
    // preventScroll ensures closing never jumps away from the current row.
    modalTrigger?.focus({ preventScroll: true });
    modalTrigger = null;
  }
  function stepTrend(direction: -1 | 1) {
    const next = modalIndex + direction;
    if (next < 0 || next >= filteredRows.length) return;
    modalMetric = filteredRows[next];
    if (trendDialog) trendDialog.scrollTop = 0;
  }
  function statusLabelFromMetric(m: Metric) {
    const passed = isPass(m, year);
    return passed === null ? 'ไม่มีเกณฑ์/ข้อมูล' : passed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์';
  }
  function goalText(m: Metric) { return m.goal ? `${m.goal.label}${m.unit==='%'?'%':m.unit==='นาที'?' นาที':''}` : 'ไม่กำหนด'; }
  function showCurrent(m: Metric) { return `${num(getValue(m,year))}${getValue(m,year)===null?'':m.unit==='%'?'%':` ${m.unit}`}`; }
</script>

<svelte:head>
  <title>CLINIC M370 SMART CARE DASHBOARD | Nakornping Hospital</title>
  <meta name="description" content="ระบบข้อมูลอัจฉริยะเพื่อการติดตามและดูแลผู้ป่วยโรคเรื้อรัง — Dashboard สรุปตัวชี้วัด DM, COPD และคุณภาพบริการ" />
</svelte:head>

<div class:nav-collapsed={compactNav} class="app-shell">
  <aside class="side" aria-label="เมนูหลัก">
    <div class="brand">
      <div class="brand-icon"><HeartPulse size={27} strokeWidth={2.1} /><span class="brand-spark" aria-hidden="true">✦</span></div>
      {#if !compactNav}
        <div class="brand-text"><strong>CLINIC M370</strong><span>SMART CARE</span></div>
      {/if}
    </div>
    {#if !compactNav}<p class="nav-caption">EXPLORE DASHBOARD</p>{/if}
    <nav class="nav-links" aria-label="หมวดรายงาน">
      {#each nav as item (item.page)}
        <button class:active={page===item.page} aria-current={page===item.page?'page':undefined} onclick={()=>go(item.page)} title={item.title}>
          <span class="nav-icon">
            {#if item.page==='overview'}<LayoutDashboard size={19}/>
            {:else if item.page==='dm'}<HeartPulse size={19}/>
            {:else if item.page==='copd'}<Wind size={19}/>
            {:else if item.page==='workload'}<Stethoscope size={19}/>
            {:else if item.page==='experience'}<HeartHandshake size={19}/>
            {:else}<BookOpenText size={19}/>{/if}
          </span>
          {#if !compactNav}<span class="nav-text"><strong>{item.title}</strong><small>{item.kicker}</small></span><ChevronRight size={16} class="nav-chevron"/>{/if}
        </button>
      {/each}
    </nav>
    {#if !compactNav}
      <div class="side-bottom"><ShieldCheck size={20}/><div><strong>Aggregate data only</strong><span>ข้อมูลสรุป ไม่ใช่ข้อมูลผู้ป่วยรายบุคคล</span></div></div>
    {/if}
    <button class="collapse-button" title={compactNav?'ขยายเมนู':'ย่อเมนู'} aria-label={compactNav?'ขยายเมนู':'ย่อเมนู'} onclick={()=>compactNav=!compactNav}>
      {#if compactNav}<PanelLeftOpen size={17}/>{:else}<PanelLeftClose size={17}/>{/if}
    </button>
  </aside>

  <main class="main">
    <header class="topbar">
      <div class="crumb"><House size={15}/><span>Smart Care</span><ChevronRight size={13}/><strong>{currentNav.title}</strong></div>
      <div class="top-actions">
        <label class="year-control"><CalendarDays size={16}/><span>ปีงบประมาณ</span>
          <select aria-label="เลือกปีงบประมาณ" disabled={page==='workload'||page==='method'} value={year} onchange={(e)=>year=Number(e.currentTarget.value)}>
            {#each years as y}<option value={y}>{y}</option>{/each}
          </select>
        </label>
      </div>
    </header>

    <section class="hero" aria-label="ชื่อแดชบอร์ด">
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-dot"></span>HEALTHCARE INSIGHTS <span class="eyebrow-sep">✦</span> MADE WITH CARE</div>
        <h1>CLINIC M370 <span>SMART CARE</span> DASHBOARD</h1>
        <p class="hero-subtitle">{data.metadata.subtitle}</p>
        <p class="hero-tagline"><Sparkles size={17}/> “{data.metadata.tagline}”</p>
      </div>
      <div class="hero-art" aria-hidden="true"><div class="hero-circle circle1"></div><div class="hero-circle circle2"></div><div class="hero-emblem"><HeartPulse size={65} strokeWidth={1.6}/></div><span class="floating-plus plus1">✦</span><span class="floating-plus plus2">✦</span><span class="hero-mini-badge"><ShieldCheck size={18}/></span><span class="hero-mini-heart">♥</span></div>
    </section>

    {#if page==='overview'}
      <div class="section-heading"><div><span class="section-kicker">EXECUTIVE SNAPSHOT</span><h2>ภาพรวมผลดำเนินงาน <span class="muted">พ.ศ. {year}</span></h2></div><span class="section-context">เทียบเกณฑ์ที่กำหนดใน Excel ต้นทาง</span></div>
      <div class="kpi-grid">
        <div class="kpi mint"><div class="kpi-label"><span>ผ่านเกณฑ์ DM</span><div class="icon-circle"><HeartPulse size={20}/></div></div><strong>{dmStatus.pass}<span>/{dmStatus.pass+dmStatus.fail}</span></strong><p>ตัวชี้วัดที่มีเกณฑ์ประเมิน</p><div class="mini-meter" role="progressbar" aria-label="สัดส่วนตัวชี้วัด DM ที่ผ่านเกณฑ์" aria-valuemin="0" aria-valuemax="100" aria-valuenow={(dmStatus.pass/Math.max(1,dmStatus.pass+dmStatus.fail))*100}><b style={`width:${(dmStatus.pass/Math.max(1,dmStatus.pass+dmStatus.fail))*100}%`}></b></div><div class="kpi-foot kpi-summary"><CheckCircle2 size={16}/> ผ่าน {dmStatus.pass} <span class="kpi-divider">•</span> ไม่ผ่าน {dmStatus.fail}</div></div>
        <div class="kpi blue"><div class="kpi-label"><span>ผ่านเกณฑ์ COPD</span><div class="icon-circle"><Wind size={20}/></div></div><strong>{copdStatus.pass}<span>/{copdStatus.pass+copdStatus.fail}</span></strong><p>ตัวชี้วัดที่มีเกณฑ์ประเมิน</p><div class="mini-meter" role="progressbar" aria-label="สัดส่วนตัวชี้วัด COPD ที่ผ่านเกณฑ์" aria-valuemin="0" aria-valuemax="100" aria-valuenow={(copdStatus.pass/Math.max(1,copdStatus.pass+copdStatus.fail))*100}><b style={`width:${(copdStatus.pass/Math.max(1,copdStatus.pass+copdStatus.fail))*100}%`}></b></div><div class="kpi-foot kpi-summary"><CheckCircle2 size={16}/> ผ่าน {copdStatus.pass} <span class="kpi-divider">•</span> ไม่ผ่าน {copdStatus.fail}</div></div>
        <div class="kpi lilac"><div class="kpi-label"><span>ความพึงพอใจ</span><div class="icon-circle"><Smile size={21}/></div></div><strong>{num(getValue(data.experience[0],year))}<span>%</span></strong><p>เป้าหมาย ≥ 80%</p><div class={`kpi-foot ${isPass(data.experience[0],year) === true ? 'is-positive' : isPass(data.experience[0],year) === false ? 'is-negative' : ''}`}>{#if isPass(data.experience[0],year)===true}<CheckCircle2 size={16}/> ผ่านเกณฑ์{:else}<AlertCircle size={14}/> {getValue(data.experience[0],year)===null?'ไม่มีข้อมูล':'ยังไม่ผ่านเกณฑ์'}{/if}</div></div>
        <div class="kpi peach"><div class="kpi-label"><span>ระยะเวลารับบริการ</span><div class="icon-circle"><Clock3 size={21}/></div></div><strong>{num(getValue(data.experience[1],year),0)}<span> นาที</span></strong><p>Cycle Time • เป้าหมาย 90 นาที</p><div class={`kpi-foot ${isPass(data.experience[1],year) === true ? 'is-positive' : isPass(data.experience[1],year) === false ? 'is-negative' : ''}`}>{#if getValue(data.experience[1],year)===null}<Info size={16}/> ไม่มีข้อมูล{:else if isPass(data.experience[1],year)===true}<CheckCircle2 size={16}/> เข้าเกณฑ์เบื้องต้น{:else}<AlertCircle size={16}/> มากกว่าเป้าหมายเบื้องต้น{/if}</div></div>
      </div>
      <div class="chart-grid">
        <section class="panel"><div class="panel-heading"><div><span class="panel-badge mint-text">01 / PERFORMANCE</span><h3>สถานะตัวชี้วัดเบาหวาน</h3><p>ผ่าน/ไม่ผ่าน ตามเกณฑ์จาก Excel</p></div><span class="panel-chip">ปี {year}</span></div><EChart option={donutOption(data.dm,year)} label={`สัดส่วนผลตัวชี้วัด DM ปี ${year}`} height={280}/></section>
        <section class="panel"><div class="panel-heading"><div><span class="panel-badge violet-text">02 / SCREENING</span><h3>ผลลัพธ์เทียบเป้าหมาย</h3><p>การติดตามและคัดกรองผู้ป่วยเบาหวาน</p></div><span class="panel-chip">%</span></div><EChart option={coverageOption(highlightDM,year)} label={`การคัดกรองเบาหวานเทียบเป้าหมาย ปี ${year}`} height={280}/></section>
      </div>
      <div class="section-heading tighter"><div><span class="section-kicker">FOCUS AREAS</span><h2>เจาะลึกตามกลุ่มงาน</h2></div></div>
      <div class="quick-grid">
        <button class="quick-card mint" onclick={()=>go('dm')}><span class="quick-icon"><HeartPulse size={22}/></span><strong>เบาหวาน (DM)</strong><span>12 ตัวชี้วัด • ผลลัพธ์และภาวะแทรกซ้อน</span><em class="quick-cta">ดูรายละเอียด <ChevronRight size={14}/></em><ArrowUpRight size={18}/></button>
        <button class="quick-card blue" onclick={()=>go('copd')}><span class="quick-icon"><Wind size={22}/></span><strong>โรคปอด COPD</strong><span>4 ตัวชี้วัด • ตรวจสมรรถภาพปอดและวัคซีน</span><em class="quick-cta">ดูรายละเอียด <ChevronRight size={14}/></em><ArrowUpRight size={18}/></button>
        <button class="quick-card lilac" onclick={()=>go('workload')}><span class="quick-icon"><Stethoscope size={22}/></span><strong>ปริมาณงานบริการ</strong><span>14 คลินิก/บริการ • VISIT และ HN แยกหน่วย</span><em class="quick-cta">ดูรายละเอียด <ChevronRight size={14}/></em><ArrowUpRight size={18}/></button>
        <button class="quick-card peach" onclick={()=>go('experience')}><span class="quick-icon"><HeartHandshake size={22}/></span><strong>คุณภาพบริการ</strong><span>ความพึงพอใจและ Cycle Time</span><em class="quick-cta">ดูรายละเอียด <ChevronRight size={14}/></em><ArrowUpRight size={18}/></button>
      </div>
    {:else if page==='dm'||page==='copd'}
      <div class="section-heading"><div><span class="section-kicker">QUALITY INDICATORS</span><h2>{page==='dm'?'ตัวชี้วัดโรคเบาหวาน':'ตัวชี้วัดโรคปอดอุดกั้นเรื้อรัง'} <span class="muted">พ.ศ. {year}</span></h2></div><span class="section-context">ผลรวมการประเมินตามเกณฑ์ต้นทาง</span></div>
      <div class="mini-stats">
        <div class="mini-stat"><CheckCircle2 size={19}/><div><strong>{counts(groupRows,year).pass}</strong><span>ผ่านเกณฑ์</span></div></div>
        <div class="mini-stat warning"><AlertCircle size={19}/><div><strong>{counts(groupRows,year).fail}</strong><span>ไม่ผ่านเกณฑ์</span></div></div>
        <div class="mini-stat neutral"><ClipboardCheck size={19}/><div><strong>{groupRows.length}</strong><span>ตัวชี้วัดทั้งหมด</span></div></div>
      </div>
      
      <div class="section-heading tighter"><div><span class="section-kicker">DATA TABLE</span><h2>รายละเอียดตัวชี้วัด</h2><p class="muted-note">กด “เปิดกราฟ” ของแต่ละรายการเพื่อดูแนวโน้มทันที • เกณฑ์ “&gt;” และ “&lt;” ยึดตาม Excel เดิม</p></div><label class="searchbox"><Search size={17}/><input aria-label="ค้นหาตัวชี้วัด" placeholder="ค้นหาตัวชี้วัด..." bind:value={search}/></label></div>
      <div class="table-shell" role="region" aria-label="ตารางตัวชี้วัด เลื่อนแนวนอนได้" tabindex="0"><table><thead><tr><th>ตัวชี้วัด</th><th>เป้าหมาย</th><th>ผลปี {year}</th><th>สถานะ</th><th>แนวโน้ม</th></tr></thead><tbody>
        {#each filteredRows as m (m.id)}
          <tr><td class="name-cell">{m.name}</td><td class="goal-cell">{goalText(m)}</td><td class="number-cell">{showCurrent(m)}</td><td><span class:is-pass={isPass(m,year)===true} class:is-fail={isPass(m,year)===false} class="status-chip">{statusLabelFromMetric(m)}</span></td><td><button type="button" class="trend-button" onclick={(event)=>openTrend(m, event.currentTarget)} aria-haspopup="dialog" aria-label={`เปิดกราฟแนวโน้มย้อนหลังของ ${m.name}`}><TrendingUp size={16}/> เปิดกราฟ</button></td></tr>
        {/each}
      </tbody></table>{#if filteredRows.length===0}<p class="empty-state">ไม่พบตัวชี้วัดที่ค้นหา</p>{/if}</div>
    {:else if page==='workload'}
      <div class="section-heading"><div><span class="section-kicker">SERVICE VOLUME</span><h2>ปริมาณงานบริการ <span class="muted">ปี 2569</span></h2><p class="muted-note">แสดง VISIT และ HN เป็นคนละหน่วย • ห้ามนำผลรวม HN ข้ามคลินิกไปแทนจำนวนผู้ป่วยไม่ซ้ำ</p></div></div>
      <div class="mini-stats"><div class="mini-stat"><Stethoscope size={19}/><div><strong>{data.workload.length}</strong><span>คลินิก/บริการ</span></div></div><div class="mini-stat"><ChartNoAxesCombined size={19}/><div><strong>{num(Math.max(...data.workload.map(x=>x.visits2569??0)),0)}</strong><span>VISIT สูงสุดของคลินิกหนึ่ง</span></div></div><div class="mini-stat neutral"><UsersRound size={19}/><div><strong>HN</strong><span>จำนวนไม่ซ้ำภายในแต่ละคลินิก</span></div></div></div>
      <section class="panel"><div class="panel-heading"><div><span class="panel-badge mint-text">VISITS VS. UNIQUE HN</span><h3>คลินิกที่มีผู้รับบริการสูงสุด</h3><p>เปรียบเทียบ VISIT กับ HN แยกตามคลินิกในปี 2569</p></div><span class="panel-chip">TOP 8</span></div><EChart option={workloadOption(data.workload)} label="กราฟปริมาณ VISIT และ HN แยกตามคลินิก" height={410}/></section>
      <div class="section-heading tighter"><div><span class="section-kicker">ACTIVITY BREAKDOWN</span><h2>ข้อมูลแยกคลินิก</h2><p class="muted-note">ข้อมูลปี 2565–2568 แสดงตามต้นฉบับ แต่ยังไม่ยืนยันว่าใช้หน่วย VISIT เหมือนปี 2569</p></div></div>
      <div class="table-shell" role="region" aria-label="ตารางข้อมูลบริการแยกคลินิก เลื่อนแนวนอนได้" tabindex="0"><table class="volume-table"><thead><tr><th>คลินิก</th><th>รหัส</th>{#each [2565,2566,2567,2568] as y}<th>{y}</th>{/each}<th>2569 VISIT</th><th>2569 HN</th></tr></thead><tbody>
        {#each data.workload as item (item.code)}<tr><td class="name-cell">{item.name}</td><td>{item.code}</td>{#each [2565,2566,2567,2568] as y}<td class="number-cell">{num(item.historical[String(y)],0)}</td>{/each}<td class="number-cell">{num(item.visits2569,0)}</td><td class="number-cell">{num(item.uniqueHn2569,0)}</td></tr>{/each}
      </tbody></table></div>
    {:else if page==='experience'}
      <div class="section-heading"><div><span class="section-kicker">PATIENT EXPERIENCE</span><h2>คุณภาพและประสบการณ์บริการ <span class="muted">พ.ศ. {year}</span></h2></div></div>
      <div class="kpi-grid experience-kpis"><div class="kpi mint"><div class="kpi-label"><span>ความพึงพอใจ</span><div class="icon-circle"><Smile size={21}/></div></div><strong>{num(getValue(data.experience[0],year))}<span>%</span></strong><p>เป้าหมาย ≥ 80%</p></div><div class="kpi peach"><div class="kpi-label"><span>Cycle Time</span><div class="icon-circle"><Clock3 size={21}/></div></div><strong>{num(getValue(data.experience[1],year),0)}<span> นาที</span></strong><p>เป้าหมาย 90 นาที</p></div></div>
      <div class="chart-grid"><section class="panel"><div class="panel-heading"><div><span class="panel-badge mint-text">SATISFACTION</span><h3>แนวโน้มความพึงพอใจ</h3><p>หน่วยร้อยละ • ยิ่งสูงยิ่งดี</p></div></div><EChart option={trendOption(data.experience[0])} label="แนวโน้มความพึงพอใจ" height={290}/></section><section class="panel"><div class="panel-heading"><div><span class="panel-badge violet-text">CYCLE TIME</span><h3>แนวโน้มระยะเวลาบริการ</h3><p>หน่วยนาที • ยิ่งต่ำยิ่งดี</p></div></div><EChart option={trendOption(data.experience[1])} label="แนวโน้ม Cycle Time" height={290}/></section></div>
      <div class="info-note"><Info size={19}/><p>Cycle Time ใน Excel ระบุเป้าหมายเพียง 90 นาที ไม่มีเครื่องหมายเปรียบเทียบ จึงตีความเบื้องต้นว่า “ไม่เกิน 90 นาที” และต้องยืนยันนิยามจุดเริ่มต้น/สิ้นสุดและเกณฑ์การผ่านก่อนใช้ตัดสินผลทางการ</p></div>
    {:else}
      <div class="section-heading"><div><span class="section-kicker">DATA GOVERNANCE</span><h2>ที่มา นิยาม และข้อจำกัดของข้อมูล</h2></div></div>
      <div class="method-grid">
        <article class="method-card"><div class="method-icon mint"><Database size={23}/></div><h3>แหล่งข้อมูล</h3><p>ข้อมูลจาก Excel ที่หน่วยงานจัดส่ง: <strong>{data.metadata.source}</strong> ใช้เป็นภาพรวมตามช่วงปีในไฟล์ ไม่ใช่การดึงสดจาก HIS</p></article>
        <article class="method-card"><div class="method-icon blue"><ClipboardCheck size={23}/></div><h3>กติกาประเมินเกณฑ์</h3><p>เปรียบเทียบตามเครื่องหมาย &gt;, &lt;, ≥, ≤ และ = ที่กำหนดไว้จริง ไม่ปัดเศษก่อนตัดสินสถานะ ตัวชี้วัดไม่มีเกณฑ์แยกเป็น “ไม่มีเกณฑ์”</p></article>
        <article class="method-card"><div class="method-icon lilac"><ShieldCheck size={23}/></div><h3>ความเป็นส่วนตัว</h3><p>เวอร์ชันเว็บไซต์ใช้เฉพาะสถิติสรุป ไม่บรรจุชื่อ HN, CID, วันเกิด หรือผลตรวจผู้ป่วยรายบุคคล และไม่เชื่อมต่อฐานข้อมูลโรงพยาบาล</p></article>
        <article class="method-card"><div class="method-icon peach"><CalendarDays size={23}/></div><h3>ปีงบประมาณและการอัปเดต</h3><p>แสดงปี พ.ศ. ตามที่ปรากฏในไฟล์ Excel แหล่งข้อมูลยังไม่มีวันปิดงวดแน่ชัด ต้องตรวจสอบก่อนเรียกข้อมูลปี 2569 ว่าเป็นข้อมูลครบปี</p></article>
      </div>
      <div class="info-note caution"><AlertCircle size={20}/><div><strong>DM Remission ยังไม่รวมในข้อมูลเผยแพร่</strong><p>ไฟล์ DM Remission เป็นข้อมูลระดับรายบุคคลและยังต้องตรวจสอบข้อมูลซ้ำ นิยามทางคลินิก และการเปิดเผยกลุ่มย่อย จึงไม่นำข้อมูลชุดนั้นเข้าสู่ ChatGPT Sites ฉบับนี้</p></div></div>
      <div class="info-note"><Info size={19}/><p>ข้อมูลย้อนหลังปี 2565–2568 ในชีตปริมาณงานยังไม่มีคำยืนยันชัดเจนว่าหน่วยนับตรงกับ VISIT ในปี 2569 และ HN นับไม่ซ้ำภายในคลินิก ไม่ใช่จำนวนผู้ป่วยไม่ซ้ำข้ามคลินิก</p></div>
    {/if}

    {#if page !== 'method'}
      <div class="data-caveat"><Info size={18}/><div><strong>เกี่ยวกับข้อมูล</strong><span>นี่คือข้อมูลสรุปจาก Excel ไม่ใช่ข้อมูล real-time และไม่ได้ใช้เพื่อการวินิจฉัยผู้ป่วยรายบุคคล รายละเอียดเกณฑ์และข้อจำกัดอยู่ในหน้า <button onclick={()=>go('method')}>คำอธิบายข้อมูล <ArrowUpRight size={13}/></button></span></div></div>
    {/if}
    <footer><span>© 2569 CLINIC M370 SMART CARE DASHBOARD</span><span><HeartPulse size={14}/> Made with care • ข้อมูลสรุปเท่านั้น</span></footer>
  </main>
</div>



<!-- Native dialog: keeps original table position; Esc & explicit close supported. -->
<dialog
  bind:this={trendDialog}
  class="trend-dialog"
  aria-labelledby="trend-dialog-heading"
  aria-describedby="trend-dialog-caption"
  onclose={handleTrendClosed}
>
  {#if modalMetric}
    <div class="trend-dialog-header">
      <div class="trend-dialog-heading">
        <span class="trend-dialog-kicker"><TrendingUp size={16}/> SMART CARE • INDICATOR TREND</span>
        <h2 id="trend-dialog-heading">กราฟแนวโน้มย้อนหลัง</h2>
        <p id="trend-dialog-caption">ข้อมูลย้อนหลังตามปี พ.ศ. จาก Excel ต้นฉบับ</p>
      </div>
      <button type="button" class="trend-dialog-close" onclick={closeTrend} aria-label="ปิดกราฟและกลับไปที่ตาราง" autofocus><X size={21}/></button>
    </div>
    <div class="trend-dialog-content">
      <div class="trend-metric-title">{modalMetric.name}</div>
      <div class="trend-summary">
        <div class="trend-summary-card trend-summary-primary">
          <span>ผลปี {year}</span>
          <strong>{showCurrent(modalMetric)}</strong>
          <span class:is-pass={isPass(modalMetric,year)===true} class:is-fail={isPass(modalMetric,year)===false} class="status-chip">{statusLabelFromMetric(modalMetric)}</span>
        </div>
        <div class="trend-summary-card trend-summary-secondary">
          <span>เป้าหมาย</span>
          <strong>{goalText(modalMetric)}</strong>
          <small>เทียบตามเกณฑ์ในไฟล์ Excel</small>
        </div>
      </div>
      <div class="trend-dialog-chart">
        <EChart option={trendOption(modalMetric)} label={`กราฟแนวโน้มย้อนหลัง ${modalMetric.name}`} height={290}/>
      </div>
      <div class="trend-history" aria-label="ตัวเลขย้อนหลังรายปี">
        {#each years.slice().reverse().filter((y)=>modalMetric?.values[String(y)] !== undefined) as historicalYear (historicalYear)}
          <div class:chosen={historicalYear===year} class="trend-history-item">
            <span>พ.ศ. {historicalYear}</span>
            <strong>{num(getValue(modalMetric,historicalYear))}{getValue(modalMetric,historicalYear)===null ? '' : modalMetric.unit==='%'?'%':` ${modalMetric.unit}`}</strong>
          </div>
        {/each}
      </div>
      <p class="trend-dialog-note"><Info size={15}/> เส้นประในกราฟคือเกณฑ์เป้าหมาย (ถ้าระบุไว้) • ไม่ใช่ข้อมูล Real-time</p>
    </div>
    <div class="trend-dialog-footer">
      <span class="trend-dialog-count">รายการ {modalIndex+1} / {filteredRows.length}</span>
      <div class="trend-dialog-navigation">
        <button type="button" class="trend-nav-button" disabled={modalIndex<=0} onclick={()=>stepTrend(-1)}><ChevronLeft size={17}/> ก่อนหน้า</button>
        <button type="button" class="trend-nav-button" disabled={modalIndex<0 || modalIndex>=filteredRows.length-1} onclick={()=>stepTrend(1)}>ถัดไป <ChevronRight size={17}/></button>
        <button type="button" class="trend-done-button" onclick={closeTrend}>กลับสู่ตาราง</button>
      </div>
    </div>
  {/if}
</dialog>
