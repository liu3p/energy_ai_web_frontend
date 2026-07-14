<template>
    <div class="header">
        <cv-breadcrumb v-if="props.showBreadcrumb" separator="/">
            <template v-for="(route, index) in $route.matched" :key="index">
                <template v-if="route.meta?.label">
                    <cv-breadcrumb-item v-if="index !== $route.matched.length - 1" :to="{path: route?.path}">
                        {{ t(route.meta?.label) }}
                    </cv-breadcrumb-item>
                    <cv-breadcrumb-item v-else>{{ t(route.meta?.label) }}</cv-breadcrumb-item>
                </template>
            </template>
        </cv-breadcrumb>
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';

const props = defineProps({
    showBreadcrumb: {
        type: Boolean,
        default: true,
    },
});
const {t: _t} = useLocale();
const t = (label: unknown = '') => _t(label as string);
</script>

<style lang="scss" scoped>
.header {
    padding: var(--fw-gap);
    border-radius: var(--fw-border-raduis);
    background: #fff;
    margin-bottom: var(--fw-gap);
}
</style>
