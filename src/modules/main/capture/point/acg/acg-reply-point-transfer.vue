<template>
    <cv-drawer v-model="visible" :title="title" size="75%" @close="cancel" destroy-on-close>
        <cv-form :model="filters" class="transfer-form" inline style="margin-top: -16px">
            <cv-form-item label="筛选方式：">
                <cv-select v-model="filters.filterType" style="width: 180px" @change="handleFilterTypeChange">
                    <cv-option label="agc策略" :value="1" />
                    <cv-option label="agc模型" :value="2" />
                </cv-select>
            </cv-form-item>
            <cv-form-item label="agc策略：" v-if="filters.filterType === 1">
                <cv-select
                    v-model="agcDevCode"
                    style="width: 180px"
                    @change="handleAgcDeviceChange"
                    @clear="handleAgcDeviceChange"
                    clearable
                >
                    <cv-option
                        v-for="item in agcStrategyOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </cv-select>
            </cv-form-item>
            <cv-form-item label="agc模型：" v-if="filters.filterType === 2">
                <cv-select-tree
                    v-model="agcDevCode"
                    :data="agcDeviceOptions"
                    @change="handleAgcDeviceChange"
                    @clear="handleAgcDeviceChange"
                    style="width: 180px"
                    clearable
                    default-expand-all
                ></cv-select-tree>
            </cv-form-item>
            <cv-form-item label="参数类型：">
                <cv-select v-model="filters.paraType" style="width: 180px" @change="handleAgcDeviceChange" clearable>
                    <cv-option
                        v-for="item in paraTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </cv-select>
            </cv-form-item>
            <cv-form-item label="数据类型：">
                <cv-select v-model="filters.dataType" style="width: 180px" @change="handleAgcDeviceChange">
                    <cv-option
                        v-for="item in dataTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </cv-select>
            </cv-form-item>
        </cv-form>
        <Transfer
            :target-keys="targetKeys"
            :data-source="allAgcData"
            locale
            :select-all-labels="selectAllLabels"
            @change="handleChange"
            :rowKey="record => record.path"
            style="background: #fff"
        >
            <template #children="{direction, filteredItems, selectedKeys, onItemSelectAll, onItemSelect}">
                <acg-reply-point-transfer-table
                    v-bind="{
                        direction,
                        filteredItems,
                        selectedKeys,
                        onItemSelectAll,
                        onItemSelect,
                    }"
                />
            </template>
        </Transfer>
        <template #footer>
            <cv-button @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
            <cv-button type="primary" @click="submit">{{ t('fw.common.sure') }}</cv-button>
        </template>
    </cv-drawer>
</template>
<script lang="ts" setup>
import {ref, reactive, watch, computed} from 'vue';
import AcgReplyPointTransferTable from '@/modules/main/capture/point/acg/acg-reply-point-transfer-table.vue';
import {Transfer, Table} from 'ant-design-vue';
import type {SelectAllLabel} from 'ant-design-vue/es/transfer';
import {useLocale} from 'cloudview.ui-next';
import _ from 'lodash';
import {pointType} from '@/modules/main/capture/point/point.model';
import {queryRtuList, queryAgcRtuPoints, queryAgcModelTree} from '@/modules/main/capture/point/point.service';
import StrategicManagementService from '@/modules/main/agc/strategy/strategic-management.service';
const {t} = useLocale();
const props = defineProps<{
    type: string;
}>();
const emit = defineEmits(['submit']);

const tableData = ref<any>([]);
const agcTableData = ref<any>([]); //agc参数列表
const deviceOptions = ref<any>([]);
const agcStrategyOptions = ref<any>([]); // agc策略列表
const agcDeviceOptions = ref<any>([]); //agc模型列表
const targetKeys = ref<string[]>([]);
const targetInfo = ref([]);
const allAgcData = computed(() => {
    const existingPaths = new Set(agcTableData.value.map((item: {path: string}) => item.path));
    const extraItems = targetInfo.value.filter((item: any) => !existingPaths.has(item.path));
    return [...agcTableData.value, ...extraItems];
});
const selectAllLabels: SelectAllLabel[] = [
    ({selectedCount, totalCount}) => `${selectedCount}/${totalCount}`,
    ({selectedCount, totalCount}) => `${selectedCount}/${totalCount}`,
];

//参数类型
const paraTypeOptions = computed(() => {
    return filters.filterType === 1
        ? [
              {
                  label: '静态参数',
                  value: 'para',
              },
              {
                  label: '计算参数',
                  value: 'calc_para',
              },
          ]
        : [
              {
                  label: '静态参数',
                  value: 'para',
              },
              {
                  label: '动态参数',
                  value: 'dyn_para',
              },
          ];
});
//数据类型
const dataTypeOptions = ref<any>([
    {
        label: 'ANALOG',
        value: 'ANALOG',
    },
    {
        label: 'DIGITAL',
        value: 'DIGITAL',
    },
    {
        label: 'PULSE',
        value: 'PULSE',
    },
    {
        label: 'CONTROL',
        value: 'CONTROL',
    },
    {
        label: 'REGULATE',
        value: 'REGULATE',
    },
    {
        label: 'ATTRIBUTE',
        value: 'ATTRIBUTE',
    },
]);
//设备名称
const devcode = ref();
//agc设备名称
const agcDevCode = ref();
//筛选参数
const filters = reactive({
    paraType: '', //参数类型
    dataType: '', //数据类型
    name: '',
    MqttKey: false,
    trans: '1',
    filterType: 1, //筛选方式：1 agc策略，2 agc模型
});
const visible = ref(false);
const title = computed(() => {
    const text = pointType.find(point => point.name === props.type)?.label;
    return `添加${text}`;
});

