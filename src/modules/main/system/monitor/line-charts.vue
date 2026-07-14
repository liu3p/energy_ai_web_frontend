<template>
    <charts ref="chartRef" type="line" style="flex: 1" :options="chartOptions" />
</template>
<script setup lang="ts">
import Charts from '@/common/echarts/charts.vue';
import {ref, watch} from 'vue';
import {initOptions} from '@/modules/main/system/monitor/chart-options';

const props = defineProps<{
    data: {
        point: string | number;
        value: string | number;
    },
    limit?: number
}>();
const chartRef = ref();
const chartOptions = ref<any>(initOptions());
const xAxis = ref<(string | number)[]>([]);
const data = ref<(string | number)[]>([]);

watch(() => props.data, () => {
    const propsData = props.data ?? {};
    // const {limit} = props;
    xAxis.value.push(propsData.point);
    data.value.push(propsData.value);
    // xAxis.value = xAxis.value.slice(limit ?? -20);
    // data.value = data.value.slice(limit ?? -20);
    chartOptions.value = initOptions({
        xAxis, data,
    });
});
</script>
<style scoped lang="scss">

</style>