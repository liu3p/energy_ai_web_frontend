<template>
    <div ref="gridWrapperRef" class="grid-data">
        <div v-if="props.title" class="grid-data-title">
            {{ props.title }}
        </div>
        <div class="grid-data__content">
            <div
                v-for="(item, index) in props.data"
                v-show="item?.show !== false"
                :key="index"
                :style="{width: width, height: _itemHeight + 'px'}"
                class="grid-data-item"
            >
                <div class="grid-data-item-label">
                    <header-tooltip :content="item.label"></header-tooltip>
                </div>
                <div class="grid-data-item-value" :class="item.canClick && 'grid-data-item-canClick'">
                    <header-tooltip
                        :content="dealItemValue(item)"
                        :color-type="item.statusDict ? item.statusDict[item.value]?.colorType : item.valueColorType"
                    >
                        <div v-if="item.canClick" class="grid-arrow"></div>
                    </header-tooltip>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import HeaderTooltip from '@/common/header-tooltip.vue';
import {ColorType} from '@/common/dict';
import {StatusDict} from './status';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();
const props = withDefaults(
    defineProps<{
        data: {
            label: string;
            value: number | string;
            valueColorType?: ColorType;
            unit?: string;
            statusDict?: StatusDict;
            show?: boolean;
            canClick?: boolean;
            click?: () => void;
        }[];
        col?: number;
        title?: string;
        itemHeight?: number;
    }>(),
    {
        col: 1,
        title: '',
        itemHeight: 0,
    }
);

const gridWrapperRef = ref();
const _itemHeight = ref(49);

const getItemHeight = () => {
    if (props.itemHeight) {
        _itemHeight.value = props.itemHeight;
    } else {
        if (gridWrapperRef.value) {
            const rows = Math.ceil(props.data.length / props.col);
            _itemHeight.value = Math.ceil((gridWrapperRef.value as HTMLElement).clientHeight / rows);
        }
    }
};

const width = computed(() => 100 / props.col + '%');

const dealItemValue = (item: any) => {
    let doneValue = '';
    if (item.value === '') {
        doneValue = '--';
    } else if (item.statusDict) {
        doneValue = item.statusDict[item.value]?.value ? t(item.statusDict[item.value]?.value) : item.value;
    }
    if (item.value !== '' && item.value !== '--' && item.value !== '-') {
        doneValue += item.unit ?? '';
    }
    return doneValue;
};

onMounted(() => {
    getItemHeight();
});
</script>
<style scoped lang="scss">
.grid-arrow {
    display: inline-block;
    border: 5px solid transparent;
    border-left-color: #35353e;
    margin-left: 6px;
}
.grid-data {
    display: flex;
    flex-flow: column nowrap;
    margin: 16px 0;
    overflow: auto hidden;

    &-title {
        line-height: 14px;
        font-size: 14px;
        font-weight: 700;
        padding-bottom: 12px;
    }

    &__content {
        flex: 1;
        border: 1px solid #e5e6ea;
        border-top: none;
        overflow: auto;
        border-radius: 4px;
        display: flex;
        flex-wrap: wrap;
    }

    &-item {
        display: flex;
        border-top: 1px solid #e5e6ea;

        &-label {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            word-wrap: break-word;
            flex: 5;
            border-right: 1px solid #e5e6ea;
            background: #f2f3f5;
            text-align: center;
            font-size: 14px; //1445 px
            padding-right: 16px;
            font-weight: 700;
        }

        &-value {
            flex: 4;
            padding-left: 16px;
            font-size: 14px;
            font-weight: 400;
            align-self: center;
        }
        &-canClick {
            cursor: pointer;
        }

        &-unit {
            font-size: 12px;
        }
    }
}
</style>
