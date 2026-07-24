<template>
    <div class="vis-attr-input">
        <div class="vis-attr-input__top">
            <div class="vis-attr-input__name-box">
                <span class="vis-attr-input__name">
                    <cv-tooltip :content="title" placement="top" :show-after="1000">{{ title }}</cv-tooltip>
                </span>
                <cv-icon v-if="props.showEdit" :size="12" @click="emit('edit', config)">
                    <cv-icon-edit></cv-icon-edit>
                </cv-icon>
                <cv-tooltip v-if="props.config.desc" placement="top" :content="t(props.config.desc)">
                    <cv-icon :size="12" color="#bbb">
                        <cv-icon-tip-info></cv-icon-tip-info>
                    </cv-icon>
                </cv-tooltip>
            </div>
            <span
                v-if="props.showBinding"
                class="vis-attr-input__binding"
                :class="{'is-binding': props.hasBinding}"
                @click="emit('showDataBinding')"
            >
                {{ t('vis.property.dataBinding') }}
            </span>
        </div>
        <div
            style="display: flex; flex-direction: column"
            @keydown.ctrl.z.exact.stop
            @keydown.ctrl.y.exact.stop
            @keydown.ctrl.shift.z.exact.stop
            @keydown.meta.z.exact.stop
            @keydown.meta.y.exact.stop
            @keydown.meta.shift.z.exact.stop
        >
            <component :is="compDict[props.config.type].comp" v-model="value" v-bind="compProps" size="large">
                <template v-if="props.config.type === AttrTypeEnum.SELECT">
                    <cv-option
                        v-for="item in props.config.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </cv-option>
                </template>
            </component>
        </div>
    </div>
</template>
<script lang="ts" setup>
import type {
    IAttrBoolDef,
    IAttrColorDef,
    IAttrDef,
    IAttrNumberDef,
    IAttrSelectDef,
    IAttrTextDef,
} from '@cloudview.visualization-next/services';
import {AttrTypeEnum, predefineColors} from '@cloudview.visualization-next/services';
import 'cloudview.ui-next/es/input/style/css';
import 'cloudview.ui-next/es/input-number/style/css';
import 'cloudview.ui-next/es/select/style/css';
import 'cloudview.ui-next/es/checkbox/style/css';
import 'cloudview.ui-next/es/color-picker/style/css';
import {CvCheckbox, CvColorPicker, CvInput, CvInputNumber, CvSelect, useLocale} from 'cloudview.ui-next';
import VisStrokeDasharraySelect from './stroke-dasharray-select.vue';
import VisLineArrowSelect from './line-arrow-select.vue';
import {computed} from 'vue';
import {CvIconTipInfo} from 'cloudview.ui-next-icon';

const {t} = useLocale();

defineOptions({name: 'AttrInput'});

interface IProps {
    modelValue: number | string | boolean | null;
    config: IAttrDef;
    showBinding?: boolean;
    showEdit?: boolean;
    showId?: boolean;
    hasBinding?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    modelValue: null,
    showBinding: true,
    showEdit: false,
    showId: true,
    hasBinding: false,
});

const emit = defineEmits(['update:modelValue', 'showDataBinding', 'edit']);

const value = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        emit('update:modelValue', val);
    },
});

const compDict = {
    [AttrTypeEnum.BOOLEAN]: {
        comp: CvCheckbox,
        props() {
            const config = props.config as IAttrBoolDef;
            return {
                disabled: config.disabled,
                readonly: config.readonly,
            };
        },
    },
    [AttrTypeEnum.TEXT]: {
        comp: CvInput,
        props() {
            const config = props.config as IAttrTextDef;
            return {
                disabled: config.disabled,
                readonly: config.readonly,
            };
        },
    },
    [AttrTypeEnum.NUMBER]: {
        comp: CvInputNumber,
        props() {
            const config = props.config as IAttrNumberDef;
            return {
                step: config.step,
                min: config.needMin ? config.min : -Infinity,
                max: config.needMax ? config.max : Infinity,
                disabled: config.disabled,
                readonly: config.readonly,
            };
        },
    },
    [AttrTypeEnum.SELECT]: {
        comp: CvSelect,
        props() {
            const config = props.config as IAttrSelectDef;
            return {
                disabled: config.disabled,
                readonly: config.readonly,
            };
        },
    },
    [AttrTypeEnum.COLOR]: {
        comp: CvColorPicker,
        props() {
            const config = props.config as IAttrColorDef;
            return {
                disabled: config.disabled,
                showAlpha: true,
                predefine: predefineColors,
                readonly: config.readonly,
            };
        },
    },
    [AttrTypeEnum.STROKE_DASHARRAY]: {
        comp: VisStrokeDasharraySelect,
        props() {
            return {};
        },
    },
    [AttrTypeEnum.LINE_ARROW]: {
        comp: VisLineArrowSelect,
        props() {
            return {};
        },
    },
};

const compProps = computed(() => {
    return compDict[props.config.type].props();
});

const title = computed(() => {
    return props.showId ? `${t(props.config.name)}(${props.config.id})` : t(props.config.name);
});
</script>
