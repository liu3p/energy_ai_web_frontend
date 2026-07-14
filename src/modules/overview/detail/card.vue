<template>
    <div class="card">
        <div class="card-title">{{ props.title }}</div>
        <div class="card-cont">
            <div v-for="(item, key) in props.config" :key="key" class="card-cont-item">
                <div class="card-cont-item-title">{{ item.label }}</div>
                <div
                    class="card-cont-item-value"
                    :class="{
                        'color-error':
                            (item.statusDict ? item.statusDict[item.value]?.colorType : item.valueColorType) ===
                            ColorType.ERROR,
                        'color-normal':
                            (item.statusDict ? item.statusDict[item.value]?.colorType : item.valueColorType) ===
                            ColorType.NORMAL,
                        'color-success':
                            (item.statusDict ? item.statusDict[item.value]?.colorType : item.valueColorType) ===
                            ColorType.SUCCESS,
                    }"
                >
                    {{ item.statusDict?.[item.value]?.value ? t(item.statusDict[item.value]?.value) : item.value
                    }}<span v-if="item.unit" class="card-cont-item-unit">{{ item.unit }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {StatusDict} from './status';
import {useLocale} from 'cloudview.ui-next';
import {ColorType} from '@/common/dict';

const {t} = useLocale();
const props = defineProps<{
    title: string;
    config: {
        label: string;
        value: string | number;
        valueColorType?: number;
        unit?: string;
        canClick?: boolean;
        statusDict?: StatusDict;
        click?: () => void;
    }[];
}>();
</script>
<style scoped lang="scss">
.card {
    border-radius: 4px;
    border: 1px solid #e5e6ea;
    background: #fafafa;
    &-title {
        color: #35353e;
        font-size: 14px;
        font-weight: 700;
        line-height: 14px; /* 100% */
        padding: 16px;
        border-bottom: 1px solid #e5e6ea;
    }
    &-cont {
        background-color: #fff;
        padding: 16px 16px 8px;
        display: flex;
        &-item {
            flex: 1;
            &-title {
                color: #35353e;
                font-size: 12px;
                font-weight: 400;
                line-height: 16px;
                opacity: 0.6;
            }
            &-value {
                color: #35353e;
                font-size: 14px;
                font-weight: 700;
                line-height: 32px;
            }
            &-unit {
                color: #35353e;
                font-size: 12px;
                font-weight: 400;
                line-height: 32px;
            }
        }
    }
}
.color-normal {
    color: #3162e1;
}
.color-error {
    color: #ef424c;
}
.color-success {
    color: #1da500;
}
</style>
