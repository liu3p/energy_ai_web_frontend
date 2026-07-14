<template>
    <div class="menu">
        <cv-button :class="{
            'menu-item':true,
            'menu-item-active': route.path.includes(item.path)
        }" v-for="(item,index) in menus" :key="index"
                   @mouseenter="collapse = true">
            <span>{{ item.meta!.title }}</span>
            <cv-icon color="transparent" size="16" style="margin-left: 8px">
                <component
                    v-if="item.icon"
                    :is="item.icon"
                />
            </cv-icon>
        </cv-button>
    </div>
    <div class="popper animate__animated animate__fadeIn" v-if="collapse" @mouseleave="collapse = false">
        <div v-for="(item,index) in menus" :key="index">
            <h1 class="submenu-title">{{ item.meta!.title }}</h1>
            <div :class="{
                'submenu-item': true,
                'submenu-item-active': route.path === `/main/${item.path}/${citem.path}`
            }" v-for="(citem,i) in item.children" :key="i"
                 @click="router.push(`/main/${item.path}/${citem.path}`)">{{ citem.meta!.title }}
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {computed, ref} from 'vue';
import {RouteRecordRaw, useRoute} from 'vue-router';
import {useLocale} from 'cloudview.ui-next';
import {userMenuList} from '@/common/user';
import {useRouter} from 'vue-router';

const {t} = useLocale();
const route = useRoute();
const router = useRouter();

const collapse = ref(false);
const menus = computed(() => {
    return userMenuList.value?.reduce((prev: RouteRecordRaw[], item: RouteRecordRaw) => {
        return [...prev, ...item.children!];
    }, []) ?? [];
});
</script>
<style scoped lang="scss">
.menu {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.menu-item {
    border: none;
    color: #8F9292;
    display: flex;
    align-items: center;
}

.menu-item-active {
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: bold;
    color: #35353E;
    background: #EFF1F4;

    &:hover {
        color: #35353E;
        background: #EFF1F4;
    }
}

.popper {
    position: absolute;
    width: 100%;
    height: 420px;
    background: #fff;
    left: 0;
    display: flex;
    justify-content: center;
    gap: 120px;
    box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.02);
}

.submenu-title {
    color: #b8b8bb;
    font-size: 24px;
    font-weight: normal;
    padding: 12px;
}

.submenu-item {
    font-size: 16px;
    color: #5d5d65;
    padding: 12px;
    margin-bottom: 20px;
    border-radius: 8px;
    cursor: pointer;
}

.submenu-item-active {
    background: #EFF1F4;
    font-weight: bold;
    color: #35353E;
}
</style>