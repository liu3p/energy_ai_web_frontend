<script setup lang="ts">
import {watch} from 'vue';
import {setLocaleMessages} from './locale-store';

const props = defineProps<{
    locale?: Record<string, unknown>;
}>();

watch(
    () => props.locale,
    val => {
        if (val) {
            setLocaleMessages(val);
        }
    },
    {immediate: true, deep: true}
);
</script>

<template>
    <slot />
</template>
