<script lang="ts">
  import { onMount } from 'svelte';
  import type { ECharts, EChartsOption } from 'echarts';
  interface Props { option: EChartsOption | Record<string, unknown>; height?: number; label: string }
  let { option, height = 310, label }: Props = $props();
  let element: HTMLDivElement;
  let chart: ECharts | null = null;
  let ready = $state(false);
  let failed = $state(false);
  onMount(() => {
    let destroyed = false;
    let resize: ResizeObserver | null = null;
    import('echarts').then((echarts) => {
      if (destroyed || !element) return;
      chart = echarts.init(element, undefined, {renderer:'canvas'});
      chart.setOption(option as EChartsOption, true);
      resize = new ResizeObserver(() => chart?.resize());
      resize.observe(element);
      ready = true;
    }).catch(() => { if (!destroyed) failed = true; });
    return () => { destroyed = true; resize?.disconnect(); chart?.dispose(); chart = null; };
  });
  $effect(() => {
    const current = option;
    if (ready && chart) chart.setOption(current as EChartsOption, true);
  });
</script>
<div class="chart-holder" role="img" aria-label={label} style={`min-height:${height}px`}>
  <div class="echart" bind:this={element} style={`height:${height}px`}></div>
  {#if failed}<div class="chart-message">ไม่สามารถโหลดกราฟได้ กรุณาดูค่าตัวเลขในตารางด้านล่าง</div>{/if}
</div>
