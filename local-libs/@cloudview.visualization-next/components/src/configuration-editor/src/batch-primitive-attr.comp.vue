<template>
    <div class="vis-batch-primitive-attrs">
        <div class="vis-batch-primitive-attrs__title">批量绑定</div>
        <cv-button class="vis-primitive-attr__bind-device" @click="openSelectDialog">
            {{ t('vis.configuration.batchBindDevice') }}
        </cv-button>
        <vis-select-equipment v-model="selectDialogVisible" :batch-primitives="props.primitives"></vis-select-equipment>
    </div>
</template>

<script lang="ts" setup>
import {PrimitiveInstance} from '@cloudview.visualization-next/services';
import {useLocale} from 'cloudview.ui-next';
import VisSelectEquipment from './select-equipment.vue';
import {ref} from 'vue';

defineOptions({name: 'BatchPrimitiveAttrs'});

const {t} = useLocale();

const props = defineProps<{
    primitives: PrimitiveInstance[];
    attrType: symbol;
}>();

const selectDialogVisible = ref(false);

const openSelectDialog = () => {
    selectDialogVisible.value = true;
};
</script>
