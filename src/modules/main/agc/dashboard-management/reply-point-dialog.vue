<template>
    <cv-dialog-form
        v-model="visible"
        width="1000"
        inline
        :title="t('fw.strategyManagement.configParams')"
        :draggable="true"
        :z-index="2000"
        :form-model="formData"
        @close="cancel"
    >
        <div style="padding: 0 56px">
            <el-tabs v-model="activeName" class="demo-tabs">
                <el-tab-pane :label="t('fw.monitor.pointType.analog')" name="analog"></el-tab-pane>
                <el-tab-pane :label="t('fw.monitor.pointType.digital')" name="digital"></el-tab-pane>
                <el-tab-pane :label="t('fw.monitor.pointType.pulse')" name="pulse"></el-tab-pane>
                <el-tab-pane :label="t('fw.monitor.pointType.control')" name="control"></el-tab-pane>
                <el-tab-pane :label="t('fw.monitor.pointType.regulate')" name="regulate"></el-tab-pane>
            </el-tabs>
            <cv-form-item label="RTU" prop="type">
                <el-select
                    v-model="rtuId"
                    placeholder="Select"
                    teleported
                    @change="handleRtuChange"
                    style="width: 240px; z-index: 9999 !important"
                >
                    <el-option v-for="item in treeOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </cv-form-item>
            <cv-form-item :label="t('fw.dashboardManagement.device')" prop="type">
                <el-select
                    v-model="deviceId"
                    placeholder="Select"
                    teleported
                    style="width: 240px; z-index: 9999 !important"
                >
                    <el-option v-for="item in deviceList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </cv-form-item>
            <cv-form-item prop="type">
                <el-button type="primary" @click="getTableData">{{ t('fw.common.search') }}</el-button>
            </cv-form-item>
            <Table
                :columns="columns"
                :data-source="tableData"
                size="small"
                bordered
                :pagination="{
                    showTotal: (total: number) =>
                        t('fw.dashboardManagement.totalCount').replace('{total}', String(total)),
                }"
            >
                <template #action="{record}">
                    <a @click="selectPoint(record)">{{ t('fw.common.sure') }}</a>
                </template>
            </Table>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="cancel">{{ t('fw.monitor.close') }}</el-button>
            </div>
        </template>
    </cv-dialog-form>
</template>

<script lang="ts" setup>
import {Table} from 'ant-design-vue';
import {CvMessage, useLocale} from 'cloudview.ui-next';
import {computed, ref} from 'vue';
import dashboardManagementServiceApi from '@/modules/main/agc/dashboard-management/dashboard-management.service';
import {queryRtuListExceptPoints} from '@/modules/main/capture/point/point.service';

const {t} = useLocale();
const emit = defineEmits(['refresh', 'selectPoint']);
const activeName = ref('analog');
const treeOptions = ref<any[]>([]);
const deviceList = ref<any[]>([]);
const rtuId = ref();
const deviceId = ref();
const tableData = ref<any>([]);
const dataNo = ref();

const columns = computed(() => [
    {
        dataIndex: 'id',
        title: 'OID',
    },
    {
        title: t('fw.monitor.paramName'),
        dataIndex: 'name',
    },
    {
        title: t('fw.common.operation'),
        key: 'operation',
        slots: {customRender: 'action'},
    },
]);

const selectPoint = (selectInfo: Object) => {
    emit('selectPoint', selectInfo, dataNo.value);
    CvMessage.success(t('fw.common.operateSuccess'));
    cancel();
};

const visible = ref(false);

const formData = ref({
    type: '',
    name: '',
});

const open = (no?: number) => {
    dataNo.value = no;
    visible.value = true;
    void initRtuList();
};

const getTableData = async () => {
    const res = await dashboardManagementServiceApi.getPoints(rtuId.value, deviceId.value, activeName.value);
    if (res?.state) {
        tableData.value = res.data[activeName.value];
    } else {
        CvMessage.error(res.data.msg || t('fw.dashboardManagement.queryFailed'));
    }
};

/** RTU/设备 ID 编号空间重叠，只能在顶层 RTU 列表匹配，不能递归进 device */
const handleRtuChange = (id: string | number) => {
    const rtu = (treeOptions.value ?? []).find(item => String(item.id) === String(id));
    deviceId.value = null;
    deviceList.value = rtu?.device ?? [];
};

const cancel = () => {
    visible.value = false;
    deviceId.value = null;
    deviceList.value = [];
    tableData.value = [];
};

const initRtuList = () => {
    return queryRtuListExceptPoints().then(res => {
        if (res.state) {
            treeOptions.value = res.data.map(rtu => ({
                ...rtu,
                key: rtu.name + rtu.id,
                device: rtu.device?.map(dev => ({
                    ...dev,
                    key: dev.name + dev.id,
                })),
            }));
            if (rtuId.value != null && rtuId.value !== '') {
                handleRtuChange(rtuId.value);
            }
        }
    });
};

defineExpose({
    open,
    cancel,
});
</script>

<style lang="scss" scoped>
.el-checkbox {
    border: 1px solid #d8dbe1;
    padding: 20px 48px;
    border-radius: 4px;
    margin-bottom: 12px;
}
</style>
