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
import {findMenuTitleByPath, sidebarMenus, type SidebarMenuItem} from '@/modules/main/layout/sidebar-menu';

const route = useRoute();

function findParentTitle(path: string, menus: SidebarMenuItem[] = sidebarMenus): string {
    for (const item of menus) {
        if (item.children?.some(child => child.path === path)) {
            return item.title;
        }
        if (item.children) {
            const nested = findParentTitle(path, item.children);
            if (nested) {
                return nested;
            }
        }
    }
    return '';
}

const currentTitle = computed(() => findMenuTitleByPath(route.path) || (route.meta.title as string) || '');
const parentTitle = computed(() => findParentTitle(route.path));
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
