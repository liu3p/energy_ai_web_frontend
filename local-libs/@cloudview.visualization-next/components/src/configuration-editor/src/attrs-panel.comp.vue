<template>
    <component
        :is="compDict[type]"
        v-bind="attrProps"
        :attr-type="type"
        :configuration="props.configuration"
        :binding-visible="props.bindingVisible"
    ></component>
</template>

<script lang="ts" setup>
import {boardAttrConfig, Configuration, provideObserver, Topics} from '@cloudview.visualization-next/services';
import {AttrTypes} from './types';
import BoardAttr from './board-attr.comp.vue';
import PrimitiveAttrs from './primitive-attr.comp.vue';
import BatchPrimitiveAttrs from './batch-primitive-attr.comp.vue';
import {ref, watch} from 'vue';

interface IProps {
    configuration: Configuration;
    bindingVisible: boolean;
}

const props = defineProps<IProps>();

defineOptions({name: 'AttrsPanel'});
const observer = provideObserver();
const compDict = {
    [AttrTypes.BOARD]: BoardAttr,
    [AttrTypes.PRIMITIVE]: PrimitiveAttrs,
    [AttrTypes.BATCH_PRIMITIVE]: BatchPrimitiveAttrs,
};
const type = ref(AttrTypes.BOARD);
const attrProps = ref();

watch(
    () => props.configuration,
    () => {
        if (props.configuration?.activatedBoard) {
            if (props.configuration.activatedBoard.selectedPrimitives.length === 1) {
                type.value = AttrTypes.PRIMITIVE;
                attrProps.value = {
                    primitive: props.configuration.activatedBoard.selectedPrimitives[0],
                };
            } else if (props.configuration.activatedBoard.selectedPrimitives.length > 1) {
                type.value = AttrTypes.BATCH_PRIMITIVE;
                attrProps.value = {
                    primitives: props.configuration.activatedBoard.selectedPrimitives,
                };
                observer.dispatch(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, false);
            } else {
                type.value = AttrTypes.BOARD;
                attrProps.value = {
                    config: boardAttrConfig,
                    valueDict: props.configuration.activatedBoard.attributes,
                };
                observer.dispatch(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, false);
            }
        }
    },
    {immediate: true, deep: true}
);
</script>
