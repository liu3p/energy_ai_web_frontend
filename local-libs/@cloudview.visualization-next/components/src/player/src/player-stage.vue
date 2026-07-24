<template>
    <svg ref="svg" class="vis-player-stage" :style="style">
        <slot></slot>
    </svg>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import type {IBoardAttr} from '@cloudview.visualization-next/services';
import {useLocale} from 'cloudview.ui-next';
// @ts-ignore
import {SVG} from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';

defineOptions({name: 'VisPlayerStage'});
const props = withDefaults(
    defineProps<{
        config: IBoardAttr;
    }>(),
    {}
);
const emit = defineEmits(['panEnd', 'beforePan', 'panning', 'zoom']);

const svg = ref();
const {t} = useLocale();

const style = computed(() => {
    return {backgroundColor: props.config?.['background-color']};
});

onMounted(() => {
    // @ts-ignore
    const stage = SVG(svg.value) as any;
    stage.viewbox(props.config.viewBox).panZoom({
        panning: !props.config.panDisable,
        pinchZoom: !props.config.zoomDisable,
        wheelZoom: !props.config.zoomDisable,
        zoomFactor: 0.1,
        zoomMin: 0.1,
        zoomMax: 10,
    });
    stage.on('panStart', () => emit('beforePan'));
    stage.on('panEnd', () => emit('panEnd'));
    stage.on('panning', () => emit('panning'));
    stage.on('zoom', () => emit('zoom'));
});

defineExpose({getSvg: () => svg.value});
</script>
