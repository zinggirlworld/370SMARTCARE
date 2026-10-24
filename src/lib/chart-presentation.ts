import type { EChartsOption } from 'echarts';

type Style = Record<string, unknown>;
const tones: Record<string, string> = {
  '#08a58b': '#00a58b', '#007e6d': '#008b76', '#267bea': '#3478e5',
  '#8755dc': '#9851d8', '#d83d70': '#db3c7c', '#45637d': '#526b7f',
  '#233d5b': '#29465b', '#dfeaf5': '#e9eff3', '#dbe2ed': '#8493a8'
};
const record = (value: unknown): Style => value && typeof value === 'object' ? value as Style : {};
const tone = (value: unknown) => typeof value === 'string' ? tones[value.toLowerCase()] ?? value : value;
const paint = (value: unknown): Style => {
  const style = record(value);
  return { ...style, ...(style.color !== undefined ? { color: tone(style.color) } : {}) };
};

// Decorate chart styles only. Keep values, dates, thresholds and gaps untouched.
export function presentChart(input: EChartsOption | Style, reducedMotion = false): EChartsOption {
  const option = input as Style;
  const series = Array.isArray(option.series) ? option.series.map((raw) => {
    const s = record(raw);
    const result: Style = { ...s, itemStyle: paint(s.itemStyle) };
    if (s.lineStyle) result.lineStyle = paint(s.lineStyle);
    if (s.label) result.label = paint(s.label);
    if (s.areaStyle) result.areaStyle = {
      ...record(s.areaStyle), opacity: 1,
      color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
        { offset: 0, color: '#00b99b4d' }, { offset: 1, color: '#00b99b04' }
      ] }
    };
    if (s.markLine) {
      const line = record(s.markLine);
      result.markLine = { ...line, lineStyle: paint(line.lineStyle), label: paint(line.label) };
    }
    if (s.type === 'pie' && Array.isArray(s.data)) {
      result.data = s.data.map((rawPoint) => {
        const point = record(rawPoint);
        return { ...point, itemStyle: paint(point.itemStyle) };
      });
    }
    return result;
  }) : option.series;
  const styleAxis = (raw: unknown) => {
    const axis = record(raw);
    const split = record(axis.splitLine);
    return {
      ...axis,
      axisLabel: { ...paint(axis.axisLabel), fontFamily: 'Tahoma, sans-serif' },
      ...(axis.splitLine ? { splitLine: { ...split, lineStyle: { ...paint(split.lineStyle), color: '#e9eff3', type: 'dashed' } } } : {})
    };
  };
  const goalValues = Array.isArray(option.series) ? option.series.flatMap((raw) => {
    const marks = record(record(raw).markLine).data;
    return Array.isArray(marks) ? marks.map(mark=>record(mark).yAxis).filter((value): value is number=>typeof value==='number' && Number.isFinite(value)) : [];
  }) : [];
  const goalRange = goalValues.length && record(option.yAxis).type === 'value' ? {
    min: (extent: { min: number; max: number }) => {
      const low = Math.min(extent.min, ...goalValues);
      const high = Math.max(extent.max, ...goalValues);
      const padded = low - (high - low || 1) * .08;
      return low >= 0 ? Math.max(0, padded) : padded;
    },
    max: (extent: { min: number; max: number }) => {
      const low = Math.min(extent.min, ...goalValues);
      const high = Math.max(extent.max, ...goalValues);
      return high + (high - low || 1) * .08;
    }
  } : {};
  return {
    ...option, series,
    textStyle: { ...record(option.textStyle), fontFamily: 'Tahoma, sans-serif', color: '#526b7f' },
    ...(option.xAxis ? { xAxis: styleAxis(option.xAxis) } : {}),
    // Keep the original goal line visible even when it lies outside observed values.
    ...(option.yAxis ? { yAxis: { ...styleAxis(option.yAxis), ...goalRange } } : {}),
    ...(option.legend ? { legend: { ...record(option.legend), textStyle: { ...record(record(option.legend).textStyle), color: '#526b7f', fontFamily: 'Tahoma, sans-serif' } } } : {}),
    tooltip: {
      ...record(option.tooltip), confine: true, backgroundColor: '#fffffffa',
      borderColor: '#e0e9e7', borderWidth: 1, padding: [11, 14],
      textStyle: { color: '#355366', fontFamily: 'Tahoma, sans-serif', fontSize: 12 },
      extraCssText: 'border-radius:14px;box-shadow:0 8px 28px #3f627219;'
    },
    animation: !reducedMotion,
    animationDuration: reducedMotion ? 0 : 420,
    animationDurationUpdate: reducedMotion ? 0 : 260,
    animationEasingUpdate: 'cubicOut'
  } as EChartsOption;
}
