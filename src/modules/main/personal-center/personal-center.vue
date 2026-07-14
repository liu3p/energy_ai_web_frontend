<template>
    <cv-dialog-form
        v-model="visible"
        :title="t('fw.personalCenter.personalCenter')"
        :draggable="true"
        :form-model="form"
        width="450px"
        :submit="submit"
        :loading="submitLoading"
        :submit-text="t('fw.login.confirm')"
    >
        <cv-form-item class="personal-center__form-item" prop="user_name">
            <div class="personal-center__block">
                <div class="personal-center__block-label">
                    <cv-icon :size="14" color="transparent">
                        <icon-user />
                    </cv-icon>
                    {{ t('fw.personalCenter.account') }}
                </div>
                <cv-input v-model.trim="form!.user_name" class="personal-center__block-input" disabled></cv-input>
            </div>
        </cv-form-item>
        <cv-form-item class="personal-center__form-item" prop="nick_name">
            <div class="personal-center__block">
                <div class="personal-center__block-label">
                    <cv-icon :size="14" color="transparent">
                        <icon-nick-name />
                    </cv-icon>
                    {{ t('fw.personalCenter.nickname') }}
                </div>
                <cv-input
                    v-model="form!.nick_name"
                    class="personal-center__block-input"
                    :maxlength="30"
                    @change="
                        (val: string) => {
                            form.nick_name = val.trim();
                        }
                    "
                ></cv-input>
            </div>
        </cv-form-item>
        <cv-form-item class="personal-center__form-item" prop="email">
            <div class="personal-center__block">
                <div class="personal-center__block-label">
                    <cv-icon :size="14" color="transparent">
                        <icon-email />
                    </cv-icon>
                    {{ t('fw.login.email') }}
                </div>
                <div class="personal-center__block-mix">
                    <cv-input
                        v-model.trim="form!.email"
                        class="personal-center__block-input--short"
                        disabled
                    ></cv-input>
                    <cv-button
                        type="primary"
                        class="personal-center__block-btn"
                        @click="changeEmailRef.open(form.id)"
                        >{{ t('fw.personalCenter.changeEmail') }}</cv-button
                    >
                </div>
            </div>
        </cv-form-item>
        <template #footer>
            <span class="dialog-footer">
                <cv-button @click="visible = false">{{ t('fw.common.cancel') }}</cv-button>
                <cv-button v-loading="submitLoading" type="primary" @click="submit">{{
                    t('fw.login.confirm')
                }}</cv-button>
            </span>
        </template>
    </cv-dialog-form>
    <change-email ref="changeEmailRef" @change-email="changeNewEmail"></change-email>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {IconUser, IconEmail, IconNickName} from '@/icons/index';
import type {UserModel} from './personal-center.model';
import PersonalCenterAPI from './personal-center.service';
import ChangeEmail from './change-email.vue';
import {getErrorCodeTips} from '@/common/error-code';

const {t} = useLocale();
const changeEmailRef = ref();
const form = ref<UserModel>({
    id: '',
    description: '',
    email: '',
    mobile: '',
    nick_name: '',
    project_id: '',
    role_id: '',
    state: 0,
    user_name: '',
});
const visible = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const getUserInfo = () => {
    PersonalCenterAPI.getUserInfo().then(res => {
        if (res.state) {
            form.value = res.data;
        }
    });
};
const submit = () => {
    submitLoading.value = true;
    PersonalCenterAPI.updateName(form.value.id, form.value.email, form.value.nick_name).then(res => {
        if (res.state) {
            CvMessage.success(t('fw.common.operateSuccess'));
            submitLoading.value = false;
            visible.value = false;
        } else {
            CvMessage.error(t(getErrorCodeTips((res.data as any).code)));
            submitLoading.value = false;
        }
    });
};

const changeNewEmail = (email: string) => {
    PersonalCenterAPI.updateEmail(form.value.id, email).then(res => {
        if (res.state) {
            submitLoading.value = false;
            visible.value = false;
            CvMessage.success(t('fw.common.operateSuccess'));
            form.value.email = email;
        } else {
            CvMessage.error(t(getErrorCodeTips((res.data as any).code)));
            submitLoading.value = false;
        }
    });
};
const open = () => {
    form.value = {
        id: '',
        description: '',
        email: '',
        mobile: '',
        nick_name: '',
        project_id: '',
        role_id: '',
        state: 0,
        user_name: '',
    };
    getUserInfo();
    visible.value = true;
};
defineExpose({
    open,
});
</script>
<style lang="scss" scoped>
.personal-center {
    &__form-item {
        padding: 8px 16px 24px;
        margin-bottom: 0;

        &:last-child {
            padding-bottom: 26px;
        }
    }

    &__block {
        display: flex;
        flex-direction: column;
        gap: 5px;

        &-label {
            height: 19px;
            display: flex;
            align-items: center;
            gap: 2px;
        }

        &-input {
            width: 385px;

            &--code {
                width: 100px;
            }

            &--short {
                width: 220px;
            }
        }

        &-btn {
            flex: 1;
        }

        &-mix {
            width: 385px;
            display: flex;
            gap: 8px;
        }
    }
}
</style>
