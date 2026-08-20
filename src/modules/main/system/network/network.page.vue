<template>
    <div class="container">
        <div class="network-param">
            <div class="network-param__header">
                <span>{{ t('fw.systemPages.deviceParams') }}</span>
                <span>
                    <cv-button>{{ t('fw.common.edit') }}</cv-button>
                </span>
            </div>
            <div class="network-param__contain">
                <div class="form-item">
                    <div class="label">{{ t('fw.systemPages.serialNumber') }}</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">{{ t('fw.systemPages.deviceModel') }}</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">{{ t('fw.systemPages.hostname') }}</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">{{ t('fw.systemPages.currentTime') }}</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">{{ t('fw.systemPages.timezone') }}</div>
                    <div class="form-wrap">
                        <cv-input />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();
</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
}
.network-param {
    width: 100%;
    height: 142px;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    &__header {
        height: 48px;
        background: #fff;
        padding: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #EBEBEB;
    }
    &__contain {
        background: #fff;
        height: calc(100% - 48px);
        padding: 16px;
        overflow: hidden;
        display: grid;
        grid-template-columns: repeat(5,1fr);
        gap: 50px;
        .label {
            color: #1A1A1A;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 4px;
        }
    }
}
</style>
