<template>
    <div class="vis-attr-add">
        <div class="vis-attr-add__header">
            <div>
                <div class="vis-attr-add__title">{{ t('vis.common.add') + props.prefixName }}</div>
            </div>
            <cv-icon class="vis-attr-add__close" @click="emit('close')">
                <cv-icon-close></cv-icon-close>
            </cv-icon>
        </div>
        <div class="vis-attr-add__body">
            <cv-scrollbar style="padding: 0 20px">
                <cv-form ref="form" :model="formModel" :rules="rules" size="large">
                    <cv-form-item prop="id">
                        <div class="vis-attr-add__prop-title">
                            {{ props.prefixName + 'ID' }}
                            <span class="vis-attr-add__form-title-star">*</span>
                        </div>
                        <cv-input
                            v-model="formModel.id"
                            :title="formModel.id"
                            :disabled="isEdit"
                            :maxlength="40"
                            :show-word-limit="true"
                            :clearable="true"
                        ></cv-input>
                    </cv-form-item>

                    <cv-form-item prop="name">
                        <div class="vis-attr-add__prop-title">
                            {{ props.prefixName + t('vis.common.name') }}
                            <span class="vis-attr-add__form-title-star">*</span>
                        </div>
                        <cv-input
                            v-model="formModel.name"
                            :clearable="true"
                            :maxlength="40"
                            :show-word-limit="true"
                        ></cv-input>
                    </cv-form-item>

                    <cv-form-item prop="tag">
                        <div class="vis-attr-add__prop-title">
                            {{ props.prefixName + t('vis.common.group') }}
                        </div>
                        <cv-select v-model="formModel.tag" allow-create filterable clearable :maxlength="40">
                            <cv-option
                                v-for="(item, index) in props.groups"
                                :key="index"
                                :label="item.label"
                                :value="item.value"
                            ></cv-option>
                        </cv-select>
                    </cv-form-item>

                    <cv-form-item prop="type">
                        <div class="vis-attr-add__prop-title">
                            {{ t('vis.common.dataType') }}
                        </div>
                        <cv-select v-model="formModel.type" @change="typeChangeHandle">
                            <cv-option
                                v-for="(item, key) in dataTypeList"
                                :key="key"
                                :label="t(item)"
                                :value="key"
                            ></cv-option>
                        </cv-select>
                    </cv-form-item>

                    <template v-if="formModel.type === 'number'">
                        <cv-form-item prop="needMax">
                            <cv-checkbox v-model="formModel.needMax" @change="needMaxChangeHandler">
                                {{ t('vis.common.maxValue') }}
                            </cv-checkbox>
                        </cv-form-item>
                        <cv-form-item v-if="formModel.needMax">
                            <cv-input-number
                                v-model="formModel.max"
                                :min="formModel.needMin ? formModel.min : formModel.value"
                                :precision="2"
                                @change="maxChangeHandler"
                            ></cv-input-number>
                        </cv-form-item>

                        <cv-form-item prop="needMin">
                            <cv-checkbox v-model="formModel.needMin" @change="needMinChangeHandler">
                                {{ t('vis.common.minValue') }}
                            </cv-checkbox>
                        </cv-form-item>
                        <cv-form-item v-if="formModel.needMin" prop="min">
                            <cv-input-number
                                v-model="formModel.min"
                                :max="formModel.needMax ? formModel.max : formModel.value"
                                :precision="2"
                                @change="minChangeHandler"
                            ></cv-input-number>
                        </cv-form-item>
                        <cv-form-item prop="step">
                            <div class="vis-attr-add__prop-title">
                                {{ t('vis.common.stepValue') }}
                            </div>
                            <cv-input-number v-model="formModel.step" :precision="2"></cv-input-number>
                        </cv-form-item>
                    </template>

                    <cv-form-item v-if="formModel.type === AttrTypeEnum.SELECT" prop="formModelOptions">
                        <div class="vis-attr-add__prop-title">
                            {{ t('vis.property.select') }}
                            <cv-tooltip
                                content='使用json格式： [["label1", "value1"],["label2", "value2"]]'
                                placement="top"
                            >
                                <cv-icon>
                                    <cv-icon-tip-info></cv-icon-tip-info>
                                </cv-icon>
                            </cv-tooltip>
                        </div>
                        <cv-input v-model="formModelOptions" @change="optionsHandle"></cv-input>
                    </cv-form-item>

                    <cv-form-item prop="value">
                        <div class="vis-attr-add__prop-title">
                            {{ t('vis.common.defaultValue') }}
                        </div>
                        <cv-input v-if="formModel.type === 'text'" v-model="formModel.value"></cv-input>
                        <cv-input-number
                            v-else-if="formModel.type === 'number'"
                            v-model="formModel.value"
                            :precision="2"
                            :min="formModel.needMin ? formModel.min : -Infinity"
                            :max="formModel.needMax ? formModel.max : Infinity"
                            :step="formModel.step"
                            controls-position="right"
                        >
                        </cv-input-number>
                        <cv-color-picker
                            v-else-if="formModel.type === 'color'"
                            v-model="formModel.value"
                            show-alpha
                            :predefine="predefineColors"
                        ></cv-color-picker>
                        <cv-checkbox v-else-if="formModel.type === 'bool'" v-model="formModel.value">
                            {{ formModel.value }}
                        </cv-checkbox>
                        <cv-select v-else-if="formModel.type === 'select'" v-model="formModel.value">
                            <cv-option
                                v-for="item in formModel.options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            ></cv-option>
                        </cv-select>
                    </cv-form-item>

                    <cv-form-item prop="readonly">
                        <cv-checkbox v-model="formModel.readonly">
                            {{ t('vis.common.onlyRead') + props.prefixName }}
                        </cv-checkbox>
                    </cv-form-item>

                    <cv-form-item prop="desc">
                        <div class="vis-attr-add__prop-title">
                            {{ t('vis.common.description') }}
                        </div>
                        <cv-input v-model="formModel.desc" type="textarea" :autosize="{minRows: 3}"></cv-input>
                    </cv-form-item>
                </cv-form>
            </cv-scrollbar>
        </div>
        <div class="vis-attr-add__operation-box">
            <cv-pop-confirm v-if="isEdit" :title="t('vis.common.confirmToDelete')" @confirm="deleteProp">
                <template #reference>
                    <cv-button class="vis-attr-add__button">
                        {{ t('vis.common.delete') }}
                    </cv-button>
                </template>
            </cv-pop-confirm>
            <cv-button class="vis-attr-add__button" type="primary" @click="submitProp">
                {{ t('vis.common.confirm') }}
            </cv-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {CvColorPicker, useLocale} from 'cloudview.ui-next';
