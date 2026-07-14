<template>
    <cv-drawer
        v-model="drawer"
        size="638"
        :with-header="false"
        :close-on-click-modal="false"
        :destroy-on-close="false"
        class="retrieve__dialog"
    >
        <div class="retrieve-pwd">
            <div class="retrieve-pwd__header">
                <cv-icon :size="14" color="#35353E" style="cursor: pointer" @click="handleClose">
                    <icon-back></icon-back>
                </cv-icon>
                {{ step === 3 ? t('fw.login.resetPwd') : t('fw.login.retrievePwd') }}
            </div>
            <div v-if="step === 1" class="retrieve-pwd__header-step1"></div>
            <div v-if="step === 2 && !isInternational" class="retrieve-pwd__header-step2">
                <div class="text">
                    {{ t('fw.login.enterSendTo') }}
                    <span style="color: #353535">{{ data.phone }}</span>
                    {{ t('fw.login.verificationCode') }}
                </div>
            </div>
            <div v-if="step === 2 && isInternational" class="retrieve-pwd__header-step2-in">
                <div class="text flex-colum-center">
                    <div>
                        {{ t('fw.login.emailHint') }} <span style="color: #353535">{{ data.email }}</span>
                    </div>
                    <div>{{ t('fw.login.viewEmailCode') }}</div>
                </div>
            </div>
            <div v-if="step === 3" class="retrieve-pwd__header-step3">
                <div class="phone-text">
                    <cv-icon :size="14" color="#35353E">
                        <icon-retrieve-pwd></icon-retrieve-pwd>
                    </cv-icon>
                    {{ isInternational ? data.email : data.phone }}
                </div>
                <div class="text">{{ t('fw.login.pwdRules') }}</div>
            </div>
            <div class="retrieve-pwd__body">
                <cv-form ref="formRef" :model="data" label-position="top" class="login__form__body" :rules="rules">
                    <cv-form-item v-if="step === 1 && !isInternational" :label="t('fw.login.phone')" prop="phone">
                        <cv-select
                            v-model="curTimeZone"
                            class="retrieve-pwd-inputL"
                            :placeholder="t('fw.common.pleaseSelect')"
                            @change="changeCurCode"
                            ><cv-option
                                v-for="item in timeZoneOptions"
                                :key="item.id"
                                :value="item.id"
                                :label="`${item.name} ${item.phone_code}`"
                            >
                                <div class="flex-between">
                                    <span>{{ item.name }}</span>
                                    <span>{{ item.phone_code }}</span>
                                </div>
                            </cv-option>
                        </cv-select>
                        <cv-input
                            v-model="data.phone"
                            v-trim
                            class="retrieve-pwd-inputR"
                            :validate-event="false"
                            :placeholder="t('fw.login.phoneMessage')"
                        ></cv-input>
                    </cv-form-item>
                    <cv-form-item v-if="step === 1 && isInternational" :label="t('fw.login.email')" prop="email">
                        <cv-input
                            v-model="data.email"
                            v-trim
                            :validate-event="false"
                            :placeholder="t('fw.common.pleaseInput') + t('fw.login.email')"
                            :maxlength="60"
                        ></cv-input>
                    </cv-form-item>
                    <template v-if="step === 2 && !isInternational">
                        <cv-form-item prop="code">
                            <div class="retrieve-pwd__body-code">
                                <cv-input
                                    v-model="data.code"
                                    v-trim
                                    :placeholder="t('fw.login.verifyCode')"
                                    :maxlength="6"
                                >
                                </cv-input>
                                <cv-button
                                    native-type="submit"
                                    class="code-btn"
                                    type="primary"
                                    size="large"
                                    :disabled="data.count !== 60"
                                    @click="getCode"
                                >
                                    {{ data.count !== 60 ? `${data.count} S` : t('fw.login.getCode') }}
                                </cv-button>
                            </div>
                        </cv-form-item>
                    </template>
                    <template v-if="step === 2 && isInternational">
                        <cv-form-item prop="code">
                            <div class="retrieve-pwd__body-code">
                                <cv-input
                                    v-model="data.code"
                                    v-trim
                                    :placeholder="t('fw.login.verifyCode')"
                                    :maxlength="6"
                                >
                                </cv-input>
                                <cv-button
                                    native-type="submit"
                                    class="code-btn"
                                    type="primary"
                                    size="large"
                                    :disabled="data.count !== 120"
                                    @click="getCode"
                                >
                                    {{ data.count !== 120 ? `${data.count} S` : t('fw.login.getCode') }}
                                </cv-button>
                            </div>
                        </cv-form-item>
                    </template>
                    <template v-if="step === 3">
                        <cv-form-item prop="password">
                            <cv-input
                                v-model="data.password"
                                v-trim
                                :placeholder="t('fw.login.enterPwd')"
                                autocomplete="new-password"
                                :maxlength="24"
                                show-password
                            ></cv-input>
                        </cv-form-item>
                        <cv-form-item prop="confirmPwd">
                            <cv-input
                                v-model="data.confirmPwd"
                                v-trim
                                :placeholder="t('fw.login.enterPwdAgain')"
                                autocomplete="new-password"
                                :maxlength="24"
                                show-password
                            ></cv-input>
                        </cv-form-item>
                    </template>
                </cv-form>
            </div>
            <div v-if="step !== 3">
                <cv-button native-type="submit" class="retrieve-pwd__btn" type="primary" size="large" @click="toNext">
                    {{ t('fw.login.next') }}
                </cv-button>
            </div>
            <div v-if="step === 3">
                <cv-button native-type="submit" class="retrieve-pwd__btn" type="primary" size="large" @click="confirm">
                    {{ t('fw.login.confirm') }}
                </cv-button>
            </div>
        </div>
    </cv-drawer>
