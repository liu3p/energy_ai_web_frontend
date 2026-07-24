<template>
    <path
        v-if="type === PrimitiveTypeAllEnum.LINE"
        class="vis-primitive-box is-line"
        :d="d.value"
        stroke="#5a81e7"
        :stroke-width="2 / props.zoom"
        stroke-dasharray="5 5"
        fill="none"
    ></path>
    <rect
        v-else
        class="vis-primitive-box is-rect"
        :x="box.box.x"
        :y="box.box.y"
        :width="box.box.width"
        :height="box.box.height"
        fill="#adc0f3"
        stroke="#5a81e7"
        :stroke-width="2 / props.zoom"
        stroke-dasharray="5 5"
        fill-opacity="0.3"
    ></rect>
</template>

<script lang="ts" setup>
import {Box, type ILineBox, PrimitiveTypeAllEnum} from '@cloudview.visualization-next/services';
import {computed, ref} from 'vue';

interface IProps {
    type: PrimitiveTypeAllEnum;
    box: Box;
    zoom: number;
}

const props = withDefaults(defineProps<IProps>(), {type: PrimitiveTypeAllEnum.SVG});

let d = ref();
if (props.type === PrimitiveTypeAllEnum.LINE) {
    d.value = computed(() => {
        const {x, y, posList} = props.box.box as ILineBox;
        return `M ${x} ${y} ${posList?.map(p => `${p.type} ${p.x} ${p.y}`).join(' ')}`;
    });
}
</script>
