<template>
    <div class="container">
        <div class="side-btn__wrapper">
            <el-button
                size="large"
                :type="modelType == 'basic_info' ? 'primary' : ''"
                @click="btnClick('basic_info')"
            >
                {{ t('fw.dashboardManagement.basicInfoConfig') }}
            </el-button>
            <el-button
                size="large"
                :type="modelType == 'realtime' ? 'primary' : ''"
                @click="btnClick('realtime')"
            >
                {{ t('fw.dashboardManagement.realtimeConfig') }}
            </el-button>
            <el-button
                size="large"
                :type="modelType == 'topology' ? 'primary' : ''"
                @click="btnClick('topology')"
            >
                {{ t('fw.dashboardManagement.topologyConfig') }}
            </el-button>
            <el-button
                size="large"
                :type="modelType == 'power_level' ? 'primary' : ''"
                @click="btnClick('power_level')"
            >
                {{ t('fw.dashboardManagement.powerLevelConfig') }}
            </el-button>
        </div>
        <div class="main-contain">
            <div class="main-contain__header">
                <span>{{ modelName }}</span>
                <cv-button v-if="modelType != 'topology'" type="primary" @click="modelManageRef.open()">
                    <span>{{ t('fw.dashboardManagement.addAttribute') }}</span>
                </cv-button>
                <cv-button v-else type="primary" @click="saveConfig(configData.topology)">
                    <span>{{ t('fw.capturePoint.save') }}</span>
                </cv-button>
            </div>
            <div class="main-contain__center">
                <div class="static-parameter-table">
                    <cv-table
                        v-if="modelType != 'topology'"
                        :data="configData[modelType]"
                        class="table-container"
                        row-key="id"
                    >
                        <cv-table-column prop="show_name" :label="t('fw.dashboardManagement.showName')" />
                        <cv-table-column prop="oid" :label="t('fw.dashboardManagement.selectPoint')" />
                        <cv-table-column prop="type" :label="t('fw.dashboardManagement.dataType')">
                            <template #default="{row}">
                                {{ typeName[row.type] }}
                            </template>
                        </cv-table-column>
                        <cv-table-column prop="table" :label="t('fw.dashboardManagement.showValue')">
                            <template #default="{row}">
                                <div v-if="row.type == 3">{{ row.show_value }}</div>
                                <div v-else-if="row.table">
                                    <div
                                        v-for="item in Object.keys(row.table)"
                                        :key="item"
                                        :style="`color:${row.table[item].split('_')[1] || '#000'}`"
                                    >
                                        {{ item }}：{{ row.table[item].split('_')[0] || '#000' }}
                                    </div>
                                </div>
                            </template>
                        </cv-table-column>
                        <cv-table-column prop="show_unit" :label="t('fw.dashboardManagement.unit')" />
                        <cv-table-column
                            :label="t('fw.common.operation')"
                            width="340"
                            min-width="340"
                            align="left"
                            header-align="center"
                        >
                            <template #default="scope">
                                <div class="table-actions">
                                    <cv-button text type="danger" @click="delect(scope.row)">
                                        {{ t('fw.common.delete') }}
                                    </cv-button>
                                    <cv-button text type="primary" @click="modelManageRef.open(scope.row)">
                                        {{ t('fw.common.edit') }}
                                    </cv-button>
                                    <cv-button
                                        text
                                        type="primary"
                                        v-if="scope.row.no != 1"
                                        @click="move(scope.row, 1)"
                                    >
                                        {{ t('fw.dashboardManagement.moveUp') }}
                                    </cv-button>
                                    <cv-button
                                        text
                                        type="primary"
                                        v-if="scope.row.no != configData[modelType].length"
                                        @click="move(scope.row, 0)"
                                    >
                                        {{ t('fw.dashboardManagement.moveDown') }}
                                    </cv-button>
                                </div>
                            </template>
                        </cv-table-column>
                    </cv-table>
                    <el-card v-else style="margin-top: 10px" v-for="item in configData[modelType]" :key="item.no">
                        <el-checkbox v-model="item.used" :true-value="1" :false-value="0">
                            {{ item.show_name }}
                        </el-checkbox>
                        <div class="select-point">
                            {{ t('fw.dashboardManagement.power') + t('fw.common.colon') }}
                            <cv-input
                                style="width: 200px"
                                v-model="item.oid"
                                @click="replyPointRef.open(item.no)"
                                :placeholder="t('fw.common.pleaseSelect')"
                            />
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
import {computed, onMounted, ref} from 'vue';
import dashboardManagementServiceApi from '@/modules/main/agc/dashboard-management/dashboard-management.service';
import dashboardManagementDialog from '@/modules/main/agc/dashboard-management/dashboard-management.dialog.vue';
import ReplyPointDialog from '@/modules/main/agc/dashboard-management/reply-point-dialog.vue';
import {CvMessageBox, CvMessage, useLocale} from 'cloudview.ui-next';

