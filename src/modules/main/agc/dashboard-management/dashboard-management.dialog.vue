<template>
    <cv-dialog-form v-model="visible" width="700" :title="dialogType == 'add' ? '新增' : '编辑'" :draggable="true"
        :submit="submit" :form-model="formData" label-width="80" :z-index="1000" :submit-text="t('fw.common.confirm')"
        @close="cancel" :rules="rules">
        <div style="padding: 0 56px">
            <cv-form-item label="展示名称" prop="show_name">
                <cv-input v-model="formData.show_name" placeholder="请输入"></cv-input>
            </cv-form-item>
            <cv-form-item label="点位类型" prop="type">
                <cv-select :disabled="disabled" v-model="formData.type" placeholder="请输入" @change="selectChange">
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
                        <cv-input v-model="domain.number" type="number" style="width: 90px" placeholder="请输入" />
                    </cv-form-item>
                    <cv-form-item label="值名称" label-width="70" :key="domain.key" :prop="'enumList.' + index + '.value'">
                        <cv-input v-model="domain.value" style="width: 170px" placeholder="请输入" />
                    </cv-form-item>
                    <el-color-picker v-model="domain.color" size="large" style="margin-left:5px"
                        :predefine="predefineColors" />
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
const predefineColors = ref([
    '#000000',
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
])
const replyPointRef = ref();
const dialogType = ref('add');
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
    color: string,
    value: string
}
const formData = ref<{
    no: number,
    type: string,
    show_name: string,
    oid: string,
    show_unit: string,
    show_value: string,
    enumList: EnumItem[]
}>({
    no: 0,
    type: '',
    show_name: '',
    oid: '',
    show_unit: "",
    show_value: "",
    enumList: [{
        key: Date.now(),
        color: '#000000',
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
        color: "#000000",
        value: '',
    })
}

const open = (data: any) => {
    if (data) {
        dialogType.value = 'edit'
        const { no, type, show_name, oid, show_unit, show_value, table } = data;
        formData.value = {
            no: no,
            type: type,
            show_name: show_name,
            oid: oid,
            show_unit: show_unit,
            show_value: show_value,
            enumList: table ? Object.keys(table).map((item, index) => {
                return {
                    key: Date.now(),
                    color: table[item].split("_")[1],
                    number: item,
                    value: table[item].split("_")[0],
                }
            }) : [{
                key: Date.now(),
                number: "",
                value: ""
            }]
        };
    } else {
        dialogType.value = 'add'
    }
    visible.value = true;
};
const selectChange = () => {
    formData.value.oid = '';
    formData.value.show_unit = '';
    formData.value.show_value = '';
    formData.value.enumList = [{
        key: Date.now(),
        number: "",
        color: "#000000",
        value: ""
    }]
}
const selectPoint = (info: any) => {
    formData.value.oid = info.id
}

const submit = async () => {
    emit('submit', formData.value, dialogType.value);
    cancel();
};

const cancel = () => {
    visible.value = false;
    formData.value = {
        no: 0,
        type: '',
        show_name: '',
        oid: '',
        show_unit: "",
        show_value: "",
        enumList: [{
            key: Date.now(),
            number: "",
            color: "#000000",
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
.enum-list {
    display: flex;
}

.enum-btn {
    margin-top: 5px;
    margin-left: 5px;
}
</style>
