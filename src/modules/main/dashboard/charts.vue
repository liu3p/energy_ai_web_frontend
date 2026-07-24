<template>
    <charts ref="chartRef" type="line" style="flex: 1" :options="chartOptions" />
</template>
<script setup lang="ts">
import Charts from '@/common/echarts/charts.vue';
import { ref, watch } from 'vue';
import { initOptions } from '@/modules/main/dashboard/chart-options';
type chartParams = { xAxis: (number | string)[]; data: { name: string; type: 'line' | 'bar'; color: string; data: (number | string)[] }[] };
const props = defineProps<{
    data?: chartParams
}>();
const chartOptions = ref<any>(initOptions());

watch(() => props.data, () => {
    const propsData = props.data ?? {
        xAxis: [],
        data: []
    };
    chartOptions.value = initOptions(propsData);
});
</script>
<style scoped lang="scss"></style>