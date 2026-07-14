<template>
    <div class="overview">
        <div class="overview__header">
            <breadcrumb :config="breadcrumbConfig" />
        </div>
        <div class="overview__content">
            <cv-tabs v-model="activeName" :panes="panes"> </cv-tabs>
            <device-detail v-if="activeName === '1'" />
        </div>
    </div>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import Breadcrumb from '@/common/breadcrumb.vue';
import {useLocale} from 'cloudview.ui-next';
import DeviceDetail from './device-detail.vue';

const {t} = useLocale();

const breadcrumbConfig = [{path: '/main/overview', label: t('auth.overview')}, {label: t('fw.common.detail')}];
const activeName = ref('1');
const panes = ref([
    {
        name: '1',
        label: t('fw.overview.deviceDetail'),
    },
    {
        name: '2',
        label: t('fw.overview.curveAnalysis'),
    },
    {
        name: '3',
        label: t('fw.overview.tableAnalysis'),
    },
]);
</script>
<style scoped lang="scss">
.overview {
    padding: 8px;
    &__header {
        height: 40px;
        line-height: 40px;
    }
    &__content {
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.04);
        background: #fff;
        padding-top: 12px;
    }
}
</style>
