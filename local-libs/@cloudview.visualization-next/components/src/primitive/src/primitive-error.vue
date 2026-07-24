<template>
    <g>
        <line
            :x1="props.x"
            :y1="props.y"
            :x2="props.endX"
            :y2="props.endY"
            fill="red"
            stroke="red"
            stroke-width="10"
        ></line>
        <line
            :x1="props.endX"
            :y1="props.y"
            :x2="props.x"
            :y2="props.endY"
            fill="red"
            stroke="red"
            stroke-width="10"
        ></line>
        <animate attributeName="opacity" from="1" to="0" dur="0.5s" repeatCount="indefinite"></animate>
    </g>
</template>
<script lang="ts" setup>
defineOptions({name: 'VisPrimitiveError'});
const props = defineProps<{
    x: number;
    y: number;
    endX: number;
    endY: number;
}>();
</script>
