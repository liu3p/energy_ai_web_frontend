<template>
    <cv-dialog-form
        v-model="visible"
        width="500"
        :title="isEdit ? '编辑设备' : '新增设备'"
        :draggable="true"
        :submit="submit"
        :form-model="formData"
        submit-text="确定"
        label-width="130px"
        @close="close"
        :rules="rules"
    >
        <cv-form-item v-if="isEdit" label="设备ID" prop="name">
            <cv-input v-model.trim="formData.id" disabled :controls="false" class="w-cm" />
        </cv-form-item>
        <cv-form-item label="设备名称" prop="name">
            <cv-input v-model.trim="formData.name" :controls="false" class="w-cm" />
        </cv-form-item>
        <cv-form-item label="设备地址" prop="devaddr">
            <cv-input
                v-model.trim="formData.devaddr"
                :disabled="isEdit"
                @input="(value: any) => formData.devaddr = (value.replace(/[^\d]/g, '') + '')"
                :controls="false"
                class="w-cm"
            />
        </cv-form-item>
        <cv-form-item v-if="type === 2" label="待转发设备" prop="deviceId">
            <cv-select-tree
                v-model="formData.deviceId"
                :data="filteredDeviceOption"
                :props="{
                    label: 'name',
                    value: 'id',
                    children: 'device',
                }"
                :controls="false"
                class="w-cm"
                clearable
                only-child
                default-expand-all
                @change="handleTreeChange"
                @clear="handleTreeClear"
            ></cv-select-tree>
        </cv-form-item>
        <cv-form-item label="MqttDeviceId" prop="mqttkey">
            <cv-input v-model.trim="formData.mqttkey" :controls="false" class="w-cm" />
        </cv-form-item>
    </cv-dialog-form>
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
    name: '',
    devaddr: '1',
    mqttkey: '',
    rtuId: '',
    deviceId: '',
});
const submit = () => {
    emit('submit', formData.value);
};
const open = (data: any) => {
    if (data) {
        isEdit.value = true;
        formData.value = _.cloneDeep(data);
    } else {
        isEdit.value = false;
    }
    visible.value = true;
};
const close = () => {
    visible.value = false;
    formData.value = {
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
.w-cm {
    width: 260px;
}
</style>
