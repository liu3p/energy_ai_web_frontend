<template>
    <cv-config-provider v-bind="config">
        <router-view></router-view>
    </cv-config-provider>
</template>

<script setup lang="ts">
import {reactive, ref, toRaw} from 'vue';
// @ts-ignore
import cvZh from 'cloudview.ui-next/locale/lang/zh-cn';
// @ts-ignore
import cvEn from 'cloudview.ui-next/locale/lang/en';
import zhCn from './locale/zh-cn';
import enUs from './locale/en-us';
import {useLocale} from 'cloudview.ui-next';
import {Locale} from '@/common/locale';

const {t} = useLocale();
const fwZh = {...cvZh, ...zhCn};
const fwEn = {...cvEn, ...enUs};

const config = reactive({
    locale: Locale.locale,
});
</script>

<style>
#app {
    height: 100%;
}
</style>
