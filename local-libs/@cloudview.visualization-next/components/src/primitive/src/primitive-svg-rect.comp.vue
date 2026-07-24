<template>
    <g class="vis-primitive-svg-rect">
        <rect
            ref="rect"
            :x="model.attributes.x"
            :y="model.attributes.y"
            :width="model.attributes.width"
            :height="model.attributes.height"
            :fill="model.attributes.fill"
            :fill-opacity="model.attributes['fill-opacity']"
            :opacity="model.attributes.opacity"
            :stroke="model.attributes.stroke"
            :stroke-opacity="model.attributes['stroke-opacity']"
            :stroke-dasharray="model.attributes['stroke-dasharray']"
            :stroke-width="model.attributes['stroke-width']"
        ></rect>
        <box-rect v-if="model.selected" :type="model.type" :box="model.box" :zoom="props.zoom"></box-rect>
    </g>
</template>

<script lang="ts" setup>
import type {PrimitiveInstanceSvgRect} from '@cloudview.visualization-next/services';
import BoxRect from './box.comp.vue';

interface IProps {
    model: PrimitiveInstanceSvgRect;
    zoom: number;
}

const props = defineProps<IProps>();
</script>
