<template>
    <cv-dialog
        v-model="visible"
        :title="
            binding?.type === DataBindingTypeEnum.TELECONTROL
                ? t('vis.property.telecontrol')
                : t('vis.property.teleadjust')
        "
        size="small"
        custom-class="vis-player-control"
        :close-on-click-modal="false"
    >
        <div v-for="(control, index) in controls" :key="index" class="vis-player-control__control-item">
            <cv-form
                :ref="el => (formComponent[index] = el)"
                size="default"
                :model="formModels[index].data"
                :rules="rules[index]"
            >
                <div
                    class="vis-player-control__control-item-title"
                    :class="{'vis-player-control__control-item-title--border': control.parameters}"
                >
                    <div>{{ control.name }}</div>
                    <div>
                        <cv-button type="primary" size="small" @click="showHistory(control.identifier)"
                            >{{ t('vis.player.operationHistory') }}
                        </cv-button>
                        <cv-pop-confirm
                            :title="t('vis.player.confirmToSend')"
                            placement="top"
                            @confirm="emitControl(index)"
                        >
                            <template #reference>
                                <cv-button type="primary" size="small">{{ t('vis.common.submit') }}</cv-button>
                            </template>
                        </cv-pop-confirm>
                    </div>
                </div>
                <div v-if="control.parameters !== null" class="vis-player-control__control-item-payload">
                    <div
                        v-for="parameter in control.parameters"
                        class="vis-player-control__control-item-payload-item"
                        :style="{flexBasis: parameter.data_type === 'object' ? '100%' : '48%'}"
                    >
                        <cv-form-item :label="parameter.name" :prop="parameter.identifier">
                            <cv-select
                                v-if="parameter.data_type === 'enum'"
                                v-model="formModels[index].data[parameter.identifier]"
                            >
                                <cv-option
                                    v-for="option in parameter.data_type_spec"
                                    :value="option.key"
                                    :label="option.name"
                                >
                                </cv-option>
                            </cv-select>
                            <cv-input-number
                                v-if="numberTypes.indexOf(parameter.data_type) > -1"
                                v-model="formModels[index].data[parameter.identifier]"
                                :min="parameter.data_type_spec.lower_limit"
                                :max="parameter.data_type_spec.upper_limit"
                            ></cv-input-number>
                            <cv-input
                                v-if="parameter.data_type === 'str'"
                                v-model="formModels[index].data[parameter.identifier]"
                                :minlength="parameter.data_type_spec.min_length"
                                :maxlength="parameter.data_type_spec.max_length"
                            ></cv-input>
                            <cv-input
                                v-if="parameter.data_type === 'object'"
                                v-model="formModels[index].data[parameter.identifier]"
                                type="textarea"
                            ></cv-input>
                        </cv-form-item>
                    </div>
                </div>
            </cv-form>
        </div>
        <template #footer>
            <cv-button @click="visible = false">{{ t('vis.common.close') }}</cv-button>
        </template>
    </cv-dialog>

    <cv-dialog v-model="historyVisible" :title="t('vis.player.operationHistory')" destroy-on-close>
        <div class="vis-player-control__history">
            <cv-pagination-table :load-data="getHistory" height="100%">
                <cv-table-column :label="t('vis.player.operateDate')" prop="create_at"></cv-table-column>
                <cv-table-column :label="t('vis.common.identifier')">
                    <template #default="{row}">
                        {{ row.send_payload.method }}
                    </template>
                </cv-table-column>
                <cv-table-column :label="t('vis.common.data')">
                    <template #default="{row}">
                        {{ row.send_payload.data }}
                    </template>
                </cv-table-column>
                <cv-table-column :label="t('vis.common.state')">
                    <template #default="{row}">
                        <div class="vis-player-control__history-status">
                            {{ t(historyStatusDict[row.status]) }}
                        </div>
                    </template>
                </cv-table-column>
            </cv-pagination-table>
        </div>
        <template #footer>
            <cv-button @click="historyVisible = false">{{ t('vis.common.close') }}</cv-button>
        </template>
    </cv-dialog>
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue';
import type {IBindingTeleadjust, IBindingTelecontrol, ITelecontrol} from '@cloudview.visualization-next/services';
import {DataBindingTypeEnum, DeviceApi} from '@cloudview.visualization-next/services';
import {useLocale} from 'cloudview.ui-next';

