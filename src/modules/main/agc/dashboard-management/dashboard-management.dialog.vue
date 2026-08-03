<template>
    <cv-dialog-form v-model="visible" width="600" title="新增" :draggable="true" :submit="submit" :form-model="formData"
        label-width="80" z-index="1000" :submit-text="t('fw.common.confirm')" @close="cancel" :rules="rules">
        <div style="padding: 0 56px">
            <cv-form-item label="展示名称" prop="show_name">
                <cv-input v-model="formData.show_name" placeholder="请输入"></cv-input>
            </cv-form-item>
            <cv-form-item label="点位类型" prop="type">
                <cv-select :disabled="disabled" v-model="formData.type" placeholder="请输入">
                    <cv-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </cv-select>
            </cv-form-item>
            <cv-form-item label="选择点位" prop="oid" v-if="formData.type != '3'">
                <cv-input v-model="formData.oid" @click="replyPointRef.open()" placeholder="请选择">
                </cv-input>
            </cv-form-item>
            <cv-form-item label="单位" prop="unit" v-if="formData.type == '1'">
                <cv-input v-model="formData.show_unit" placeholder="请输入" />
            </cv-form-item>
            <template v-if="formData.type == '2'">
                <div class="enum-list" v-for="(domain, index) in formData.enumList">
                    <cv-form-item label="数值" label-width="80" :key="domain.key" :prop="'enumList.' + index + '.value'">
                        <cv-input v-model="domain.number" type="number" style="width: 100px" placeholder="请输入" />
                    </cv-form-item>
                    <cv-form-item label="值名称" label-width="70" :key="domain.key" :prop="'enumList.' + index + '.value'">
                        <cv-input v-model="domain.value" style="width: 100px" placeholder="请输入" />
                    </cv-form-item>
                    <el-button class="enum-btn" @click="addEnum">＋</el-button>
                    <el-button class="enum-btn" v-if="formData.enumList.length != 1"
                        @click="removeEnum(domain)">—</el-button>
                </div>
            </template>
            <cv-form-item label="固定值" prop="show_value" v-if="formData.type == '3'">
                <cv-input v-model="formData.show_value" placeholder="请输入" />
            </cv-form-item>
        </div>
    </cv-dialog-form>
    <reply-point-dialog ref="replyPointRef" @selectPoint="selectPoint"></reply-point-dialog>
</template>

<script lang="ts" setup>
import { useLocale } from 'cloudview.ui-next';
import { ref } from 'vue';
import ReplyPointDialog from '@/modules/main/agc/dashboard-management/reply-point-dialog.vue'
const { t } = useLocale();
const emit = defineEmits(['refresh', 'submit']);
const replyPointRef = ref();

const rules = {
    type: [
        {
            required: true,
            message: '类型不能为空',
            trigger: 'change',
        },
    ],
    show_name: [
        {
            required: true,
            message: '名称不能为空',
            trigger: 'blur',
        },
    ],
};
const visible = ref(false);
const disabled = ref(false);
const typeOptions = ref([
    {
        value: 1,
        label: '实时值',
    },
    {
        value: 2,
        label: '枚举值',
    },
    {
        value: 3,
        label: '固定值',
    },
]);

interface EnumItem {
    key: number,
    number: string,
    value: string
}
const formData = ref<{
    type: string,
    show_name: string,
    oid: string,
    show_unit: string,
    show_value: string,
    enumList: EnumItem[]
}>({
    type: '',
    show_name: '',
    oid: '',
    show_unit: "",
    show_value: "",
    enumList: [{
        key: Date.now(),
        number: "",
        value: ""
    }]
});


const removeEnum = (item: EnumItem) => {
    const index = formData.value.enumList.indexOf(item)
    if (index !== -1) {
        formData.value.enumList.splice(index, 1)
    }
}

const addEnum = () => {
    formData.value.enumList.push({
        key: Date.now(),
        number: '',
        value: '',
    })
}

const open = (data: any, node: any) => {
    visible.value = true;
};

const selectPoint = (info: any) => {
    formData.value.oid = info.id
}

const submit = async () => {
    emit('submit', formData.value);
    cancel();
};

const cancel = () => {
    visible.value = false;
    formData.value = {
        type: '',
        show_name: '',
        oid: '',
        show_unit: "",
        show_value: "",
        enumList: [{
            key: Date.now(),
            number: "",
            value: ""
        }]
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

.enum-list {
    display: flex;
}

.enum-btn {
    margin-top: 5px;
    margin-left: 5px;
}
</style>
