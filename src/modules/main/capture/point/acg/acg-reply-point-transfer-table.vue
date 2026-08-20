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
        :pagination="{showTotal: total => t('fw.capturePoint.totalItems').replace('{total}', String(total))}"
    />
</template>
<script setup lang="ts">
import {Table} from 'ant-design-vue';
import {computed, h} from 'vue';
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
        title: t('fw.capturePoint.description'),
        width: '30%',
    },
]);
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