const cancel = () => {
    visible.value = false;
    filters.filterType = 1;
    filters.paraType = '';
    filters.dataType = '';
    filters.name = '';
    filters.MqttKey = false;
    devcode.value = null;
    tableData.value = [];
    targetKeys.value = [];
    targetInfo.value = [];
    agcDevCode.value = null;
};
const handleChange = (nextTargetKeys: string[], direction: string, moveKeys: string[]) => {
    // console.log(nextTargetKeys, direction, moveKeys);
    if (direction === 'right') {
        targetKeys.value = [...targetKeys.value, ...moveKeys];
    } else if (direction === 'left') {
        targetKeys.value = targetKeys.value.filter(key => !moveKeys.includes(key));
    }
    targetInfo.value = allAgcData.value.filter(item => targetKeys.value.includes(item.path));
};
const open = (data?: any) => {
    targetKeys.value = [];
    filters.dataType = props.type.toUpperCase();

    //获取agc模型树状结构(仅名称)
    queryAgcModelTree().then(res => {
        if (res.state) {
            visible.value = true;
            agcDeviceOptions.value = parseAgcModelTree(res.data);
        }
    });

    //获取agc策略列表
    StrategicManagementService.getStrategys().then(res => {
        if (res.state) {
            agcStrategyOptions.value = res.data.map(item => ({
                label: item.name,
                value: item.name,
            }));
        }
    });

    //获取表格数据
    const agcData = {
        name: 'all',
        paraType: 'all',
        dataType: props.type.toUpperCase(),
        selectType: filters.filterType === 1 ? 'strategy' : 'model',
    };
    queryAgcRtuPoints(agcData).then(res => {
        if (res.state) {
            agcTableData.value =
                res.data?.map(item => ({
                    ...item,
                    trans: '1',
                })) || [];
        }
    });
};

//解析agc模型树，转换为树形结构格式
const parseAgcModelTree = (treeData: any): any[] => {
    let idCounter = 1;

    const traverse = (node: any): any => {
        const children: any[] = [];

        //处理子设备 sub_devices
        if (node.sub_devices && Array.isArray(node.sub_devices)) {
            node.sub_devices?.forEach((subDevice: any) => {
                const child = traverse(subDevice);
                if (child) {
                    children.push(child);
                }
            });
        }

        //处理子设备 subDevice
        if (node.subDevice && typeof node.subDevice === 'object') {
            const child = traverse(node.subDevice);
            if (child) {
                children.push(child);
            }
        }

        return {
            label: node.name || 'Unnamed',
            id: node.name,
            children: children.length > 0 ? children : undefined,
        };
    };

    if (Array.isArray(treeData)) {
        return treeData.map(node => traverse(node));
    }
    return [traverse(treeData)];
};
const submit = () => {
    // const res = tableData.value.filter((item: {id: string}) => {
    //     return targetKeys.value.includes(item.id);
    // });
    emit('submit', targetInfo.value, filters.dataType);
    cancel();
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

const handleDeviceChange = (id: string) => {
    const type = props.type;
    const node = findTreeNodeById(deviceOptions.value, id, 'device');
    if (node.hasOwnProperty('device')) {
        tableData.value = node.device?.reduce((prev, dev) => [...prev, ...(dev[type] ?? [])], []) ?? [];
    } else {
        tableData.value = node[type] ?? [];
    }
};

//处理agc设备选择变化
const handleAgcDeviceChange = () => {
    //获取表格数据
    const agcData = {
        name: agcDevCode.value,
        paraType: filters.paraType,
        dataType: filters.dataType,
        selectType: filters.filterType === 1 ? 'strategy' : 'model',
    };

    for (const key in agcData) {
        if (agcData['name'] == '' || agcData['name'] == null) {
            agcData['name'] = 'all';
        }
        if (agcData['paraType'] == '' || agcData['paraType'] == null) {
            agcData['paraType'] = 'all';
        }
        if (agcData['dataType'] == '' || agcData['dataType'] == null) {
            agcData['dataType'] = props.type.toUpperCase();
        }
    }
    queryAgcRtuPoints(agcData).then(res => {
        if (res.state) {
            if (res.data?.length) {
                agcTableData.value = res.data;
            } else {
                agcTableData.value = [];
            }
        }
    });
};

//处理筛选方式变化
const handleFilterTypeChange = () => {
    // 1: agc策略, 2: agc模型
    filters.paraType = undefined;
    agcDevCode.value = undefined;

    if (filters.filterType === 2) {
        filters.paraType = 'para';
    }
    handleAgcDeviceChange();
};
defineExpose({
    open,
    cancel,
});
</script>

<style scoped lang="scss">
:deep(.ant-transfer-list-header ) {
    .ant-checkbox-wrapper {
        margin-right: 8px;
    }
    .ant-transfer-list-header-dropdown {
        display: none;
    }
}
</style>
