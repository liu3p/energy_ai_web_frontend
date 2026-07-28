<template>
    <div class="main-layout">
        <app-sidebar class="main-layout__sidebar" />
        <div class="main-layout__content">
            <main-header class="main-layout__header" />
            <main-breadcrumb />
            <div class="main-layout__container">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import AppSidebar from '@/modules/main/layout/app-sidebar.vue';
import MainHeader from '@/modules/main/main-header.vue';
import MainBreadcrumb from '@/modules/main/main-breadcrumb.vue';
</script>

<style lang="scss" scoped>
.main-layout {
    display: flex;
    height: 100%;
    overflow: hidden;
    background: #f2f4fa;

    &__sidebar {
        flex-shrink: 0;
    }

    &__content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    &__header {
        flex-shrink: 0;
    }

    &__container {
        flex: 1;
        padding: 16px;
        box-sizing: border-box;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
}
</style>
