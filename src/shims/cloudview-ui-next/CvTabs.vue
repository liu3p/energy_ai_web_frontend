<template>
    <ElTabs
        :model-value="modelValue"
        :type="type"
        v-bind="attrs"
        @update:model-value="onUpdate"
        @tab-click="onTabClick"
        @tab-change="onTabChange"
    >
        <ElTabPane
            v-for="pane in panes"
            :key="String(pane.name)"
            :label="String(pane.label)"
            :name="pane.name"
        />
        <slot />
    </ElTabs>
</template>

<script setup lang="ts">
defineOptions({inheritAttrs: false});

import {useAttrs} from 'vue';
import {ElTabPane, ElTabs} from 'element-plus';

export type CvTabPaneItem = {
    label: string | number;
    name: string | number;
    [key: string]: unknown;
};

withDefaults(
    defineProps<{
        modelValue?: string | number;
        panes?: CvTabPaneItem[];
        type?: '' | 'card' | 'border-card';
    }>(),
    {
        panes: () => [],
        type: '',
    }
);

const emit = defineEmits<{
    'update:modelValue': [value: string | number];
    'tab-click': [pane: unknown, ev: Event];
    'tab-change': [name: string | number];
}>();

const attrs = useAttrs();

const onUpdate = (value: string | number) => {
    emit('update:modelValue', value);
};

const onTabClick = (pane: unknown, ev: Event) => {
    emit('tab-click', pane, ev);
};

const onTabChange = (name: string | number) => {
    emit('tab-change', name);
};
</script>
