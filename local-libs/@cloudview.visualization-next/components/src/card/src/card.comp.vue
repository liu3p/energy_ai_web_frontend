<template>
    <cv-tooltip :content="props.info?.name" :offset="-100" :show-arrow="false" :show-after="1500">
        <div class="vis-card" :class="props.customClass">
            <div class="vis-card__img-box" @click="emits('click-img', props.info)">
                <img
                    class="vis-card__img"
                    :src="props.imgSrc"
                    :style="style"
                    :alt="props.imgSrc ? t('vis.common.imageLoadError') : ''"
                />
            </div>
            <div class="vis-card__info-box">
                <div class="vis-card__name">{{ props.info?.name }}</div>
                <div class="vis-card__operates">
                    <div class="vis-card__operates-custom">
                        <cv-button
                            v-for="item in props.operates"
                            :key="item.label"
                            type="primary"
                            link
                            @click="item.callback(props.info)"
                            >{{ item.label }}
                        </cv-button>
                    </div>
                    <cv-button
                        type="primary"
                        link
                        class="vis-card__operate-delete"
                        @click="emits('delete', props.info)"
                    >
                        {{ t('vis.common.delete') }}
                    </cv-button>
                </div>
            </div>
        </div>
    </cv-tooltip>
</template>
<script lang="ts" setup>
import defaultProps from './props';
import {useLocale} from 'cloudview.ui-next';
import {computed} from 'vue';

const {t} = useLocale();

defineOptions({name: 'CardComp'});
const props = defineProps(defaultProps);

const emits = defineEmits(['delete', 'click-img']);

const style = computed(() => {
    if (!props.imgSrc) {
        return {};
    }
    if ('type' in props.info!) {
        return {};
    }
    return {
        width: '100%',
        height: '100%',
    };
});
</script>
