<template>
    <div class="vis-primitive-attr">
        <div class="vis-primitive-attr__binding" :style="{width: bindingVisible ? '260px' : '0'}">
            <vis-data-binding
                v-if="bindingVisible"
                :bindings="props.primitive?.bindings"
                :devices="props.primitive?.devices"
                :key-config="attrConfig"
                :binding-key="bindingKey"
                :data-type="getBindingDataType()"
                @close="hideBinding"
            ></vis-data-binding>
        </div>
        <div class="vis-primitive-attr__attr-panel">
            <span class="vis-primitive-attr__title">
                <cv-tooltip :content="props.primitive?.name" :show-after="1000">{{ props.primitive?.name }}</cv-tooltip>
            </span>
            <cv-button class="vis-primitive-attr__bind-device" @click="openSelectDialog">
                {{ t('vis.configuration.bindDevice') }}
                <span v-if="props.primitive?.devices.length" class="vis-primitive-attr__bind-device-num">
                    {{ props.primitive?.devices.length }}
                </span>
            </cv-button>
            <cv-checkbox v-model="justShowBinding" class="vis-primitive-attr__just-show-binding">
                {{ t('vis.property.showBindProperty') }}
            </cv-checkbox>
            <vis-primitive-attrs
                :configs="props.primitive?.defaultConfig"
                :user-defined-configs="props.primitive?.userDefined"
                :values="props.primitive?.attributes"
                :bindings="props.primitive?.bindings"
                :just-show-has-binding="justShowBinding"
                :status="props.primitive.status ?? {}"
                :status-list="props.primitive instanceof PrimitiveInstanceSvg ? props.primitive.statusList : []"
                @show-data-binding="showBinding"
            ></vis-primitive-attrs>
        </div>
    </div>
    <vis-select-equipment v-model="selectDialogVisible" :primitive="props.primitive"></vis-select-equipment>
</template>

<script lang="ts" setup>
import type {Primitive, PrimitiveInstance} from '@cloudview.visualization-next/services';
import {
    Configuration,
    PrimitiveInstanceSvg,
    provideObserver,
    statusPrefix,
    Topics,
} from '@cloudview.visualization-next/services';
import {useLocale} from 'cloudview.ui-next';
import {computed, onActivated, onDeactivated, onMounted, onUnmounted, ref} from 'vue';
import VisPrimitiveAttrs from '../../primitive-attrs';
import VisSelectEquipment from './select-equipment.vue';
import VisDataBinding from '../../data-binding';

const {t} = useLocale();

defineOptions({name: 'PrimitiveAttr'});

interface IProps {
    primitive: Primitive | PrimitiveInstance;
    attrType: symbol;
    configuration: Configuration;
    bindingVisible: boolean;
}

const props = withDefaults(defineProps<IProps>(), {});

const justShowBinding = ref(false);
const selectDialogVisible = ref(false);
const openSelectDialog = () => {
    selectDialogVisible.value = true;
};

// 数据绑定窗口
const bindingKey = ref('');
const observer = provideObserver();
const attrConfig = computed(() => {
    if (bindingKey.value.startsWith(statusPrefix)) {
        return {
            id: bindingKey.value,
            name: t('vis.common.state') + bindingKey.value.replace(statusPrefix, ''),
            attrType: 'status',
        };
    } else {
        return Object.assign({}, props.primitive.defaultConfig, props.primitive.userDefined)[bindingKey.value];
    }
});
const getBindingDataType = () => {
    try {
        const value = (props.primitive as PrimitiveInstance).getAttribute(bindingKey.value);
        if (bindingKey.value.includes('color') && value === null) {
            return 'string';
        } else {
            return typeof value;
        }
    } catch (e) {
        return '';
    }
};
const showBinding = (key: string) => {
    bindingKey.value = key;
    observer.dispatch(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, true);
};
const hideBinding = () => {
    observer.dispatch(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, false);
};
// 切换选中图元时关闭数据绑定窗口
let hideBindingCB;
const hideBindingListener = () => {
    hideBindingCB = observer.on(Topics.PROVIDE_PRIMITIVE_ATTR, (instance: PrimitiveInstance) => {
        if (props.primitive !== instance && props.bindingVisible) {
            hideBinding();
        }
    });
};

const offHideBindingListener = () => {
    observer.off(Topics.PROVIDE_PRIMITIVE_ATTR, hideBindingCB);
};
onActivated(hideBindingListener);
onDeactivated(offHideBindingListener);
onMounted(hideBindingListener);
onUnmounted(offHideBindingListener);

// const closeRightAdditionWindow = () => observer.dispatch(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, false);
// onActivated(closeRightAdditionWindow);
// onMounted(closeRightAdditionWindow);
// onDeactivated(hideBinding);
// onUnmounted(hideBinding);
</script>
