<template>
    <div ref="chartRef" class="charts" />
</template>
<script lang="ts" setup>
import {onMounted, PropType, ref, watch, onBeforeUnmount, nextTick} from 'vue';
import {BarOption, LineOption, PieOption, ChartType, CustomOption} from './type';
import * as echarts from 'echarts';
import barOption from './options/bar';
import lineOption from './options/line';
import pieOption from './options/pie';
import customOption from './options/custom';

const props = defineProps({
    type: {
        // required: true,
        type: String as PropType<ChartType>,
        default: 'bar',
    },
    options: {
        type: Object as PropType<echarts.EChartsCoreOption>,
        default: () => ({}),
    },
    disabledInitOpts: {
        type: Boolean,
        default: false,
    },
});

const optionsMap = new Map<string, LineOption | BarOption | PieOption | CustomOption>([
    ['line', lineOption],
    ['bar', barOption],
    ['pie', pieOption],
    ['custom', customOption],
]);

const chartRef = ref();
let myChart: echarts.ECharts;

const getOptions = () => {
    return optionsMap.get(props.type);
};

async function initChart() {
    myChart = echarts.init(chartRef.value);
    const option = getOptions();
    // 绘制图表
    !props.disabledInitOpts && myChart.setOption(option!);
    nextTick(() => {
        myChart.setOption(props.options);
        chartResize();
    });
}

watch(
    () => props.options,
    () => {
        if (myChart) {
            myChart.setOption(props.options);
        }
    },
    {
        deep: true,
    }
);

function chartResize() {
    myChart.resize();
}

async function clear() {
    myChart?.clear();
    const option = getOptions();
    // 绘制图表
    !props.disabledInitOpts && myChart.setOption(option!);
}
function dispatchAction(params: any) {
    myChart.dispatchAction(params);
}
function on(...params: any) {
    (myChart as any).on(...params);
}
onMounted(() => {
    initChart();
    window.addEventListener('resize', chartResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', chartResize);
    myChart.dispose();
});

defineExpose({
    clear,
    chartResize,
    dispatchAction,
    on,
});
</script>
<style lang="scss" scoped>
.charts {
    width: 100%;
    height: 100%;
}
</style>