</template>
<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {ref, reactive} from 'vue';
import CommApi from '@/common/comm';
import {IconBack, IconRetrievePwd} from '@/icons/index';
import ValidateUtils from '@/common/validate-utils';
import {getConfig} from '@/common/config_util';
import {getErrorCodeTips} from '@/common/error-code';

const {t} = useLocale();
const drawer = ref(false);
const isInternational = getConfig('INTERNATIONAL');

const curTimeZone = ref('');
const curTimeZoneText = ref('');
const timeZoneOptions = ref<Record<string, any>>([]);

const data = reactive({
    phone: '',
    code: '',
    password: '',
    userId: '',
    confirmPwd: '',
    count: isInternational ? 120 : 60,
    key: '',
    email: '',
});
const step = ref(1);
const formRef = ref();
let timer: ReturnType<typeof setInterval> | null = null;
const rules = {
    phone: {
        required: true,
        trigger: 'blur',
        validator: async (rule: Record<string, unknown>, value: string, callback: (p?: Error) => void) => {
            if (!value) {
                return callback(new Error(t('fw.login.phoneMessage')));
            }
            try {
                const res = await CommApi.validatePhone(curTimeZoneText.value + value);
                if (res.status === 200) {
                    return callback();
                }
            } catch (e) {
                return callback(new Error(t('fw.common.networkError')));
            }
            return callback(new Error(t('fw.login.phoneMessageErr')));
        },
    },
    email: {
        required: true,
        trigger: 'blur',
        validator: async (rule: Record<string, unknown>, value: string, callback: (p?: Error) => void) => {
            if (!value) {
                callback(new Error(t('fw.common.pleaseInput') + t('fw.login.email')));
            }
            try {
                const res = await CommApi.validateEmail(value);
                if (res.status === 200) {
                    return callback();
                } else if (res.status === 401) {
                    const resData = await res.json();
                    return callback(new Error(t(getErrorCodeTips(resData.code))));
                }
            } catch (e) {
                return callback(new Error(t('fw.common.networkError')));
            }
            return callback(new Error(t('fw.login.emailErrorHint')));
        },
    },
    code: {
        required: true,
        trigger: 'blur',
        validator: async (rule: Record<string, unknown>, value: string, callback: (p?: Error) => void) => {
            if (!value) {
                return callback(new Error(t('fw.login.codeMessage')));
            } else if (!isInternational && !new RegExp('^[0-9]{6}$').test(value)) {
                return callback(new Error(t('fw.login.incorrectCodeFormat')));
            }
            return callback();
        },
    },
    password: {
        required: true,
        trigger: 'blur',
        validator: async (rule: Record<string, unknown>, value: string, callback: (p?: Error) => void) => {
            if (!value) {
                return callback(new Error(t('fw.login.enterPwd')));
            } else if (!ValidateUtils.validatePassword(value)) {
                callback(new Error(t(`fw.login.incorrectPasswordFormat`)));
            }
        },
    },
    confirmPwd: {
        required: true,
        trigger: 'blur',
        validator: async (rule: Record<string, unknown>, value: string, callback: (p?: Error) => void) => {
            if (!value) {
                return callback(new Error(t('fw.login.enterPwdAgain')));
            } else if (value !== data.password) {
                return callback(new Error(t('fw.login.pwdNotMatch')));
            }
        },
    },
};

const open = async () => {
    step.value = 1;
    drawer.value = true;
};

