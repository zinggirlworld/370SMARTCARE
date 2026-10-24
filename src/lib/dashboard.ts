import raw from './data/metrics.json';

export type Group = 'dm' | 'copd' | 'experience';
export type Page = 'overview' | 'dm' | 'copd' | 'workload' | 'experience' | 'method';
export type GoalOp = '>' | '<' | '≥' | '≤' | '=';
export interface Goal { op: GoalOp; value: number; label: string }
export interface Metric {
  id: string;
  name: string;
  goal: Goal | null;
  unit: '%' | 'นาที' | 'คน';
  values: Record<string, number | null>;
  group: Group;
}
export interface Workload {
  name: string;
  code: string;
  historical: Record<string, number | null>;
  visits2569: number | null;
  uniqueHn2569: number | null;
}
export interface DataSet {
  metadata: { title: string; subtitle: string; tagline: string; source: string; snapshotDate: string; privacy: string };
  dm: Metric[];
  copd: Metric[];
  experience: Metric[];
  workload: Workload[];
}
export const data = raw as unknown as DataSet;
export const allMetrics: Metric[] = [...data.dm, ...data.copd, ...data.experience];
export const years = [...new Set(allMetrics.flatMap((m) => Object.keys(m.values).map(Number)))].sort((a, b) => b - a);
export const latestYear = years[0] ?? 2569;