const {t} = useLocale();
const configData = ref<any>({});
const replyPointRef = ref();
const modelType = ref();
const modelName = ref();
const typeName = computed<Record<number, string>>(() => ({
    1: t('fw.dashboardManagement.realtimeValue'),
    2: t('fw.dashboardManagement.enumValue'),
    3: t('fw.dashboardManagement.fixedValue'),
}));
const modelManageRef = ref();

const btnClick = (type: string) => {
    modelType.value = type;
    switch (type) {
        case 'basic_info':
            modelName.value = t('fw.dashboardManagement.basicInfoConfig');
            break;
        case 'realtime':
            modelName.value = t('fw.dashboardManagement.realtimeConfig');
            break;
        case 'topology':
            modelName.value = t('fw.dashboardManagement.topologyConfig');
            break;
        case 'power_level':
            modelName.value = t('fw.dashboardManagement.powerLevelConfig');
            break;
    }
};
const initData = () => {
    dashboardManagementServiceApi.getConfig().then(res => {
        if (res.state) {
            configData.value = res.data.data;
        }
    });
};

interface EnumItem {
    key: number;
    number: string;
    color: string;
    value: string;
}

const delect = (row: any) => {
    const data: any = [...configData.value[modelType.value]];
    CvMessageBox.confirm(
        t('fw.dashboardManagement.confirmDeleteConfig'),
        t('fw.dashboardManagement.confirmDelete'),
        {
            confirmButtonText: t('fw.common.confirm'),
            cancelButtonText: t('fw.common.cancel'),
            type: 'warning',
        },
    )
        .then(async () => {
            data.splice(row.no - 1, 1);
            saveConfig(data);
        })
        .catch(() => {});
};

const move = async (row: any, type: number) => {
    const dataList: any = [...configData.value[modelType.value]];
    const index = row.no - 1;
    const temp = dataList[index];
    if (type == 1) {
        dataList.splice(index, 1);
        dataList.splice(index - 1, 0, temp);
    } else {
        dataList.splice(index, 1);
        dataList.splice(index + 1, 0, temp);
    }
    saveConfig(dataList);
};

const submit = (
    poinInfo: {
        no: number;
        type: string;
        show_name: string;
        oid: string;
        show_unit: string;
        show_value: string;
        enumList: EnumItem[];
    },
    submitType: string,
) => {
    const {no, show_name, type, oid, show_value, show_unit, enumList} = poinInfo;
    const table: Record<string, string> = {};
    enumList.forEach(item => {
        if (item.number != '' && item.value != '') {
            table[item.number] = item.value + '_' + item.color;
        }
    });
    const data = {
        no: no,
        type: type,
        oid: oid,
        show_value: show_value,
        show_name: show_name,
        show_unit: show_unit,
        table: JSON.stringify(table) === '{}' ? null : table,
    };
    if (submitType == 'edit') {
        const index = poinInfo.no - 1;
        configData.value[modelType.value].splice(index, 1);
        configData.value[modelType.value].splice(index, 0, data);
        saveConfig(configData.value[modelType.value]);
    } else {
        saveConfig([...configData.value[modelType.value], data]);
    }
};

const saveConfig = async (data: any) => {
    const saveData = data.map((item: any, index: number) => {
        return {
            ...item,
            no: index + 1,
        };
    });
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
        CvMessage.success(t('fw.common.operateSuccess'));
        initData();
    } else CvMessage.error(res.data.msg);
};

const selectPoint = (info: any, no: number) => {
    const item = configData.value.topology.find((item: any) => {
        return item.no == no;
    });
    item.oid = info.id;
};
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
    border-right: solid 2px #e9edf4;
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
    border-bottom: 1px solid #ebebeb;
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

.table-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: nowrap;
    white-space: nowrap;
}

.select-point {
    float: right;
    display: flex;
    align-items: center;
}
</style>
