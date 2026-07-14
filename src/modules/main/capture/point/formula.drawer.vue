<template>
    <cv-drawer
        ref="drawerRef"
        v-model="visible"
        title="编辑公式"
        size="1300px"
        @close="handleClose"
    >
        <div class="drawer-content">
            <div class="drawer-content-left">
                <div class="form-wrapper">
                    <cv-form ref="formRef" :inline="true" label-position="top" :model="formData" :rules="rules">
                        <cv-form-item label="计算方式" prop="calctype">
                            <cv-select v-model="formData.calctype" style="width: 160px;">
                                <cv-option label="周期" value="0"></cv-option>
                                <cv-option label="触发" value="1"></cv-option>
                            </cv-select>
                        </cv-form-item>
                        <cv-form-item prop="calccycle" label="计算周期（秒）" v-if="formData.calctype === '0'">
                            <cv-input v-model="formData.calccycle"
                                      style="width: 160px;"></cv-input>
                        </cv-form-item>
                        <cv-form-item prop="triggerpoint" label="触发点位" v-if="formData.calctype === '1'">
                            <cv-select v-model="formData.triggerpoint" @click="pickPointRef.open(true,formData.triggerpoint)"
                                       style="width: 160px;">
                            </cv-select>
                        </cv-form-item>
                        <cv-form-item prop="triggertype" label="触发方式" v-if="formData.calctype === '1'">
                            <cv-select v-model="formData.triggertype" style="width: 160px;">
                                <cv-option label="变分" value="0"></cv-option>
                                <cv-option label="变合" value="1"></cv-option>
                                <cv-option label="变位" value="2"></cv-option>
                            </cv-select>
                        </cv-form-item>
                    </cv-form>
                </div>
                <div style="height: calc(100% - 64px)">
                    <div class="block-header">
                        <span>变量定义</span>
                        <cv-button @click="addRow">添加变量</cv-button>
                    </div>
                    <cv-table :data="tableData" style="width: 100%">
                        <cv-table-column prop="name" label="变量名" width="180px" />
                        <cv-table-column prop="datasource" label="映射点位">
                            <template #default="{row}">
                                <cv-select v-model="row.datasource" @click="currentRow = row;pickPointRef.open(false,row.datasource)">
                                </cv-select>
                            </template>
                        </cv-table-column>
                        <cv-table-column prop="mockValue" label="模拟值" width="180px">
                            <template #default="{row}">
                                <cv-input-number
                                    v-model="row.mockValue"
                                />
                            </template>
                        </cv-table-column>
                        <cv-table-column label="操作" width="100px">
                            <template #default="{$index}">
                                <cv-button type="primary" link @click="delRow($index)">删除</cv-button>
                            </template>

                        </cv-table-column>
                    </cv-table>
                </div>
            </div>
            <div class="drawer-content-right">
                <div class="block-header">
                    <span>
                        公式描述
                        <span class="verify-success" v-if="checkResult.content">{{ checkResult.content }}</span>
                        <span class="verify-error" v-if="checkResult.err">{{ checkResult.err }}</span>
                    </span>
                    <cv-button @click="check">校验公式</cv-button>
                </div>
                <div>
                    <cv-input
                        v-model="formData.info"
                        :rows="4"
                        type="textarea"
                        placeholder="在此处输入公式，请输入变量和计算符号"
                    />
                </div>
                <div class="block-header">
                    <span>模拟计算</span>
                    <cv-button>模拟计算</cv-button>
                </div>
                <div>
                    <cv-input
                        v-model="checkResult.result"
                        disabled
                        :rows="4"
                        type="textarea"
                    />
                </div>
            </div>
        </div>
        <template #footer>
            <div class="demo-drawer__footer">
                <cv-button type="primary" @click="saveFormula">保存公式
                </cv-button>
                <cv-button @click="handleClose">关闭</cv-button>
            </div>
        </template>
    </cv-drawer>
    <pick-point ref="pickPointRef" @submit="handleSubmit" />
