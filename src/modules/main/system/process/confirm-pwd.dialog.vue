<template>
    <cv-dialog-form
        v-model="visible"
        :title="title"
        ref="dialogForm"
        v-model:form-model="formData"
        :rules="rules"
        :submit="submit"
        width="428px"
        submitText="确定"
        label-position="top"
    >
        <div class="tips">确定执行重启操作？</div>
        <cv-form-item label="登录密码：" prop="password">
            <cv-input type="password" show-password v-model="formData.password"></cv-input>
        </cv-form-item>
    </cv-dialog-form>
</template>
<script setup lang="ts">
import {ref} from 'vue';

defineProps<{
    title: string
}>();
const emit = defineEmits(['submit']);
const initFormData = () => {
    return {
        password: '',
    };
};
const id = ref();
const formData = ref(initFormData());
const rules = {
    password: [
        {
            required: true,
            message: '请输入登录密码',
            trigger: 'blur',
        },
    ],
};
const visible = ref(false);

const submit = async () => {
    emit('submit', {
        password: formData.value.password,
        id: id.value,
    });
};

defineExpose({
    open(key: string) {
        id.value = key;
        visible.value = true;
    },
    close() {
        visible.value = false;
        id.value = null;
    },
});
</script>
<style scoped lang="scss">
.tips {
    display: flex;
    width: 100%;
    height: 50px;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    background-color: rgba(235, 157, 66, 0.2);
    border: 1px solid #eb9d42;
    border-radius: 5px;
}
</style>