<template>
    <div class="container">
        <div class="side-btn__wrapper">
            <el-button size="large" :type="modelType == 'basic_info' ? 'primary' : ''"
                @click="btnClick('basic_info')">电站基本属性配置</el-button>
            <el-button size="large" :type="modelType == 'realtime' ? 'primary' : ''"
                @click="btnClick('realtime')">实时数据配置</el-button>
            <el-button size="large" :type="modelType == 'topology' ? 'primary' : ''"
                @click="btnClick('topology')">拓扑图配置</el-button>
            <el-button size="large" :type="modelType == 'power_level' ? 'primary' : ''"
                @click="btnClick('power_level')">充放电配置</el-button>
        </div>
        <div class="main-contain">
            <div class="main-contain__header">
                <span>{{ modelName }}</span>
                <cv-button v-if="modelType != 'topology'" type="primary" @click="modelManageRef.open()">
                    <span>＋ 添加属性</span>
                </cv-button>
                <cv-button v-else type="primary" @click="saveConfig(configData.topology)">
                    <span>保存</span>
                </cv-button>
            </div>
            <div class="main-contain__center">
                <div class="static-parameter-table">
                    <cv-table v-if="modelType != 'topology'" :data="configData[modelType]" class="table-container"
                        row-key="id">
                        <cv-table-column prop="show_name" label="展示名称" />
                        <cv-table-column prop="oid" label="选择点位" />
                        <cv-table-column prop="type" label="数据类型">
                            <template #default="{ row }">
                                {{ typeName[row.type] }}
                            </template>
                        </cv-table-column>
                        <cv-table-column prop="table" label="展示值">
                            <template #default="{ row }">
                                <div v-if="row.type == 3">{{ row.show_value }}</div>
                                <div v-else-if="row.table">
                                    <div v-for="item, index in Object.keys(row.table)"
                                        :style="`color:${row.table[item].split('_')[1] || '#000'}`">
                                        {{ item }}：{{ row.table[item].split("_")[0] || '#000' }}
                                    </div>
                                </div>
                            </template>
                        </cv-table-column>
                        <cv-table-column prop="show_unit" label="单位" />
                        <cv-table-column label="操作" width="180">
                            <template #default="scope">
                                <cv-button text type="danger" @click="delect(scope.row)">删除
                                </cv-button>
                                <cv-button text type="primary" @click="modelManageRef.open(scope.row)">编辑
                                </cv-button>
                                <cv-button text type="primary" v-if="scope.row.no != 1" @click="move(scope.row, 1)">
                                    上移
                                </cv-button>
                                <cv-button text type="primary" v-if="scope.row.no != configData[modelType].length"
                                    @click="move(scope.row, 0)">
                                    下移
                                </cv-button>
                            </template>
                        </cv-table-column>
                    </cv-table>
                    <el-card v-else style="margin-top: 10px;" v-for="item in configData[modelType]">
                        <el-checkbox v-model="item.used" :true-value='1' :false-value='0'>
                            {{ item.show_name }}
                        </el-checkbox>
                        <div class="select-point">
                            功率：
                            <cv-input style="width:200px;" v-model="item.oid" @click="replyPointRef.open(item.no)"
                                placeholder="请选择" />
                        </div>
                    </el-card>
                </div>
            </div>
        </div>
        <dashboard-management-dialog ref="modelManageRef" @submit="submit"></dashboard-management-dialog>
        <reply-point-dialog ref="replyPointRef" @selectPoint="selectPoint"></reply-point-dialog>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import dashboardManagementServiceApi from '@/modules/main/agc/dashboard-management/dashboard-management.service';
import dashboardManagementDialog from '@/modules/main/agc/dashboard-management/dashboard-management.dialog.vue';
import ReplyPointDialog from '@/modules/main/agc/dashboard-management/reply-point-dialog.vue'
import { CvMessageBox, CvMessage, useLocale } from 'cloudview.ui-next';
import _ from 'lodash';
const configData = ref<any>({});
const replyPointRef = ref();
const modelType = ref();
const modelName = ref();
const typeName = ref<any>({
    1: '实时值',
    2: '枚举值',
    3: '固定值',
});
const modelManageRef = ref();

