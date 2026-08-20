<template>
    <cv-drawer
        ref="drawerRef"
        v-model="visible"
        :title="t('fw.capturePoint.editFormula')"
        size="1300px"
        @close="handleClose"
    >
        <div class="drawer-content">
            <div class="drawer-content-left">
                <div class="form-wrapper">
                    <cv-form ref="formRef" :inline="true" label-position="top" :model="formData" :rules="rules">
                        <cv-form-item :label="t('fw.capturePoint.calcType')" prop="calctype">
                            <cv-select v-model="formData.calctype" style="width: 160px;">
                                <cv-option :label="t('fw.capturePoint.period')" value="0"></cv-option>
                                <cv-option :label="t('fw.capturePoint.trigger')" value="1"></cv-option>
                            </cv-select>
                        </cv-form-item>
                        <cv-form-item prop="calccycle" :label="t('fw.capturePoint.calcCycle')" v-if="formData.calctype === '0'">
                            <cv-input v-model="formData.calccycle"
                                      style="width: 160px;"></cv-input>
                        </cv-form-item>
                        <cv-form-item prop="triggerpoint" :label="t('fw.capturePoint.triggerPoint')" v-if="formData.calctype === '1'">
                            <cv-select v-model="formData.triggerpoint" @click="pickPointRef.open(true,formData.triggerpoint)"
                                       style="width: 160px;">
                            </cv-select>
                        </cv-form-item>
                        <cv-form-item prop="triggertype" :label="t('fw.capturePoint.triggerType')" v-if="formData.calctype === '1'">
                            <cv-select v-model="formData.triggertype" style="width: 160px;">
                                <cv-option :label="t('fw.capturePoint.changeOpen')" value="0"></cv-option>
                                <cv-option :label="t('fw.capturePoint.changeClose')" value="1"></cv-option>
                                <cv-option :label="t('fw.capturePoint.changeBoth')" value="2"></cv-option>
                            </cv-select>
                        </cv-form-item>
                    </cv-form>
                </div>
                <div style="height: calc(100% - 64px)">
                    <div class="block-header">
                        <span>{{ t('fw.capturePoint.varDefine') }}</span>
                        <cv-button @click="addRow">{{ t('fw.capturePoint.addVariable') }}</cv-button>
                    </div>
                    <cv-table :data="tableData" style="width: 100%">
                        <cv-table-column prop="name" :label="t('fw.capturePoint.varName')" width="180px" />
                        <cv-table-column prop="datasource" :label="t('fw.capturePoint.mapPoint')">
                            <template #default="{row}">
                                <cv-select v-model="row.datasource" @click="currentRow = row;pickPointRef.open(false,row.datasource)">
                                </cv-select>
                            </template>
                        </cv-table-column>
                        <cv-table-column prop="mockValue" :label="t('fw.capturePoint.mockValue')" width="180px">
                            <template #default="{row}">
                                <cv-input-number
                                    v-model="row.mockValue"
                                />
                            </template>
                        </cv-table-column>
                        <cv-table-column :label="t('fw.common.operation')" width="100px">
                            <template #default="{$index}">
                                <cv-button type="primary" link @click="delRow($index)">{{ t('fw.common.delete') }}</cv-button>
                            </template>

                        </cv-table-column>
                    </cv-table>
                </div>
            </div>
            <div class="drawer-content-right">
                <div class="block-header">
                    <span>
                        {{ t('fw.capturePoint.formulaDesc') }}
                        <span class="verify-success" v-if="checkResult.content">{{ checkResult.content }}</span>
                        <span class="verify-error" v-if="checkResult.err">{{ checkResult.err }}</span>
                    </span>
                    <cv-button @click="check">{{ t('fw.capturePoint.verifyFormula') }}</cv-button>
                </div>
                <div>
                    <cv-input
                        v-model="formData.info"
                        :rows="4"
                        type="textarea"
                        :placeholder="t('fw.capturePoint.formulaPlaceholder')"
                    />
                </div>
                <div class="block-header">
                    <span>{{ t('fw.capturePoint.mockCalc') }}</span>
                    <cv-button>{{ t('fw.capturePoint.mockCalc') }}</cv-button>
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
                <cv-button type="primary" @click="saveFormula">{{ t('fw.capturePoint.saveFormula') }}
                </cv-button>
                <cv-button @click="handleClose">{{ t('fw.monitor.close') }}</cv-button>
            </div>
        </template>
    </cv-drawer>
    <pick-point ref="pickPointRef" @submit="handleSubmit" />
</template>
<script setup lang="ts">
import {ref, computed} from 'vue';
import {useLocale, CvMessage} from 'cloudview.ui-next';
import PickPoint from '@/modules/main/capture/point/pick-point.vue';
import {checkFormula, getFormula, updateFormula} from '@/modules/main/capture/point/point.service';

const {t} = useLocale();

const rules = computed(() => ({
    calctype: {
        required: true,
        trigger: 'blur',
        message: t('fw.capturePoint.calcTypeRequired'),
    },
    calccycle: {
        required: true,
        trigger: 'blur',
        message: t('fw.capturePoint.calcCycleRequired'),
    },
}));
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
                    content: t('fw.capturePoint.formulaValid'),
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
        return CvMessage.warning(t('fw.capturePoint.pleaseVerifyFormula'));
    }
    if (!tableData.value.every(item => item.datasource)) {
        return CvMessage.warning(t('fw.capturePoint.mapPointRequired'));
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
                    CvMessage.success(t('fw.common.operateSuccess'));
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