export function getValue(m: Metric, year: number): number | null {
  const v = m.values[String(year)];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
export function isPass(m: Metric, year: number): boolean | null {
  const v = getValue(m, year);
  const g = m.goal;
  if (v === null || g === null) return null;
  switch (g.op) {
    case '>': return v > g.value;
    case '<': return v < g.value;
    case '≥': return v >= g.value;
    case '≤': return v <= g.value;
    case '=': return v === g.value;
    default: return null;
  }
}
export function counts(ms: Metric[], year: number): {pass: number; fail: number; unscored: number} {
  return ms.reduce((acc, m) => {
    const p = isPass(m, year);
    if (p === true) acc.pass++;
    else if (p === false) acc.fail++;
    else acc.unscored++;
    return acc;
  }, { pass: 0, fail: 0, unscored: 0 });
}
export function num(v: number | null | undefined, digits = 2): string {
  return typeof v === 'number' && Number.isFinite(v)
    ? new Intl.NumberFormat('th-TH', {maximumFractionDigits: digits}).format(v)
    : '—';
}
export function metricUnit(m: Metric): string { return m.unit === '%' ? '%' : m.unit; }
export function statusLabel(v: boolean | null): string {
  return v === null ? 'ไม่มีเกณฑ์/ข้อมูล' : v ? 'ผ่านเกณฑ์' : 'ต่ำกว่าเกณฑ์';
}
export function sourceName(group: Group) {
  return group === 'dm' ? 'เบาหวาน (DM)' : group === 'copd' ? 'โรคปอดอุดกั้นเรื้อรัง (COPD)' : 'ประสบการณ์ผู้รับบริการ';
}
export function csvEscape(value: string | number | null | undefined): string {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // prevent spreadsheet formula execution
  return `"${s.replace(/"/g, '""')}"`;
}
export function exportCsv(rows: (string | number | null | undefined)[][], name: string): void {
  const csv = '\uFEFF' + rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = name.replace(/[^a-zA-Z0-9-_\.]/g, '-') + '.csv';
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export const palette = {
  mint:'#08A58B', mintDark:'#007E6D', blue:'#267BEA', violet:'#8755DC', peach:'#E58346',
  coral:'#D83D70', slate:'#45637D', ink:'#233D5B', grid:'#DFEAF5'
};

export function trendOption(metric: Metric) {
  const xs = [...years].reverse().filter((y) => metric.values[String(y)] !== undefined);
  const values = xs.map((y) => getValue(metric, y));
  const markLine = metric.goal ? {
    silent: true,
    symbol: 'none',
    lineStyle: {color:palette.coral,type:'dashed',width:1.5},
    label: {formatter:`เกณฑ์ ${metric.goal.label}`,position:'insideEndTop',color:'#AD425A',fontSize:12},
    data: [{ yAxis: metric.goal.value }]
  } : undefined;
  return {
    backgroundColor: 'transparent',
    tooltip: {trigger:'axis', valueFormatter:(value:number)=>`${num(value)} ${metric.unit}`},
    grid: {top:30, left:50, right:18, bottom:46},
    xAxis: {type:'category', data:xs.map(String), axisLine:{lineStyle:{color:'#dfe6f0'}},axisLabel:{color:'#596D84'}},
    yAxis: {type:'value', scale: true, axisLabel:{color:'#596D84'},splitLine:{lineStyle:{color:palette.grid}}},
    series: [{type:'line',data:values, smooth:0.25, symbol:'circle',symbolSize:8,
      lineStyle:{color:palette.mintDark,width:3},itemStyle:{color:palette.mintDark,borderColor:'#fff',borderWidth:2},
      areaStyle:{opacity:0.13,color:palette.mint},markLine}],
    animationDuration:350
  };
}

export function coverageOption(metrics: Metric[], year: number) {
  const chosen = metrics.filter((m) => getValue(m,year)!==null).slice(0,7);
  return {
    tooltip: {trigger:'axis',axisPointer:{type:'shadow'}}, legend:{top:0,textStyle:{color:palette.slate}},
    grid: {left:17,right:22,top:42,bottom:16,containLabel:true},
    xAxis: {type:'value',min:0,max:100,axisLabel:{color:palette.slate,formatter:'{value}%'},splitLine:{lineStyle:{color:palette.grid}}},
    yAxis: {type:'category',data:chosen.map((m)=>m.name.length>26?m.name.slice(0,25)+'…':m.name).reverse(),axisLabel:{color:palette.ink,fontSize:12},axisLine:{show:false},axisTick:{show:false}},
    series:[{name:'ผลจริง',type:'bar',barWidth:13,barGap:'35%',data:chosen.map((m)=>getValue(m,year)).reverse(),itemStyle:{color:palette.mint,borderRadius:[0,8,8,0]}},
      {name:'เป้าหมาย',type:'bar',barWidth:13,data:chosen.map((m)=>m.goal?.value??null).reverse(),itemStyle:{color:palette.violet,borderRadius:[0,8,8,0]}}],
    animationDuration:400
  };
}

export function donutOption(ms:Metric[], year:number) {
  const c=counts(ms,year);
  return {tooltip:{trigger:'item'},legend:{bottom:0,textStyle:{color:palette.slate}},
    series:[{type:'pie',radius:['61%','78%'],center:['50%','45%'],avoidLabelOverlap:true,
      itemStyle:{borderColor:'#fff',borderWidth:5,borderRadius:8},label:{show:false},
      data:[{name:'ผ่านเกณฑ์',value:c.pass,itemStyle:{color:palette.mint}},
            {name:'ไม่ผ่านเกณฑ์',value:c.fail,itemStyle:{color:palette.coral}},
            {name:'ไม่มีเกณฑ์/ข้อมูล',value:c.unscored,itemStyle:{color:'#dbe2ed'}}]}],animationDuration:450};
}
export function workloadOption(items: Workload[]) {
  const top = [...items].sort((a,b)=>(b.visits2569??0)-(a.visits2569??0)).slice(0,8).reverse();
  return {
    tooltip:{trigger:'axis',axisPointer:{type:'shadow'}},legend:{top:0,textStyle:{color:palette.slate}},
    grid:{left:10,right:20,top:43,bottom:10,containLabel:true},
    xAxis:{type:'value',axisLabel:{color:palette.slate},splitLine:{lineStyle:{color:palette.grid}}},
    yAxis:{type:'category',data:top.map(x=>x.name.length>21?x.name.slice(0,20)+'…':x.name),axisLabel:{color:palette.ink,fontSize:12},axisLine:{show:false},axisTick:{show:false}},
    series:[{name:'VISIT (ครั้ง)',type:'bar',barWidth:12,data:top.map(x=>x.visits2569),itemStyle:{color:palette.blue,borderRadius:[0,7,7,0]}},
      {name:'HN รายคลินิก',type:'bar',barWidth:12,data:top.map(x=>x.uniqueHn2569),itemStyle:{color:palette.mint,borderRadius:[0,7,7,0]}}],
    animationDuration:350
  };
}