const btnClick = (type: string) => {
    modelType.value = type;
    switch (type) {
        case 'basic_info':
            modelName.value = '电站基本属性配置'
            break;
        case 'realtime':
            modelName.value = '实时数据配置'
            break;
        case 'topology':
            modelName.value = '拓扑图配置'
            break;
        case 'power_level':
            modelName.value = '充放电配置'
            break;
    }

};
const initData = () => {
    dashboardManagementServiceApi.getConfig().then(res => {
        if (res.state) {
            configData.value = res.data.data
        }
    });
};

interface EnumItem {
    key: number,
    number: string,
    color: string,
    value: string
}

const delect = (row: any) => {
    let data: any = [...configData.value[modelType.value]]
    CvMessageBox.confirm('确认删除该项配置？', '确认删除', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            data.splice(row.no - 1, 1)
            saveConfig(data);
        })
        .catch(() => { });
}

const move = async (row: any, type: number) => {
    let dataList: any = [...configData.value[modelType.value]]
    let index = row.no - 1
    const temp = dataList[index];
    if (type == 1) {
        dataList.splice(index, 1);
        dataList.splice(index - 1, 0, temp);
    } else {
        dataList.splice(index, 1);
        dataList.splice(index + 1, 0, temp);
    }
    saveConfig(dataList);
}

const submit = (poinInfo: {
    no: number,
    type: string,
    show_name: string,
    oid: string,
    show_unit: string,
    show_value: string,
    enumList: EnumItem[]
}, submitType: string) => {
    const { no, show_name, type, oid, show_value, show_unit, enumList } = poinInfo
    let table: Record<string, string> = {};
    enumList.forEach((item, index) => {
        if (item.number != '' && item.value != '') {
            table[item.number] = item.value + "_" + item.color;
        }
    })
    let data = {
        "no": no,
        "type": type,
        "oid": oid,
        "show_value": show_value,
        "show_name": show_name,
        "show_unit": show_unit,
        "table": JSON.stringify(table) === '{}' ? null : table
    };
    if (submitType == 'edit') {
        let index = poinInfo.no - 1
        configData.value[modelType.value].splice(index, 1);
        configData.value[modelType.value].splice(index, 0, data);
        saveConfig(configData.value[modelType.value])
    } else {
        saveConfig([...configData.value[modelType.value], data])
    }
}

const saveConfig = async (data: any) => {
    let saveData = data.map((item: any, index: number) => {
        return {
            ...item,
            no: index + 1
        }
    })
    let res: any;
    switch (modelType.value) {
        case 'basic_info':
            res = await dashboardManagementServiceApi.editBasicInfoConfig(saveData);
            break;
        case 'realtime':
            res = await dashboardManagementServiceApi.editRealtimeConfig(saveData);
            break;
        case 'power_level':
            res = await dashboardManagementServiceApi.editPowerLevelConfig(saveData);
            break;
        case 'topology':
            res = await dashboardManagementServiceApi.editTopologyConfig(saveData);
            break;
    }
    if (res.state) {
        CvMessage.success('操作成功');
        initData();
    } else CvMessage.error(res.data.msg);
}

const selectPoint = (info: any, no: number) => {
    let item = configData.value.topology.find((item: any) => {
        return item.no == no
    })
    item.oid = info.id
}
onMounted(() => {
    btnClick('basic_info');
    initData();
});


</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
    display: flex;
    border-radius: 8px;
    background: #fff;
}

.side-btn__wrapper {
    border-right: solid 2px #E9EDF4;
    width: 15%;
    display: flex;
    flex-direction: column;
    height: 100%;

    .el-button {
        margin: 15px 15px 0 15px;
    }
}

.main-contain__header {
    height: 48px;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EBEBEB;
}

.main-contain__center {
    height: calc(100% - 48px);
    overflow: auto;
}

.main-contain {
    height: 100%;
    display: flex;
    flex-direction: column;
    width: 85%;
    overflow: hidden;

    .header {
        padding: 16px;
        font-weight: bold;
    }
}

.static-parameter-table {
    padding: 16px;
}

.select-point {
    float: right;
    display: flex;
    align-items: center;
}
</style>