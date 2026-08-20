<template>
    <div class="placeholder-page main-body">
        <div class="placeholder-page__title">{{ displayTitle }}</div>
        <div class="placeholder-page__desc">{{ t('fw.layout.pageBuilding') }}</div>
    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useLocale} from 'cloudview.ui-next';

const props = defineProps<{
    title?: string;
    titleKey?: string;
}>();

const {t} = useLocale();

const displayTitle = computed(() => {
    if (props.titleKey) {
        return t(props.titleKey);
    }
    return props.title || '';
});
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
