<template>
    <cv-dialog-form
        v-model="visible"
        width="500"
        title="新增节点"
        :draggable="true"
        :submit="submit"
        :form-model="formData"
        :submit-text="t('fw.common.confirm')"
        @close="cancel"
        :rules="rules"
    >
        <div style="padding: 0 56px">
            <cv-form-item label="类型" prop="type">
                <cv-select :disabled="disabled" v-model="formData.type">
                    <cv-option
                        v-for="item in typeOptions"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                </cv-select>
            </cv-form-item>
            <cv-form-item label="名称" prop="name">
                <cv-input v-model="formData.name"></cv-input>
            </cv-form-item>
        </div>
    </cv-dialog-form>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {ref} from 'vue';
import ModelManagementServiceApi from '@/modules/main/agc/model-management/model-management.service';

const {t} = useLocale();
const emit = defineEmits(['refresh']);

const rules = {
    type: [
        {
            required: true,
            message: '类型不能为空',
            trigger: 'blur',
        },
    ],
    name: [
        {
            required: true,
            message: '名称不能为空',
            trigger: 'blur',
        },
    ],
};
const visible = ref(false);
const disabled = ref(false);
const currentNode = ref();
const typeOptions = ref();
const formData = ref({
    type: '',
    name: '',
});
const open = (data: any, node: any) => {
    const {type} = data;
    ModelManagementServiceApi.getDeviceTypes(type).then(res => {
        if (res.state) {
            typeOptions.value = res.data;
        }
    });
    currentNode.value = node;
    visible.value = true;
};

const submit = async () => {
    const {type, name} = formData.value;
    let res: any;
    /**
     * 新增
     */
    const {
        data: {name: deviceName},
    } = currentNode.value;
    res = await ModelManagementServiceApi.createAgcDevice(deviceName, {type, name});
    if (res.state) {
        CvMessage.success('操作成功');
        emit('refresh');
        cancel();
    } else CvMessage.error(res.data.msg);
};
const cancel = () => {
    visible.value = false;
    formData.value = {
        type: '',
        name: '',
    };
};
defineExpose({
    open,
    cancel,
});
</script>

<style lang="scss" scoped>
.w-cm {
    width: 320px;
}

.el-checkbox {
    border: 1px solid #d8dbe1;
    padding: 20px 48px;
    border-radius: 4px;
    margin-bottom: 12px;
}

.is-checked {
    border-color: var(--el-checkbox-checked-text-color);
}
</style>
