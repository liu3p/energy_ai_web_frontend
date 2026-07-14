<template>
    <cv-dialog-form
        v-model="visible"
        :title="t('fw.common.changePassword')"
        size="small"
        :draggable="true"
        :submit="submit"
        :form-model="form"
        :rules="rules"
        :loading="summitLoading"
        label-width="140px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :submit-text="t('fw.common.confirm')"
    >
        <div style="padding-right: 72px">
            <cv-form-item :label="t('fw.personalCenter.originPassword') + ' : '" prop="originPassword">
                <cv-input
                    v-model.trim="form.originPassword"
                    :placeholder="t('fw.personalCenter.inputOriginPassword')"
                    :maxlength="24"
                    show-password
                >
                </cv-input>
            </cv-form-item>
            <cv-form-item :label="t('fw.personalCenter.newPassword') + ' : '" prop="newPassword">
                <cv-input
                    v-model.trim="form.newPassword"
                    :placeholder="t('fw.personalCenter.inputNewPassword')"
                    :maxlength="24"
                    show-password
                ></cv-input>
            </cv-form-item>
            <cv-form-item :label="t('fw.personalCenter.confirmPassword') + ' : '" prop="confirmNewPassword">
                <cv-input
                    v-model.trim="form.confirmNewPassword"
                    :placeholder="t('fw.personalCenter.inputConfirmPassword')"
                    :maxlength="24"
                    show-password
                ></cv-input>
            </cv-form-item>
        </div>
    </cv-dialog-form>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {ref} from 'vue';
import ChangePasswordAPI from './change-password.service';
import ValidateUtils from '@/common/validate-utils';
import {getErrorCodeTips} from '@/common/error-code';
import authService from '@/common/auth.service';
import router from '@/router';

const {t} = useLocale();
const summitLoading = ref<boolean>(false);
const visible = ref<boolean>(false);
const form = ref({
    originPassword: '',
    newPassword: '',
    confirmNewPassword: '',
});
const rules = {
    originPassword: [
        {
            required: true,
            message: t('fw.personalCenter.inputOriginPassword'),
            trigger: 'blur',
        },
    ],
    newPassword: [
        {
            required: true,
            message: t('fw.personalCenter.inputNewPassword'),
            trigger: 'blur',
        },
        {
            validator: async (rule: any, value: any, callback: any) => {
                if (form.value.newPassword === form.value.originPassword) {
                    callback(new Error(t('fw.personalCenter.samePassword')));
                } else if (!ValidateUtils.validatePassword(form.value.newPassword)) {
                    callback(new Error(t(`fw.personalCenter.passwordFormat`)));
                }
                callback();
            },
            trigger: 'blur',
        },
    ],
    confirmNewPassword: [
        {
            required: true,
            message: t('fw.personalCenter.inputConfirmPassword'),
            trigger: 'blur',
        },
        {
            validator: async (rule: any, value: any, callback: any) => {
                if (form.value.newPassword !== form.value.confirmNewPassword) {
                    callback(new Error(t('fw.personalCenter.confirmFailed')));
                }
                callback();
            },
            trigger: 'blur',
        },
    ],
};
const submit = async () => {
    summitLoading.value = true;
    ChangePasswordAPI.changePassword({
        new_password: form.value.newPassword,
        password: form.value.originPassword,
    }).then(res => {
        if (res.state) {
            visible.value = false;
            CvMessage.success(t('fw.personalCenter.changePasswordSuccess'));
            setTimeout(() => {
                authService.logout().then(() => {
                    router.replace('/login');
                });
            }, 500);
        } else {
            if ((res.data as any).code === 412) {
                CvMessage.error(t('fw.personalCenter.originPasswordWrong'));
            } else {
                CvMessage.error(t('fw.personalCenter.changePasswordFailed'));
            }
        }
        summitLoading.value = false;
    });
};
const open = () => {
    form.value.originPassword = '';
    form.value.newPassword = '';
    form.value.confirmNewPassword = '';
    visible.value = true;
};
defineExpose({
    open,
});
</script>
