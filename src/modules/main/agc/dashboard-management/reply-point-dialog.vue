<template>
    <cv-dialog-form v-model="visible" width="1000" inline title="配置参数" :draggable="true" z-index="2000"
        :form-model="formData" @close="cancel">
        <div style="padding: 0 56px">
            <el-tabs v-model="activeName" class="demo-tabs">
                <el-tab-pane label="遥测" name="analog"></el-tab-pane>
                <el-tab-pane label="遥信" name="digital"></el-tab-pane>
                <el-tab-pane label="遥脉" name="pulse"></el-tab-pane>
                <el-tab-pane label="遥控" name="control"></el-tab-pane>
                <el-tab-pane label="遥调" name="regulate"></el-tab-pane>
            </el-tabs>
            <cv-form-item label="RTU" prop="type">
                <el-select v-model="rtuId" placeholder="Select" teleported @change="handleRtuChange"
                    style="width: 240px;z-index: 9999 !important;">
                    <el-option v-for="item in treeOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </cv-form-item>
            <cv-form-item label="设备" prop="type">
                <el-select v-model="deviceId" placeholder="Select" teleported
                    style="width: 240px;z-index: 9999 !important;">
                    <el-option v-for="item in deviceList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </cv-form-item>
            <cv-form-item prop="type">
                <el-button type="primary" @click="getTableData">查询</el-button>
            </cv-form-item>
            <Table :columns="columns" :data-source="tableData" size="small" bordered
                :pagination="{ showTotal: total => `共 ${total} 条` }">
                <template #action="{ record }">
                    <a @click="selectPoint(record)">确定</a>
                </template>
            </Table>
        </div>
    </cv-dialog-form>
</template>

<script lang="ts" setup>
import { Table } from 'ant-design-vue';
import { useLocale } from 'cloudview.ui-next';
import { onMounted, ref } from 'vue';
import dashboardManagementServiceApi from '@/modules/main/agc/dashboard-management/dashboard-management.service';
import { queryRtuListExceptPoints } from '@/modules/main/capture/point/point.service';

const { t } = useLocale();
const emit = defineEmits(['refresh', 'selectPoint']);
const activeName = ref('analog')
const treeOptions = ref();
const deviceList = ref([]);
const rtuId = ref();
const deviceId = ref();
const tableData = ref<any>([]);
const dataNo = ref();

const columns = [
    {
        dataIndex: 'id',
        title: 'OID',
    },
    {
        title: '参数名称',
        dataIndex: 'name',
    },
    {
        title: '原始值',
        dataIndex: 'rawvalue',
    },

    {
        title: '当前值',
        dataIndex: 'currvalue',
    },
    {
        title: '死数',
        dataIndex: 'dead',
    },
    {
        title: '品质数',
        dataIndex: 'quality',
    },
    {
        title: '刷新时间',
        dataIndex: 'sendtime'
    },
    {
        title: '操作',
        key: 'operation',
        slots: { customRender: 'action' },
    },
];

const selectPoint = (selectInfo: Object) => {
    emit('selectPoint', selectInfo, dataNo.value);
    CvMessage.success('操作成功');
    cancel();
}

const visible = ref(false);

const formData = ref({
    type: '',
    name: '',
});

const open = (no: number) => {
    dataNo.value = no;
    visible.value = true;
};


function findTreeNodeById(tree: any, targetId: any, children: string) {
    for (const node of tree) {
        if (node.id === targetId) {
            return node;
        }
        if (node[children] && node[children].length > 0) {
            const found: any = findTreeNodeById(node[children], targetId, children);
            if (found) {
                return found;
            }
        }
    }

    return null;
}

const getTableData = async () => {
    const res = await dashboardManagementServiceApi.getPoints(rtuId.value, deviceId.value, activeName.value);
    if (res?.state) {
        tableData.value = res.data[activeName.value];
    } else {
        CvMessage.error(res.data.msg || '查询失败');
    }
};

const handleRtuChange = (id: string) => {
    const node = findTreeNodeById(treeOptions.value, id, 'device');
    deviceId.value = null;
    deviceList.value = node.device;
};

const cancel = () => {
    visible.value = false;
    deviceId.value = null;
    tableData.value = [];
};

const initRtuList = () => {
    queryRtuListExceptPoints().then(res => {
        if (res.state) {
            treeOptions.value = res.data.map(rtu => ({
                ...rtu,
                key: rtu.name + rtu.id,
                device: rtu.device?.map(dev => ({
                    ...dev,
                    key: dev.name + dev.id,
                })),
            }));
        }
    });
};

onMounted(() => {
    initRtuList();
});


defineExpose({
    open,
    cancel,
});
</script>

<style lang="scss" scoped>
.w-cm {
    width: 320px;
}

.el-checkbox {
    border: 1px solid #d8dbe1;
    padding: 20px 48px;
    border-radius: 4px;
    margin-bottom: 12px;
}

.is-checked {
    border-color: var(--el-checkbox-checked-text-color);
}
</style>
