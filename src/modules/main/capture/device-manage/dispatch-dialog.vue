<template>
    <cv-dialog v-model="visible" :title="t('fw.deviceManage.dispatch.title')" width="480px" @close="handleClose">
        <cv-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <cv-form-item :label="paramLabel" prop="value">
                <cv-input-number
                    v-if="currentParam?.dispatchMode === 'regulate'"
                    v-model="formData.value"
                    style="width: 100%"
                />
                <cv-select v-else-if="currentParam?.dispatchMode === 'control'" v-model="formData.value">
                    <cv-option :value="1">{{ t('fw.deviceManage.dispatch.controlClose') }}</cv-option>
                    <cv-option :value="0">{{ t('fw.deviceManage.dispatch.controlOpen') }}</cv-option>
                </cv-select>
                <cv-input
                    v-else
                    v-model="formData.value"
                    :placeholder="t('fw.deviceManage.dispatch.pleaseInputDispatchValue')"
                />
            </cv-form-item>
        </cv-form>
        <template #footer>
            <div class="dispatch-dialog__footer">
                <cv-form ref="passwordFormRef" :model="formData" :rules="rules" label-position="top">
                    <cv-form-item
                        :label="t('fw.personalCenter.loginPwd') + t('fw.common.colon')"
                        prop="checkpwd"
                    >
                        <cv-input
                            v-model="formData.checkpwd"
                            type="password"
                            show-password
                            :placeholder="t('fw.deviceManage.dispatch.pleaseInputLoginPwd')"
                        />
                    </cv-form-item>
                </cv-form>
                <div class="dispatch-dialog__actions">
                    <cv-button @click="handleClose">{{ t('fw.common.cancel') }}</cv-button>
                    <cv-button type="primary" :loading="loading" @click="handleSubmit">
                        {{ t('fw.deviceManage.dispatch.dispatch') }}
                    </cv-button>
                </div>
            </div>
        </template>
    </cv-dialog>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue';
import {CvMessage, useLocale} from 'cloudview.ui-next';
import type {ParamCardItem} from './device-manage.types';
import {dispatchDeviceParam} from './device-manage.service';

const {t} = useLocale();
const emit = defineEmits<{
    success: [paramName: string, value: string | number];
}>();

const visible = defineModel<boolean>({default: false});
const loading = ref(false);
const formRef = ref();
const passwordFormRef = ref();
const currentParam = ref<ParamCardItem | null>(null);

const formData = reactive<{
    value: string | number | undefined;
    checkpwd: string;
}>({
    value: '',
    checkpwd: '',
});

const paramLabel = computed(() => currentParam.value?.label ?? '');

const rules = computed(() => ({
    value: [{required: true, message: t('fw.deviceManage.dispatch.pleaseInputDispatchValue'), trigger: 'blur'}],
    checkpwd: [{required: true, message: t('fw.deviceManage.dispatch.pleaseInputLoginPwd'), trigger: 'blur'}],
}));

watch(visible, val => {
    if (!val) {
        currentParam.value = null;
        formData.value = '';
        formData.checkpwd = '';
    }
});

function open(param: ParamCardItem) {
    currentParam.value = param;
    if (param.dispatchMode === 'control') {
        formData.value = Number(param.value) === 1 ? 1 : 0;
    } else {
        formData.value = param.value ?? '';
    }
    formData.checkpwd = '';
    visible.value = true;
}

function handleClose() {
    visible.value = false;
}

async function handleSubmit() {
    const valueValid = await formRef.value?.validate?.().catch(() => false);
    const passwordValid = await passwordFormRef.value?.validate?.().catch(() => false);
    if (!valueValid || !passwordValid || !currentParam.value || formData.value === undefined) {
        return;
    }

    loading.value = true;
    const res = await dispatchDeviceParam(currentParam.value, formData.value, formData.checkpwd);
    loading.value = false;

    if (res.state) {
        CvMessage.success(t('fw.deviceManage.dispatch.dispatchSuccess'));
        emit('success', currentParam.value.name, formData.value);
        handleClose();
    } else {
        CvMessage.error(res.message ?? t('fw.deviceManage.dispatch.dispatchFailed'));
    }
}

defineExpose({open});
</script>

<style scoped lang="scss">
.dispatch-dialog__footer {
    width: 100%;
}

.dispatch-dialog__footer :deep(.cv-form-item) {
    margin-bottom: 16px;
}

.dispatch-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>
