<template>
    <div
        class="vis-data-binding"
        :class="{'show-border': props.showHeader}"
        tabindex="1"
        @keydown.ctrl.z.exact.stop
        @keydown.ctrl.y.exact.stop
        @keydown.ctrl.shift.z.exact.stop
        @keydown.meta.z.exact.stop
        @keydown.meta.y.exact.stop
        @keydown.meta.shift.z.exact.stop
    >
        <div v-if="props.showHeader" class="vis-data-binding__header">
            <div>
                <div class="vis-data-binding__title">{{ t('vis.common.dataBinding') }}</div>
                <div class="vis-data-binding__sub-title">
                    {{ t(props.keyConfig.name ?? '') }} ({{ props.keyConfig?.id }})
                </div>
            </div>
            <cv-icon class="vis-data-binding__close" @click="emit('close')">
                <cv-icon-close></cv-icon-close>
            </cv-icon>
        </div>
        <div class="vis-data-binding__body">
            <cv-scrollbar style="padding: 0 15px 15px">
                <cv-form :model="dataBindingForm" :rules="rules">
                    <cv-form-item prop="type">
                        <div class="vis-data-binding__prop-title">
                            {{ t('vis.property.bindType') }}
                        </div>
                        <cv-select v-model="dataBindingForm.type" :clearable="true" @change="bindTypeChangeHandler">
                            <cv-option
                                v-for="(item, index) in bindTypeList"
                                :key="index"
                                :label="t(item.label)"
                                :value="item.value"
                            ></cv-option>
                        </cv-select>
                    </cv-form-item>
                    <template v-if="dataBindingForm.type !== ''">
                        <!-- 自定义绑定 -->
                        <template v-if="dataBindingForm.type.startsWith('custom')">
                            <cv-form-item prop="customKey">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectCustomItem') }}
                                </div>
                                <cv-select v-model="dataBindingForm.customKey">
                                    <cv-option
                                        v-for="(item, key) in customItems"
                                        :key="key"
                                        :value="key"
                                        :label="item.label"
                                    ></cv-option>
                                </cv-select>
                            </cv-form-item>
                        </template>

                        <!-- 选择设备 -->
                        <template
                            v-if="
                                [
                                    DataBindingTypeEnum.DEVICE_INFO,
                                    DataBindingTypeEnum.DEVICE_PROP,
                                    DataBindingTypeEnum.DEVICE_STATE,
                                ].indexOf(dataBindingForm.type) > -1 ||
                                dataBindingForm.type.startsWith('tele') ||
                                (dataBindingForm.type.startsWith('custom') &&
                                    customItems?.[dataBindingForm.customKey]?.needSelectDevice)
                            "
                        >
                            <cv-form-item prop="snId">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectDevice') }}
                                </div>
                                <cv-select v-model="dataBindingForm.deviceId" @change="deviceChangHandler">
                                    <cv-option
                                        v-for="(item, index) in props.devices"
                                        :key="index"
                                        :label="item.name"
                                        :value="item.id"
                                    ></cv-option>
                                </cv-select>
                            </cv-form-item>
                        </template>

                        <!-- 选择topic -->
                        <template
                            v-if="
                                dataBindingForm.type === DataBindingTypeEnum.TELEMETRY ||
                                dataBindingForm.type === DataBindingTypeEnum.TELEINDICATION ||
                                dataBindingForm.type === DataBindingTypeEnum.TELEPULSE ||
                                dataBindingForm.type === DataBindingTypeEnum.DEVICE_PROP
                            "
                        >
                            <cv-form-item prop="topic">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectDeviceAttribute') }}
                                </div>
                                <cv-select v-model="dataBindingForm.topic" @change="topicChangeHandler">
                                    <cv-option
                                        v-for="(item, index) in topicList"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.value"
                                    ></cv-option>
                                </cv-select>
                            </cv-form-item>
                        </template>

                        <cv-form-item prop="translateToLabel">
                            <cv-checkbox
                                v-if="dataBindingForm.type === DataBindingTypeEnum.TELEINDICATION"
                                v-model="dataBindingForm.translateToLabel"
                                @change="translateToLabelChangeHandler"
                            >
                                {{ t('vis.configuration.translateToLabel') }}
                            </cv-checkbox>
                        </cv-form-item>

                        <!-- 设备信息 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.DEVICE_INFO">
                            <cv-form-item prop="topic">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectDeviceAttribute') }}
                                </div>
                                <cv-select v-model="dataBindingForm.deviceInfo">
                                    <cv-option
                                        v-for="(item, index) in propsList"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.value"
                                    ></cv-option>
                                </cv-select>
                            </cv-form-item>
                        </template>

                        <!-- 选择图元 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.PRIMITIVE_PROP">
                            <cv-form-item prop="topic">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectPrimitive') }}
                                </div>
                                <cv-select v-model="dataBindingForm.primitiveId" @change="primitiveChangeHandler">
                                    <cv-option
                                        v-for="(item, index) in primitiveList"
                                        :key="index"
                                        :label="item.name"
                                        :value="item.id"
                                    ></cv-option>
                                </cv-select>
                            </cv-form-item>
                        </template>

                        <!-- 选择图元属性 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.PRIMITIVE_PROP">
                            <cv-form-item prop="topic">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectPrimitive') }}（{{ t('vis.property.choices') }}）
                                </div>
                                <cv-select v-model="dataBindingForm.primitiveProps" multiple>
                                    <cv-option
                                        v-for="(item, index) in primitivePropList"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.value"
                                    ></cv-option>
                                </cv-select>
                            </cv-form-item>
                        </template>

                        <!-- 画板参数 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.BOARD_ARGS">
                            <cv-form-item prop="boardArgsName">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectBoardParameter') }}（{{ t('vis.property.choices') }}）
                                </div>
                                <cv-select key="board-args" v-model="dataBindingForm.args" multiple>
                                    <cv-option
                                        v-for="(item, index) in boardArgsList"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.value"
                                    ></cv-option>
                                </cv-select>
                            </cv-form-item>
                        </template>

                        <!-- 脚本程序 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.SCRIPT">
                            <cv-form-item prop="eventAction">
                                <div
                                    class="vis-data-binding__prop-title"
                                    style="display: flex; justify-content: space-between"
                                >
                                    {{ t('vis.property.scriptContent') }}
                                </div>
                                <cv-input
                                    v-model="dataBindingForm.eventAction"
                                    type="textarea"
                                    :rows="5"
                                    :readonly="true"
                                    @click="openScriptEditor"
                                ></cv-input>
                            </cv-form-item>
                        </template>

                        <!-- 数据转换 -->
                        <template
                            v-if="
                                props.keyConfig.attrType !== 'event' &&
                                dataBindingForm.type !== DataBindingTypeEnum.SCRIPT
                            "
                        >
                            <cv-form-item prop="transformDefinition">
                                <cv-tooltip :content="t('vis.property.scriptTips')" placement="top">
                                    <div style="display: flex; justify-content: space-between; width: 100%">
                                        <div class="vis-data-binding__prop-title">
                                            {{ t('vis.property.transformationDefinition') }}
                                            <cv-icon>
                                                <cv-icon-tip-info></cv-icon-tip-info>
                                            </cv-icon>
                                        </div>
                                        <div class="vis-data-binding__convert-data-type">
                                            {{ t('vis.configuration.requiredDataType') }}{{ dataType }}
                                        </div>
                                    </div>
                                </cv-tooltip>

                                <cv-input
                                    v-model="dataBindingForm.convertDefinition"
                                    type="textarea"
                                    :rows="5"
                                    :readonly="true"
                                    :disabled="dataBindingForm.translateToLabel"
                                    @click="openScriptEditor"
                                ></cv-input>
                            </cv-form-item>
                        </template>

                        <!-- 画板切换 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.BOARD_TOGGLE">
                            <cv-form-item :prop="'boardId'">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectBoard') }}
                                </div>
                                <cv-select v-model="dataBindingForm.boardId">
                                    <cv-option
                                        v-for="(item, index) in boardList"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.value"
                                    ></cv-option>
                                </cv-select>
                            </cv-form-item>
                        </template>

                        <!-- 链接跳转 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.LINK_TO">
                            <cv-form-item prop="blank">
                                <div class="vis-data-binding__prop-title" style="margin-right: 6px">
                                    {{ t('vis.property.newBlank') }}
                                </div>
                                <cv-checkbox v-model="dataBindingForm.blank"></cv-checkbox>
                            </cv-form-item>
                            <cv-form-item prop="url">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.url') }}
                                </div>
                                <cv-input v-model="dataBindingForm.url" placeholder="http://"></cv-input>
                            </cv-form-item>
                        </template>

                        <!-- 组态图跳转 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.LINT_TO_CONFIGURATION">
                            <cv-form-item prop="configurationId">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.selectConfiguration') }}
                                </div>
                                <cv-lazy-select
                                    v-model="dataBindingForm.configurationId"
                                    :load-options="loadConfigurations"
                                ></cv-lazy-select>
                            </cv-form-item>
                        </template>

                        <!-- 弹窗 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.DIALOG">
                            <cv-form-item prop="title">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.dialogTitle') }}
                                </div>
                                <cv-input v-model="dataBindingForm.title"></cv-input>
                            </cv-form-item>
                            <cv-form-item prop="width">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.width') }}
                                </div>
                                <cv-input v-model="dataBindingForm.width"></cv-input>
                            </cv-form-item>
                            <cv-form-item prop="dialogContent">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.dialogContent') }}
                                </div>
                                <cv-input
                                    v-model="dataBindingForm.content"
                                    type="textarea"
                                    :rows="5"
                                    :readonly="true"
                                    @click="openRichTextEditor"
                                ></cv-input>
                            </cv-form-item>
                        </template>

                        <!-- 浮窗 -->
                        <template v-if="dataBindingForm.type === DataBindingTypeEnum.POPOVER">
                            <cv-form-item prop="title">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.popoverTitle') }}
                                </div>
                                <cv-input v-model="dataBindingForm.title"></cv-input>
                            </cv-form-item>
                            <cv-form-item prop="width">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.width') }}
                                </div>
                                <cv-input v-model="dataBindingForm.width"></cv-input>
                            </cv-form-item>
                            <cv-form-item prop="direction">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.popoverDirection') }}
                                </div>
                                <cv-select v-model="dataBindingForm.direction">
                                    <cv-option :label="t('vis.property.directionLeft')" value="left"></cv-option>
                                    <cv-option :label="t('vis.property.directionRight')" value="right"></cv-option>
                                    <cv-option :label="t('vis.property.directionTop')" value="top"></cv-option>
                                    <cv-option :label="t('vis.property.directionBottom')" value="bottom"></cv-option>
                                </cv-select>
                            </cv-form-item>
                            <cv-form-item prop="backColor">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.background') }}
                                </div>
                                <div style="width: 100%">
                                    <cv-color-picker v-model="dataBindingForm.backColor" show-alpha></cv-color-picker>
                                </div>
                            </cv-form-item>
                            <cv-form-item prop="foreColor">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.textColor') }}
                                </div>
                                <div style="width: 100%">
                                    <cv-color-picker v-model="dataBindingForm.foreColor" show-alpha></cv-color-picker>
                                </div>
                            </cv-form-item>
                            <cv-form-item prop="value">
                                <div class="vis-data-binding__prop-title">
                                    {{ t('vis.property.popoverContent') }}
                                </div>
                                <cv-input
                                    v-model="dataBindingForm.content"
                                    type="textarea"
                                    :rows="5"
                                    :readonly="true"
                                    @click="openRichTextEditor"
                                ></cv-input>
                            </cv-form-item>
                        </template>

                        <!-- 脚本编辑器 -->
                        <cv-dialog
                            v-model="scriptEditorVisible"
                            :title="scriptEditorTitle"
                            custom-class="vis-data-binding__script-editor"
                            :close-on-press-escape="false"
                            :close-on-click-modal="false"
                            append-to-body
                            destroy-on-close
                        >
                            <vis-data-binding-script-editor
                                v-model="scriptValue"
                                :is-event="scriptEditorIsEvent"
                            ></vis-data-binding-script-editor>
                            <template #footer>
                                <div>
                                    <cv-button size="default" @click="scriptEditorVisible = false">
                                        {{ t('vis.common.cancel') }}
                                    </cv-button>
                                    <cv-button type="primary" size="default" @click="onScriptEditorSave">
                                        {{ t('vis.common.save') }}
                                    </cv-button>
                                </div>
                            </template>
                        </cv-dialog>

                        <!-- 富文本编辑 -->
                        <cv-dialog
                            v-model="richTextEditorVisible"
                            :title="richTextEditorTitle"
                            custom-class="vis-data-binding__rich-text-editor"
                            :close-on-press-escape="false"
                            :close-on-click-modal="false"
                            append-to-body
                            destroy-on-close
                        >
                            <div style="height: 350px">
                                <vis-data-binding-rich-text-editor
                                    ref="richTextEditor"
                                    v-model="richTextValue"
                                    :fore-color="dataBindingForm.foreColor"
                                    :back-color="dataBindingForm.backColor"
                                ></vis-data-binding-rich-text-editor>
                            </div>
                            <template #footer>
                                <div>
                                    <cv-button size="default" @click="richTextEditorVisible = false">
                                        {{ t('vis.common.cancel') }}
                                    </cv-button>
                                    <cv-button type="primary" size="default" @click="onRichTextEditorSave">
                                        {{ t('vis.common.save') }}
                                    </cv-button>
                                </div>
                            </template>
                        </cv-dialog>
                    </template>
                </cv-form>
            </cv-scrollbar>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {
    actionBinding,
    ConfigurationApi,
    customBindingToDefinitionMap,
    DataBindingTypeEnum,
    DeviceApi,
    editBoard,
    editConfiguration,
    type IAttrBaseDef,
    type IBinding,
    type IBindingCustomAction,
    type IBindingCustomComponent,
    type IBindingCustomData,
    type IBindingCustomSubscribe,
    type IBindingDeviceProp,
    type IBindingDeviceState,
    type IBindingDialog,
    type IBindingPopover,
    type IBindingPrimitiveProp,
    type IBindingScript,
    type IBindingTeleadjust,
    type IBindingTelecontrol,
    type IBindingTeleindication,
    type IBindingTelemetry,
    type IBindingTelepulse,
    type IConfiguration,
    type IDeviceProperty,
    type IPaginationData,
    type IPrimitiveBindings,
    type IPrimitiveDevice,
    type ITeleIndication,
    type ITelemetry,
    type ITelePulse,
    type IValueBinding,
    type PrimitiveInstance,
    useGlobalConfig,
    valueBinding,
} from '@cloudview.visualization-next/services';
import {CvIconClose} from 'cloudview.ui-next-icon';
import {computed, inject, type Ref, ref, watch} from 'vue';
import type {Response} from 'cloudview.ui-next';
import {useLocale} from 'cloudview.ui-next';
import VisDataBindingScriptEditor from './data-binding-script-editor.vue';
import VisDataBindingRichTextEditor from '../../rich-text-editor';

