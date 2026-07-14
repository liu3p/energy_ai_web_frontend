<template>
    <div class="sidebar">
        <div class="sidebar__left">
            <template v-for="(item, index) in menus">
                <div
                    v-if="item.show !== false && (item.builtIn || enableMenuIds.includes(item.id))"
                    :key="index"
                    class="sidebar__left-menu"
                >
                    <div
                        class="sidebar__left-menu-btn"
                        :class="activeMenuIndex === index && 'sidebar__left-menu--active'"
                        @click="switchMenu(index)"
                    >
                        <div v-show="activeMenuIndex === index" class="sidebar__left-menu--active-bar"></div>

                        <cv-icon v-if="item.icon && item.activeIcon" size="18" color="transparent">
                            <component :is="activeMenuIndex !== index ? item.icon : item.activeIcon"></component>
                        </cv-icon>
                        <div style="width: 100%; word-break: break-all; margin-top: 6px">
                            {{ t(item.shortLabel ?? '') }}
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {menus, getMenuByCurRoute, enableMenuIds} from '@/common/menu';
import router from '@/router';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

const activeMenuIndex = ref(0);

const menu = computed(() => menus.value[activeMenuIndex.value]);

watch(
    () => router.currentRoute.value,
    () => {
        const [fIndex, sIndex] = getMenuByCurRoute();
        activeMenuIndex.value = fIndex;
    },
    {
        immediate: true,
    }
);

/** @param resetSubIndex 是否重置子菜单 */
function switchMenu(index: number) {
    if (index !== activeMenuIndex.value) {
        activeMenuIndex.value = index;
        const path =
            menu.value.path ??
            menu.value.subMenus?.find(item => {
                return enableMenuIds.value.includes(item.id);
            })?.path;
        path && router.push(path);
    }
}
</script>
<style lang="scss" scoped>
.sidebar {
    display: flex;

    &__left {
        position: relative;
        z-index: 99;
        width: 60px;
        padding: 72px 0 18px;
        background: #313234;

        &-menu {
            margin-bottom: 8px;

            &:hover {
                .sidebar__left-menu-btn-hover-img {
                    display: block;
                }

                .sidebar__left-preview {
                    display: block;
                }
            }

            &-btn {
                padding-top: 10px;
                border: 1px solid transparent;
                border-left: none;
                border-right: none;
                width: 100%;
                height: 56px;
                text-align: center;
                position: relative;
                cursor: pointer;
                color: #8696bc;
                font-size: 12px;
                font-weight: 400;
                line-height: 1;

                &-hover-img {
                    position: absolute;
                    left: 0;
                    top: 0;
                    display: none;
                }
            }

            &-last-btn {
                position: absolute;
                bottom: 38px;
                left: 0;
            }
        }

        &-preview {
            display: none;
            position: absolute;
            left: 60px;
            top: 0;
            height: 100%;
            width: 160px;
            text-align: left;
        }

        &-menu--active {
            background: linear-gradient(
                -90deg,
                rgba(226, 234, 255, 0.14),
                rgba(226, 234, 255, 0.18) 6.77%,
                rgba(237, 242, 255, 0)
            );
            border-image: radial-gradient(
                    105.5% 314.23% at 50% 45.19%,
                    #ffffff00 0%,
                    #ffffffe5 50%,
                    #ffffff00 100%,
                    #ffffff00 100%
                )
                1;
            color: #d1d1d1;
        }

        &-menu--active-bar {
            position: absolute;
            left: 4px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 18px;
            border-radius: 9px;
            background: #d4d4d5;
        }
    }

    &__right {
        overflow: hidden;
    }
}

.zoom-enter-active,
.zoom-leave-active {
    transition: all 0.3s ease;
    transform: translateX(0);
    width: 160px;
}

.zoom-enter-from,
.zoom-leave-to {
    width: 0;
    transform: translateX(-100%);
}
</style>
