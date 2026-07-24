<template>
    <g class="vis-primitive-svg">
        <rect
            :x="model.attributes.x"
            :y="model.attributes.y"
            :width="model.attributes.width"
            :height="model.attributes.height"
            fill-opacity="0"
        ></rect>
        <image
            :href="model.model"
            :width="model.attributes.width"
            :height="model.attributes.height"
            :x="model.attributes.x"
            :y="model.attributes.y"
            preserve-aspect-ratio="xMidYMid meet"
            :opacity="model.attributes.opacity"
        ></image>
        <box-rect v-if="model.selected" :type="model.type" :box="model.box" :zoom="props.zoom"></box-rect>
    </g>
</template>

<script lang="ts" setup>
import {getModels, PrimitiveInstanceImage} from '@cloudview.visualization-next/services';
import BoxRect from './box.comp.vue';
import {onMounted} from 'vue';

interface IProps {
    model: PrimitiveInstanceImage;
    zoom: number;
}

const props = withDefaults(defineProps<IProps>(), {});

onMounted(() => {
    if (!props.model.model) {
        getModels(props.model);
    }
});
</script>
