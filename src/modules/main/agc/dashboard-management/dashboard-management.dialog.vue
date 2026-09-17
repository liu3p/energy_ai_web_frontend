<template>
    <cv-dialog
        v-model="visible"
        width="860"
        :title="dialogType == 'add' ? t('fw.common.add') : t('fw.common.edit')"
        :draggable="true"
        :z-index="1000"
        @close="cancel"
    >
        <cv-form ref="formRef" :model="formData" :rules="rules" label-width="80px" class="dialog-form">
            <cv-form-item :label="t('fw.dashboardManagement.showName')" prop="show_name">
                <cv-input v-model="formData.show_name" :placeholder="t('fw.common.pleaseInput')" />
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
                />
            </cv-form-item>
            <cv-form-item :label="t('fw.dashboardManagement.unit')" prop="unit" v-if="formData.type == '1'">
                <cv-input v-model="formData.show_unit" :placeholder="t('fw.common.pleaseInput')" />
            </cv-form-item>
            <template v-if="formData.type == '2'">
                <div class="enum-list" v-for="(domain, index) in formData.enumList" :key="domain.key">
                    <cv-form-item
                        class="enum-list__number"
                        :label="t('fw.dashboardManagement.numberValue')"
                        label-width="80px"
                        :prop="'enumList.' + index + '.number'"
                    >
                        <cv-input
                            v-model="domain.number"
                            type="number"
                            class="enum-list__number-input"
                            :placeholder="t('fw.common.pleaseInput')"
                        />
                    </cv-form-item>
                    <cv-form-item
                        class="enum-list__name"
                        :label="t('fw.dashboardManagement.valueName')"
                        label-width="70px"
                        :prop="'enumList.' + index + '.value'"
                    >
                        <cv-input
                            v-model="domain.value"
                            class="enum-list__name-input"
                            :placeholder="t('fw.common.pleaseInput')"
                        />
                    </cv-form-item>
                    <cv-form-item
                        class="enum-list__color"
                        :label="t('fw.dashboardManagement.fontColor')"
                        label-width="60px"
                    >
                        <el-color-picker
                            v-model="formData.enumList[index].color"
                            size="default"
                            :predefine="predefineColors"
                        />
                    </cv-form-item>
                    <cv-form-item
                        class="enum-list__color"
                        :label="t('fw.dashboardManagement.bgColor')"
                        label-width="60px"
                    >
                        <el-color-picker
                            v-model="formData.enumList[index].bgColor"
                            size="default"
                            :predefine="predefineColors"
                        />
                    </cv-form-item>
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
        </cv-form>
        <template #footer>
            <cv-button @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
            <cv-button type="primary" @click="handleSubmit">{{ t('fw.common.sure') }}</cv-button>
        </template>
    </cv-dialog>
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
const formRef = ref();
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
    bgColor: string;
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
            bgColor: '#ffffff',
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
        bgColor: '#ffffff',
        value: '',
    });
};

const resolveBgColor = (bgColorMap: Record<string, string> | null | undefined, key: string) => {
    if (!bgColorMap || typeof bgColorMap !== 'object') {
        return '#ffffff';
    }
    return bgColorMap[key] ?? bgColorMap[String(Number(key))] ?? '#ffffff';
};

const open = (data: any) => {
    if (data) {
        dialogType.value = 'edit';
        const {no, type, show_name, oid, show_unit, show_value, table, bg_color} = data;
        formData.value = {
            no: no,
            type: type,
            show_name: show_name,
            oid: oid,
            show_unit: show_unit,
            show_value: show_value,
            enumList: table
                ? Object.keys(table).map((item, index) => {
                      const parts = String(table[item] ?? '').split('_');
                      return {
                          key: `${item}_${index}_${Date.now()}`,
                          color: parts[1] || '#000000',
                          bgColor: resolveBgColor(bg_color, item),
                          number: item,
                          value: parts[0] || '',
                      };
                  })
                : [
                      {
                          key: `empty_${Date.now()}`,
                          number: '',
                          value: '',
                          color: '#000000',
                          bgColor: '#ffffff',
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
            bgColor: '#ffffff',
            value: '',
        },
    ];
};
const selectPoint = (info: any) => {
    formData.value.oid = info.id;
};

const handleSubmit = async () => {
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid) {
        return;
    }
    emit('submit', formData.value, dialogType.value);
    cancel();
};

const cancel = () => {
    visible.value = false;
    formRef.value?.resetFields?.();
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
                bgColor: '#ffffff',
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
.dialog-form {
    padding: 0 40px;
}

.enum-list {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 4px;
    margin-bottom: 18px;

    :deep(.el-form-item),
    :deep(.cv-form-item) {
        margin-bottom: 0;
        margin-right: 0;
        display: flex;
        align-items: center;
    }

    :deep(.el-form-item__label),
    :deep(.cv-form-item__label) {
        height: 32px;
        line-height: 32px;
        padding-bottom: 0;
    }

    :deep(.el-form-item__content),
    :deep(.cv-form-item__content) {
        display: flex;
        align-items: center;
        line-height: 32px;
    }

    :deep(.el-color-picker) {
        display: inline-flex;
        align-items: center;
        height: 32px;
        margin-left: 0;
        flex-shrink: 0;
    }

    :deep(.el-color-picker__trigger) {
        width: 32px;
        height: 32px;
        padding: 2px;
    }
}

.enum-list__number {
    flex: 0 0 auto;

    :deep(.el-form-item__label),
    :deep(.cv-form-item__label) {
        justify-content: flex-end;
        text-align: right;
    }
}

.enum-list__number-input {
    width: 90px;
}

.enum-list__name {
    flex: 0 0 auto;
}

.enum-list__name-input {
    width: 170px;
}

.enum-list__color {
    flex: 0 0 auto;

    :deep(.el-form-item__label),
    :deep(.cv-form-item__label) {
        justify-content: flex-end;
        text-align: right;
    }
}

.enum-btn {
    margin-left: 4px;
    margin-top: 0;
    height: 32px;
    width: 32px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
</style>
