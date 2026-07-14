<template>
    <cv-dialog-form
        v-model="visible"
        width="500"
        title="新增通道"
        :draggable="true"
        :submit="submit"
        :form-model="formData"
        submit-text="确定"
        label-width="130px"
        @close="close"
        :rules="rules"
    >
        <cv-form-item label="通道名称" prop="name">
            <cv-input v-model.trim="formData.name" :controls="false" class="w-cm" />
        </cv-form-item>
    </cv-dialog-form>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {RTUTYPE} from '@/modules/main/capture/point/point.model';

const {t} = useLocale();

const emit = defineEmits(['submit']);
const rules = {
    name: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
            trigger: 'blur',
        },
    ],
};

const visible = ref(false);

const formData = ref({
    name: '',
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
