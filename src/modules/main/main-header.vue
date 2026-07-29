<template>
    <div class="main-header">
        <div class="main-header__title">{{ pageTitle }}</div>
        <div class="main-header__right">
            <cv-tooltip effect="light" :content="t('fw.common.switchLan')" placement="bottom">
                <button class="main-header__action" type="button" @click="changeLanguage">
                    {{ t('fw.header.language') }}
                </button>
            </cv-tooltip>
            <cv-dropdown ref="dropdownRef" popper-class="main-header__dropdown" trigger="click">
                <div class="main-header__user">
                    <span>{{ userInfo?.username || userInfo?.usertype }}</span>
                </div>
                <template #dropdown>
                    <div class="main-header__dropdown-body">
                        <div
                            v-if="userInfo?.usertype !== 'admin'"
                            class="main-header__dropdown-item"
                            @click="changePasswordRef.open()"
                        >
                            <cv-icon :size="14" color="transparent">
                                <icon-user />
                            </cv-icon>
                            {{ t('fw.common.changePassword') }}
                        </div>
                        <div class="main-header__dropdown-item" @click="rightMenuHandler('logout')">
                            <cv-icon :size="14" color="transparent">
                                <icon-logout />
                            </cv-icon>
                            {{ t('fw.common.logout') }}
                        </div>
                    </div>
                </template>
            </cv-dropdown>
        </div>
        <change-password ref="changePasswordRef" />
    </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import {useRoute} from 'vue-router';
import {useLocale} from 'cloudview.ui-next';
import {Locale} from '@/common/locale';
import router from '@/router';
import {clearUserInfo, userInfo} from '@/common/user';
import {IconLogout, IconUser} from '@/icons/index';
import {Token} from '@/common/token';
import ChangePassword from '@/modules/main/change-password/change-password.vue';
import authService from '@/common/auth.service';
import {findMenuTitleByPath} from '@/modules/main/layout/sidebar-menu';

const {t} = useLocale();
const route = useRoute();
const dropdownRef = ref();
const changePasswordRef = ref();

const pageTitle = computed(() => {
    return findMenuTitleByPath(route.path) || (route.meta.title as string) || t('fw.common.home');
});

function changeLanguage() {
    const lang = Locale.localeName === 'zh-CN' ? 'en-US' : 'zh-CN';
    Locale.changeLocale(lang);
}

const rightMenuHandler = () => {
    authService.logout().then(() => {
        clearUserInfo();
        Token.clearLocalToken();
        router.push('/login');
    });
    dropdownRef.value.handleClose();
};
</script>

<style lang="scss" scoped>
.main-header {
    height: 64px;
    padding: 0 20px;
    background: #f2f4f7;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__title {
        font-size: 18px;
        font-weight: 700;
        color: #35353e;
    }

    &__right {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    &__action {
        border: none;
        border-radius: 6px;
        background: #3162e1;
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        padding: 4px 8px;
        cursor: pointer;
    }

    &__user {
        min-width: 32px;
        height: 32px;
        padding: 0 10px;
        border-radius: 16px;
        background: #3162e1;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
    }

    &__dropdown-body {
        padding: 6px 8px;
    }

    &__dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 36px;
        padding: 0 12px;
        border-radius: 8px;
        cursor: pointer;

        &:hover {
            background: rgb(49 98 225 / 8%);
        }
    }
}
</style>
