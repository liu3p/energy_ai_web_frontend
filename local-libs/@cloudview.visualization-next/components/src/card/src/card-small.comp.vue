<template>
    <cv-tooltip :content="props.info?.name" :offset="-60" :show-arrow="false" :show-after="1500">
        <div class="vis-card vis-card--small" :class="props.customClass">
            <div class="vis-card__img-box">
                <img
                    class="vis-card__img"
                    :src="props.imgSrc"
                    :style="style"
                    :alt="props.imgSrc ? t('vis.common.imageLoadError') : ''"
                />
            </div>

            <div class="vis-card__info-box">
                <div class="vis-card__name">{{ props.info?.name }}</div>
                <cv-checkbox
                    v-model="checked"
                    :disabled="!props.checkAble"
                    @change="checkChange($event, props.info?.id)"
                ></cv-checkbox>
            </div>
        </div>
    </cv-tooltip>
</template>
<script lang="ts" setup>
import defaultProps from './props';
import {computed, ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

defineOptions({name: 'CardSmall'});
const props = defineProps(defaultProps);
const emits = defineEmits(['check-change']);

const checked = ref(false);

const checkChange = (val, id) => {
    emits('check-change', val, id);
};

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

const setChecked = val => {
    if (props.checkAble) {
        checked.value = val;
    }
};
defineExpose({setChecked, info: props.info});
</script>
