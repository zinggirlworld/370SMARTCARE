import { counts, coverageOption, donutOption, getValue, isPass, latestYear, num, palette, years, type Metric, type Page } from './dashboard';

export type StatusFilter = 'all' | 'fail' | 'pass';
const pages: Page[] = ['overview', 'dm', 'copd', 'workload', 'experience', 'method'];

export function readView(search: string): { page: Page; year: number } {
  const params = new URLSearchParams(search);
  const candidatePage = params.get('page') as Page;
  const candidateYear = Number(params.get('year'));
  return {
    page: pages.includes(candidatePage) ? candidatePage : 'overview',
    year: years.includes(candidateYear) ? candidateYear : latestYear
  };
}

export function viewUrl(current: URL, page: Page, year: number): URL {
  const url = new URL(current);
  url.searchParams.set('page', page);
  url.searchParams.set('year', String(year));
  return url;
}

export function metricStatus(metric: Metric, year: number): string {
  if (getValue(metric, year) === null) return 'ไม่มีข้อมูล';
  if (metric.goal === null) return 'ไม่มีเกณฑ์';
  return isPass(metric, year) ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์';
}

export function matchesStatus(metric: Metric, year: number, filter: StatusFilter): boolean {
  return filter === 'all' || isPass(metric, year) === (filter === 'pass');
}

// Add presentation only: retain the original chart values, thresholds and scoring.
export function donutWithSummary(metrics: Metric[], year: number) {
  const option = donutOption(metrics, year);
  const c = counts(metrics, year);
  const scored = c.pass + c.fail;
  return {
    ...option,
    title: {
      text: scored ? `${c.pass}/${scored}` : '—',
      subtext: 'ตัวชี้วัดผ่านเกณฑ์',
      left: 'center', top: '32%', itemGap: 7,
      textStyle: { color: palette.ink, fontSize: 32, fontWeight: 800 },
      subtextStyle: { color: palette.slate, fontSize: 12 }
    }
  };
}

export function coverageWithValues(metrics: Metric[], year: number) {
  const option = coverageOption(metrics, year);
  return {
    ...option,
    grid: { ...option.grid, right: 62 },
    series: option.series.map((series, index) => index ? series : {
      ...series,
      label: {
        show: true, position: 'right', distance: 5,
        color: palette.ink, fontSize: 11, fontWeight: 700,
        formatter: (params: { value: number | null }) => params.value === null ? '' : `${num(params.value)}%`
      }
    })
  };
}