// 获取验证码
const getCode = async () => {
    data.count--;
    timer = setInterval(() => {
        data.count--;
        if (data.count <= 0) {
            clearTimer();
        }
    }, 1000);
    if (!isInternational) {
        CommApi.smsCode(curTimeZoneText.value + data.phone, 10).then(async (res: any) => {
            if (res.status !== 200) {
                const resData = await res.json();
                CvMessage.error(t(getErrorCodeTips(resData.code)));
                clearTimer();
                data.count = 60;
            }
        });
    } else {
        const res = await CommApi.smsEmailCode(data.email, 120);
        if (res.status == 200) {
            return true;
        } else {
            const resData = await res.json();
            CvMessage.error(t(getErrorCodeTips(resData.code)));
            clearTimer();
            data.count = 120;
            return false;
        }
    }
};

const clearTimer = () => {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }
    data.count = isInternational ? 120 : 60;
};

// 修改新密码
const toNext = () => {
    formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            if (step.value === 2) {
                if (!isInternational) {
                    CommApi.validateCode(data.code, curTimeZoneText.value + data.phone)
                        .then(res => {
                            if (res.status === 200) {
                                step.value++;
                                data.password = '';
                                data.confirmPwd = '';
                                return res.json();
                            } else {
                                CvMessage.error(t('fw.login.codeMessageErr'));
                                return {key: ''};
                            }
                        })
                        .then(res => {
                            data.key = res.key;
                        });
                } else {
                    CommApi.validateEmailCode(data.code, data.email)
                        .then(res => {
                            if (res.status === 200) {
                                step.value++;
                                data.password = '';
                                data.confirmPwd = '';
                                return res.json();
                            } else {
                                CvMessage.error(t('fw.login.codeMessageErr'));
                                return {key: ''};
                            }
                        })
                        .then(res => {
                            data.key = res.key;
                        });
                }
            } else {
                if (step.value == 1 && (await getCode())) {
                    step.value++;
                } else if (step.value != 1) {
                    step.value++;
                }
            }
        }
    });
};

// 确定
const confirm = () => {
    formRef.value.validate((valid: boolean) => {
        if (valid) {
            if (!isInternational) {
                CommApi.resetPwd(data.key, curTimeZoneText.value + data.phone, data.password).then(async (res: any) => {
                    if (res.status === 200) {
                        CvMessage.success(t('fw.login.modifyPwdSuc'));
                        handleClose();
                    } else {
                        const resData = await res.json();
                        CvMessage.error(t(getErrorCodeTips(resData.code)));
                    }
                });
            } else {
                CommApi.resetPwdEmail(data.key, curTimeZoneText.value + data.email, data.password).then(
                    async (res: any) => {
                        if (res.status === 200) {
                            CvMessage.success(t('fw.login.modifyPwdSuc'));
                            handleClose();
                        } else {
                            const resData = await res.json();
                            CvMessage.error(t(getErrorCodeTips(resData.code)));
                        }
                    }
                );
            }
        }
    });
};

const handleClose = () => {
    drawer.value = false;
    data.phone = '';
    data.code = '';
    data.password = '';
    data.confirmPwd = '';
    data.key = '';
    data.email = '';
    clearTimer();
    data.count = isInternational ? 120 : 60;
};

const changeCurCode = (item: string) => {
    if (isInternational) {
        return;
    }
    timeZoneOptions.value.forEach((ele: any) => {
        if (ele.id === item) {
            curTimeZone.value = ele.id;
            curTimeZoneText.value = ele.phone_code;
        }
    });
};

defineExpose({
    open,
});
</script>
<style lang="scss" scoped>
.retrieve-pwd {
    width: 326px;
    height: 400px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    &__header {
        font-size: 28px;
        color: var(--primary-color);
        font-weight: 600;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;

        &-step1 {
            width: 100%;
            height: 72px;
        }

        &-step2 {
            width: 100%;
            height: 96px;
            line-height: 96px;
            color: #aeaeb2;
        }

        &-step2-in {
            width: 100%;
            height: 96px;
            color: #aeaeb2;
        }

        &-step3 {
            width: 100%;
            color: #aeaeb2;
            margin-top: 30px;
            margin-bottom: 24px;

            .phone-text {
                padding: 8px 14px;
                background-color: var(--white-color);
                border-radius: 4px;
                color: #353535;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 138px;
                height: 32px;
                margin-bottom: var(--fw-gap);
                gap: 6px;
            }
        }
    }

    &__body {
        margin-bottom: 48px;

        &-code {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;

            .code-btn {
                background: rgb(20 97 233 / 10%);
                color: var(--primary-color);
                border-color: rgb(20 97 233 / 10%);
                width: 100px;
            }
        }
    }

    &__btn {
        width: 100%;
        border-radius: 20px;
    }

    &-inputL {
        width: 130px !important;
        margin-right: 16px;
    }

    &-inputR {
        width: 180px !important;
    }
}
</style>
<style lang="scss">
.cv-drawer.el-drawer.rtl.retrieve__dialog {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
</style>
