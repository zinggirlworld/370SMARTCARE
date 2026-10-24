import fs from 'node:fs';
import assert from 'node:assert/strict';
const path = new URL('../src/lib/data/metrics.json', import.meta.url);
const d = JSON.parse(fs.readFileSync(path,'utf8'));
const all = [...d.dm,...d.copd,...d.experience];
assert.equal(d.metadata.privacy, 'AGGREGATES_ONLY');
assert.equal(d.dm.length,12);
assert.equal(d.copd.length,4);
assert.equal(d.experience.length,2);
assert.equal(d.workload.length,14);
assert.equal(d.dm[0].values['2569'],25.48);
assert.equal(d.dm[8].values['2569'],62.45);
assert.equal(d.copd[1].values['2569'],35.14);
assert.equal(d.experience[0].values['2569'],81.47);
assert.equal(d.experience[1].values['2569'],209);
assert.equal(d.workload[0].visits2569,7218);
assert.equal(d.workload[0].uniqueHn2569,2454);
for(const m of all){
  assert.ok(m.id && m.name && m.group);
  assert.ok(Object.keys(m.values).some(k=> /^25\d{2}$/.test(k)));
  for(const val of Object.values(m.values)) assert.ok(val===null || (typeof val==='number' && Number.isFinite(val)));
}
for(const x of d.workload){ assert.match(x.code, /^\d{4,5}$/); }
const text=JSON.stringify(d);
for (const forbidden of ['patient_name','patient_id','cid','birth_date','phone','address','hn_unique','hba1c_recorded','remission_summary']) assert.ok(!text.includes(`"${forbidden}"`),`Unsafe key ${forbidden}`);
console.log('PASS aggregate data structure + 13 source value/shape checks');
console.log(`Rows: DM=${d.dm.length}, COPD=${d.copd.length}, Experience=${d.experience.length}, Workload=${d.workload.length}`);
