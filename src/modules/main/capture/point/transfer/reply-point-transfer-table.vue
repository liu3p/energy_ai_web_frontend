<template>
    <Table :row-selection="getRowSelection({
        selectedKeys,
        onItemSelectAll,
        onItemSelect,
    })" :columns="columns" :data-source="filteredItems" size="small" :custom-row="({ key }) => ({
        onClick: () => onItemSelect(key, !selectedKeys.includes(key)),
    })
        " bordered :pagination="{showTotal: total => `共 ${total} 条`}" />
</template>
<script setup lang="ts">
import {Table} from 'ant-design-vue';

defineProps({
    direction: {
        type: String,
        required: true,
    },
    filteredItems: {
        type: Array,
        required: true,
    },
    selectedKeys: {
        type: Array,
        required: true,
    },
    onItemSelectAll: {
        type: Function,
        required: true,
    },
    onItemSelect: {
        type: Function,
        required: true,
    },

});

const columns = [
    {
        dataIndex: 'id',
        title: 'OID',
        width: 150,
    },
    {
        dataIndex: 'name',
        title: '原始名',
        width: 150,
    },
    {
        dataIndex: 'mqttkey',
        title: 'MqttKey',
        width: 150,
    },
];
const getRowSelection = ({
                             disabled,
                             selectedKeys,
                             onItemSelectAll,
                             onItemSelect,
                         }: Record<string, any>) => {
    return {
        onSelectAll(selected: boolean, selectedRows: Record<string, string | boolean>[]) {
            const treeSelectedKeys = selectedRows.filter(item => !item.disabled).map(({key}) => key);
            onItemSelectAll(treeSelectedKeys, selected);
        },
        onSelect({key}: Record<string, string>, selected: boolean) {
            onItemSelect(key, selected);
        },
        selectedRowKeys: selectedKeys,
    };
};
</script>
<style lang="scss">
.transfer-form {
    margin-bottom: 12px;

    .el-form-item {
        margin: 12px 8px;
    }
}
</style>