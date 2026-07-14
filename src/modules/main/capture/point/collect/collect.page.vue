<template>
    <div class="container">
        <cv-table
            ref="cvTableRef"
            :data="tableData"
            class="table-container"
            row-key="id"
            :reserve-selection="false"
            @select-all="handleSelectAll"
            @selection-change="handleSelectionChange"
        >
            <cv-table-column type="selection" width="55" />
            <cv-table-column
                v-for="col in filteredColumns"
                :key="col.prop"
                :prop="col.prop"
                :label="col.label"
                :width="col.width"
                :fixed="col.fixed"
            >
                <template v-if="col.prop === 'index'" #default="{row, $index}">
                    <span>{{ $index + 1 }}</span>
                </template>

                <template v-else-if="col.prop === 'id'" #default="{row}">
                    <span>{{ row.id }}</span>
                </template>

                <template v-else-if="col.type === 'select'" #header="scope">
                    <span>{{ scope.column.label }}</span>
                    <cv-icon
                        color="#fff"
                        style="cursor: pointer; margin-left: 4px"
                        @click="batchRef.open(col.prop, 'select', col.selectOptions)"
                    >
                        <icon-edit></icon-edit>
                    </cv-icon>
                </template>

                <template v-else #header="scope">
                    <span>{{ scope.column.label }}</span>
                    <cv-icon
                        color="#fff"
                        style="cursor: pointer; margin-left: 4px"
                        @click="batchRef.open(col.prop, 'text')"
                    >
                        <icon-edit></icon-edit>
                    </cv-icon>
                </template>

                <template v-if="col.type === 'select'" #default="{row}">
                    <cv-select v-model="row[col.prop]">
                        <cv-option
                            v-for="item in col.selectOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></cv-option>
                    </cv-select>
                </template>

                <template v-else-if="col.prop !== 'index' && col.prop !== 'id'" #default="{row}">
                    <cv-input v-model="row[col.prop]" />
                </template>
            </cv-table-column>

            <cv-table-column v-if="type === 5" label="操作" min-width="160" fixed="right">
                <template #default="{row}">
                    <cv-button
                        type="primary"
                        :disabled="!row.id"
                        text
                        @click="formulaDrawerRef.open({rid, did, pid: row.id})"
                    >
                        公式编辑
                    </cv-button>
                </template>
            </cv-table-column>

            <cv-table-column label="操作" min-width="100" fixed="right">
                <template #default="{row}">
                    <cv-button type="danger" :disabled="!row.id" text @click="deleteOpen(row)">删除</cv-button>
                </template>
            </cv-table-column>
        </cv-table>

        <cv-pagination
            layout="->,total,sizes,prev, pager, next,jumper"
            :page-sizes="[10, 20, 30, 40, 50]"
            :total="currentTableData.length"
            :current-page="currentPage"
            :page-size="pageSize"
            style="margin-top: 10px"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        />

        <batching-dialog ref="batchRef" @submit="handleSubmit" />
        <formula-drawer ref="formulaDrawerRef"></formula-drawer>
    </div>
</template>

<script setup lang="ts">
import {ref, computed, reactive, toRefs, nextTick} from 'vue';
import {IconEdit} from '@/icons';
import BatchingDialog from '@/modules/main/capture/point/batching-dialog.vue';
import {tableConfigs, ColumnConfig} from '@/modules/main/capture/point/collect/collect.model';
import FormulaDrawer from '../formula.drawer.vue';
import {CvMessageBox, CvMessage} from 'cloudview.ui-next';
import {delPointById} from '@/modules/main/capture/point/point.service';

const props = defineProps<{
    type: number;
    active: string;
    rid: string;
    did: string;
    points: {
        analog: any[];
        digital: any[];
        pulse: any[];
        regulate: any[];
        control: any[];
        attribute: any[];
    };
}>();

const emit = defineEmits(['updatePoints', 'selection-change']);

const batchRef = ref();
const formulaDrawerRef = ref();
const cvTableRef = ref();
const pages = reactive({
    currentPage: 1,
    pageSize: 10,
});
const {currentPage, pageSize} = toRefs(pages);

const selectedRows = ref<any[]>([]);
const isChangingPage = ref(false);

const currentTableData = computed(() => {
    return props.points[props.active as keyof typeof props.points] ?? [];
});

const isTransfer = computed(() => props.type === 2);

const tableConfig = computed(() => tableConfigs[props.active]);

