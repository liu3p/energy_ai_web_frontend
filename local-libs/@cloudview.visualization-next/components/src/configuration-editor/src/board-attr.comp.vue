<template>
    <div class="vis-board-attr">
        <span class="vis-board-attr__title">{{ t('vis.configuration.boardAttr') }}</span>
        <div class="vis-board-attr__container">
            <vis-attr-input
                v-for="item in config"
                :key="item.id"
                v-model="boardAttrDict[item.id]"
                :config="item"
                :show-binding="false"
                :show-edit="false"
                :show-id="false"
            ></vis-attr-input>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type {IBoardAttr, IBoardAttrConfig} from '@cloudview.visualization-next/services';
import {Configuration, provideObserver} from '@cloudview.visualization-next/services';
import VisAttrInput from '../../attr-input';
import {useLocale} from 'cloudview.ui-next';
import {computed} from 'vue';

const {t} = useLocale();
defineOptions({name: 'BoardAttr'});

const observer = provideObserver();

interface IProps {
    config?: IBoardAttrConfig;
    valueDict?: IBoardAttr;
    attrType: symbol;
    configuration: Configuration;
}

const props = withDefaults(defineProps<IProps>(), {
    config: () => ({} as IBoardAttrConfig),
    valueDict: () => ({} as IBoardAttr),
});

const emits = defineEmits(['update:valueDict']);

const boardAttrDict = computed({
    get() {
        return props.valueDict;
    },
    set(val) {
        emits('update:valueDict', val);
    },
});
</script>
