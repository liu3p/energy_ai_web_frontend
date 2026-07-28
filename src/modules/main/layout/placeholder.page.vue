<template>
    <div class="placeholder-page main-body">
        <div class="placeholder-page__title">{{ title }}</div>
        <div class="placeholder-page__desc">页面建设中，敬请期待。</div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
}>();
</script>

<style scoped lang="scss">
.placeholder-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 320px;
    color: #8f9292;

    &__title {
        font-size: 20px;
        font-weight: 700;
        color: #35353e;
        margin-bottom: 12px;
    }
}
</style>