</template>
<script setup lang="ts">
import {ref} from 'vue';
import PickPoint from '@/modules/main/capture/point/pick-point.vue';
import {checkFormula, getFormula, updateFormula} from '@/modules/main/capture/point/point.service';

const rules = {
    calctype: {
        required: true,
        trigger: 'blur',
        message: '计算方式不能为空',
    },
    calccycle: {
        required: true,
        trigger: 'blur',
        message: '计算周期不能为空',
    },
};
const visible = ref(false);
const pickPointRef = ref();
const formData = ref<{
    triggerpoint?: string
    triggertype?: string
    calctype?: string
    calccycle?: string
    info?: string
}>({
    calctype: '0',
});
const tableData = ref<Partial<{name: string, datasource: string, mockValue: string}>[]>([]);
const currentRow = ref();
const formRef = ref();
const checkResult = ref({
    err: '',
    content: '',
    result: '',
    pass: false,
});
const idParams = ref<{
    rid: string;
    pid: string;
    did: string;
}>();

const addRow = () => {
    const len = tableData.value?.length ?? 0;
    (tableData.value ?? (tableData.value = [])).push({
        name: `x${len + 1}`,
    });
};

const handleSubmit = (records: any, trigger: boolean) => {
    if (trigger) {
        formData.value.triggerpoint = records.id;
    } else {
        currentRow.value.datasource = records.id;
        currentRow.value.triggerpoint = records.name;
    }
};
const handleClose = () => {
    visible.value = false;
    checkResult.value = {
        err: '',
        content: '',
        result: '',
        pass: false,
    };
};
const delRow = (index: number) => {
    tableData.value.splice(index, 1);
};

const check = () => {
    const params = {};
    tableData.value.forEach(item => {
        params[item.name] = item.mockValue ?? 0;
    });
    checkFormula({
        formula: formData.value.info,
        params,
    }).then(res => {
        if (res.state) {
            if (!res.data.err) {
                checkResult.value = {
                    content: '公式有效',
                    result: res.data.result,
                    pass: true,
                };
            } else {
                checkResult.value = {
                    err: res.data.err,
                    pass: false,
                };
            }
        } else {
            checkResult.value = {pass: false, err: res.data.err};
        }
    });
};

const saveFormula = () => {
    if (!checkResult.value.pass) {
        return CvMessage.warning('请先校验公式');
    }
    if (!tableData.value.every(item => item.datasource)) {
        return CvMessage.warning('映射点位不能为空');
    }
    formRef.value.validate((vali: boolean) => {
        if (vali) {
            const {rid, did, pid} = idParams.value!;
            updateFormula(rid, did, pid, {
                formula: formData.value,
                factors: tableData.value,
            }).then(res => {
                if (res.state) {
                    visible.value = false;
                    CvMessage.success('操作成功');
                } else CvMessage.error(res.data.msg);
            });
        }
    });
};

defineExpose({
    open(ids) {
        if (ids.pid) {
            const {rid, did, pid} = ids;
            getFormula(rid, did, pid).then(res => {
                if (res.state) {
                    formData.value = res.data.formula;
                    tableData.value = res.data.factors;
                }
            });
        }
        idParams.value = ids ?? {};
        visible.value = true;
    },
});
</script>
<style scoped lang="scss">
:deep(.cv-form-item) {
    margin-bottom: 0 !important;
}

.drawer-content {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 16px;
    flex-direction: row;

    &-left {
        width: 700px;
        height: 100%;
    }

    &-right {
        width: calc(100% - 700px);
        height: 100%;
    }
}

.block-header {
    color: #1A1A1A;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 0;
}

.form-wrapper {
    height: 64px;
}

.verify-success {
    color: #00A63E;
    font-weight: normal;
    margin-left: 4px;
}

.verify-error {
    color: #EF424C;
    font-weight: normal;
    margin-left: 4px;
}
</style>
