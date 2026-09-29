<template>
    <div class="register">
        <div class="register__card">
            <div class="register__title">{{ t('fw.login.registerTitle') }}</div>
            <div class="register__body">
                <div class="register__row">
                    <span class="register__label">{{ t('fw.login.machineSerial') }}</span>
                    <cv-button
                        type="primary"
                        :loading="submitting"
                        :disabled="submitting || !machineSerial"
                        @click="handleSubmit"
                    >
                        {{ t('fw.common.submit') }}
                    </cv-button>
                </div>
                <div class="register__serial" :class="{'is-empty': !machineSerial}">
                    {{ machineSerial || t('fw.login.machineSerialLoading') }}
                </div>

                <div class="register__license-block">
                    <div class="register__label">{{ t('fw.login.licenseKey') }}</div>
                    <cv-input
                        v-model="licenseKey"
                        v-trim
                        type="textarea"
                        :rows="4"
                        :placeholder="t('fw.login.enterLicenseKey')"
                        :disabled="submitting"
                        class="register__license-input"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {CvMessage, useLocale} from 'cloudview.ui-next';
import router from '@/router';
import {License} from '@/common/license';
import LicenseServiceApi from '@/modules/login/license.service';

const {t} = useLocale();
const machineSerial = ref('');
const licenseKey = ref('');
const submitting = ref(false);

async function loadPageData() {
    try {
        machineSerial.value = await LicenseServiceApi.fetchSerialNumber();
        if (!machineSerial.value) {
            CvMessage.warning(t('fw.login.machineSerialFailed'));
        }
    } catch {
        CvMessage.error(t('fw.login.machineSerialFailed'));
    }
}

async function handleSubmit() {
    // 上传前去掉所有空白字符（空格、换行等）
    const key = licenseKey.value.replace(/\s+/g, '');
    if (!key) {
        CvMessage.warning(t('fw.login.enterLicenseKey'));
        return;
    }
    submitting.value = true;
    try {
        const registerRes = await LicenseServiceApi.register(key);
        if (!registerRes.state) {
            CvMessage.error((registerRes.data as {msg?: string})?.msg || t('fw.login.registerFailed'));
            return;
        }

        // 仅根据 register 返回的 is_valid 判断是否放行
        const license = LicenseServiceApi.pickLicenseInfo(registerRes.data);
        if (license?.is_valid === true) {
            License.setValid(true);
            CvMessage.success(t('fw.login.registerSuccess'));
            await router.replace('/main');
            return;
        }

        License.setValid(false);
        CvMessage.error(t('fw.login.registerNotActive'));
    } catch {
        CvMessage.error(t('fw.login.registerFailed'));
    } finally {
        submitting.value = false;
    }
}

onMounted(() => {
    void loadPageData();
});
</script>

<style scoped lang="scss">
.register {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f5f7fa url('/login-bg.webp') no-repeat center center;
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
}

.register__card {
    width: 480px;
    min-height: 300px;
    border-radius: 32px;
    background: rgb(255 255 255 / 90%);
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px 0 rgb(12 25 51 / 10%);
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    gap: 36px;
    box-sizing: border-box;
}

.register__title {
    color: #35353e;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    text-align: center;
}

.register__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.register__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.register__label {
    color: #35353e;
    font-size: 14px;
    font-weight: 600;
}

.register__serial {
    min-height: 48px;
    padding: 12px 16px;
    border-radius: 8px;
    background: #f5f6f8;
    color: #35353e;
    font-size: 14px;
    line-height: 22px;
    word-break: break-all;
    box-sizing: border-box;

    &.is-empty {
        color: #98a3be;
    }
}

.register__license-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.register__license-input {
    width: 100%;

    :deep(.el-textarea__inner) {
        background-color: #f5f6f8;
        box-shadow: none;
        border-radius: 8px;
        min-height: 96px;
        resize: vertical;
    }

    :deep(.el-textarea__inner:focus) {
        box-shadow: 0 0 0 1px var(--primary-color, #3162e1) inset;
    }
}
</style>
