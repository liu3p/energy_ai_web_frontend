<template>
    <cv-dialog
        v-model="visible"
        width="480px"
        class="add-rtu-dialog"
        :title="t('fw.capturePoint.addRtu')"
        :draggable="true"
        align-center
        @close="close"
    >
        <cv-form ref="formRef" :model="formData" :rules="rules" label-width="110px" class="dialog-form">
            <cv-form-item :label="t('fw.capturePoint.rtuName')" prop="name">
                <cv-input
                    v-model.trim="formData.name"
                    :placeholder="t('fw.common.pleaseInput')"
                    class="w-full"
                />
            </cv-form-item>
            <cv-form-item :label="t('fw.capturePoint.rtuType')" prop="type">
                <cv-select
                    v-model="formData.type"
                    filterable
                    :placeholder="t('fw.common.pleaseSelect')"
                    class="w-full"
                >
                    <cv-option
                        v-for="item in rtuTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </cv-select>
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
import { RTUADDTYPE } from '@/modules/main/capture/point/point.model';

const {t} = useLocale();

const formRef = ref();
const rtuTypeOptions = computed(() =>
    RTUADDTYPE.map(item => ({
        ...item,
        label: t(`fw.capturePoint.rtuAddTypeOption.${item.value}`),
    }))
);

const emit = defineEmits(['submit']);
const rules = {
    name: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
            trigger: 'blur',
        },
    ],
    type: [
        {
            required: true,
            message: t('fw.common.pleaseSelect'),
            trigger: 'change',
        },
    ],
};

const visible = ref(false);

const formData = ref({
    name: '',
    type: '',
    memofcabinet: '',
    rtuaddr: '',
});

const handleSubmit = async () => {
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid) {
        return;
    }
    emit('submit', formData.value);
};

const open = () => {
    visible.value = true;
};

const close = () => {
    visible.value = false;
    formRef.value?.resetFields?.();
    formData.value = {
        name: '',
        type: '',
        memofcabinet: '',
        rtuaddr: '',
    };
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
.add-rtu-dialog.el-dialog {
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
