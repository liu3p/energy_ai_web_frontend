<template>
    <Table
        :row-selection="
            getRowSelection({
                selectedKeys,
                onItemSelectAll,
                onItemSelect,
            })
        "
        :columns="columns"
        :data-source="filteredItems"
        size="small"
        :custom-row="
            ({key}) => ({
                onClick: () => onItemSelect(key, !selectedKeys.includes(key)),
            })
        "
        bordered
        :pagination="{showTotal: total => `共 ${total} 条`}"
    />
</template>
<script setup lang="ts">
import {Table} from 'ant-design-vue';
import {h} from 'vue';

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
    //{
    //dataIndex: 'name',
    //title: '名称',
    //  width: 150,
    //},
    {
        dataIndex: 'path',
        title: 'path',
        width: '70%',
        customRender: ({text}: {text: string}) => {
            const wrappedText = text.replace(/\//g, '/&#8203;');
            return h('div', {style: {wordBreak: 'break-word', whiteSpace: 'pre-wrap'}, innerHTML: wrappedText});
        },
    },
    {
        dataIndex: 'aliasname',
        title: '描述',
        width: '30%',
    },
    // {
    //     dataIndex: 'value',
    //     title: '值',
    //     width: 150,
    // },
];
const getRowSelection = ({disabled, selectedKeys, onItemSelectAll, onItemSelect}: Record<string, any>) => {
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
