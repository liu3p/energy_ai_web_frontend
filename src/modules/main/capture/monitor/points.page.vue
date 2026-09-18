<template>
    <div class="container">
        <cv-table :data="data" class="table-container" row-key="no">
            <cv-table-column prop="index" :label="t('fw.common.number')" width="80" fixed>
                <template #default="{ $index }">
                    <span>{{ $index + 1 }}</span>
                </template>
            </cv-table-column>
            <cv-table-column prop="pointID" label="OID" width="160" />
            <cv-table-column prop="name" :label="t('fw.monitor.paramName')"></cv-table-column>
            <template v-if="['analog', 'digital', 'pulse'].includes(active)">
                <cv-table-column prop="rawvalue" :label="t('fw.monitor.rawValue')"></cv-table-column>
                <cv-table-column prop="currvalue" :label="t('fw.monitor.currentValue')"></cv-table-column>
                <cv-table-column prop="dead" :label="t('fw.monitor.dead')"></cv-table-column>
                <cv-table-column prop="quality" :label="t('fw.monitor.quality')"></cv-table-column>
                <cv-table-column prop="sendtime" :label="t('fw.monitor.refreshTime')" :width="170">
                    <template #default="{ row }">
                        {{ moment(row.sendtime).format('YYYY-MM-DD HH:mm:ss') }}
                    </template>
                </cv-table-column>
                <cv-table-column prop="sendtime" :label="t('fw.common.operation')">
                    <template #default="{ row }">
                        <cv-button type="primary" text @click="history(row)">
                            {{ t('fw.monitor.historyData') }}
                        </cv-button>
                    </template>
                </cv-table-column>
            </template>
            <template v-if="['regulate', 'control'].includes(active)">
                <cv-table-column prop="rawvalue" :label="t('fw.monitor.dispatchValue')"></cv-table-column>
                <cv-table-column prop="ctlvalue" :label="t('fw.monitor.frontControlValue')"></cv-table-column>
                <cv-table-column :label="t('fw.common.operation')">
                    <template #default="{ row }">
                        <cv-button type="primary" text @click="monitor(row)">
                            {{ t('fw.monitor.dispatch') }}
                        </cv-button>
                    </template>
                </cv-table-column>
            </template>
            <template v-if="active === 'attribute'">
                <cv-table-column prop="currvalue" :label="t('fw.monitor.attributeValue')"></cv-table-column>
                <cv-table-column prop="dead" :label="t('fw.monitor.dead')"></cv-table-column>
                <cv-table-column prop="sendtime" :label="t('fw.monitor.refreshTime')"></cv-table-column>
            </template>
        </cv-table>
        <cv-pagination
            layout="->,total,sizes,prev, pager, next,jumper"
            :page-sizes="[10, 20, 30, 40, 50]"
            :total="pageTotal"
            :current-page="currentPage"
            :page-size="pageSize"
            style="margin-top: 10px"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        >
        </cv-pagination>
    </div>
    <cv-dialog
        v-model="visible"
        :title="title"
        width="480px"
        class="dispatch-dialog"
        align-center
        @close="cancel"
    >
        <cv-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="dialog-form">
            <cv-form-item :label="t('fw.monitor.deviceName')" prop="deviceName">
                <cv-input disabled v-model="props.deviceName" />
            </cv-form-item>
            <cv-form-item :label="t('fw.monitor.paramName')" prop="name">
                <cv-input disabled v-model="formData.name" />
            </cv-form-item>
            <cv-form-item :label="t('fw.monitor.dispatchValue')" prop="value">
                <cv-input-number
                    v-if="active === 'regulate'"
                    v-model="formData.value"
                    style="width: 100%"
                />
                <cv-select v-else-if="active === 'control'" v-model="formData.value" style="width: 100%">
                    <cv-option :value="1">{{ t('fw.monitor.controlClose') }}</cv-option>
                    <cv-option :value="0">{{ t('fw.monitor.controlOpen') }}</cv-option>
                </cv-select>
            </cv-form-item>
            <cv-form-item :label="t('fw.monitor.loginPassword')" prop="checkpwd">
                <cv-input
                    type="password"
                    show-password
                    v-model="formData.checkpwd"
                    :placeholder="t('fw.common.pleaseInput')"
                />
            </cv-form-item>
        </cv-form>
        <template #footer>
            <div class="dialog-footer">
                <cv-button class="cancel-btn" @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
                <cv-button type="primary" @click="handleSubmit">{{ t('fw.common.sure') }}</cv-button>
            </div>
        </template>
    </cv-dialog>
    <cv-dialog-form v-model="historyVisible" :title="t('fw.monitor.historyData')" :z-index="1000" width="1000">
        <div class="history-header">
            <el-radio-group v-model="tabPosition" style="margin-bottom: 30px">
                <el-radio-button value="chart">{{ t('fw.monitor.chart') }}</el-radio-button>
                <el-radio-button value="table">{{ t('fw.monitor.data') }}</el-radio-button>
            </el-radio-group>
            <div class="history-header-right">
                <el-date-picker
                    v-model="historyDate"
                    @change="getHistory"
                    type="date"
                    :editable="false"
                    :clearable="false"
                    style="width: 120px"
                />
                <el-select v-model="historyInterval" style="width: 110px" @change="getHistory">
                    <el-option
                        v-for="item in intervalOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <el-button type="primary" :loading="exporting" @click="exportHistoryCsv">
                    {{ t('fw.monitor.exportCsv') }}
                </el-button>
            </div>
        </div>
        <div class="history-container">
            <charts v-show="tabPosition == 'chart'" style="height: 300px" :data="historyChartData" />
            <cv-table v-show="tabPosition == 'table'" :data="historyTableData" row-key="index" style="height: 400px">
                <cv-table-column prop="index" :label="t('fw.common.number')" width="100" sortable>
                    <template #default="{ $index }">
                        <span>{{ $index + 1 }}</span>
                    </template>
                </cv-table-column>
                <cv-table-column prop="time" :label="t('fw.monitor.time')" />
                <cv-table-column :prop="selectNode.name" :label="selectNode.name"></cv-table-column>
            </cv-table>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="historyVisible = false">{{ t('fw.monitor.close') }}</el-button>
            </div>
        </template>
    </cv-dialog-form>
