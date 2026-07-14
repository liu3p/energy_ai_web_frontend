<template>
    <div class="patch-match">
        <div class="patch-match__label">
            {{ t('common.patchMatchPage') }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
const {t} = useLocale();
</script>

<style scoped lang="scss">
.patch-match {
    flex: 1 0 0;
    width: 100%;
    height: 100%;
    background: url('../../assets/404.png') no-repeat center;
    overflow: hidden;

    &__label {
        font-size: 36px;
        width: 370px;
        height: 50px;
        margin: auto;
        white-space: nowrap;
        position: relative;
        top: 65%;
    }
}
</style>
