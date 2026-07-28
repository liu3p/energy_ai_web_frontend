<template>
    <img
        v-if="src"
        class="sidebar-menu-icon"
        :src="src"
        :alt="alt"
        width="16"
        height="16"
    />
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
    iconSrc?: string;
    iconActiveSrc?: string;
    active?: boolean;
    alt?: string;
}>();

const src = computed(() => {
    if (props.active && props.iconActiveSrc) {
        return props.iconActiveSrc;
    }
    return props.iconSrc;
});
</script>

<style scoped lang="scss">
.sidebar-menu-icon {
    display: block;
    flex-shrink: 0;
}
</style>
