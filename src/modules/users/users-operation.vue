<template>
    <cv-dialog-form
        v-model="visible"
        :title="isEdit ? t('fw.users.editUser') : t('fw.users.addUser')"
        size="small"
        :draggable="true"
        label-width="100px"
        :form-model="formModel"
        :rules="rules"
        :submit="submit"
    >
        <cv-form-item :label="t('fw.users.name') + t('fw.common.colon')" prop="name">
            <cv-input v-model="formModel.name"></cv-input>
        </cv-form-item>
        <cv-form-item :label="t('fw.users.date') + t('fw.common.colon')" prop="date">
            <cv-select v-model="formModel.date">
                <cv-option value="1">1</cv-option>
                <cv-option value="2">2</cv-option>
            </cv-select>
        </cv-form-item>
        <cv-form-item :label="t('fw.users.address') + t('fw.common.colon')" prop="address">
            <cv-input v-model="formModel.address"></cv-input>
        </cv-form-item>
    </cv-dialog-form>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {UserModel} from './user.model';
import {cloneDeep} from 'lodash';

const emit = defineEmits(['saved']);

const {t} = useLocale();
const visible = ref(false);
const isEdit = ref(false);
// 初始化表单数据
const initFormData = (): UserModel => {
    return {
        name: '',
        date: '',
        address: '',
    };
};
// 表单模型
const formModel = ref(initFormData());
const rules = {
    name: {
        required: true,
        message: t('fw.users.pleaseInputUserName'),
        trigger: 'blur',
    },
    date: {
        required: true,
        message: 'change error',
        trigger: 'change',
    },
};
// 提交数据
const submit = async () => {
    // todo 模拟网络请求
    await new Promise<void>(resolve => {
        setTimeout(() => {
            emit('saved', cloneDeep(formModel.value));
            resolve();
        }, 1000);
    });
    return true;
};
const open = (data?: UserModel) => {
    if (data) {
        isEdit.value = true;
        formModel.value = cloneDeep(data);
    } else {
        isEdit.value = false;
        formModel.value = initFormData();
    }
    visible.value = true;
};
defineExpose({
    open,
});
</script>
