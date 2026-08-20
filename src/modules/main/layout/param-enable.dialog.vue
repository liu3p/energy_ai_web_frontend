<template>
    <cv-dialog
        v-model="visible"
        :title="t('fw.layout.paramEnableTitle')"
        width="428px"
        @close="close"
    >
        <div class="tips">{{ t('fw.layout.paramEnableConfirm') }}</div>
        <cv-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <cv-form-item :label="t('fw.monitor.loginPassword') + t('fw.common.colon')" prop="checkpwd">
                <cv-input
                    v-model="formData.checkpwd"
                    type="password"
                    show-password
                    :placeholder="t('fw.layout.pleaseInputLoginPwd')"
                />
            </cv-form-item>
        </cv-form>
        <template #footer>
            <cv-button @click="close">{{ t('fw.common.cancel') }}</cv-button>
            <cv-button type="primary" :loading="loading" @click="handleSubmit">
                {{ t('fw.common.confirm') }}
            </cv-button>
        </template>
    </cv-dialog>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue';
import {CvMessage, useLocale} from 'cloudview.ui-next';
import {enableParams} from './param-enable.service';

const {t} = useLocale();
const emit = defineEmits<{
    success: [];
}>();

const visible = ref(false);
const loading = ref(false);
const formRef = ref();
const formData = reactive({
    checkpwd: '',
});

const rules = {
    checkpwd: [
        {
            required: true,
            message: t('fw.layout.pleaseInputLoginPwd'),
            trigger: 'blur',
        },
    ],
};

async function handleSubmit() {
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid || loading.value) {
        return;
    }
    loading.value = true;
    try {
        const res = await enableParams(formData.checkpwd);
        if (res.state) {
            CvMessage.success(res.msg || t('fw.layout.paramEnableSuccess'));
            emit('success');
            close();
        } else {
            CvMessage.error(res.msg || t('fw.layout.paramEnableFailed'));
        }
    } catch {
        CvMessage.error(t('fw.layout.paramEnableFailed'));
    } finally {
        loading.value = false;
    }
}

function open() {
    formData.checkpwd = '';
    visible.value = true;
}

function close() {
    visible.value = false;
    formData.checkpwd = '';
    formRef.value?.resetFields?.();
}

defineExpose({
    open,
    close,
});
</script>

<style scoped lang="scss">
.tips {
    display: flex;
    width: 100%;
    height: 50px;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    background-color: rgba(235, 157, 66, 0.2);
    border: 1px solid #eb9d42;
    border-radius: 5px;
}
</style>
