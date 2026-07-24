<template>
    <g class="vis-primitive-svg-rect">
        <path :d="d" :stroke-width="bgWidth" stroke="black" stroke-opacity="0" fill-opacity="0" fill="none"></path>
        <path
            :d="d"
            :opacity="model.attributes.opacity"
            :stroke="model.attributes['background-color']"
            :stroke-opacity="model.attributes['background-opacity']"
            :stroke-width="model.attributes['background-width']"
            :visibility="model.attributes['background-visible'] ? 'visible' : 'hidden'"
            fill="none"
        >
        </path>
        <path
            :d="d"
            :opacity="model.attributes.opacity"
            :stroke="model.attributes.stroke"
            :stroke-opacity="model.attributes['stroke-opacity']"
            :stroke-dasharray="model.attributes['stroke-dasharray']"
            :stroke-width="model.attributes['stroke-width']"
            fill="none"
        >
            <animate
                v-if="model.attributes['stream-animation']"
                attributeName="stroke-dashoffset"
                :from="model.attributes['stream-direction-reverse'] ? 0 : 20000"
                :to="model.attributes['stream-direction-reverse'] ? 20000 : 0"
                :dur="dur"
                repeatCount="indefinite"
                begin="0"
            ></animate>
        </path>
        <box-rect v-if="model.selected" :type="model.type" :box="model.box" :zoom="props.zoom"></box-rect>
    </g>
</template>

<script lang="ts" setup>
import type {PrimitiveInstanceSvgLine} from '@cloudview.visualization-next/services';
import BoxRect from './box.comp.vue';
import {computed} from 'vue';

interface IProps {
    model: PrimitiveInstanceSvgLine;
    zoom: number;
}

const props = defineProps<IProps>();

const d = computed(() => {
    const {x, y, posList} = props.model.attributes;
    return `M ${x} ${y} ${posList?.map(p => `${p.type} ${p.x} ${p.y}`).join(' ')}`;
});

const dur = computed(() => {
    return `${1000 / props.model.attributes['stream-speed']}s`;
});

const bgWidth = computed(() => {
    if (props.model.attributes['background-visible']) {
        return Math.max(props.model.attributes['background-width'], props.model.attributes['stroke-width']);
    }
    return props.model.attributes['stroke-width'];
});
</script>
