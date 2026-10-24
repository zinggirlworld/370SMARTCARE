<script lang="ts">
  import { onMount } from 'svelte';
  import type { ECharts, EChartsOption } from 'echarts';
  import { presentChart } from '$lib/chart-presentation';
  interface Props { option: EChartsOption | Record<string, unknown>; height?: number; label: string }
  let { option, height = 310, label }: Props = $props();
  let element: HTMLDivElement;
  let chart: ECharts | null = null;
  let ready = $state(false);
  let failed = $state(false);
  let reducedMotion = $state(false);
  onMount(() => {
    let destroyed = false;
    let resize: ResizeObserver | null = null;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { reducedMotion = motion.matches; };
    updateMotion();
    motion.addEventListener('change', updateMotion);
    import('echarts').then((echarts) => {
      if (destroyed || !element) return;
      chart = echarts.init(element, undefined, {renderer:'canvas'});
      chart.setOption(presentChart(option, reducedMotion), true);
      resize = new ResizeObserver(() => chart?.resize());
      resize.observe(element);
      ready = true;
    }).catch(() => { if (!destroyed) failed = true; });
    return () => { destroyed = true; motion.removeEventListener('change', updateMotion); resize?.disconnect(); chart?.dispose(); chart = null; };
  });
  $effect(() => {
    const current = option;
    const reduce = reducedMotion;
    if (ready && chart) chart.setOption(presentChart(current, reduce), true);
  });
</script>
<div class="chart-holder" role="img" aria-label={label} aria-busy={!ready && !failed} style={`min-height:${height}px`}>
  <div class="echart" bind:this={element} style={`height:${height}px`}></div>
  {#if !ready && !failed}<div class="chart-loading">กำลังเตรียมกราฟ</div>{/if}
  {#if failed}<div class="chart-message">ไม่สามารถโหลดกราฟได้ กรุณาดูค่าตัวเลขในตารางด้านล่าง</div>{/if}
</div>
