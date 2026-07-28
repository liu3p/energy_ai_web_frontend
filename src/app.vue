<template>
    <cv-config-provider v-bind="config">
        <router-view></router-view>
    </cv-config-provider>
</template>

<script setup lang="ts">
import {reactive} from 'vue';
import zhCn from './locale/zh-cn';
import enUs from './locale/en-us';
import {Locale} from '@/common/locale';

const config = reactive({
    locale: Locale.localeName.startsWith('zh-') ? zhCn : enUs,
});
</script>

<style>
#app {
    height: 100%;
}
</style>
