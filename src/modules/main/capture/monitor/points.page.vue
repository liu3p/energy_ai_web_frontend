<template>
    <div class="container">
        <cv-table :data="data" class="table-container" row-key="no">
            <cv-table-column prop="index" label="序号" width="80" fixed>
                <template #default="{ $index }">
                    <span>{{ $index + 1 }}</span>
                </template>
            </cv-table-column>
            <cv-table-column prop="pointID" label="OID" width="160" />
            <cv-table-column prop="name" label="参数名称"></cv-table-column>
            <template v-if="['analog', 'digital', 'pulse'].includes(active)">
                <cv-table-column prop="rawvalue" label="原始值"></cv-table-column>
                <cv-table-column prop="currvalue" label="当前值"></cv-table-column>
                <cv-table-column prop="dead" label="死数"></cv-table-column>
                <cv-table-column prop="quality" label="品质位"></cv-table-column>
                <cv-table-column prop="sendtime" label="刷新时间" :width="170">
                    <template #default="{ row }">
                        {{ moment(row.sendtime).format("YYYY-MM-DD HH:mm:ss") }}
                    </template>
                </cv-table-column>
                <cv-table-column prop="sendtime" label="操作">
                    <template #default="{ row }">
                        <cv-button type="primary" text @click="history(row)">历史数据</cv-button>
                    </template>
                </cv-table-column>
            </template>
            <template v-if="['regulate', 'control'].includes(active)">
                <cv-table-column prop="rawvalue" label="下发值"></cv-table-column>
                <cv-table-column prop="ctlvalue" label="前置控制值"></cv-table-column>
                <cv-table-column label="操作">
                    <template #default="{ row }">
                        <cv-button type="primary" text @click="monitor(row)">下发</cv-button>
                    </template>
                </cv-table-column>
            </template>
            <template v-if="active === 'attribute'">
                <cv-table-column prop="currvalue" label="属性值"></cv-table-column>
                <cv-table-column prop="dead" label="死数"></cv-table-column>
                <cv-table-column prop="sendtime" label="刷新时间"></cv-table-column>
            </template>
        </cv-table>
        <cv-pagination layout="->,total,sizes,prev, pager, next,jumper" :page-sizes="[10, 20, 30, 40, 50]"
            :total="pageTotal" :current-page="currentPage" :page-size="pageSize" style="margin-top: 10px"
            @current-change="handleCurrentChange" @size-change="handleSizeChange">
        </cv-pagination>
    </div>
    <cv-dialog-form v-model="visible" :title="title" ref="dialogForm" v-model:form-model="formData" :rules="rules"
        :submit="submit" width="428px" submitText="确定" label-position="top" style="padding: 0 24px">
        <cv-form-item label="设备名称：" prop="deviceName">
            <cv-input disabled v-model="props.deviceName"></cv-input>
        </cv-form-item>
        <cv-form-item label="参数名称：" prop="name">
            <cv-input disabled v-model="formData.name"></cv-input>
        </cv-form-item>
        <cv-form-item label="下发值：" prop="value">
            <cv-input-number v-if="active === 'regulate'" v-model="formData.value"
                style="width: 100%"></cv-input-number>
            <cv-select v-if="active === 'control'" v-model="formData.value">
                <cv-option :value="1">控合</cv-option>
                <cv-option :value="0">控分</cv-option>
            </cv-select>
        </cv-form-item>
        <cv-form-item label="登录密码：" prop="checkpwd">
            <cv-input type="password" show-password v-model="formData.checkpwd"></cv-input>
        </cv-form-item>
    </cv-dialog-form>
    <cv-dialog-form v-model="historyVisible" title="历史数据" :z-index="1000" width="1000">
        <div class="history-header">
            <el-radio-group v-model="tabPosition" style="margin-bottom: 30px">
                <el-radio-button value="chart">图形</el-radio-button>
                <el-radio-button value="table">数据</el-radio-button>
            </el-radio-group>
            <el-date-picker v-model="historyDate" @change="getHistory" type="date" :editable="false" :clearable='false'
                style="width: 120px;" />
        </div>
        <div class="history-container ">
            <charts v-show="tabPosition == 'chart'" style="height:300px" :data="historyChartData" />
            <cv-table v-show="tabPosition == 'table'" :data="historyTableData" row-key="index" style="height:400px">
                <cv-table-column prop="index" label="序号" width="100" sortable>
                    <template #default="{ $index }">
                        <span>{{ $index + 1 }}</span>
                    </template>
                </cv-table-column>
                <cv-table-column prop="time" label="时间" />
                <cv-table-column :prop="selectNode.name" :label="selectNode.name"></cv-table-column>
            </cv-table>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="historyVisible = false">关闭</el-button>
            </div>
        </template>
    </cv-dialog-form>
