<template>
    <cv-dialog-form
        v-model="visible"
        :title="t('fw.personalCenter.changeEmail')"
        :draggable="true"
        :submit="submit"
        :rules="rules"
        :form-model="form"
        label-width="200px"
        :loading="submitLoading"
        :submit-text="t('fw.login.confirm')"
    >
        <cv-form-item :label="t('fw.personalCenter.loginPwd') + ': '" prop="password">
            <cv-input
                v-model.trim="form.password"
                class="dialog__input--long"
                :placeholder="t('fw.common.pleaseInput') + t('fw.personalCenter.loginPwd')"
                :maxlength="24"
                show-password
            >
            </cv-input>
        </cv-form-item>
        <cv-form-item class="dialog__item" :label="t('fw.personalCenter.newEmail') + ' : '" prop="newEmail">
            <cv-input
                v-model.trim="form.newEmail"
                :placeholder="t('fw.common.pleaseInput') + t('fw.personalCenter.newEmail')"
                class="dialog__input--long"
                :maxlength="60"
            ></cv-input>
        </cv-form-item>
        <cv-form-item class="dialog__item" :label="t('fw.personalCenter.code') + ' : '" prop="code">
            <cv-input
                v-model.trim="form.code"
                :placeholder="t('fw.common.pleaseInput') + t('fw.personalCenter.code')"
                class="dialog__input--short"
                :maxlength="6"
            ></cv-input>
            <countdown-button-email
                :disabled-rule="isSending()"
                class="dialog__countdown-button"
                :is-reset="isReset"
                @sent="sendCode"
            ></countdown-button-email>
        </cv-form-item>
        <template #footer="{submit: submitForm, isLoading}">
            <cv-button @click="visible = false"> {{ t('fw.common.cancel') }} </cv-button>
            <cv-button type="primary" :disabled="isConfirm" :is-loading="isLoading" @click="submitForm">
                {{ t('fw.login.confirm') }}
            </cv-button>
        </template>
    </cv-dialog-form>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {ref} from 'vue';
import countdownButtonEmail from './countdown-button-email.vue';
import ValidateUtils from '@/common/validate-utils';
import CommApi from '@/common/comm';
import PersonalCenterAPI from './personal-center.service';
import {getErrorCodeTips} from '@/common/error-code';

const {t} = useLocale();
const emit = defineEmits(['changeEmail']);
const visible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const rightEmail = ref<boolean>(false);
const isConfirm = ref(true);

const isPwd = ref(false);
const isEmail = ref(false);
const isReset = ref(false);

const form = ref({
    id: '',
    password: '',
    newEmail: '',
    code: '',
});
const rules = {
    password: [
        {
            required: true,
            message: t('fw.common.pleaseInput') + t('fw.login.password'),
            trigger: 'blur',
        },
        {
            validator: async (rule: any, value: string, callback: any) => {
                const res = await PersonalCenterAPI.checkOrgPwd(form.value.id, value);
                if (res.status !== 200) {
                    isConfirm.value = true;
                    isPwd.value = false;
                    callback(new Error(t('fw.personalCenter.verifyPasswordFailed')));
                } else {
                    isConfirm.value = false;
                    isPwd.value = true;
                    callback();
                }
            },
            trigger: 'blur',
        },
    ],
    newEmail: [
        {
            required: true,
            message: t('fw.common.pleaseInput') + t('fw.login.email'),
            trigger: 'blur',
        },
        {
            validator: async (rule: any, value: string, callback: any) => {
                if (!ValidateUtils.validateEmail(value)) {
                    callback(new Error(t('fw.personalCenter.incorrectEmailFormat')));
                    rightEmail.value = false;
                    isEmail.value = false;
                } else {
                    rightEmail.value = true;
                    isEmail.value = true;
                }
            },
            trigger: 'blur',
        },
    ],
    code: [
        {
            required: true,
            message: t('fw.common.pleaseInput') + t('fw.personalCenter.code'),
            trigger: 'blur',
        },
    ],
};
const sendCode = () => {
    CommApi.smsEmailCode(form.value.newEmail, 120).then(async res => {
        if (res.ok) {
            CvMessage.success(t('fw.personalCenter.sentCodeSucces'));
        } else {
            const resData = await res.json();
            CvMessage.error(t(getErrorCodeTips(resData.code)));
            isReset.value = true;
        }
    });
};
const open = (passId: string) => {
    form.value.id = passId;
    form.value.newEmail = '';
    form.value.password = '';
    form.value.code = '';
    isConfirm.value = true;
    rightEmail.value = true;
    isPwd.value = false;
    isEmail.value = false;
    isReset.value = false;
    localStorage.setItem('sendTs', '0');
    visible.value = true;
};
const submit = async () => {
    submitLoading.value = true;
    CommApi.validateEmailCode(form.value.code, form.value.newEmail)
        .then(res => {
            if (res.ok) {
                emit('changeEmail', form.value.newEmail);
                visible.value = false;
                submitLoading.value = false;
                return res.json();
            } else {
                return res.json();
            }
        })
        .then(res => {
            if (res.key !== undefined) {
                return;
            }
            CvMessage.error(t(getErrorCodeTips(res.code)));
            submitLoading.value = false;
        });
};

const isSending = () => {
    if (isPwd.value && isEmail.value) {
        return false;
    }
    return true;
};

defineExpose({
    open,
});
</script>
<style lang="scss">
.dialog {
    &__item {
        margin-top: 25px;
    }

    &__input {
        &--long {
            width: 430px !important;
        }

        &--short {
            width: 264px !important;
        }
    }

    &__countdown-button {
        margin-left: 16px;
        width: 150px;
    }
}
</style>
