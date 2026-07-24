<!--eslint-disable vue/no-v-html-->
<template>
    <cv-dialog
        ref="dialog"
        v-model="display"
        :custom-class="!title ? 'vis-player-dialog--no-header' : ''"
        :width="width || '500px'"
        :title="title"
        append-to-body
        :show-close="true"
    >
        <div v-html="content"></div>
    </cv-dialog>
</template>

<script lang="ts" setup>
import type {IBindingDialog, PrimitiveInstance} from '@cloudview.visualization-next/services';
import {Utils} from '@cloudview.visualization-next/services';
import {computed, ref} from 'vue';

defineOptions({name: 'VisPlayerDialog'});

const dialog = ref();
const display = ref(false);
const template = ref('');
const title = ref('');
const width = ref<string | number>('');
const primitive = ref<PrimitiveInstance>();
const content = computed(() => (primitive.value ? Utils.parseTemplate(template.value, primitive.value) : ''));

const show = (binding: IBindingDialog, instance: PrimitiveInstance) => {
    primitive.value = instance;
    template.value = binding.template;
    title.value = binding.title;
    width.value = /^\d+$/.test(binding.width) ? binding.width + 'px' : binding.width;
    display.value = true;
};

defineExpose({show});
</script>
