<template>
    <div v-if="parentTitle" class="breadcrumb">
        <span class="breadcrumb__parent">{{ parentTitle }}</span>
        <span class="breadcrumb__sep">/</span>
        <span class="breadcrumb__current">{{ currentTitle }}</span>
    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import {useLocale} from 'cloudview.ui-next';
import {findMenuTitleKeyByPath, findParentTitleKeyByPath} from '@/modules/main/layout/sidebar-menu';

const {t} = useLocale();
const route = useRoute();

const currentTitle = computed(() => {
    const menuTitleKey = findMenuTitleKeyByPath(route.path);
    const metaTitle = route.meta.title as string | undefined;
    const titleKey = menuTitleKey || (metaTitle?.startsWith('fw.') ? metaTitle : '');
    if (titleKey) {
        return t(titleKey);
    }
    return metaTitle || '';
});
const parentTitle = computed(() => {
    const titleKey = findParentTitleKeyByPath(route.path);
    return titleKey ? t(titleKey) : '';
});
</script>

<style scoped lang="scss">
.breadcrumb {
    padding: 12px 20px 0;
    color: #8f9292;
    font-size: 13px;

    &__current {
        color: #35353e;
        font-weight: 600;
    }

    &__sep {
        margin: 0 6px;
    }
}
</style>
