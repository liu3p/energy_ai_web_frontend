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
    <cv-dialog-form
        v-model="visible"
        :title="title"
        ref="dialogForm"
        v-model:form-model="formData"
        :rules="rules"
        :submit="submit"
        width="428px"
        :submitText="t('fw.common.sure')"
        label-position="top"
        style="padding: 0 24px"
    >
        <cv-form-item :label="t('fw.monitor.deviceName') + t('fw.common.colon')" prop="deviceName">
            <cv-input disabled v-model="props.deviceName"></cv-input>
        </cv-form-item>
        <cv-form-item :label="t('fw.monitor.paramName') + t('fw.common.colon')" prop="name">
            <cv-input disabled v-model="formData.name"></cv-input>
        </cv-form-item>
        <cv-form-item :label="t('fw.monitor.dispatchValue') + t('fw.common.colon')" prop="value">
            <cv-input-number
                v-if="active === 'regulate'"
                v-model="formData.value"
                style="width: 100%"
            ></cv-input-number>
            <cv-select v-if="active === 'control'" v-model="formData.value">
                <cv-option :value="1">{{ t('fw.monitor.controlClose') }}</cv-option>
                <cv-option :value="0">{{ t('fw.monitor.controlOpen') }}</cv-option>
            </cv-select>
        </cv-form-item>
        <cv-form-item :label="t('fw.monitor.loginPassword') + t('fw.common.colon')" prop="checkpwd">
            <cv-input type="password" show-password v-model="formData.checkpwd"></cv-input>
        </cv-form-item>
    </cv-dialog-form>
    <cv-dialog-form v-model="historyVisible" :title="t('fw.monitor.historyData')" :z-index="1000" width="1000">
        <div class="history-header">
            <el-radio-group v-model="tabPosition" style="margin-bottom: 30px">
                <el-radio-button value="chart">{{ t('fw.monitor.chart') }}</el-radio-button>
                <el-radio-button value="table">{{ t('fw.monitor.data') }}</el-radio-button>
            </el-radio-group>
            <el-date-picker
                v-model="historyDate"
                @change="getHistory"
                type="date"
                :editable="false"
                :clearable="false"
                style="width: 120px"
            />
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
import {monitorControl, monitorRegulate} from '@/modules/main/capture/monitor/monitor.service';
import dashboardServiceApi from '@/modules/main/dashboard/dashboard.service';
import charts from '@/modules/main/dashboard/charts.vue';
import moment from 'moment';

type chartParams = {
    xAxis: (number | string)[];
    data: {name: string; type: 'line' | 'bar'; color?: string; data: (number | string)[]}[];
    unit?: string;
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
const selectNode = ref();
const tabPosition = ref<string>('chart');
const historyChartData = ref<chartParams>({
    xAxis: [],
    data: [],
});
const historyTableData = ref<any>([]);
const formData = ref<
    Partial<{
        pid: string;
        value: string;
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
    visible.value = true;
    formData.value.value = ctlvalue;
    formData.value.name = name;
    formData.value.pid = pointID;
};

const history = (records: any) => {
    selectNode.value = records;
    historyVisible.value = true;
    historyDate.value = new Date();
    getHistory();
};
const getHistory = () => {
    const oid = selectNode.value.pointID;
    historyChartData.value = {
        xAxis: [],
        data: [],
        unit: '',
    };
    historyTableData.value = [];
    const params = {
        type: 'analog',
        ids: [oid],
        start_time: moment(historyDate.value).startOf('day'),
        end_time: moment(historyDate.value).startOf('day').add(1, 'day'),
        interval: 3600,
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
            historyChartData.value.unit = selectNode.value.unit;
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
    formData.value = {};
};
const submit = async () => {
    const {did, rid} = props;
    const {checkpwd, pid, value} = formData.value;
    const data = {value, checkpwd};
    let res: any;
    if (props.active === 'regulate') res = await monitorRegulate(rid, did, pid!, data);
    else if (props.active === 'control') res = await monitorControl(rid, did, pid!, data);
    if (res.state) {
        CvMessage.success(t('fw.common.operateSuccess'));
        cancel();
    }
};

defineExpose({
    initPage,
});
</script>

<style scoped lang="scss">
.cv-form-item {
    margin-bottom: 12px !important;
}

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
</style>
