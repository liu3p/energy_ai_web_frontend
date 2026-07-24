<template>
    <cv-tooltip :content="props.info?.name" :show-after="500" placement="top">
        <div class="vis-card vis-card--mini" :class="props.customClass">
            <div class="vis-card__img-box" :draggable="props.draggable" @dragstart="dragstart(props.info)">
                <img
                    class="vis-card__img"
                    :src="props.imgSrc"
                    :alt="props.imgSrc === '' ? t('vis.common.imageLoadError') : ''"
                />
            </div>

            <div class="vis-card__info-box">
                <div class="vis-card__name">{{ props.info?.name }}</div>
            </div>
        </div>
    </cv-tooltip>
</template>
<script lang="ts" setup>
import defaultProps from './props';
import {useLocale} from 'cloudview.ui-next';
import {dragPrimitiveInfo, store} from '@cloudview.visualization-next/services';

defineOptions({name: 'CardMini'});
const props = defineProps(defaultProps);

const {t} = useLocale();

const dragstart = info => {
    store.commit(dragPrimitiveInfo, info);
};
</script>
