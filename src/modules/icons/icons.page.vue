<template>
    <main-header></main-header>
    <div class="main-body icons-view">
        <div v-for="icon in icons" :key="icon.name" class="icons-view__cell">
            <div class="icons-view__icon">
                <cv-icon :size="24" color="#42ccef">
                    <component :is="icon"></component>
                </cv-icon>
            </div>
            <div class="icons-view__title">
                {{ icon.name }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import MainHeader from '../../common/main-header.vue';
import * as icons from '../../icons/index.js';
</script>

<style lang="scss">
.icons-view {
    display: flex;
    flex-wrap: wrap;
    background-color: #efefef;

    &__cell {
        border: 1px solid #eaeaea;
        flex: 1 1 140px;
        height: 100px;
        display: flex;
        flex-direction: column;
    }

    &__icon {
        flex-basis: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &__title {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        color: #9c9c9c;
    }
}
</style>