</template>

<script setup lang="ts">
import {computed, reactive, toRefs, ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {currentLocale} from '@/common/locale';
import {monitorControl, monitorRegulate} from '@/modules/main/capture/monitor/monitor.service';
import dashboardServiceApi from '@/modules/main/dashboard/dashboard.service';
import charts from '@/modules/main/dashboard/charts.vue';
import moment from 'moment';

type chartParams = {
    xAxis: (number | string)[];
    data: {name: string; type: 'line' | 'bar'; color?: string; data: (number | string)[]}[];
    unit?: string;
    xAxisLabelHourly?: boolean;
};

const {t} = useLocale();

const props = defineProps<{
    active: string;
    rid: string;
    did: string;
    deviceName: string;
    data: any[];
    pageTotal: number;
}>();
const emit = defineEmits<{
    (e: 'page-change', pageInfo: {currentPage: number; pageSize: number}): void;
}>();

const rules = {
    value: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
            trigger: 'blur',
        },
    ],
    checkpwd: [
        {
            required: true,
            message: t('fw.common.pleaseInput'),
            trigger: 'blur',
        },
    ],
};
const pages = reactive({
    currentPage: 1,
    pageSize: 10,
});

const {currentPage, pageSize} = toRefs(pages);
const visible = ref(false);
const historyVisible = ref(false);
const historyDate = ref(new Date());
const historyInterval = ref(900);
const exporting = ref(false);
const intervalOptions = computed(() =>
    [1, 5, 10, 15].map(count => ({
        value: count * 60,
        label: currentLocale.value.startsWith('zh-') ? `${count}分钟` : `${count} min`,
    })),
);
const selectNode = ref();
const tabPosition = ref<string>('chart');
const historyChartData = ref<chartParams>({
    xAxis: [],
    data: [],
});
const historyTableData = ref<any>([]);
const formRef = ref();
const formData = ref<
    Partial<{
        pid: string;
        value: string | number;
        name: string;
        checkpwd: string;
    }>
>({});
const title = computed(() => {
    if (props.active === 'regulate') return t('fw.monitor.dispatchRegulate');
    else if (props.active === 'control') return t('fw.monitor.dispatchControl');
});

const monitor = (records: any) => {
    const {pointID, ctlvalue, name} = records;
    formData.value = {
        value: ctlvalue,
        name,
        pid: pointID,
        checkpwd: '',
    };
    visible.value = true;
};

const history = (records: any) => {
    selectNode.value = records;
    historyVisible.value = true;
    historyDate.value = new Date();
    historyInterval.value = 900;
    getHistory();
};
const getHistory = () => {
    const oid = selectNode.value.pointID;
    historyChartData.value = {
        xAxis: [],
        data: [],
        unit: '',
        xAxisLabelHourly: true,
    };
    historyTableData.value = [];
    const params = {
        type: 'analog',
        ids: [oid],
        start_time: moment(historyDate.value).startOf('day'),
        end_time: moment(historyDate.value).startOf('day').add(1, 'day'),
        interval: historyInterval.value,
    };
    switch (oid.split('-')[2]) {
        case '101':
            params.type = 'digital';
            break;
        case '102':
            params.type = 'analog';
            break;
        case '105':
            params.type = 'pulse';
            break;
    }
    dashboardServiceApi.getHistory(params).then(res => {
        if (res.state) {
            historyChartData.value.xAxis = res.data.data.map(n => {
                return moment(n.time).format('HH:mm');
            });
            historyChartData.value.data.push({
                name: selectNode.value.name,
                type: 'line',
                data: res.data.data.map(n => {
                    return n.data[oid];
                }),
            });
            historyChartData.value.unit = '';
            historyChartData.value.xAxisLabelHourly = true;
            historyChartData.value = JSON.parse(JSON.stringify(historyChartData.value));
            res.data.data.forEach(n => {
                const json: Record<string, unknown> = {
                    time: moment(n.time).format('HH:mm'),
                };
                json[selectNode.value.name] = n.data[oid];
                historyTableData.value.push(json);
            });
        }
    });
};

