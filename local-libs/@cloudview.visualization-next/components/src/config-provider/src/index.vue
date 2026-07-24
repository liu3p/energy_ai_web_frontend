<template>
    <slot :config="config"></slot>
</template>
<script lang="ts" setup>
import {computed} from 'vue';
import defaultProps from './props';
import type {IGlobalConfigType} from '@cloudview.visualization-next/services';
import {provideGlobalConfig} from '@cloudview.visualization-next/services';
import {useLocale} from 'cloudview.ui-next';

defineOptions({name: 'ConfigProvider'});
const props = defineProps(defaultProps);
const {t} = useLocale();
const doneProps = computed(() => ({...props, t} as IGlobalConfigType));
const config = provideGlobalConfig(doneProps);
</script>
