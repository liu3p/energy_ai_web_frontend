<template>
    <animate
        v-if="flash"
        attributeName="opacity"
        from="0"
        to="1"
        :dur="flashDur"
        :begin="flashBegin"
        repeatCount="indefinite"
    />
</template>
<script lang="ts" setup>
defineOptions({
    name: 'VisPrimitiveAnimation',
});
const props = defineProps({
    flash: {
        type: Boolean,
        default: false,
    },
    flashDur: {
        type: Number,
        default: 0.5,
    },
    flashBegin: {
        type: Number,
        default: 0,
    },
});
</script>
