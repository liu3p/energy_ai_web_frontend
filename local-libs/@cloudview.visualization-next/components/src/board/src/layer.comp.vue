<template>
    <g class="vis-layer">
        <vis-primitive
            v-for="primitive in layer.elements"
            v-show="!primitive.invisible"
            :key="primitive.id"
            :model="primitive"
            editable
            :no-cursor="props.noCursor"
            :zoom="props.zoom"
            @selected="primitiveSelected"
            @before-select="beforeSelect"
            @click-select="clickSelect"
        ></vis-primitive>
    </g>
</template>

<script lang="ts" setup>
import VisPrimitive from '../../primitive';
import type {Layer} from '@cloudview.visualization-next/services';

defineOptions({name: 'VisLayer'});
const emits = defineEmits(['before-select', 'selected', 'click-select']);

interface IProps {
    layer: Layer;
    noCursor: boolean;
    zoom: number;
}

const props = defineProps<IProps>();

const primitiveSelected = primitive => {
    props.layer.setSelected(true);
    emits('selected', primitive, props.layer);
};

const beforeSelect = (primitive, event) => {
    props.layer.setSelected(true);
    emits('before-select', primitive, props.layer, event);
};

const clickSelect = primitive => {
    emits('click-select', primitive, props.layer);
};
</script>
