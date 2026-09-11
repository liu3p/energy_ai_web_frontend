<template>
    <div class="empty" :class="className">
        <img src="../assets/empty.svg" alt="" :style="{height}" />
        <div>{{ t('fw.common.noData') }}</div>
    </div>
</template>

<script setup lang="ts">
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

defineProps({
    className: {
        type: String,
    },
    height: {
        type: String,
    }
})
</script>

<style scoped lang="scss">
.empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