defineOptions({name: 'VisPlayerControl'});
const {t} = useLocale();
const visible = ref(false);
const controls = ref<ITelecontrol[]>([]);
const formModels = reactive<Record<number, Record<string, any>>>([]);
const rules = reactive<Record<string, any>>([]);
const formComponent = reactive<Record<number, any>>({});
const numberTypes = ['i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'f32', 'f64'];
const binding = ref<IBindingTelecontrol | IBindingTeleadjust>();
const methods = {
    [DataBindingTypeEnum.TELECONTROL]: {
        emit: DeviceApi.emitTelecontrol,
        getList: DeviceApi.getTelecontrols,
        getHistory: DeviceApi.getTelecontrolHistory,
    },
    [DataBindingTypeEnum.TELEADJUST]: {
        emit: DeviceApi.emitTeleajust,
        getList: DeviceApi.getTeleadjusts,
        getHistory: DeviceApi.getTeleajustHistory,
    },
};
/*
const minNumber = {
    'i8': -128,
    'i16': -32768,
    'i32': -2147483648,
    'i64': 0,
    'u8': 0,
    'u16': 0,
    'u32': 0,
    'u64': 0,
    'f32': -3.4e38,
    'f64': -1.7e-308,
};
const maxNumber = {
    'i8': 127,
    'i16': 32767,
    'i32': 2147483647,
    'i64': 4294967295,
    'u8': 255,
    'u16': 65535,
    'u32': 4294967295,
    'u64': 18446744073709551999,
    'f32': 3.4e38,
    'f64': 1.7e308,
};
*/

const emitControl = index => {
    formComponent[index].validate(async valid => {
        if (valid) {
            const result = await methods[binding.value!.type].emit(binding.value!.deviceId, formModels[index]);
            if (result.state) {
                CvMessage({type: 'success', message: t('vis.player.orderDistributeSuccess')});
            } else {
                CvMessage({type: 'error', message: t('vis.player.orderDistributeFailed')});
            }
        } else {
            CvMessage({type: 'error', message: t('vis.common.formItemError')});
        }
    });
};
const show = async (_binding: IBindingTelecontrol | IBindingTeleadjust) => {
    binding.value = _binding;
    const result = await methods[binding.value!.type].getList(_binding.deviceId);
    if (result.state) {
        controls.value = result.data;
        controls.value.forEach((control, index) => {
            formModels[index] = {
                data: {},
                identifier: control.identifier,
                device_timeout: control.device_timeout,
            };
            rules[index] = {};

            if (control.parameters) {
                control.parameters.forEach(param => {
                    formModels[index].data[param.identifier] = '';
                    rules[index][param.identifier] = [
                        {
                            validator(rule, value, callback) {
                                if (numberTypes.indexOf(param.data_type) > -1) {
                                    if (
                                        value < (param.data_type_spec as any).lower_limit ||
                                        value > (param.data_type_spec as any).upper_limit
                                    ) {
                                        return callback(new Error(t('vis.player.numberTransfinite')));
                                    }
                                } else if (param.data_type === 'object') {
                                    try {
                                        if (value) JSON.parse(value);
                                    } catch (e) {
                                        return callback(new Error('vis.player.incorrectJSONFormat'));
                                    }
                                }
                                return callback();
                            },
                        },
                    ];
                });
            }
        });
    } else {
        CvMessage({type: 'error', message: t('vis.player.getOperationListFailed')});
    }
    visible.value = true;
};

// 操作历史
const historyVisible = ref(false);
let historyIdentifier = '';
const historyStatusDict = {
    1: 'vis.player.messageSaved',
    2: 'vis.player.distributeSuccess',
    3: 'vis.player.subscribeFailed',
    4: 'vis.player.sendFailed',
    5: 'vis.player.deviceAckFailed',
    6: 'vis.player.deviceAckSuccess',
    9: 'vis.player.deviceAckTimeout',
    10: 'vis.player.serverAbnormal',
};
const getHistory = async ({currentPage, pageSize}) => {
    const historyResult = await methods[binding.value!.type].getHistory(
        binding.value!.deviceId,
        currentPage,
        pageSize,
        historyIdentifier
    );
    if (historyResult.state) {
        return {data: historyResult.data.data, total: historyResult.data.pagination.total_count};
    } else {
        CvMessage({type: 'error', message: t('vis.player.getOperationHistoryFailed')});
        return {data: [], total: 0};
    }
};
const showHistory = async (identifier: string) => {
    historyIdentifier = identifier;
    historyVisible.value = true;
};
defineExpose({
    show,
});
</script>
