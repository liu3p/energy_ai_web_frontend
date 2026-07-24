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
    </g>
</template>

<script lang="ts" setup>
import type {PrimitiveInstanceSvgEllipse} from '@cloudview.visualization-next/services';

interface IProps {
    model: PrimitiveInstanceSvgEllipse;
}

const props = defineProps<IProps>();
</script>