const filteredColumns = computed(() => {
    if (!tableConfig.value) return [];
    return tableConfig.value.columns.filter((col: ColumnConfig) => {
        if (!col.condition) return true;

        if (col.condition === 'isTransfer') return isTransfer.value;
        if (col.condition === '!isTransfer') return !isTransfer.value;

        return true;
    });
});

const tableData = computed(() => {
    const processedData = [...currentTableData.value];
    return processedData.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

const handleSelectionChange = (rows: any[]) => {
    if (isChangingPage.value) {
        return;
    }
    const currentPageSelectedIds = new Set(rows.map(row => row.id));

    const nonCurrentPageSelected = selectedRows.value.filter(
        row => !tableData.value.some(current => current.id === row.id)
    );

    const currentPageSelected = tableData.value.filter(row => currentPageSelectedIds.has(row.id));

    selectedRows.value = [...nonCurrentPageSelected, ...currentPageSelected];

    emit('selection-change', selectedRows.value);
};

const handleSelectAll = val => {
    if (val.length > 0) {
        selectedRows.value = [...currentTableData.value];
    } else {
        selectedRows.value = [];
    }
    emit('selection-change', selectedRows.value);
};

const handleCurrentChange = val => {
    pages.currentPage = val;
    handleToggleRowChange();
};
const handleSizeChange = val => {
    pages.pageSize = val;
    handleToggleRowChange();
};
// 处理选中状态
const handleToggleRowChange = () => {
    isChangingPage.value = true;
    nextTick(() => {
        if (cvTableRef.value) {
            tableData.value.forEach(row => {
                const isSelected = selectedRows.value.some(selected => selected.id === row.id);
                cvTableRef.value.toggleRowSelection(row, isSelected);
            });
        }

        setTimeout(() => {
            isChangingPage.value = false;
        }, 0);
    });
}

const handleSubmit = (key: string, map: Map<number, string>, value: any) => {
    currentTableData.value.forEach((item: any, index) => {
        if (map.has(index + 1)) {
            item[key] = map.get(index + 1);
        }
    });
};

const deleteOpen = (row: any) => {
    CvMessageBox.confirm(`确认删除？`, '删除', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            deleteConfirm(row);
        })
        .catch(() => {
            CvMessage({
                type: 'info',
                message: '删除取消！',
            });
        });
};

const deleteConfirm = (row: any) => {
    handleDelete(row.id);
};

const handleDelete = async (id: string) => {
    const data: {
        analog: {id: string}[];
        digital: {id: string}[];
        pulse: {id: string}[];
        control: {id: string}[];
        regulate: {id: string}[];
        attribute: {id: string}[];
    } = {
        analog: [],
        digital: [],
        pulse: [],
        control: [],
        regulate: [],
        attribute: [],
    };

    (data[props.active as keyof typeof data] as {id: string}[]) = [{id}];

    try {
        const res = await delPointById(props.rid, props.did, data);
        if (res.code === 200) {
            CvMessage({
                type: 'success',
                message: '删除成功！',
            });
            emit('updatePoints');
        } else {
            CvMessage({
                type: 'error',
                message: res.msg,
            });
        }
    } catch (error) {
        console.log(error);
        CvMessage({
            type: 'error',
            message: '删除失败',
        });
    }
};

const batchDelete = async () => {
    const ids = selectedRows.value.map(row => row.id).filter(id => id);
    if (ids.length === 0) {
        CvMessage({type: 'warning', message: '请选择要删除的记录'});
        return;
    }

    const data: {
        analog: {id: string}[];
        digital: {id: string}[];
        pulse: {id: string}[];
        control: {id: string}[];
        regulate: {id: string}[];
        attribute: {id: string}[];
    } = {
        analog: [],
        digital: [],
        pulse: [],
        control: [],
        regulate: [],
        attribute: [],
    };

    (data[props.active as keyof typeof data] as {id: string}[]) = ids.map(id => ({id}));

    try {
        const res = await delPointById(props.rid, props.did, data);
        if (res.code === 200) {
            CvMessage({type: 'success', message: '删除成功！'});
            emit('updatePoints');
            clearSelection();
        } else {
            CvMessage({type: 'error', message: res.msg});
        }
    } catch (error) {
        console.log(error);
        CvMessage({type: 'error', message: '删除失败'});
    }
};

const clearSelection = () => {
    selectedRows.value = [];
};

defineExpose({
    batchDelete,
    clearSelection,
});
</script>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
}

:deep(.cell) {
    display: flex;
    align-items: center;
}

.table-container {
    width: 100%;
    height: calc(100% - 50px);
    border: none;
}
</style>
