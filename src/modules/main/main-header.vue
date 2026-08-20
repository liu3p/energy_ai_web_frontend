<template>
    <div class="main-header">
        <div class="main-header__title">{{ pageTitle }}</div>
        <div class="main-header__right">
            <cv-dropdown
                trigger="click"
                placement="bottom"
                popper-class="main-header__lang-popper"
                @visible-change="onLangVisibleChange"
                @command="changeLanguage"
            >
                <button
                    class="main-header__lang"
                    :class="{'is-active': langOpen || langHover}"
                    type="button"
                    @mouseenter="langHover = true"
                    @mouseleave="langHover = false"
                >
                    <img
                        class="main-header__lang-icon"
                        :src="langOpen || langHover ? languageHoverIcon : languageIcon"
                        alt="language"
                    />
                </button>
                <template #dropdown>
                    <cv-dropdown-menu>
                        <cv-dropdown-item
                            command="zh-CN"
                            :class="{'is-selected': Locale.localeName === 'zh-CN'}"
                        >
                            中文
                        </cv-dropdown-item>
                        <cv-dropdown-item
                            command="en-US"
                            :class="{'is-selected': Locale.localeName !== 'zh-CN'}"
                        >
                            English
                        </cv-dropdown-item>
                    </cv-dropdown-menu>
                </template>
            </cv-dropdown>

            <cv-dropdown
                ref="userDropdownRef"
                trigger="click"
                placement="bottom-end"
                popper-class="main-header__user-popper"
            >
                <div class="main-header__user">
                    <span class="main-header__avatar">{{ avatarLetter }}</span>
                    <span class="main-header__username">{{ displayName }}</span>
                </div>
                <template #dropdown>
                    <div class="main-header__dropdown-body">
                        <div class="main-header__dropdown-item" @click="handleLogout">
                            <img class="main-header__logout-icon" :src="logoutIcon" alt="logout" />
                            {{ t('fw.common.logout') }}
                        </div>
                    </div>
                </template>
            </cv-dropdown>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import {useRoute} from 'vue-router';
import {useLocale} from 'cloudview.ui-next';
import {Locale} from '@/common/locale';
import router from '@/router';
import {clearUserInfo, userInfo} from '@/common/user';
import {Token} from '@/common/token';
import authService from '@/common/auth.service';
import {findMenuTitleKeyByPath} from '@/modules/main/layout/sidebar-menu';
import languageIcon from '@/assets/header-icons/ic_language.svg';
import languageHoverIcon from '@/assets/header-icons/ic_language_hover.svg';
import logoutIcon from '@/assets/header-icons/ic_log_out.svg';

const {t} = useLocale();
const route = useRoute();
const userDropdownRef = ref();
const langOpen = ref(false);
const langHover = ref(false);

const pageTitle = computed(() => {
    const menuTitleKey = findMenuTitleKeyByPath(route.path);
    const metaTitle = route.meta.title as string | undefined;
    const titleKey = menuTitleKey || (metaTitle?.startsWith('fw.') ? metaTitle : '');
    if (titleKey) {
        return t(titleKey);
    }
    return metaTitle || t('fw.common.home');
});

const displayName = computed(() => userInfo.value?.username || userInfo.value?.usertype || '');

const avatarLetter = computed(() => {
    const name = displayName.value.trim();
    return name ? name.charAt(0).toUpperCase() : 'U';
});

function onLangVisibleChange(visible: boolean) {
    langOpen.value = visible;
}

function changeLanguage(lang: string) {
    if (lang === Locale.localeName || (lang === 'en-US' && !Locale.localeName.startsWith('zh-'))) {
        return;
    }
    if (lang === 'zh-CN' && Locale.localeName.startsWith('zh-')) {
        return;
    }
    Locale.changeLocale(lang);
}

function handleLogout() {
    authService.logout().then(() => {
        clearUserInfo();
        Token.clearLocalToken();
        router.push('/login');
    });
    userDropdownRef.value?.handleClose?.();
}
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
        gap: 12px;
    }

    &__lang {
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        &:hover,
        &.is-active {
            background: transparent;
        }
    }

    &__lang-icon {
        width: 32px;
        height: 32px;
        display: block;
    }

    &__user {
        height: 36px;
        padding: 0 12px 0 4px;
        border-radius: 18px;
        background: #e9edf4;
        color: #35353e;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }

    &__avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #3162e1;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    &__username {
        font-size: 14px;
        line-height: 1;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__dropdown-body {
        padding: 6px 8px;
        min-width: 140px;
    }

    &__dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 36px;
        padding: 0 12px;
        border-radius: 8px;
        cursor: pointer;
        color: #5c6373;
        font-size: 14px;

        &:hover {
            background: #f2f4f7;
        }
    }

    &__logout-icon {
        width: 14px;
        height: 14px;
        display: block;
    }
}
</style>

<style lang="scss">
.main-header__lang-popper {
    border: none !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 24px rgb(12 25 51 / 12%) !important;
    overflow: hidden;

    .el-dropdown-menu {
        padding: 6px;
        border: none;
        min-width: 120px;
    }

    .el-dropdown-menu__item {
        height: 36px;
        line-height: 36px;
        border-radius: 6px;
        justify-content: center;
        color: #35353e;
        font-size: 14px;

        &:hover,
        &:focus,
        &.is-selected {
            background: #e9edf4 !important;
            color: #35353e !important;
        }
    }

    .el-popper__arrow {
        display: none;
    }
}

.main-header__user-popper {
    border: none !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 24px rgb(12 25 51 / 12%) !important;
    overflow: hidden;

    .el-popper__arrow {
        display: none;
    }
}
</style>
