import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const read = p => fs.readFileSync(new URL('../'+p, import.meta.url),'utf8');
const d=JSON.parse(read('src/lib/data/dm-remission.json'));
const keys=x=>Object.keys(x).sort();
assert.deepEqual(keys(d), ['schemaVersion','fiscalYear','source','unit','totalRecords','remainingRecords','duplicateIdentifierExcess','numericHba1cRecords','confirmedRemissionRecords','statuses'].sort());
assert.deepEqual(keys(d.source), ['sheet','sha256','summaryRow','snapshotDate'].sort());
assert.equal(d.schemaVersion,1); assert.equal(d.fiscalYear,2569); assert.equal(d.unit,'รายการ');
assert.equal(d.totalRecords,89); assert.equal(d.remainingRecords,63);
assert.equal(d.duplicateIdentifierExcess,1); assert.equal(d.numericHba1cRecords,63);
assert.equal(d.confirmedRemissionRecords,null); assert.equal(d.source.snapshotDate,null);
assert.deepEqual(d.statuses.map(s=>s.id),['stopped','same','none','reduced','increased','lost','transferred']);
assert.deepEqual(d.statuses.map(s=>s.count),[8,34,2,13,6,8,18]);
for(const s of d.statuses) { assert.deepEqual(keys(s),['count','id','label']); assert.ok(Number.isInteger(s.count)&&s.count>=0); }
assert.equal(d.statuses.reduce((n,s)=>n+s.count,0),d.totalRecords);
assert.equal(d.statuses.slice(0,5).reduce((n,s)=>n+s.count,0),d.remainingRecords);
const transpile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const dashboard=url(transpile(read('src/lib/dashboard.ts')).replace("import raw from './data/metrics.json';",`const raw=${read('src/lib/data/metrics.json')};`));
const ux=await import(url(transpile(read('src/lib/ux.ts')).replace("from './dashboard'",`from '${dashboard}'`)));
for(const y of [2564,2569,2570]) {
 assert.deepEqual(ux.readView(`?page=remission&year=${y}`),{page:'remission',year:2569});
 assert.equal(ux.viewUrl(new URL('https://example.test/370SMARTCARE/?keep=1'),'remission',y).search,'?keep=1&page=remission&year=2569');
}
assert.deepEqual(ux.readView('?page=dm&year=2564'),{page:'dm',year:2564});
console.log('PASS remission aggregate allowlist, totals, missing values, record units, fixed fiscal year and existing navigation');
