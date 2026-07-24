<template>
    <g class="vis-primitive-svg-rect">
        <ellipse
            ref="rect"
            :cx="model.attributes.cx"
            :cy="model.attributes.cy"
            :rx="model.attributes.rx"
            :ry="model.attributes.ry"
            :fill="model.attributes.fill"
            :fill-opacity="model.attributes['fill-opacity']"
            :opacity="model.attributes.opacity"
            :stroke="model.attributes.stroke"
            :stroke-opacity="model.attributes['stroke-opacity']"
            :stroke-dasharray="model.attributes['stroke-dasharray']"
            :stroke-width="model.attributes['stroke-width']"
        ></ellipse>
        <box-rect v-if="model.selected" :type="model.type" :box="model.box" :zoom="props.zoom"></box-rect>
    </g>
</template>

<script lang="ts" setup>
import type {PrimitiveInstanceSvgEllipse} from '@cloudview.visualization-next/services';
import BoxRect from './box.comp.vue';

interface IProps {
    model: PrimitiveInstanceSvgEllipse;
    zoom: number;
}

const props = defineProps<IProps>();
</script>