</template>

<script setup lang="ts">
import { computed, reactive, toRefs, ref } from 'vue';
import { monitorControl, monitorRegulate } from '@/modules/main/capture/monitor/monitor.service';
import dashboardServiceApi from '@/modules/main/dashboard/dashboard.service';
import charts from '@/modules/main/dashboard/charts.vue';
import moment from 'moment';
type chartParams = { xAxis: (number | string)[]; data: { name: string; type: 'line' | 'bar', color?: string, data: (number | string)[] }[]; unit?: string };
const props = defineProps<{
    active: string;
    rid: string;
    did: string;
    deviceName: string;
    data: any[];
    pageTotal: number;
}>();
const emit = defineEmits<{
    (e: 'page-change', pageInfo: { currentPage: number; pageSize: number }): void;
}>();

const rules = {
    value: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ],
    checkpwd: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ],
};
const pages = reactive({
    currentPage: 1,
    pageSize: 10,
});

const { currentPage, pageSize } = toRefs(pages);
const visible = ref(false);
const historyVisible = ref(false);
const historyDate = ref(new Date())
const selectNode = ref();
const tabPosition = ref<string>('chart')
const historyChartData = ref<chartParams>({
    xAxis: [],
    data: []
});
const historyTableData = ref<any>([])
const formData = ref<
    Partial<{
        pid: string;
        value: string;
        name: string;
        checkpwd: string;
    }>
>({});
const title = computed(() => {
    if (props.active === 'regulate') return '下发遥调';
    else if (props.active === 'control') return '下发遥控';
});

const monitor = (records: any) => {
    const { pointID, ctlvalue, name } = records;
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
        unit: "",
    };
    historyTableData.value = [];
    const params = {
        "type": "analog",
        "ids": [oid],
        "start_time": moment(historyDate.value).startOf('day'),
        "end_time": moment(historyDate.value).startOf('day').add(1, 'day'),
        "interval": 3600
    };
    switch (oid.split("-")[2]) {
        case '101':
            params.type = "digital";
            break;
        case '102':
            params.type = "analog";
            break;
        case '105':
            params.type = "pulse";
            break;
    }
    dashboardServiceApi.getHistory(params).then((res) => {
        if (res.state) {
            historyChartData.value.xAxis = res.data.data.map((n, i) => {
                return moment(n.time).format("HH:mm")
            });
            historyChartData.value.data.push({
                name: selectNode.value.name,
                type: "line",
                data: res.data.data.map((n) => { return n.data[oid] }),
            })
            historyChartData.value.unit = selectNode.value.unit
            historyChartData.value = JSON.parse(JSON.stringify(historyChartData.value))
            res.data.data.forEach((n, i) => {
                let json = {
                    time: moment(n.time).format("HH:mm")
                }
                json[selectNode.value.name] = n.data[oid]
                historyTableData.value.push(json)
            })

        }
    })
}

const handleCurrentChange = (val: number) => {
    pages.currentPage = val;
    emit('page-change', { currentPage: val, pageSize: pages.pageSize });
};
const handleSizeChange = (val: number) => {
    pages.pageSize = val;
    emit('page-change', { currentPage: pages.currentPage, pageSize: val });
};
const initPage = (pageInfo?: { currentPage?: number; pageSize?: number }) => {
    pages.currentPage = pageInfo?.currentPage ?? 1;
    pages.pageSize = pageInfo?.pageSize ?? 10;
};
const cancel = () => {
    visible.value = false;
    formData.value = {};
};
const submit = async () => {
    const { did, rid } = props;
    const { checkpwd, pid, value } = formData.value;
    const data = { value, checkpwd };
    let res: any;
    if (props.active === 'regulate') res = await monitorRegulate(rid, did, pid!, data);
    else if (props.active === 'control') res = await monitorControl(rid, did, pid!, data);
    if (res.state) {
        CvMessage.success('操作成功');
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
