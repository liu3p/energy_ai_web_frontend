<template>
    <cv-dialog-form
        v-model="visible"
        width="700"
        :title="dialogType == 'add' ? t('fw.common.add') : t('fw.common.edit')"
        :draggable="true"
        :submit="submit"
        :form-model="formData"
        label-width="80"
        :z-index="1000"
        :submit-text="t('fw.common.confirm')"
        @close="cancel"
        :rules="rules"
    >
        <div style="padding: 0 56px">
            <cv-form-item :label="t('fw.dashboardManagement.showName')" prop="show_name">
                <cv-input v-model="formData.show_name" :placeholder="t('fw.common.pleaseInput')"></cv-input>
            </cv-form-item>
            <cv-form-item :label="t('fw.dashboardManagement.pointType')" prop="type">
                <cv-select
                    :disabled="disabled"
                    v-model="formData.type"
                    :placeholder="t('fw.common.pleaseInput')"
                    @change="selectChange"
                >
                    <cv-option
                        v-for="item in typeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </cv-select>
            </cv-form-item>
            <cv-form-item :label="t('fw.dashboardManagement.selectPoint')" prop="oid" v-if="formData.type != '3'">
                <cv-input
                    v-model="formData.oid"
                    @click="replyPointRef.open()"
                    :placeholder="t('fw.common.pleaseSelect')"
                >
                </cv-input>
            </cv-form-item>
            <cv-form-item :label="t('fw.dashboardManagement.unit')" prop="unit" v-if="formData.type == '1'">
                <cv-input v-model="formData.show_unit" :placeholder="t('fw.common.pleaseInput')" />
            </cv-form-item>
            <template v-if="formData.type == '2'">
                <div class="enum-list" v-for="(domain, index) in formData.enumList" :key="domain.key">
                    <cv-form-item
                        :label="t('fw.dashboardManagement.numberValue')"
                        label-width="80"
                        :prop="'enumList.' + index + '.value'"
                    >
                        <cv-input
                            v-model="domain.number"
                            type="number"
                            style="width: 90px"
                            :placeholder="t('fw.common.pleaseInput')"
                        />
                    </cv-form-item>
                    <cv-form-item
                        :label="t('fw.dashboardManagement.valueName')"
                        label-width="70"
                        :prop="'enumList.' + index + '.value'"
                    >
                        <cv-input
                            v-model="domain.value"
                            style="width: 170px"
                            :placeholder="t('fw.common.pleaseInput')"
                        />
                    </cv-form-item>
                    <el-color-picker
                        v-model="domain.color"
                        size="large"
                        style="margin-left: 5px"
                        :predefine="predefineColors"
                    />
                    <el-button class="enum-btn" @click="addEnum">＋</el-button>
                    <el-button class="enum-btn" v-if="formData.enumList.length != 1" @click="removeEnum(domain)">
                        —
                    </el-button>
                </div>
            </template>
            <cv-form-item
                :label="t('fw.dashboardManagement.fixedValue')"
                prop="show_value"
                v-if="formData.type == '3'"
            >
                <cv-input v-model="formData.show_value" :placeholder="t('fw.common.pleaseInput')" />
            </cv-form-item>
        </div>
    </cv-dialog-form>
    <reply-point-dialog ref="replyPointRef" @selectPoint="selectPoint"></reply-point-dialog>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {computed, ref} from 'vue';
import ReplyPointDialog from '@/modules/main/agc/dashboard-management/reply-point-dialog.vue';

const {t} = useLocale();
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
]);
const replyPointRef = ref();
const dialogType = ref('add');
const rules = {
    type: [
        {
            required: true,
            message: t('fw.dashboardManagement.typeRequired'),
            trigger: 'change',
        },
    ],
    show_name: [
        {
            required: true,
            message: t('fw.dashboardManagement.nameRequired'),
            trigger: 'blur',
        },
    ],
};
const visible = ref(false);
const disabled = ref(false);
const typeOptions = computed(() => [
    {
        value: 1,
        label: t('fw.dashboardManagement.realtimeValue'),
    },
    {
        value: 2,
        label: t('fw.dashboardManagement.enumValue'),
    },
    {
        value: 3,
        label: t('fw.dashboardManagement.fixedValue'),
    },
]);

interface EnumItem {
    key: number;
    number: string;
    color: string;
    value: string;
}
const formData = ref<{
    no: number;
    type: string;
    show_name: string;
    oid: string;
    show_unit: string;
    show_value: string;
    enumList: EnumItem[];
}>({
    no: 0,
    type: '',
    show_name: '',
    oid: '',
    show_unit: '',
    show_value: '',
    enumList: [
        {
            key: Date.now(),
            color: '#000000',
            number: '',
            value: '',
        },
    ],
});

const removeEnum = (item: EnumItem) => {
    const index = formData.value.enumList.indexOf(item);
    if (index !== -1) {
        formData.value.enumList.splice(index, 1);
    }
};

const addEnum = () => {
    formData.value.enumList.push({
        key: Date.now(),
        number: '',
        color: '#000000',
        value: '',
    });
};

const open = (data: any) => {
    if (data) {
        dialogType.value = 'edit';
        const {no, type, show_name, oid, show_unit, show_value, table} = data;
        formData.value = {
            no: no,
            type: type,
            show_name: show_name,
            oid: oid,
            show_unit: show_unit,
            show_value: show_value,
            enumList: table
                ? Object.keys(table).map(item => {
                      return {
                          key: Date.now(),
                          color: table[item].split('_')[1],
                          number: item,
                          value: table[item].split('_')[0],
                      };
                  })
                : [
                      {
                          key: Date.now(),
                          number: '',
                          value: '',
                      },
                  ],
        };
    } else {
        dialogType.value = 'add';
    }
    visible.value = true;
};
const selectChange = () => {
    formData.value.oid = '';
    formData.value.show_unit = '';
    formData.value.show_value = '';
    formData.value.enumList = [
        {
            key: Date.now(),
            number: '',
            color: '#000000',
            value: '',
        },
    ];
};
const selectPoint = (info: any) => {
    formData.value.oid = info.id;
};

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
        show_unit: '',
        show_value: '',
        enumList: [
            {
                key: Date.now(),
                number: '',
                color: '#000000',
                value: '',
            },
        ],
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