type IBindingWithDevice =
    | IBindingDeviceProp
    | IBindingDeviceState
    | IBindingTeleadjust
    | IBindingTelecontrol
    | IBindingTelemetry
    | IBindingTeleindication
    | IBindingTelepulse
    | IBindingCustomData
    | IBindingCustomComponent
    | IBindingCustomSubscribe
    | IBindingCustomAction;

interface ISelectOption {
    label: string;
    value: string;
}

defineOptions({name: 'VisDataBinding'});
const props = withDefaults(
    defineProps<{
        showHeader?: boolean;
        bindingKey: string;
        keyConfig: IAttrBaseDef;
        bindings: IPrimitiveBindings;
        devices: IPrimitiveDevice[];
        dataType: string;
    }>(),
    {
        showHeader: true,
    }
);
const emit = defineEmits(['close']);

const {t} = useLocale();
const initialBindingData = () => {
    return {
        type: '',
    };
};
const baseValueInitialBindingData = () => {
    return {
        attrType: '',
        convertDefinition: '',
    };
};
const baseActionInitialBindingData = () => {
    return {
        attrType: '',
    };
};
const initialBindingDataStrategy: Record<DataBindingTypeEnum, () => IBinding> = {
    [DataBindingTypeEnum.PRIMITIVE_PROP]: () => {
        return {
            type: DataBindingTypeEnum.PRIMITIVE_PROP,
            primitiveId: '',
            primitiveProps: [],
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.DEVICE_PROP]: () => {
        return {
            type: DataBindingTypeEnum.DEVICE_PROP,
            deviceId: '',
            deviceSn: '',
            topic: '',
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.TELEMETRY]: () => {
        return {
            type: DataBindingTypeEnum.TELEMETRY,
            deviceId: '',
            deviceSn: '',
            topic: '',
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.TELEINDICATION]: () => {
        return {
            type: DataBindingTypeEnum.TELEINDICATION,
            deviceId: '',
            deviceSn: '',
            topic: '',
            translateToLabel: true,
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.CUSTOM_DATA]: () => {
        return {
            type: DataBindingTypeEnum.CUSTOM_DATA,
            customKey: '',
            deviceId: '',
            deviceSn: '',
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.BOARD_ARGS]: () => {
        return {
            type: DataBindingTypeEnum.BOARD_ARGS,
            args: [],
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.DEVICE_STATE]: () => {
        return {
            type: DataBindingTypeEnum.DEVICE_STATE,
            deviceId: '',
            deviceSn: '',
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.DEVICE_INFO]: () => {
        return {
            type: DataBindingTypeEnum.DEVICE_INFO,
            deviceId: '',
            deviceSn: '',
            deviceInfo: '',
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.TELEPULSE]: () => {
        return {
            type: DataBindingTypeEnum.TELEPULSE,
            deviceId: '',
            deviceSn: '',
            topic: '',
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.SCRIPT]: () => {
        return {
            type: DataBindingTypeEnum.SCRIPT,
            eventAction: '',
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.TELEINDICATION]: () => {
        return {
            type: DataBindingTypeEnum.TELEINDICATION,
            deviceId: '',
            deviceSn: '',
            topic: '',
            ...baseValueInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.TELECONTROL]: () => {
        return {
            type: DataBindingTypeEnum.TELECONTROL,
            deviceId: '',
            deviceSn: '',
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.TELEADJUST]: () => {
        return {
            type: DataBindingTypeEnum.TELEADJUST,
            deviceId: '',
            deviceSn: '',
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.LINK_TO]: () => {
        return {
            type: DataBindingTypeEnum.LINK_TO,
            blank: true,
            url: '',
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.LINT_TO_CONFIGURATION]: () => {
        return {
            type: DataBindingTypeEnum.LINT_TO_CONFIGURATION,
            configurationId: '',
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.BOARD_TOGGLE]: () => {
        return {
            type: DataBindingTypeEnum.BOARD_TOGGLE,
            boardId: '',
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.DIALOG]: () => {
        return {
            type: DataBindingTypeEnum.DIALOG,
            template: '',
            content: '',
            width: '',
            title: '',
            insertBindings: {},
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.POPOVER]: () => {
        return {
            type: DataBindingTypeEnum.POPOVER,
            backColor: '',
            foreColor: '',
            template: '',
            content: '',
            width: '',
            title: '',
            direction: 'left',
            insertBindings: {},
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.CUSTOM_ACTION]: () => {
        return {
            type: DataBindingTypeEnum.CUSTOM_ACTION,
            customKey: '',
            deviceId: '',
            deviceSn: '',
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.CUSTOM_COMPONENT]: () => {
        return {
            type: DataBindingTypeEnum.CUSTOM_COMPONENT,
            customKey: '',
            deviceId: '',
            deviceSn: '',
            ...baseActionInitialBindingData(),
        };
    },
    [DataBindingTypeEnum.CUSTOM_SUBSCRIPTION]: () => {
        return {
            type: DataBindingTypeEnum.CUSTOM_SUBSCRIPTION,
            customKey: '',
            deviceId: '',
            deviceSn: '',
            ...baseValueInitialBindingData(),
        };
    },
};
const dataBindingForm = ref<IBinding | {type: string}>(initialBindingData());
const rules = {};
const bindTypeList = ref<{label: string; value: string}[]>([]);

// 自定义绑定
const customBindings = useGlobalConfig('customBindings');
const customItems = computed(() => {
    const definitionKey = customBindingToDefinitionMap[dataBindingForm.value.type];
    if (!customBindings.value || !definitionKey) return {};
    return customBindings.value[definitionKey] ?? {};
});

const changeBindingVal = (bindings, key, val) => {
    bindings[key] = val;
};

// 切换绑定类型，初始化数据
const bindTypeChangeHandler = () => {
    if (dataBindingForm.value.type) {
        dataBindingForm.value = initialBindingDataStrategy[dataBindingForm.value.type]();
        changeBindingVal(props.bindings, props.bindingKey, dataBindingForm.value);

        (dataBindingForm.value as IBinding).attrType = props.keyConfig.attrType;
    } else {
        dataBindingForm.value = initialBindingData();
        Reflect.deleteProperty(props.bindings, props.bindingKey);
    }
};

// topic 列表
const topicList = ref<(ISelectOption & {data?: unknown})[]>([]);
const topicApiHandler = <T extends {identifier: string; name: string}>(response: Response<T[]>) => {
    if (response.state) {
        return response.data.map(item => {
            return {
                label: `${item.name} (${item.identifier})`,
                value: item.identifier,
                data: item,
            };
        });
    } else {
        CvMessage({message: t('vis.message.queryDeviceInfoFailed'), type: 'error'});
        return [];
    }
};
const topicChangeHandler = (topic: string) => {
    if (dataBindingForm.value.type === DataBindingTypeEnum.TELEINDICATION) {
        if ((dataBindingForm.value as IBindingTeleindication).translateToLabel) {
            const {data} = topicList.value.find(item => item.value === topic)!;
            const dict = {};
            (data as {data_type_spec: {key: number; name: string}[]}).data_type_spec.forEach(item => {
                dict[item.key] = item.name;
            });
            (dataBindingForm.value as any).convertDefinition = `return ${JSON.stringify(dict)}[$value];`;
        }
    }
};
const translateToLabelChangeHandler = async value => {
    if (value) {
        const bindingData = dataBindingForm as Ref<IBindingTeleindication>;
        try {
            if (bindingData.value.convertDefinition) {
                await CvMessageBox.confirm(t('vis.configuration.coverConvertDefinition'), t('vis.common.prompt'));
            }
            topicChangeHandler(bindingData.value.topic);
        } catch (e) {
            bindingData.value.translateToLabel = false;
        }
    }
};

// 设备属性
const propsList = ref<ISelectOption[]>([]);
const deviceChangHandler = async (deviceId: string) => {
    (dataBindingForm.value as IBindingWithDevice).deviceSn = props.devices.find(item => item.id === deviceId)!.sn;
    switch (dataBindingForm.value.type) {
        case DataBindingTypeEnum.TELEPULSE:
            topicList.value = topicApiHandler<ITelePulse>(await DeviceApi.getTelepulses(deviceId));
            break;
        case DataBindingTypeEnum.TELEINDICATION:
            topicList.value = topicApiHandler<ITeleIndication>(await DeviceApi.getTeleindications(deviceId));
            break;
        case DataBindingTypeEnum.TELEMETRY:
            topicList.value = topicApiHandler<ITelemetry>(await DeviceApi.getTelemetries(deviceId));
            break;
        case DataBindingTypeEnum.DEVICE_PROP:
            topicList.value = topicApiHandler<IDeviceProperty>(await DeviceApi.getDeviceProperties(deviceId));
            break;
        case DataBindingTypeEnum.TELECONTROL:
            break;
        case DataBindingTypeEnum.TELEADJUST:
            break;
        case DataBindingTypeEnum.DEVICE_INFO: {
            const response = await DeviceApi.getDevice(deviceId);
            if (response.state) {
                propsList.value = Object.keys(response.data).map(key => ({
                    label: key,
                    value: key,
                }));
            } else {
                CvMessage({message: t('vis.message.queryDeviceInfoFailed'), type: 'error'});
                propsList.value = [];
            }
            break;
        }
        default:
            break;
    }
};

// 图元列表
const board = inject(editBoard);
const primitiveList = ref<PrimitiveInstance[]>(board!.value.layers.map(layer => layer.elements).flatMap(item => item));
const primitivePropList = ref<ISelectOption[]>([]);
const primitiveChangeHandler = (primitiveId: string) => {
    const primitive = primitiveList.value.find(item => item.id === primitiveId);
    if (primitive) {
        let propList: ISelectOption[];
        propList = Object.keys(primitive.userDefined).map(key => ({
            label: primitive.userDefined[key].name,
            value: key,
        }));
        propList = propList.concat(
            Object.keys(primitive.defaultConfig)
                .filter(key => primitive.defaultConfig[key].attrType !== 'event')
                .map(key => ({
                    label: `${t(primitive.defaultConfig[key].name)} (${key})`,
                    value: key,
                }))
        );
        primitivePropList.value = propList;
    } else {
        primitivePropList.value = [];
    }
};

// 画板参数列表
const boardArgsList = computed(() => {
    return Object.keys(board!.value.parameters).map(key => ({
        label: board!.value.parameters[key].name,
        value: key,
    }));
});

// 画板列表
const configuration = inject(editConfiguration);
const boardList = computed(() => {
    return configuration!.value.content
        .filter(item => item.boardId !== board!.value.boardId)
        .map(item => ({
            label: item.boardName,
            value: item.boardId,
        }));
});

// 脚本编辑器
const scriptEditorVisible = ref(false);
const scriptValue = ref('');
const scriptEditorIsEvent = ref(false);
const scriptEditorTitle = ref('');
const openScriptEditor = () => {
    scriptEditorIsEvent.value = props.keyConfig.attrType === 'event';
    if (dataBindingForm.value.type === DataBindingTypeEnum.SCRIPT) {
        scriptEditorTitle.value = t('vis.property.scriptContent');
        scriptValue.value = (dataBindingForm.value as IBindingScript).eventAction;
    } else {
        scriptEditorTitle.value = t('vis.property.transformationDefinition');
        scriptValue.value = (dataBindingForm.value as IValueBinding & {convertDefinition: string}).convertDefinition;
    }
    scriptEditorVisible.value = true;
};
const onScriptEditorSave = () => {
    if (dataBindingForm.value.type === DataBindingTypeEnum.SCRIPT) {
        (dataBindingForm.value as IBindingScript).eventAction = scriptValue.value;
    } else {
        (dataBindingForm.value as IValueBinding & {convertDefinition: string}).convertDefinition = scriptValue.value;
    }
    scriptEditorVisible.value = false;
};

// 加载组态图列表
const loadConfigurations = (count: number) => {
    const id = configuration!.value.id;
    return new Promise((resolve, reject) => {
        ConfigurationApi.getConfigurationList({
            pageSize: 20,
            page: count + 1,
        }).then(response => {
            if (response.state) {
                const result: {label: string; value: string}[] = [];
                (response.data as unknown as IPaginationData<IConfiguration[]>).data.forEach(item => {
                    if (item.id !== id) {
                        result.push({
                            label: item.name,
                            value: item.id!,
                        });
                    }
                });
                return resolve(result);
            } else {
                CvMessage({
                    message: t('vis.message.queryConfigurationListFailed'),
                    type: 'error',
                });
                reject();
            }
        });
    });
};

// 富文本编辑器弹窗
const richTextEditor = ref();
const richTextValue = ref('');
const richTextEditorTitle = ref('');
const richTextEditorVisible = ref(false);
const openRichTextEditor = () => {
    richTextEditorTitle.value =
        dataBindingForm.value.type === DataBindingTypeEnum.DIALOG
            ? t('vis.property.dialogContent')
            : t('vis.property.popoverContent');
    richTextValue.value = (dataBindingForm.value as IBindingDialog | IBindingPopover).content;
    richTextEditorVisible.value = true;
};
const onRichTextEditorSave = () => {
    Object.assign(dataBindingForm.value, richTextEditor.value.getValue());
    richTextEditorVisible.value = false;
};

// 初始化数据
const onInit = () => {
    dataBindingForm.value = props.bindings[props.bindingKey] ?? initialBindingData();
    bindTypeList.value = props.keyConfig.attrType === 'event' ? actionBinding : valueBinding;
    // 复原设备属性下拉列表
    const deviceId = (dataBindingForm.value as IBindingWithDevice).deviceId;
    if (deviceId) {
        deviceChangHandler(deviceId);
    }
    // 复原图元属性下拉列表
    const primitiveId = (dataBindingForm.value as IBindingPrimitiveProp).primitiveId;
    if (primitiveId) {
        primitiveChangeHandler(primitiveId);
    }
};
onInit();
watch<string>(() => props.bindingKey, onInit);
</script>
