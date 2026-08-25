<template>
    <cv-dialog
        v-model="visible"
        width="480px"
        class="add-device-dialog"
        :title="isEdit ? t('fw.capturePoint.editDevice') : t('fw.capturePoint.addDevice')"
        :draggable="true"
        align-center
        @close="close"
    >
        <cv-form ref="formRef" :model="formData" :rules="rules" label-width="120px" class="dialog-form">
            <cv-form-item v-if="isEdit" :label="t('fw.capturePoint.deviceId')" prop="id">
                <cv-input v-model.trim="formData.id" disabled class="w-full" />
            </cv-form-item>
            <cv-form-item :label="t('fw.capturePoint.deviceName')" prop="name">
                <cv-input
                    v-model.trim="formData.name"
                    :placeholder="t('fw.common.pleaseInput')"
                    class="w-full"
                />
            </cv-form-item>
            <cv-form-item :label="t('fw.capturePoint.deviceAddr')" prop="devaddr">
                <cv-input
                    v-model.trim="formData.devaddr"
                    :disabled="isEdit"
                    :placeholder="t('fw.common.pleaseInput')"
                    class="w-full"
                    @input="(value: any) => (formData.devaddr = value.replace(/[^\d]/g, '') + '')"
                />
            </cv-form-item>
            <cv-form-item v-if="type === 2" :label="t('fw.capturePoint.transferDevice')" prop="deviceId">
                <cv-select-tree
                    v-model="formData.deviceId"
                    :data="filteredDeviceOption"
                    :props="{
                        label: 'name',
                        value: 'id',
                        children: 'device',
                    }"
                    class="w-full"
                    clearable
                    only-child
                    default-expand-all
                    @change="handleTreeChange"
                    @clear="handleTreeClear"
                />
            </cv-form-item>
            <cv-form-item label="MqttDeviceId" prop="mqttkey">
                <cv-input
                    v-model.trim="formData.mqttkey"
                    :placeholder="t('fw.common.pleaseInput')"
                    class="w-full"
                />
            </cv-form-item>
        </cv-form>
        <template #footer>
            <div class="dialog-footer">
                <cv-button class="cancel-btn" @click="close">{{ t('fw.common.cancel') }}</cv-button>
                <cv-button type="primary" @click="handleSubmit">{{ t('fw.common.sure') }}</cv-button>
            </div>
        </template>
    </cv-dialog>
</template>
<script setup lang="ts">
import {ref, computed} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import _ from 'lodash';

const {t} = useLocale();

const props = defineProps({
    type: {
        type: Number,
        default: 0,
    },
    deviceOption: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['submit']);
const formRef = ref();

const filteredDeviceOption = computed(() => {
    return props.deviceOption.filter((item: any) => item.type !== 2);
});

const rules = {
    name: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
            trigger: 'blur',
        },
    ],
    devaddr: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
            trigger: 'blur',
        },
    ],
};

const visible = ref(false);
const isEdit = ref(false);

const formData = ref({
    id: '',
    name: '',
    devaddr: '1',
    mqttkey: '',
    rtuId: '',
    deviceId: '',
});

const handleSubmit = async () => {
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid) {
        return;
    }
    emit('submit', formData.value);
};

const open = (data: any) => {
    if (data) {
        isEdit.value = true;
        formData.value = _.cloneDeep(data);
    } else {
        isEdit.value = false;
        formData.value = {
            id: '',
            name: '',
            devaddr: '1',
            mqttkey: '',
            rtuId: '',
            deviceId: '',
        };
    }
    visible.value = true;
};

const close = () => {
    visible.value = false;
    formRef.value?.resetFields?.();
    formData.value = {
        id: '',
        name: '',
        devaddr: '1',
        mqttkey: '',
        rtuId: '',
        deviceId: '',
    };
};

const findNodeById = (
    data: any[],
    id: string,
    parentId: string = ''
): {found: boolean; parentId: string; level: number; mqttkey: string} => {
    for (const item of data) {
        if (item.id === id) {
            return {found: true, parentId, level: parentId ? 2 : 1, mqttkey: item.mqttkey || ''};
        }
        if (item.device && item.device.length > 0) {
            const result = findNodeById(item.device, id, item.id);
            if (result.found) {
                return result;
            }
        }
    }
    return {found: false, parentId: '', level: 0, mqttkey: ''};
};

const handleTreeChange = (value: string) => {
    if (!value) {
        formData.value.deviceId = '';
        formData.value.rtuId = '';
        formData.value.mqttkey = '';
        return;
    }

    const result = findNodeById(filteredDeviceOption.value, value);

    if (result.found && result.level === 2) {
        formData.value.deviceId = value;
        formData.value.rtuId = result.parentId;
        formData.value.mqttkey = result.mqttkey;
    } else {
        formData.value.deviceId = '';
        formData.value.rtuId = '';
        formData.value.mqttkey = '';
    }
};
const handleTreeClear = () => {
    formData.value.deviceId = '';
    formData.value.rtuId = '';
    formData.value.mqttkey = '';
};
defineExpose({
    open,
    close,
});
</script>
<style scoped lang="scss">
.dialog-form {
    padding: 8px 24px 0 0;

    :deep(.el-form-item) {
        margin-bottom: 22px;
    }

    :deep(.el-form-item__label) {
        color: #1a2233;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        min-height: 36px;
        border-radius: 6px;
    }
}

.w-full {
    width: 100%;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
}

.cancel-btn {
    color: #3162e1;
    border-color: #3162e1;
    background: #fff;

    &:hover,
    &:focus {
        color: #3162e1;
        border-color: #3162e1;
        background: rgb(49 98 225 / 6%);
    }
}
</style>

<style lang="scss">
.add-device-dialog.el-dialog {
    border-radius: 12px;
    overflow: hidden;

    .el-dialog__header {
        padding: 20px 24px 12px;
        margin-right: 0;
    }

    .el-dialog__title {
        font-size: 16px;
        font-weight: 600;
        color: #1a2233;
    }

    .el-dialog__body {
        padding: 8px 16px 12px;
    }

    .el-dialog__footer {
        padding: 12px 24px 20px;
    }
}
</style>
