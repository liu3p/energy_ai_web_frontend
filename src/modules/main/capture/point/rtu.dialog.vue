<template>
    <cv-dialog-form
        v-model="visible"
        width="500"
        :title="t('fw.capturePoint.addRtu')"
        :draggable="true"
        :submit="submit"
        :form-model="formData"
        :submit-text="t('fw.common.sure')"
        label-width="130px"
        @close="close"
        :rules="rules"
    >
        <cv-form-item :label="t('fw.capturePoint.rtuName')" prop="name">
            <cv-input v-model.trim="formData.name" :controls="false" class="w-cm" />
        </cv-form-item>
        <cv-form-item :label="t('fw.capturePoint.rtuType')" prop="type">
            <cv-select v-model="formData.type" filterable style="width: 260px">
                <cv-option v-for="item in rtuTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </cv-select>
        </cv-form-item>
        <cv-form-item :label="t('fw.capturePoint.memofcabinet')" prop="memofcabinet">
            <cv-input v-model.trim="formData.memofcabinet" :controls="false" class="w-cm" />
        </cv-form-item>
    </cv-dialog-form>
</template>
<script setup lang="ts">
import {ref, computed} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {RTUTYPE} from '@/modules/main/capture/point/point.model';

const {t} = useLocale();

const rtuTypeOptions = computed(() =>
    RTUTYPE.map(item => ({
        ...item,
        label: t(`fw.capturePoint.rtuTypeOption.${item.value}`),
    }))
);

const emit = defineEmits(['submit']);
const rules = {
    name: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
            trigger: 'blur',
        },
    ],
    type: [
        {
            required: true,
            message: t('fw.common.pleaseSelect'),
            trigger: 'blur',
        },
    ],
};

const visible = ref(false);

const formData = ref({
    name: '',
    type: '',
    memofcabinet: '',
    rtuaddr: '',
});
const submit = () => {
    emit('submit', formData.value);
};
const open = () => {
    visible.value = true;
};
const close = () => {
    visible.value = false;
    formData.value = {
        name: '',
        type: '',
        memofcabinet: '',
        rtuaddr: '',
    };
};

defineExpose({
    open,
    close,
});
</script>
<style scoped lang="scss">
.w-cm {
    width: 260px;
}
</style>
