<template>
    <Table :row-selection="getRowSelection({
        selectedKeys,
        onItemSelectAll,
        onItemSelect,
    })" :columns="columns" :data-source="filteredItems" size="small" :custom-row="({ key }) => ({
        onClick: () => onItemSelect(key, !selectedKeys.includes(key)),
    })
        " bordered :pagination="{showTotal: total => t('fw.capturePoint.totalItems').replace('{total}', String(total))}" />
</template>
<script setup lang="ts">
import {computed} from 'vue';
import {Table} from 'ant-design-vue';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

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

const columns = computed(() => [
    {
        dataIndex: 'id',
        title: 'OID',
        width: 150,
    },
    {
        dataIndex: 'name',
        title: t('fw.capturePoint.originalName'),
        width: 150,
    },
    {
        dataIndex: 'mqttkey',
        title: 'MqttKey',
        width: 150,
    },
]);
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
