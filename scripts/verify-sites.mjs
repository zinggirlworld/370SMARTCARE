// Verifies the ZIP baseline and runs the actual presentation/data helpers.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const baseline = {
  'scripts/fixtures/metrics-before-copd-addition.json': '0dd0f82a2e6a5ec02e3affae19eb4ad051e108039115e45c8094fa53c98e3aab',
  'src/lib/dashboard.ts': '46f7f90f9232b0d362d9b170fc49d15cdd068864be7ea8b11d189a65b2c799a2',
  'src/app.css': 'fb12c2b5e5ca3863b090822f005042fc9838eece5bbc0db6995df4a078ac9485'
};
for (const [path, hash] of Object.entries(baseline)) {
  assert.equal(crypto.createHash('sha256').update(read(path)).digest('hex'), hash, `${path} differs from ZIP`);
}
const d = JSON.parse(read('src/lib/data/metrics.json'));
const originalData = JSON.parse(read('scripts/fixtures/metrics-before-copd-addition.json'));
assert.deepEqual({...d, copd:d.copd.slice(0,4)}, originalData, 'Original dataset must remain unchanged');
const js = ts.transpileModule(read('src/lib/dashboard.ts'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText.replace("import raw from './data/metrics.json';", `const raw = ${JSON.stringify(d)};`);
const dashboardUrl = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
const h = await import(dashboardUrl);
assert.deepEqual(h.years, [2569, 2568, 2567, 2566, 2565, 2564]);
assert.deepEqual(h.counts(d.dm, 2569), { pass: 5, fail: 7, unscored: 0 });
assert.deepEqual(h.counts(d.copd, 2569), { pass: 0, fail: 3, unscored: 3 });
assert.equal(h.getValue(d.dm[0], 2570), null);
assert.equal(h.num(null), '—');
assert.equal(h.isPass(d.dm[0], 2570), null);
assert.equal(h.getValue({values:{'2570':null}},2570), null);
assert.equal(h.trendOption({ ...d.dm[0], values: { '2564': null, '2565': 0 } }).series[0].data[0], null);
assert.equal(h.getValue({values:{'2570':0}},2570), 0);
// Boundary checks use isolated test objects, never alter dashboard data.
for (const [op, expected] of [['>',false], ['<',false], ['≥',true], ['≤',true], ['=',true]]) {
  assert.equal(h.isPass({values:{'2569':80},goal:{op,value:80}},2569), expected);
}
const source = read('src/routes/+page.svelte');
const topbar = source.split('<header class="topbar">')[1].split('</header>')[0];
assert.ok(!/CSV|Snapshot|พิมพ์|window\.print/i.test(topbar));
assert.ok(!/fetch\s*\(|WebSocket|XMLHttpRequest|192\.168\./.test(source + read('src/lib/dashboard.ts') + read('src/lib/components/EChart.svelte')));
const metadata = d.metadata;
assert.equal(metadata.title, 'CLINIC M370 SMART CARE DASHBOARD');
assert.equal(metadata.subtitle, 'ระบบข้อมูลอัจฉริยะเพื่อการติดตามและดูแลผู้ป่วยโรคเรื้อรัง');
assert.equal(metadata.tagline, 'เห็นข้อมูลไว รู้ความเสี่ยงเร็ว ติดตามต่อเนื่อง');
// Exact schemas allow aggregate counts and clinic names, never patient records.
const keys = (x) => Object.keys(x).sort();
for (const m of [...d.dm,...d.copd,...d.experience]) {
  assert.deepEqual(keys(m), ['goal','group','id','name','unit','values']);
  if (m.goal) assert.deepEqual(keys(m.goal), ['label','op','value']);
}
for (const w of d.workload) assert.deepEqual(keys(w), ['code','historical','name','uniqueHn2569','visits2569']);
console.log('PASS original ZIP data preserved; calculation helpers and Vibrant v1.3 CSS unchanged');
console.log('PASS six fiscal years, DM/COPD scoring, boundary operators and missing-vs-zero');
console.log('PASS official labels, aggregate schemas, no HIS/LAN calls or prohibited topbar actions');

const uxJs = ts.transpileModule(read('src/lib/ux.ts'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText.replace("from './dashboard'", `from '${dashboardUrl}'`);
const ux = await import(`data:text/javascript;base64,${Buffer.from(uxJs).toString('base64')}`);
assert.equal(ux.metricStatus(d.copd[0], 2569), 'ไม่มีเกณฑ์');
assert.equal(ux.metricStatus(d.copd[0], 2570), 'ไม่มีข้อมูล');
assert.equal(ux.metricStatus(d.dm[0], 2569), 'ไม่ผ่านเกณฑ์');
assert.equal(ux.metricStatus(d.dm[1], 2569), 'ผ่านเกณฑ์');
for (const [filter, expected] of [['all',12], ['fail',7], ['pass',5]]) {
  assert.equal(d.dm.filter(m=>ux.matchesStatus(m,2569,filter)).length, expected);
}
assert.equal(ux.matchesStatus(d.copd[0],2569,'fail'), false);
assert.deepEqual(ux.readView('?page=dm&year=2565'), {page:'dm',year:2565});
assert.deepEqual(ux.readView('?page=invalid&year=2570'), {page:'overview',year:2569});
assert.deepEqual(ux.readView(''), {page:'overview',year:2569});
assert.equal(ux.viewUrl(new URL('https://example.test/'), 'copd', 2568).search, '?page=copd&year=2568');
assert.equal(ux.donutWithSummary(d.dm,2569).title.text, '5/12');
assert.deepEqual(ux.donutWithSummary(d.dm,2569).series, h.donutOption(d.dm,2569).series);
const bars = ux.coverageWithValues(d.dm,2569);
const baseBars = h.coverageOption(d.dm,2569);
assert.deepEqual(bars.series.map(s=>s.data), baseBars.series.map(s=>s.data));
assert.equal(bars.series[0].label.formatter({value:null}), '');
assert.equal(bars.series[0].label.formatter({value:0}), '0%');
assert.equal(bars.series[0].label.formatter({value:25.48}), '25.48%');
console.log('PASS status distinction, filters, shared URLs and unchanged chart values');

const themeJs = ts.transpileModule(read('src/lib/chart-presentation.ts'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const theme = await import(`data:text/javascript;base64,${Buffer.from(themeJs).toString('base64')}`);
const chartCases = [h.donutOption(d.dm,2569), h.coverageOption(d.dm,2569), h.workloadOption(d.workload),
  ...[...d.dm,...d.copd,...d.experience].map(h.trendOption),
  h.trendOption({...d.dm[0],values:{'2564':null,'2565':0}})];
for (const original of chartCases) {
  const before = JSON.stringify(original);
  const styled = theme.presentChart(original);
  const points = chart => chart.series.map(s=>s.type==='pie' ? s.data.map(p=>({name:p.name,value:p.value})) : s.data);
  assert.deepEqual(points(styled), points(original));
  assert.deepEqual(styled.xAxis?.data, original.xAxis?.data);
  assert.deepEqual(styled.series.map(s=>s.markLine?.data), original.series.map(s=>s.markLine?.data));
  assert.equal(JSON.stringify(original), before);
  assert.equal(theme.presentChart(original,true).animation, false);
  assert.equal(theme.presentChart(original,true).animationDurationUpdate, 0);
}
console.log(`PASS chart presentation: ${chartCases.length} chart options preserve values, years, targets, null/zero and input; reduced motion disabled`);
const footAxis = theme.presentChart(h.trendOption(d.dm[8])).yAxis;
assert.ok(footAxis.max({min:5.69,max:62.45}) > d.dm[8].goal.value);
const acuteAxis = theme.presentChart(h.trendOption(d.dm[2])).yAxis;
assert.ok(acuteAxis.min({min:5.35,max:6.41}) < d.dm[2].goal.value);
console.log('PASS target lines remain inside the visible trend axis above or below observed values');

// Source screenshots: actual results are C:F (2564–2567), not G:K target cells.
assert.equal(d.copd.length,6);
assert.deepEqual(d.copd[4].values, {'2564':35.86,'2565':27.49,'2566':31.26,'2567':29.62,'2568':null,'2569':null});
assert.deepEqual(d.copd[5].values, {'2564':75.19,'2565':80.54,'2566':82.64,'2567':88.89,'2568':null,'2569':null});
assert.deepEqual(d.copd[4].goal,{op:'<',value:30,label:'< 30%'});
assert.deepEqual(d.copd[5].goal,{op:'≥',value:90,label:'≥ 90%'});
for(const m of d.copd.slice(4)) {
  assert.equal(h.getValue(m,2569),null);
  assert.equal(h.isPass(m,2569),null);
  assert.equal(ux.matchesStatus(m,2569,'pass'),false);
  assert.equal(ux.matchesStatus(m,2569,'fail'),false);
  assert.deepEqual(h.trendOption(m).series[0].data.slice(-2),[null,null]);
}
assert.equal(h.isPass(d.copd[4],2564),false);
assert.equal(h.isPass(d.copd[4],2565),true);
assert.equal(h.isPass(d.copd[4],2567),true);
assert.equal(h.isPass({...d.copd[4],values:{'2569':30}},2569),false);
assert.equal(h.isPass({...d.copd[5],values:{'2569':90}},2569),true);
const plan=JSON.parse(read('src/lib/data/copd-additions-source.json'));
assert.deepEqual(plan.planningYears,[2570,2571,2572,2573,2574]);
assert.deepEqual(plan.sourceColumns,{C:2564,D:2565,E:2566,F:2567,G:2568,H:2569,I:2570,J:2571,K:2572,L:2573,M:2574});
assert.deepEqual(plan.rows.map(r=>r.targets),[{'2570':'< 30%','2571':'< 30%','2572':'< 30%','2573':null,'2574':null},{'2570':'≥ 90%','2571':'≥ 90%','2572':'≥ 90%','2573':null,'2574':null}]);
assert.deepEqual(h.years,[2569,2568,2567,2566,2565,2564]);
console.log('PASS COPD screenshot values, strict/inclusive goals, NULL exclusions and separate future targets');
