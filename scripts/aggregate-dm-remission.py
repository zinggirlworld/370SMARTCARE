"""Read an external workbook; export only allowlisted aggregate fields. Never copy source into repo.
Usage: python scripts/aggregate-dm-remission.py /external/source.xlsx [--check]
Requires openpyxl in the trusted processing environment, not in the web application.
"""
import hashlib
import json
import sys
from pathlib import Path
import openpyxl

source = Path(sys.argv[1])
sheet = openpyxl.load_workbook(source, data_only=True)['สรุปงบ 69']
labels = ['หยุดยา>3เดือน', 'ยาขนาดเท่าเดิม', 'ไม่มียา', 'ลดยา', 'เพิ่มยา', 'Loss FU', 'D/C ย้ายไปรักษาที่อื่น']
assert [sheet.cell(1, i).value for i in range(4, 11)] == labels
# Stop at the summary boundary, never treat the fiscal-year summary as a patient row.
rows = list(sheet.iter_rows(min_row=2, max_row=90, values_only=True))
assert len(rows) == 89 and all(r[0] == n and r[1] is not None for n, r in enumerate(rows, 1))
assert all(all(v is None or v == 1 for v in r[3:10]) for r in rows)
assert all(sum(v == 1 for v in r[3:10]) == 1 for r in rows)
counts = [sum(r[i] == 1 for r in rows) for i in range(3, 10)]
assert counts == [int(sheet.cell(91, i).value) for i in range(4, 11)]
assert [sheet.cell(98, i).value for i in range(1, 11)] == ['ปีงบ','จำนวนคนไข้ทั้งหมด','จำนวนคนไข้คงเหลือ'] + labels
assert [sheet.cell(99, i).value for i in range(1, 11)] == [69, len(rows), sum(counts[:5])] + counts
result = {
 'schemaVersion': 1, 'fiscalYear': 2569,
 'source': {'sheet': sheet.title, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'summaryRow': 99, 'snapshotDate': None},
 'unit': 'รายการ', 'totalRecords': len(rows), 'remainingRecords': sum(counts[:5]),
 'duplicateIdentifierExcess': len(rows) - len(set(r[1] for r in rows)),
 'numericHba1cRecords': sum(isinstance(r[2], (int, float)) for r in rows),
 'confirmedRemissionRecords': None,
 'statuses': [{'id': key, 'label': label, 'count': count} for key,label,count in zip(['stopped','same','none','reduced','increased','lost','transferred'], labels, counts)]
}
target = Path(__file__).resolve().parents[1] / 'src/lib/data/dm-remission.json'
if '--check' in sys.argv:
 assert json.loads(target.read_text()) == result, 'Aggregate does not match workbook'
 print('PASS workbook totals, one status per row, summary reconciliation, duplicate count and aggregate JSON')
else:
 target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
 print('Exported aggregate JSON only; no identifiers or individual lab results')