import {ref} from 'vue';
import {
    AttrTypeEnum,
    type IAttrBaseDef,
    type IAttrBoolDef,
    type IAttrColorDef,
    type IAttrDef,
    type IAttrNumberDef,
    type IAttrSelectDef,
    type IAttrTextDef,
    predefineColors,
    Utils,
} from '@cloudview.visualization-next/services';

defineOptions({name: 'VisAttrAdd'});
const props = withDefaults(
    defineProps<{
        prefixName: string;
        groups: {label: string; value: string}[];
        forbiddenKeys?: string[];
    }>(),
    {
        forbiddenKeys: () => [],
    }
);
const emit = defineEmits(['close', 'delete', 'submit']);

const {t} = useLocale();
const form = ref();
const initModel = (): IAttrDef => {
    return {
        id: '',
        name: '',
        type: AttrTypeEnum.TEXT,
        attrType: 'userDefined',
        tag: '',
        readonly: false,
        desc: '',
        value: '',
        needMin: false,
        needMax: false,
        min: 0,
        max: 0,
        step: 1,
        options: [],
    };
};
const formModel = ref<IAttrBaseDef>(initModel());
const isEdit = ref(false);
const rules = {
    id: [
        {
            required: true,
            message: t('vis.common.enterAttrId'),
        },
        {
            validator(rule, value, callback) {
                if (!isEdit.value) {
                    if (value.trim() === '') {
                        return callback(new Error(t('vis.common.canNotOnlySpace')));
                    }
                    return props.forbiddenKeys.indexOf(value) === -1
                        ? callback()
                        : callback(new Error(t('vis.message.forbiddenId')));
                }
                return callback();
            },
        },
    ],
    name: [
        {required: true, message: t('vis.primitive.primitiveName')},
        {
            validator(rule, value, callback) {
                if (value.trim() === '') {
                    return callback(new Error(t('vis.common.canNotOnlySpace')));
                }
                return callback();
            },
        },
    ],
};

