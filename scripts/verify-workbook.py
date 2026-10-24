"""Verify that published aggregate-only metrics reproduce the approved Excel source.

Run in Windows CMD (after installing artifact_tool):
    python scripts\verify-workbook.py "C:\\path\\ข้อมูลตัวชี้วัดโรคเรื้อรัง งบ69 ครบถ้วน.xlsx"

This script reads only the approved *aggregate* workbook, never DM Remission or
individual patient data. It never writes to the original workbook.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from artifact_tool import Blob, SpreadsheetFile

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / 'src' / 'lib' / 'data' / 'metrics.json'


def equal(a, b, label):
    if a != b:
        raise AssertionError(f'{label}: Excel={a!r} != aggregate JSON={b!r}')


def numeric(a, label):
    if a is None or isinstance(a, bool) or not isinstance(a, (int, float)):
        raise AssertionError(f'{label}: non-numeric value {a!r}; review missing data rule')
    return float(a)


def eq_year_columns(headers, values, begin_column, metric, label):
    found = set()
    for i, col in enumerate(headers):
        match = re.search(r'(25\d{2})', str(col or ''))
        if not match:
            continue
        year = match.group(1)
        if year not in metric['values']:
            raise AssertionError(f'{label}: Excel year {year} is absent from published aggregate data. Add and revalidate before publishing.')
        v = values[i]
        if v is not None:
            equal(numeric(v, label), metric['values'][year], f'{label} year {year}')
        else:
            equal(None, metric['values'][year], f'{label} year {year}')
        found.add(year)
    if set(metric['values']) != found:
        raise AssertionError(f'{label}: JSON years {set(metric["values"]) - found} are not present in this Excel sheet')
    return len(found)


def normal(text):
    return re.sub(r'\s+', '', str('' if text is None else text)).casefold()


def main():
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python scripts/verify-workbook.py PATH_TO_AGGREGATE_WORKBOOK.xlsx')
    original = Path(sys.argv[1]).resolve()
    if 'remission' in original.name.casefold():
        raise SystemExit('Refusing patient-level DM Remission source: use the aggregate indicators workbook only')
    data = json.loads(SNAPSHOT.read_text(encoding='utf-8'))
    book = SpreadsheetFile.import_xlsx(Blob.load(str(original)))
    comparisons = 0

    sheet = book.worksheets.get_item('ตัวชี้วัด DM')
    rows = sheet.get_range('A1:H13').values
    headers = rows[0]
    for i, metric in enumerate(data['dm']):
        row = rows[i + 1]
        equal(normal(row[0]), normal(metric['name']), f'DM name {i + 1}')
        equal(normal(row[1]), normal(metric['goal']['label']) if metric['goal'] else '', f'DM target {i + 1}')
        comparisons += eq_year_columns(headers[2:], row[2:], 2, metric, f'DM {i + 1}')

    sheet = book.worksheets.get_item('ตัวชี้วัด COPD')
    rows = sheet.get_range('A1:H7').values
    headers = rows[0]
    for k, original_row in enumerate([2, 4, 6, 7]):
        row = rows[original_row - 1]
        metric = data['copd'][k]
        equal(normal(row[0]), normal(metric['name']), f'COPD name {k + 1}')
        excel_goal = normal(row[1]).replace('%','')
        json_goal = normal(metric['goal']['label']).replace('%','') if metric['goal'] else ''
        equal(excel_goal, json_goal, f'COPD target {k + 1}')
        comparisons += eq_year_columns(headers[2:], row[2:], 2, metric, f'COPD {k + 1}')

    sheet = book.worksheets.get_item('ความพึงพอใจ_cycleTime')
    rows = sheet.get_range('B3:I7').values
    headers = rows[1][2:]
    for k, idx in enumerate([3, 4]):
        row = rows[idx]
        metric = data['experience'][k]
        equal(normal(row[0]), normal(metric['name']), f'Experience name {k + 1}')
        comparisons += eq_year_columns(headers, row[2:], 2, metric, f'Experience {k + 1}')
    
    sheet = book.worksheets.get_item('ปริมาณงานที่สำคัญ')
    rows = sheet.get_range('A1:H16').values
    for k, metric in enumerate(data['workload']):
        row = rows[k + 2]
        equal(normal(row[0]), normal(metric['name']) + normal(metric['code']), f'Workload clinic {k + 1}')
        for j, year in enumerate([2565, 2566, 2567, 2568], 2):
            equal(numeric(row[j], f'workload {k+1} year {year}'), metric['historical'][str(year)], f'workload {k+1} year {year}')
            comparisons += 1
        equal(numeric(row[6], 'visits'), metric['visits2569'], f'workload {k+1}: 2569 VISIT')
        equal(numeric(row[7], 'HN'), metric['uniqueHn2569'], f'workload {k+1}: 2569 HN')
        if row[7] > row[6]:
            raise AssertionError(f'Workload clinic {k+1}: HN exceeds VISIT; investigate before release')
        comparisons += 2
    print(f'PASS: {comparisons} aggregate numerical cells cross-checked against the original workbook')
    print('PASS: metric names, numeric targets (DM/COPD), per-clinic codes, year coverage, HN <= VISIT')
    print('Source workbook not modified. Individual DM remission dataset not accessed.')


if __name__ == '__main__':
    main()
