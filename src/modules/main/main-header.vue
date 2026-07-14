<template>
    <div class="main-header">
        <div class="main-header__left">
            <img src="../../assets/logo.svg" alt="" />
            <h1 style="white-space: nowrap;">{{ t('fw.common.title') }}</h1>
        </div>
        <div class="main-header__center">
            <Menu />
        </div>
        <div class="main-header__right">
            <cv-tooltip class="box-item" effect="light" :content="t('fw.common.switchLan')" placement="bottom">
                <div class="main-header__right-language" @click="changeLanguage">{{ t('fw.header.language') }}</div>
            </cv-tooltip>
            <cv-dropdown ref="dropdownRef" popper-class="main-header__right__dropdown-block" trigger="click">
                <div class="main-header-right__menu-user">
                            <span class="main-header-right__menu-user-label">
                                {{ userInfo?.usertype }}
                            </span>
                </div>
                <template #dropdown>
                    <div class="main-header__right__dropdown">
                        <div class="main-header__right__dropdown-body">
                            <div
                                class="main-header__right__dropdown-body-item"
                                @click="changePasswordRef.open()"
                                v-if="userInfo.usertype !== 'admin'"
                            >
                                <cv-icon :size="14" color="transparent">
                                    <icon-user></icon-user>
                                </cv-icon>
                                {{ t('fw.common.changePassword') }}
                            </div>
                            <div
                                class="main-header__right__dropdown-body-item"
                                @click="rightMenuHandler('logout')"
                            >
                                <cv-icon :size="14" color="transparent">
                                    <icon-logout></icon-logout>
                                </cv-icon>
                                {{ t('fw.common.logout') }}
                            </div>
                        </div>
                    </div>
                </template>
            </cv-dropdown>
        </div>
        <change-password ref="changePasswordRef"></change-password>
    </div>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {Locale} from '@/common/locale';
import router from '@/router';
import Menu from '@/modules/main/menu.vue';
import {clearUserInfo, userInfo} from '@/common/user';
import {IconLogout, IconUser} from '@/icons/index';
import {Token} from '@/common/token';
import ChangePassword from '@/modules/main/change-password/change-password.vue';
import authService from '@/common/auth.service';

const {t} = useLocale();
/** 切换模式 */

const dropdownRef = ref();
const changePasswordRef = ref();

function changeLanguage() {
    const lang = Locale.localeName === 'zh-CN' ? 'en-US' : 'zh-CN';
    Locale.changeLocale(lang);
}

const rightMenuHandler = (command: string) => {
    authService.logout().then(() => {
        clearUserInfo();
        Token.clearLocalToken();
        router.push('/login');
    });
    dropdownRef.value.handleClose();
};

</script>

<style lang="scss" scoped>
.menu-icon {
    position: absolute;
    left: 0;
}

.main-header {
    width: 100%;
    height: 56px;
    background: #fff;
    display: flex;
    justify-content: space-between;

    &__left {
        width: 320px;
        display: flex;
        background-image: url('../../assets/header-left.png');
        background-size: cover;
        background-repeat: no-repeat;

        h1 {
            font-size: 20px;
            font-weight: 700;
            color: #3162E1;
            line-height: 56px;
        }
    }

    &__center {
        width: 100%;

        :deep(.el-tabs__item) {
            color: #35353E66;
            padding-right: 40px !important;
        }

        :deep(.cv-tabs .el-tabs__item.is-active) {
            color: #3162E1;
        }

        :deep(.el-tabs__nav-wrap::after) {
            position: static !important;
        }

        :deep(.el-tabs__active-bar) {
            background-color: #3162E1;
            height: 3px;
            border-radius: 3px;
        }

        :deep(.el-tabs__nav) {
            margin-top: 10px;
        }
    }

    &__right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 24px;
        width: 320px;
        padding-right: 24px;
        background-image: url('../../assets/header-right.png');
        background-size: cover;
        background-repeat: no-repeat;

        &-language {
            font-size: 12px;
            cursor: pointer;
            border-radius: 5px;
            background-color: #3162E1;
            padding: 3px;
            color: #fff;
            font-weight: bold;
        }

        &__menu {
            cursor: pointer;

            &-user {
                display: flex;
                clip-path: circle(50%);
                cursor: pointer;

                &-char {
                    width: 32px;
                    display: flex;
                    justify-content: center;
                    line-height: 32px;
                    color: #fff;
                    z-index: 1;
                    user-select: none;
                    background: linear-gradient(
                            90.43deg,
                            #372e26 0.48%,
                            #58381a 22.2%,
                            #472d15 53.22%,
                            #39230f 80.11%,
                            #3d2b1b 99.76%
                    );
                    border-bottom: 1px solid #996547;

                    &--lower {
                        line-height: 30px;
                    }
                }
            }
        }

        &__dropdown {
            width: 280px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;

            &-header {
                height: 94px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 30px 20px 22px 24px;
                background: linear-gradient(
                        90.43deg,
                        #372e26 0.48%,
                        #58381a 22.2%,
                        #472d15 53.22%,
                        #39230f 80.11%,
                        #3d2b1b 99.76%
                );
                border-bottom: 1px solid #996547;

                &--purple {
                    background: linear-gradient(
                            90.33deg,
                            #8547d5 -8.57%,
                            #8a1d94 21.91%,
                            #871691 59.73%,
                            #a9196f 99.81%
                    );
                    border-bottom: 1px solid #996547;
                }

                &--green {
                    background: linear-gradient(
                            90deg,
                            #47d591 -20.62%,
                            #29a084 5.76%,
                            #219a84 43.46%,
                            #1da886 76.13%,
                            #19bea0 100%
                    );
                    border-bottom: 1px solid #91d483;
                }

                &--blue {
                    background: linear-gradient(
                            90deg,
                            #5d88fb -20.62%,
                            #3f62c1 5.76%,
                            #3456c2 43.46%,
                            #3761cc 76.13%,
                            #3d6ff0 100%
                    );
                    border-bottom: 1px solid #779dff;
                }

                &-name {
                    height: 16px;
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    text-align: center;
                    justify-content: space-between;
                }

                &-tag {
                    height: 16px;
                    font-size: 8px;
                    line-height: 16px;
                    font-weight: 400;
                    padding: 0 4px;
                    background-color: #ffffff26;
                    color: #fff;
                    opacity: 0.5;
                    border: none;
                }

                &-mobile {
                    height: 14px;
                    font-size: 14px;
                    opacity: 0.5;
                    color: #fff;
                }
            }

            &-body {
                display: flex;
                flex-direction: column;
                flex: 1;
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
                padding: 6px 8px;

                &-item {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 8px;
                    height: 39px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: 1px solid #fff;
                    cursor: pointer;

                    &:hover {
                        border: 1px solid #cddbff;
                        background: linear-gradient(
                                270deg,
                                rgb(122 159 255 / 19.2%) 0%,
                                rgb(49 98 225 / 0%) 76.56%,
                                rgb(49 98 225 / 6.4%) 100%
                        );
                    }
                }
            }
        }
    }
}

.main-header-right__menu-user {
    display: flex;
    width: 28px;
    height: 28px;
    justify-content: center;
    align-items: center;
    border-radius: 14px;
    background: #3162E1;
    color: #fff;
}

.toggle_theme {
}
</style>