const formModelOptions = ref('');
const optionsHandle = () => {
    try {
        const value = JSON.parse(`${formModelOptions.value}`);
        (formModel.value as IAttrSelectDef).options = value.map(item => {
            return {
                label: item[0],
                value: item[1],
            };
        });
    } catch (e) {
        CvMessage({type: 'error', message: t('vis.primitive.optionConfigError')});
    }
};

const dataTypeList = {
    [AttrTypeEnum.NUMBER]: 'vis.property.number',
    [AttrTypeEnum.TEXT]: 'vis.property.text',
    [AttrTypeEnum.COLOR]: 'vis.property.color',
    [AttrTypeEnum.BOOLEAN]: 'vis.property.bool',
    [AttrTypeEnum.SELECT]: 'vis.property.select',
};
const typeChangeHandle = (type: AttrTypeEnum) => {
    switch (type) {
        case AttrTypeEnum.BOOLEAN:
            (formModel.value as IAttrBoolDef).value = false;
            break;
        case AttrTypeEnum.COLOR:
            (formModel.value as IAttrColorDef).value = '';
            break;
        case AttrTypeEnum.SELECT:
            (formModel.value as IAttrSelectDef).value = '';
            break;
        case AttrTypeEnum.NUMBER:
            (formModel.value as IAttrNumberDef).value = 0;
            break;
        case AttrTypeEnum.TEXT:
            (formModel.value as IAttrTextDef).value = '';
            break;
    }
};
const needMaxChangeHandler = () => {
    const model = formModel.value as IAttrNumberDef;
    if (model.needMax) {
        (formModel.value as IAttrNumberDef).max = model.value < model.max! ? model.max : model.value;
    }
};
const maxChangeHandler = val => {
    const model = formModel.value as IAttrNumberDef;
    if (val < model.value) {
        (formModel.value as IAttrNumberDef).value = val;
    }
};
const needMinChangeHandler = () => {
    const model = formModel.value as IAttrNumberDef;
    if (model.needMin) {
        (formModel.value as IAttrNumberDef).min = model.value < model.min! ? model.value : model.min;
    }
};
const minChangeHandler = val => {
    const model = formModel.value as IAttrNumberDef;
    if (val > model.value) {
        (formModel.value as IAttrNumberDef).value = val;
    }
};
const deleteProp = () => {
    emit('delete', formModel.value.id);
};
const submitProp = () => {
    form.value.validate((valid: boolean, errorFields) => {
        if (valid) {
            emit('submit', Utils.deepClone(formModel.value));
        } else {
            CvMessage({type: 'error', message: t('vis.common.formItemError')});
            form.value.scrollToField(Object.keys(errorFields)[0]);
        }
    });
};
const show = attrConfig => {
    isEdit.value = !!attrConfig;
    formModel.value = Object.assign(initModel(), attrConfig);
    if (attrConfig && attrConfig.type === AttrTypeEnum.SELECT) {
        formModelOptions.value = JSON.stringify(
            (formModel.value as IAttrSelectDef).options.map(item => [item.label, item.value])
        );
    }
    form.value.resetFields();
};
defineExpose({
    show,
});
</script>
