<template>
    <div class="login">
        <div class="login__header">
            <cv-dropdown
                trigger="click"
                class="login__header__menu"
                popper-class="login__popper"
                placement="bottom-end"
                @command="handleClick"
            >
                <div class="center">
                    <cv-icon :size="14" style="margin-right: 3px" color="#fff">
                        <icon-international></icon-international>
                    </cv-icon>
                    {{ Locale.localeName === 'zh-CN' ? '中文' : 'English' }}
                    <cv-icon-arrow-down class="arrow"></cv-icon-arrow-down>
                </div>
                <template #dropdown>
                    <cv-dropdown-menu>
                        <cv-dropdown-item command="zh-CN">中文</cv-dropdown-item>
                        <cv-dropdown-item command="en-US">English</cv-dropdown-item>
                    </cv-dropdown-menu>
                </template>
            </cv-dropdown>
        </div>
        <div class="login__form">
            <div class="login__form__title">{{ t('fw.common.title') }}</div>
            <cv-form
                ref="ruleFormRef"
                :model="data"
                label-position="top"
                class="login__form__body"
                :rules="rules"
                @submit.prevent="submit"
            >
                <cv-form-item prop="name" :label="t('fw.login.username')">
                    <cv-input
                        v-model="data.name"
                        v-trim
                        :placeholder="
                            t('fw.login.username') +
                            (isInternational ? '/' + t('fw.login.email') : '/' + t('fw.login.phone'))
                        "
                        autocomplete="username"
                        :maxlength="60"
                    ></cv-input>
                </cv-form-item>
                <cv-form-item prop="password" :label="t('fw.login.password')">
                    <cv-input
                        v-model="data.password"
                        v-trim
                        type="password"
                        :placeholder="t('fw.login.password')"
                        autocomplete="current-password"
                        :maxlength="100"
                    ></cv-input>
                </cv-form-item>
<!--                <p class="forget-pwd" @click="retrievePwdDialog?.open()">{{ t('fw.login.forgotPwd') }}</p>-->
                <cv-form-item>
                    <cv-button
                        native-type="submit"
                        class="login__btn"
                        type="primary"
                        :loading="loading"
                        :disabled="loading"
                        size="default"
                    >
                        {{ t('fw.login.login') }}
                    </cv-button>
                </cv-form-item>
            </cv-form>
        </div>
        <retrieve-pwd ref="retrievePwdDialog"></retrieve-pwd>
    </div>
</template>
<script lang="ts" setup>
import {reactive, ref} from 'vue';
import {CvMessage, useLocale} from 'cloudview.ui-next';
import authService from '@/common/auth.service';
import {Locale} from '@/common/locale';
import {IconInternational} from '@/icons/index';
import router from '@/router';
import {Token} from '@/common/token';
import retrievePwd from './retrieve-pwd.vue';
import {getConfig} from '@/common/config_util';
import {getErrorCodeTips} from '@/common/error-code';
import {initUserInfo, userInfo} from '@/common/user';

const {t} = useLocale();
const data = reactive({
    name: '',
    password: '',
});

const isInternational = getConfig('INTERNATIONAL');

const retrievePwdDialog = ref();
const loading = ref(false);
const ruleFormRef = ref();
const rules = {
    name: {
        required: true,
        trigger: 'blur',
        message: t('fw.login.enterUsername'),
    },
    password: {
        required: true,
        trigger: 'blur',
        validator: async (rule: Record<string, unknown>, value: string, callback: (p?: Error) => void) => {
            if (!value) {
                return callback(new Error(t('fw.login.enterPassword')));
            }
        },
    },
};

const submit = async () => {
    ruleFormRef.value.validate(async (valid: boolean) => {
        if (valid) {

            loading.value = true;
            const res = await authService.login(data.name, data.password);
            loading.value = false;
            try {
                const resData = await res.json();
                if (res.ok) {
                    Token.setLocalToken(resData);
                    router.replace('/main');
                } else {
                    switch (res.status) {
                        case 409:
                            CvMessage.error(t('fw.login.error409'));
                            break;
                        case 400:
                            CvMessage.error(t('fw.login.error400'));
                            break;
                        default:
                            CvMessage.error(t('fw.common.operateFailed'));
                    }
                }
            } catch (e) {
                CvMessage.error(t('fw.common.operateFailed'));
            }
        }
    });
};

// 语言切换
const handleClick = (cmd: string) => {
    Locale.changeLocale(cmd);
};
</script>
<style lang="scss" scoped>
p {
    margin: 0;
}

.icp {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 10px 0;
    width: 100%;
    height: 36px;
    white-space: pre;
    text-align: center;
    color: #d0d0d0;
    z-index: 1000;
}

.icp > a {
    color: #d0d0d0;
}

.icp > a:hover {
    text-decoration: none;
}

.login {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: url('../../assets/login-bg.png') no-repeat top left;
    background-size: cover;
    display: flex;

    &__header {
        width: 100%;
        height: 94px;
        display: flex;
        justify-content: flex-end;
        padding: 0 40px;
        align-items: center;

        .arrow {
            color: #062b45;
            width: 14px;
            height: 14px;
        }

        .center {
            display: flex;
            gap: 3px;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            border-radius: 8px;
            padding: 8px;
            background: transparent;
        }

        &__menu {
            color: #062b45;
        }
    }

    &__form {
        width: 416px;
        height: 370px;
        border-radius: 4px;
        background-color: #fff;
        position: absolute;
        right: 40px;
        top: 50%;
        transform: translateY(-50%);
        padding: 16px 40px;

        &__title {
            color: #35353e;
            font-size: 24px;
            font-weight: 700;
            margin: 20px 0;
        }

        &__body {
            margin-top: 24px;

            .forget-pwd {
                height: 14px;
                line-height: 14px;
                cursor: pointer;
                color: var(--primary-color);
                text-align: right;
            }
        }

        :deep(.el-form-item--label-top .el-form-item__label) {
            margin-bottom: 2px;
            font-weight: 700;
        }
    }

    &__btn {
        width: 100%;
        margin-top: 24px;
    }
}
</style>
<style lang="scss">
.login__popper {
    width: 120px;
    border-radius: 2px;
    overflow: hidden;
    border: none;

    .el-dropdown-menu {
        padding: 0;
        background-color: transparent;
        border: none;
        border-radius: 4px;

        :hover {
            border-radius: 2px;
            border-color: var(--primary-color);
            background: rgb(49 98 225 / 10%);
            font-weight: bold;
        }

        li {
            height: 44px;
            color: #98a3be;
            border: 1px solid transparent;
        }
    }

    .el-popper__arrow {
        display: none;
    }
}

.login__popper.el-popper {
    border: none;
}
</style>
