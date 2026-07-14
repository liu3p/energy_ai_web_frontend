<template>
    <cv-drawer v-model="visible" :title="title" size="75%" @close="cancel" destroy-on-close>
        <cv-form :model="filters" class="transfer-form" inline style="margin-top: -16px">
            <cv-form-item label="设备：">
                <cv-select-tree
                    v-model="devcode"
                    :data="deviceOption"
                    :props="{
                        label: 'name',
                        value: 'id',
                        children: 'device',
                    }"
                    @change="handleDeviceChange"
                    style="width: 180px"
                    only-child
                    default-expand-all
                ></cv-select-tree>
            </cv-form-item>
            <cv-form-item label="OID：">
                <cv-input v-model="filters.id" placeholder="请输入" allow-clear style="width: 180px" />
            </cv-form-item>
            <cv-form-item label="原始名：">
                <cv-input v-model="filters.name" placeholder="请输入" allow-clear style="width: 180px" />
            </cv-form-item>
            <cv-form-item>
                <span>MQTT_ID值不为空：</span>
                <cv-switch v-model="filters.MqttKey" />
            </cv-form-item>
        </cv-form>
        <Transfer
            :target-keys="targetKeys"
            :data-source="allTableData"
            locale
            :select-all-labels="selectAllLabels"
            @change="handleChange"
            :rowKey="record => record.id"
            style="background: #fff"
        >
            <template #children="{direction, filteredItems, selectedKeys, onItemSelectAll, onItemSelect}">
                <reply-point-transfer-table
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
import ReplyPointTransferTable from '@/modules/main/capture/point/transfer/reply-point-transfer-table.vue';
import {Transfer, Table} from 'ant-design-vue';
import type {SelectAllLabel} from 'ant-design-vue/es/transfer';
import {useLocale} from 'cloudview.ui-next';
import _ from 'lodash';
import {pointType} from '@/modules/main/capture/point/point.model';
import {queryTransPoints} from '@/modules/main/capture/point/point.service';

const {t} = useLocale();
const props = defineProps<{
    type: string;
    deviceOption: any;
}>();
const emit = defineEmits(['submit']);

const tableData = ref<any>([]);
const targetKeys = ref<string[]>([]);
const targetInfo = ref([]);
const queryInfo = ref({});
const allTableData = computed(() => {
    const existingIds = new Set(filterTableData.value.map((item: {id: string}) => item.id));
    const extraItems = targetInfo.value.filter((item: any) => !existingIds.has(item.id));
    return [...filterTableData.value, ...extraItems];
});
const selectAllLabels: SelectAllLabel[] = [
    ({selectedCount, totalCount}) => `${selectedCount}/${totalCount}`,
    ({selectedCount, totalCount}) => `${selectedCount}/${totalCount}`,
];
const devcode = ref();
const filters = reactive({
    id: '',
    name: '',
    MqttKey: false,
    trans: '1',
});
const visible = ref(false);
const title = computed(() => {
    const text = pointType.find(point => point.name === props.type)?.label;
    return `添加${text}`;
});

const filterTableData = computed(() => {
    return tableData.value.filter((item: any) => {
        return Object.values(filters).every((key, index) => {
            if (Object.keys(filters)[index] === 'MqttKey') {
                return key ? item[Object.keys(filters)[index]] : true;
            }
            return item[Object.keys(filters)[index]]?.includes(key) ?? true;
        });
    });
});

const cancel = () => {
    visible.value = false;
    filters.id = '';
    filters.name = '';
    filters.MqttKey = false;
    devcode.value = null;
    tableData.value = [];
    targetKeys.value = [];
    targetInfo.value = [];
};
const handleChange = (nextTargetKeys: string[], direction: string, moveKeys: string[]) => {
    if (direction === 'right') {
        targetKeys.value = [...targetKeys.value, ...moveKeys];
    } else if (direction === 'left') {
        targetKeys.value = targetKeys.value.filter(key => !moveKeys.includes(key));
    }
    targetInfo.value = allTableData.value.filter(item => targetKeys.value.includes(item.id));
};
const open = (data?: any) => {
    const {type, source_device: source_dev_id, id: dev_id, memofrtu: rtu_id} = data || {};
    const node = findTreeNodeById(props.deviceOption, source_dev_id, 'device');
    const source_rtu_id = node?.memofrtu;
    queryInfo.value = {
        source_rtu_id,
        source_dev_id,
        rtu_id,
        dev_id,
        data_type: type,
    };
    visible.value = true;
    if (source_rtu_id) {
        devcode.value = source_dev_id;
        getTableData();
    }
};
const getTableData = async () => {
    const res = await queryTransPoints(queryInfo.value);
    if (res?.state) {
        tableData.value = res.data[queryInfo.value.data_type];
    } else {
        CvMessage.error(res.data.msg || '查询失败');
    }
};
const submit = () => {
    emit('submit', targetInfo.value);
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
    const node = findTreeNodeById(props.deviceOption, id, 'device');
    queryInfo.value = {
        ...queryInfo.value,
        source_dev_id: id,
        source_rtu_id: node?.memofrtu,
    };
    getTableData();
};
defineExpose({
    open,
    cancel,
});
</script>
<style scoped lang="scss">
:deep(.ant-transfer-list-header ) {
    .ant-checkbox-wrapper {
        margin-left: 4px;
        margin-right: 8px;
    }
    .ant-transfer-list-header-dropdown {
        display: none;
    }
}
</style>
