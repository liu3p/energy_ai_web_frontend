<template>
    <div class="main">
        <main-header class="main__header"></main-header>
        <main-breadcrumb></main-breadcrumb>
        <div class="main__container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script lang="ts" setup>
import mainHeader from '../main/main-header.vue';
import MainBreadcrumb from '@/modules/main/main-breadcrumb.vue';

</script>

<style lang="scss" scoped>
.main {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &__header {
        position: relative;
        left: 0;
        top: 0;
        z-index: 999;
    }

    &__left {
        margin-right: var(--fw-gap);
        width: 240px;
    }

    &__container {
        flex: 1;
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        overflow: hidden;
        flex-direction: column;
        //margin-top: 56px;
    }

    &__logo {
        font-size: 16px;
        color: #fff;
        text-align: center;
    }

    &__footer {
        color: #ccc;
        text-align: center;
        font-size: 12px;
    }
}
</style>