/** 按天调用导出接口下载 CSV */
const exportHistoryCsv = async () => {
    const oid = selectNode.value?.pointID;
    if (!oid) {
        return;
    }
    const pointName = selectNode.value?.name || 'point';
    const dateStr = moment(historyDate.value).format('YYYY-MM-DD');
    exporting.value = true;
    try {
        const res = await dashboardServiceApi.exportHistory({
            id: oid,
            start_time: moment(historyDate.value).startOf('day').toISOString(),
            end_time: moment(historyDate.value).startOf('day').add(1, 'day').toISOString(),
        });
        const blob = res.data as Blob;
        if (blob.type?.includes('json')) {
            const text = await blob.text();
            let message = t('fw.systemPages.exportFailed');
            try {
                message = JSON.parse(text)?.msg || message;
            } catch {
                /* 非 JSON 错误体时沿用默认文案 */
            }
            CvMessage.error(message);
            return;
        }
        const disposition = res.headers?.['content-disposition'] as string | undefined;
        const fileName =
            disposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)?.[1] || `${pointName}_${dateStr}.csv`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = decodeURIComponent(fileName.replace(/"/g, ''));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch {
        CvMessage.error(t('fw.systemPages.exportFailed'));
    } finally {
        exporting.value = false;
    }
};

const handleCurrentChange = (val: number) => {
    pages.currentPage = val;
    emit('page-change', {currentPage: val, pageSize: pages.pageSize});
};
const handleSizeChange = (val: number) => {
    pages.pageSize = val;
    emit('page-change', {currentPage: pages.currentPage, pageSize: val});
};
const initPage = (pageInfo?: {currentPage?: number; pageSize?: number}) => {
    pages.currentPage = pageInfo?.currentPage ?? 1;
    pages.pageSize = pageInfo?.pageSize ?? 10;
};
const cancel = () => {
    visible.value = false;
    formRef.value?.resetFields?.();
    formData.value = {};
};
const handleSubmit = async () => {
    const valid = await formRef.value?.validate?.().catch(() => false);
    if (!valid) {
        return;
    }
    const {did, rid} = props;
    const {checkpwd, pid, value} = formData.value;
    const data = {value, checkpwd};
    let res: any;
    if (props.active === 'regulate') res = await monitorRegulate(rid, did, pid!, data);
    else if (props.active === 'control') res = await monitorControl(rid, did, pid!, data);
    if (res.state) {
        CvMessage.success(t('fw.common.operateSuccess'));
        cancel();
    } else {
        CvMessage.error(res.data?.msg || t('fw.common.operateFailed'));
    }
};

defineExpose({
    initPage,
});
</script>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
}

.table-container {
    width: 100%;
    height: calc(100% - 64px);
    border: none;

    :deep(.el-table__row) {
        height: 40px;
    }

    :deep(.el-table__cell) {
        padding-top: 0;
        padding-bottom: 0;
        height: 40px;
    }
}

.history-header {
    display: flex;
    justify-content: space-between;
}

.history-header-right {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.dialog-form {
    padding: 8px 24px 0;

    :deep(.el-form-item) {
        margin-bottom: 22px;
    }

    :deep(.el-form-item__label) {
        color: #1a2233;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper),
    :deep(.el-input-number) {
        min-height: 36px;
        border-radius: 6px;
    }

    :deep(.el-input-number) {
        width: 100%;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
}

.cancel-btn {
    color: #3162e1;
    border-color: #3162e1;
    background: #fff;

    &:hover,
    &:focus {
        color: #3162e1;
        border-color: #3162e1;
        background: rgb(49 98 225 / 6%);
    }
}
</style>

<style lang="scss">
.dispatch-dialog.el-dialog {
    border-radius: 12px;
    overflow: hidden;

    .el-dialog__header {
        padding: 20px 24px 12px;
        margin-right: 0;
    }

    .el-dialog__title {
        font-size: 16px;
        font-weight: 600;
        color: #1a2233;
    }

    .el-dialog__body {
        padding: 8px 16px 12px;
    }

    .el-dialog__footer {
        padding: 12px 24px 20px;
    }
}
</style>
