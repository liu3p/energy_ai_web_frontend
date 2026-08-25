<template>
    <cv-dialog
        v-model="visible"
        width="480px"
        class="add-node-dialog"
        :title="t('fw.modelManagement.addNode')"
        :draggable="true"
        align-center
        @close="cancel"
    >
        <cv-form ref="formRef" :model="formData" :rules="rules" label-width="64px" class="dialog-form">
            <cv-form-item :label="t('fw.modelManagement.type')" prop="type">
                <cv-select
                    :disabled="disabled"
                    v-model="formData.type"
                    :placeholder="t('fw.common.pleaseSelect')"
                    style="width: 100%"
                >
                    <cv-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
                </cv-select>
            </cv-form-item>
            <cv-form-item :label="t('fw.modelManagement.name')" prop="name">
                <cv-input v-model="formData.name" :placeholder="t('fw.common.pleaseInput')" />
            </cv-form-item>
        </cv-form>
        <template #footer>
            <div class="dialog-footer">
                <cv-button class="cancel-btn" @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
                <cv-button type="primary" @click="handleSubmit">{{ t('fw.common.sure') }}</cv-button>
            </div>
        </template>
    </cv-dialog>
</template>

<script lang="ts" setup>
import {CvMessage, useLocale} from 'cloudview.ui-next';
import {ref} from 'vue';
import ModelManagementServiceApi from '@/modules/main/agc/model-management/model-management.service';

const {t} = useLocale();
const emit = defineEmits(['refresh']);

const formRef = ref();
const rules = {
    type: [
        {
            required: true,
            message: t('fw.modelManagement.typeRequired'),
            trigger: 'change',
        },
    ],
    name: [
        {
            required: true,
            message: t('fw.modelManagement.nameRequired'),
            trigger: 'blur',
        },
    ],
};
const visible = ref(false);
const disabled = ref(false);
const currentNode = ref();
const typeOptions = ref();
const formData = ref({
    type: '',
    name: '',
});
const open = (data: any, node: any) => {
    const {type} = data;
    ModelManagementServiceApi.getDeviceTypes(type).then(res => {
        if (res.state) {
            typeOptions.value = res.data;
        }
    });
    currentNode.value = node;
    visible.value = true;
};

const handleSubmit = async () => {
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid) {
        return;
    }
    const {type, name} = formData.value;
    const {
        data: {name: deviceName},
    } = currentNode.value;
    const res = await ModelManagementServiceApi.createAgcDevice(deviceName, {type, name});
    if (res.state) {
        CvMessage.success(t('fw.common.operateSuccess'));
        emit('refresh');
        cancel();
    } else {
        CvMessage.error(res.data.msg);
    }
};
const cancel = () => {
    visible.value = false;
    formRef.value?.resetFields?.();
    formData.value = {
        type: '',
        name: '',
    };
};
defineExpose({
    open,
    cancel,
});
</script>

<style lang="scss" scoped>
.dialog-form {
    padding: 8px 24px 0;

    :deep(.el-form-item) {
        margin-bottom: 22px;
    }

    :deep(.el-form-item__label) {
        color: #1a2233;
        justify-content: flex-start;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        min-height: 36px;
        border-radius: 6px;
    }
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
.add-node-dialog.el-dialog {
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
