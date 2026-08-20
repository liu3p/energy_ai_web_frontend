<template>
    <aside class="app-sidebar" :class="{ 'app-sidebar--collapsed': collapsed }" :style="{ width: sidebarWidth }">
        <div class="app-sidebar__brand">
            <img class="app-sidebar__logo" src="@/assets/sidebar-icons/logo.svg" alt="logo" />
            <div v-show="!collapsed" class="app-sidebar__brand-text">
                <div class="app-sidebar__title">{{ t('fw.common.title') }}</div>
                <div class="app-sidebar__subtitle">Energy Management</div>
            </div>
        </div>

        <el-scrollbar class="app-sidebar__menu-wrap">
            <el-menu
                :default-active="activePath"
                :collapse="collapsed"
                :collapse-transition="false"
                background-color="#E9EDF4"
                text-color="#35353E"
                active-text-color="#3162E1"
                class="app-sidebar__menu"
                router
            >
                <template v-for="item in visibleMenus" :key="item.key">
                    <el-sub-menu v-if="item.children?.length" :index="item.key">
                        <template #title>
                            <sidebar-menu-icon
                                v-if="item.iconSrc"
                                :icon-src="item.iconSrc"
                                :icon-active-src="item.iconActiveSrc"
                                :active="isMenuItemActive(item, activePath)"
                                class="app-sidebar__icon"
                            />
                            <cv-icon v-else-if="item.icon" :size="18" color="transparent" class="app-sidebar__icon">
                                <component :is="item.icon" />
                            </cv-icon>
                            <span>{{ t(item.titleKey) }}</span>
                        </template>
                        <template v-for="child in item.children" :key="child.key">
                            <div
                                v-if="child.action"
                                class="app-sidebar__action"
                                @click.stop="handleMenuAction(child)"
                            >
                                <button
                                    class="app-sidebar__action-btn"
                                    type="button"
                                >
                                    {{ t(child.titleKey) }}
                                </button>
                                <span class="app-sidebar__action-warn">!</span>
                            </div>
                            <el-menu-item v-else :index="child.path">
                                {{ t(child.titleKey) }}
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                    <el-menu-item v-else :index="item.path!">
                        <sidebar-menu-icon
                            v-if="item.iconSrc"
                            :icon-src="item.iconSrc"
                            :icon-active-src="item.iconActiveSrc"
                            :active="isMenuItemActive(item, activePath)"
                            class="app-sidebar__icon"
                        />
                        <cv-icon v-else-if="item.icon" :size="18" color="transparent" class="app-sidebar__icon">
                            <component :is="item.icon" />
                        </cv-icon>
                        <template #title>{{ t(item.titleKey) }}</template>
                    </el-menu-item>
                </template>
            </el-menu>
        </el-scrollbar>

        <button
            class="app-sidebar__toggle"
            type="button"
            @click="toggleCollapsed"
            @mouseenter="toggleHovered = true"
            @mouseleave="toggleHovered = false"
        >
            <img class="app-sidebar__toggle-icon" :src="toggleIconSrc" alt="toggle sidebar" width="16" height="16" />
        </button>
        <param-enable-dialog ref="paramEnableDialogRef" />
    </aside>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useLocale} from 'cloudview.ui-next';
import {userInfo} from '@/common/user';
import icFold from '@/assets/sidebar-icons/ic_fold.svg';
import icFoldHover from '@/assets/sidebar-icons/ic_fold_hover.svg';
import icUnfold from '@/assets/sidebar-icons/ic_unfold.svg';
import icUnfoldHover from '@/assets/sidebar-icons/ic_unfold_hover.svg';
import {filterSidebarMenus, isMenuItemActive, sidebarMenus, type SidebarMenuItem} from './sidebar-menu';
import ParamEnableDialog from './param-enable.dialog.vue';
import SidebarMenuIcon from './sidebar-menu-icon.vue';

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 52;
const STORAGE_KEY = 'sidebar-collapsed';

const {t} = useLocale();
const route = useRoute();

const collapsed = ref(localStorage.getItem(STORAGE_KEY) === '1');
const toggleHovered = ref(false);
const paramEnableDialogRef = ref<InstanceType<typeof ParamEnableDialog>>();

const sidebarWidth = computed(() => `${collapsed.value ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`);

const toggleIconSrc = computed(() => {
    if (collapsed.value) {
        return toggleHovered.value ? icUnfoldHover : icUnfold;
    }
    return toggleHovered.value ? icFoldHover : icFold;
});

const visibleMenus = computed(() => filterSidebarMenus(sidebarMenus, userInfo.value?.usertype ?? ''));

const activePath = computed(() => route.path);

