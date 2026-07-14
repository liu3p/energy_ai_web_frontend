<template>
    <cv-dialog-form
        v-model="visible"
        width="560"
        title="批量编辑"
        :draggable="true"
        :submit="submit"
        :form-model="formData"
        :submit-text="t('fw.common.confirm')"
        label-width="130px"
        :rules="rules"
        @close="cancel"
    >
        <div class="tips">
            提示：请键入行号或用逗号分隔的行范围(例如：1,3或4-10)。
        </div>
        <cv-form-item label="选择行" prop="lines" style="margin-bottom: 24px;">
            <cv-input v-model.trim="formData.lines" class="w-cm" :placeholder="t('fw.common.pleaseInput')">
                <template #append>
                    <cv-select v-model="formData.unit" style="width: 80px" :disabled="formData.mode === 1">
                        <cv-option
                            v-for="item in [
                                {
                                    label: '行号',
                                    value: 0
                                },
                                {
                                    label: '范围',
                                    value: 1
                                }
                            ]"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </cv-select>
                </template>
            </cv-input>
        </cv-form-item>
        <cv-form-item v-if="type === 'text'" label="替换方式" prop="mode" style="margin-bottom: 24px;">
            <cv-select v-model.trim="formData.mode" :placeholder="t('fw.common.pleaseSelect')" class="w-cm" @change="modeChange">
                <cv-option
                    v-for="item in [
                        {
                            label: '相同值',
                            value: 0
                        },
                        {
                            label: '递增',
                            value: 1
                        },
                    ]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </cv-select>
        </cv-form-item>
        <cv-form-item v-if="formData.mode === 0 || type !== 'text'" label="替换参数值" prop="value" style="margin-bottom: 24px;">
            <cv-input v-if="type === 'text'" v-model.trim="formData.value" :placeholder="t('fw.common.pleaseInput')" class="w-cm" />
            <cv-switch v-if="type === 'switch'" v-model.trim="formData.value" :active-value="1" :inactive-value="0" />
            <cv-select v-if="type === 'select'" v-model.trim="formData.value" :placeholder="t('fw.common.pleaseSelect')" class="w-cm">
                <cv-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </cv-select>
        </cv-form-item>
        <template v-else>
            <cv-form-item label="起始值" prop="startValue" style="margin-bottom: 24px;">
                <cv-input v-model.trim="formData.startValue" :placeholder="t('fw.common.pleaseInput')" class="w-cm" />
            </cv-form-item>
            <cv-form-item label="步长" prop="step" style="margin-bottom: 24px;">
                <cv-input v-model.trim="formData.step" :placeholder="t('fw.common.pleaseInput')" class="w-cm" />
            </cv-form-item>
        </template>
    </cv-dialog-form>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {ref} from 'vue';

const {t} = useLocale();

const options = ref<any[]>([]);
const key = ref();
const type = ref();
const emit = defineEmits(['submit']);
const visible = ref(false);
// 默认mode为相同值
const formData = ref<{
    lines: string;
    value: string | number;
    unit: number;
    mode: number;
    startValue?: string;
    step?: string;
}>({
    lines: '',
    value: '',
    mode: 0,
    unit: 1
});
const rules = {
    lines: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
        },
        {
            validator: (rule: any, value: string,callback: any) => {
                const {unit} = formData.value;
                if (unit === 0) {
                    const regex = /^\d+(,\d+)*$/;
                    if (!regex.test(value)) {
                        return callback(new Error('请输入数字且以 , 分割'));
                    }
                 } else {
                    const regex = /^(0|[1-9]\d*)-(0|[1-9]\d*)$/;
                    if (!regex.test(value)) {
                        return callback(new Error('请输入数字且以 - 分割'));
                    }
                }
                return callback();
            },
            trigger: 'blur',
        },
    ],
    value: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
        },
    ],
    mode: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
        },
    ],
    startValue: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
        },
    ],
    step: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
        },
    ],
};
const modeChange = (e: number) => {
    if(e === 1) {
        formData.value.unit = 1;
    }
};

const open = (keywords: string,inputType: string,data?: any) => {
    if(inputType === 'switch') formData.value.value = 1;
    type.value = inputType;
    key.value = keywords;
    options.value = data;
    visible.value = true;
};

const submit = () => {
    const {unit,lines,mode,value,startValue,step} = formData.value;
    const map: Map<number, unknown> = new Map();
    const ranges = [];
    if(unit === 0) {
        const list = lines.split(',');
        [...new Set(list)].forEach(line => {
            ranges.push(parseInt(line));
        });
    } else {
        const list = lines.split('-');
        for(let i = parseInt(list[0]); i <= parseInt(list[1]); i++) {
            ranges.push(i);
        }
    }
    if(mode === 0) {
        ranges.forEach(item => {
            map.set(item,value);
        });
    } else {
        let current = parseInt(startValue as string)
        let gap = parseInt(step as string)
        ranges.forEach(item => {
            map.set(item,current)
            current += gap;
        });
    }
    emit('submit', key.value,map,value);
    cancel();
};
const cancel = () => {
    visible.value = false;
    type.value = null;
    key.value = null;
    options.value = [];
    formData.value = {
        lines: '',
        value: '',
        unit: 1,
        mode: 0,
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

.tips {
    width: 500px;
    height: 48px;
    background: #F3F6F8;
    border: 1px solid #3162E11A;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #576381;
    margin: 0 auto 24px;
}
</style>
