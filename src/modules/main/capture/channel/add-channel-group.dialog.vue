<template>
    <cv-dialog-form
        v-model="visible"
        width="500"
        title="新增通道组"
        :draggable="true"
        :submit="submit"
        :form-model="formData"
        submit-text="确定"
        label-width="130px"
        @close="close"
        :rules="rules"
    >
        <cv-form-item label="通道组名称" prop="name">
            <cv-input v-model.trim="formData.name" :controls="false" class="w-cm" />
        </cv-form-item>
        <cv-form-item label="是否转发厂站" prop="fortransfer">
            <cv-switch v-model="formData.fortransfer" active-value="1" inactive-value="0" />
        </cv-form-item>
        <cv-form-item label="关联RTU" prop="stationid">
            <cv-select
                v-model="formData.stationid"
                filterable
                style="width: 260px;"
            >
                <cv-option
                    v-for="item in options"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                />
            </cv-select>
        </cv-form-item>
    </cv-dialog-form>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

defineProps<{
    options: {
        id: string;
        name: string;
    }[]
}>();
const emit = defineEmits(['submit']);
const rules = {
    name: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
            trigger: 'blur',
        },
    ],
    fortransfer: [
        {
            required: true,
            message: t('fw.common.pleaseSelect'),
            trigger: 'blur',
        },
    ],
    stationid: [
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
    fortransfer: '0',
    stationid: '',
});


const submit = () => {
    emit('submit', formData.value);
    visible.value = false;
};
const open = () => {
    visible.value = true;
};
const close = () => {
    visible.value = false;
    formData.value = {
        name: '',
        fortransfer: '0',
        stationid: '',
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