function handleMenuAction(item: SidebarMenuItem) {
    if (item.action !== 'param-enable') {
        return;
    }
    paramEnableDialogRef.value?.open();
}

function toggleCollapsed() {
    collapsed.value = !collapsed.value;
}

watch(collapsed, val => {
    localStorage.setItem(STORAGE_KEY, val ? '1' : '0');
});
</script>

<style scoped lang="scss">
.app-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #e9edf4;
    border-right: 1px solid #dfe5ef;
    transition: width 0.2s ease;
    flex-shrink: 0;

    &--collapsed {
        .app-sidebar__brand {
            justify-content: center;
            padding: 16px 0;
        }

        .app-sidebar__logo {
            margin-right: 0;
        }

        .app-sidebar__icon {
            margin-right: 0;
        }

        .app-sidebar__toggle {
            justify-content: center;
            padding-right: 0;
        }

        :deep(.el-menu) {
            --el-menu-base-level-padding: 0px;
            --el-menu-icon-width: 16px;
        }

        :deep(.el-menu--collapse) {
            width: 52px;
        }

        :deep(.el-menu--collapse .el-menu-item),
        :deep(.el-menu--collapse .el-sub-menu__title) {
            margin: 2px 6px;
            padding: 0 !important;
            justify-content: center;
        }

        :deep(.el-menu--collapse .el-menu-item .el-menu-tooltip__trigger) {
            position: absolute;
            inset: 0;
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 0 !important;
        }

        :deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title) {
            position: relative;
            display: flex !important;
            align-items: center;
            justify-content: center;
            padding: 0 !important;
        }

        :deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title .app-sidebar__icon),
        :deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title .sidebar-menu-icon) {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            margin: 0 !important;
        }

        :deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
            display: none;
        }

        :deep(.el-menu--collapse .el-menu-item span),
        :deep(.el-menu--collapse .el-sub-menu__title > span) {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
        }
    }

    &__brand {
        display: flex;
        align-items: center;
        padding: 16px 14px;
        min-height: 64px;
        box-sizing: border-box;
    }

    &__logo {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        margin-right: 10px;
    }

    &__brand-text {
        overflow: hidden;
    }

    &__title {
        font-size: 14px;
        font-weight: 700;
        color: #3162e1;
        line-height: 1.3;
        white-space: nowrap;
    }

    &__subtitle {
        margin-top: 2px;
        font-size: 11px;
        color: #8f9292;
        white-space: nowrap;
    }

    &__menu-wrap {
        flex: 1;
        min-height: 0;
    }

    &__menu {
        border-right: none;
        background: transparent !important;

        :deep(.el-menu-item),
        :deep(.el-sub-menu__title) {
            height: 44px;
            line-height: 44px;
            margin: 2px 8px;
            border-radius: 8px;
            color: #5C6373;
        }

        :deep(.el-menu--collapse .el-menu-item) {
            position: relative;
        }

        :deep(.el-menu-item.is-active) {
            background: #fff !important;
            color: #1A2233 !important;
        }
    }

    &__icon {
        margin-right: 8px;
        vertical-align: middle;
    }

    &__action {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 44px;
        margin: 2px 8px;
        padding-left: 36px;
        box-sizing: border-box;
        cursor: pointer;
    }

    &__action-btn {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        height: 28px;
        padding: 0 12px;
        border: 1px solid #e6a23c;
        border-radius: 4px;
        background: transparent;
        color: #e6a23c;
        font-size: 14px;
        line-height: 1;
        white-space: nowrap;
        cursor: pointer;

        &:hover:not(:disabled) {
            background: rgb(230 162 60 / 8%);
        }

        &:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }
    }

    &__action-warn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #e6a23c;
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
    }

    &__toggle {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        height: 44px;
        margin: 0;
        padding-right: 10px;
        border: none;
        border-radius: 0;
        background: #fff;
        cursor: pointer;
        box-sizing: border-box;
        flex-shrink: 0;

        &:hover {
            background: rgb(49 98 225 / 8%);
        }
    }

    &__toggle-icon {
        display: block;
        flex-shrink: 0;
    }
}
</style>

<style lang="scss">
.el-menu--popup .app-sidebar__action {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    margin: 2px 8px;
    padding-left: 20px;
    box-sizing: border-box;
    cursor: pointer;
}

.el-menu--popup .app-sidebar__action-btn {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    height: 28px;
    padding: 0 12px;
    border: 1px solid #e6a23c;
    border-radius: 4px;
    background: transparent;
    color: #e6a23c;
    font-size: 14px;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
}

.el-menu--popup .app-sidebar__action-warn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e6a23c;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
}
</style>
