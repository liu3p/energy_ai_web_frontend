<template>
    <cv-dialog v-model="visible" :title="title" width="428px" @close="close">
        <div class="tips">{{ t('fw.systemPages.confirmRestart') }}</div>
        <cv-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <cv-form-item :label="t('fw.monitor.loginPassword') + t('fw.common.colon')" prop="password">
                <cv-input
                    v-model="formData.password"
                    type="password"
                    show-password
                    :placeholder="t('fw.deviceManage.dispatch.pleaseInputLoginPwd')"
                />
            </cv-form-item>
        </cv-form>
        <template #footer>
            <cv-button @click="close">{{ t('fw.common.cancel') }}</cv-button>
            <cv-button type="primary" @click="handleSubmit">{{ t('fw.common.sure') }}</cv-button>
        </template>
    </cv-dialog>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

defineProps<{
    title: string;
}>();
const emit = defineEmits(['submit']);

const formRef = ref();
const initFormData = () => ({
    password: '',
});
const id = ref();
const formData = ref(initFormData());
const rules = {
    password: [
        {
            required: true,
            message: t('fw.deviceManage.dispatch.pleaseInputLoginPwd'),
            trigger: 'blur',
        },
    ],
};
const visible = ref(false);

const close = () => {
    visible.value = false;
    id.value = null;
    formData.value = initFormData();
    formRef.value?.resetFields?.();
};

const handleSubmit = async () => {
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid) {
        return;
    }
    emit('submit', {
        password: formData.value.password,
        id: id.value,
    });
};

defineExpose({
    open(key: string) {
        id.value = key;
        formData.value = initFormData();
        visible.value = true;
    },
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
