<template>
    <div class="main-contain">
        <div class="main-contain__header">
            <cv-tabs v-model="activeName" type="card" :panes="panes" style="height: 48px"></cv-tabs>
            <div class="extra">
                <cv-button v-if="type === 2 || type === 3" @click="handleAdd">
                    <span>添加</span>
                </cv-button>
                <cv-button v-else @click="fileImportRef.open()">
                    <cv-icon :size="16" color="transparent" style="cursor: pointer">
                        <icon-download></icon-download>
                    </cv-icon>
                    <span>导入</span>
                </cv-button>
                <cv-button @click="handleExport">
                    <span>导出</span>
                </cv-button>
                <cv-button type="danger" :disabled="selectedCount === 0" @click="handleBatchDelete">
                    <span>批量删除 ({{ selectedCount }})</span>
                </cv-button>
                <cv-button
                    :loading="loading"
                    :disabled="renderCount <= 0 || loading"
                    type="primary"
                    @click="handleSubmit"
                >
                    <cv-icon :size="16" color="transparent" style="cursor: pointer">
                        <icon-submit></icon-submit>
                    </cv-icon>
                    <span>提交</span>
                </cv-button>
            </div>
        </div>
        <div class="main-contain__center">
            <cv-scrollbar style="height: 40px">
                <cv-form ref="formRef" inline :model="formData" class="form-container">
                    <cv-form-item label="点号">
                        <cv-input v-model.trim="formData.gin" class="w-cm" />
                    </cv-form-item>
                    <cv-form-item label="原始名">
                        <cv-input v-model.trim="formData.name" class="w-cm" />
                    </cv-form-item>
                    <cv-button size="default" @click="handleReset" style="margin-left: 20px">
                        <span>清空</span>
                    </cv-button>
                    <cv-button size="default" type="primary" @click="handleSearch">
                        <span>查询</span>
                    </cv-button>
                </cv-form>
            </cv-scrollbar>
            <div class="divider"></div>
            <div class="table-container">
                <collect
                    ref="collectRef"
                    :active="activeName"
                    :points="pointsData"
                    :type="type"
                    :rid="rid"
                    :did="did"
                    @update-points="initDevicePoints"
                    @selection-change="handleSelectionChange"
                />
            </div>
        </div>
        <file-import ref="fileImportRef" @submit="handleImportPoints" />
        <reply-point-transfer
            ref="transferRef"
            :type="activeName"
            :deviceOption="deviceOption"
            @submit="handleTransferSubmit"
        />
    </div>
</template>
<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import FileImport from '@/modules/main/capture/point/file-import.vue';
import {IconSubmit, IconDownload} from '@/icons';
import Collect from '@/modules/main/capture/point/collect/collect.page.vue';
import ReplyPointTransfer from '@/modules/main/capture/point/transfer/reply-point-transfer.vue';
import {
    delDevicePoints,
    queryDevicePoints,
    updateDevicePoints,
    exportDevicePoints,
    updatePoint,
    importExcelPoints,
} from '@/modules/main/capture/point/point.service';
import {pointType} from '@/modules/main/capture/point/point.model';
import axios from 'axios';
import _ from 'lodash';
import {CvMessageBox} from 'cloudview.ui-next';

const props = defineProps<{
    node: any;
    deviceOption: any;
}>();

//RTU类型
const type = computed(() => props.node.parent?.data?.type);

const rid = computed(() => props.node.parent?.data?.id);
const did = computed(() => props.node.data?.id);
const activeName = ref('analog');
const fileImportRef = ref();
const transferRef = ref();
const collectRef = ref();
const selectedCount = ref(0);
const formData = ref<{
    name?: string;
    gin?: string;
}>({});
const pointsData = ref<any>({});
const initPointsData = ref<any>({});
const rowPointsData = ref<any>({});
const renderCount = ref(-1);
const loading = ref(false);
const panes = ref<
    {
        label: string | number;
        name: string | number;
    }[]
>(pointType);

// const panes = computed(() =>
//     type.value === 3 ? [...pointType, {label: "属性", name: "attribute"}] : pointType
// );

const initDevicePoints = () => {
    const rid = props.node.parent.data.id;
    const did = props.node.data.id;
    const type = activeName.value;
    queryDevicePoints(rid, did, type).then(res => {
        if (res.state) {
            rowPointsData.value = res.data || {};
            pointsData.value = {...rowPointsData.value};
            initPointsData.value = _.cloneDeep(pointsData.value);
            renderCount.value = -1;
            selectedCount.value = 0;
            collectRef.value?.clearSelection();
        }
    });
};
watch(
    () => props.node,
    node => {
        initDevicePoints();
    },
    {immediate: true, deep: true}
);
watch(
    () => rowPointsData.value,
    v => {
        renderCount.value++;
    },
    {
        deep: true,
    }
);
watch(activeName, () => {
    initDevicePoints();
});

const handleImportPoints = async (file: File) => {
    const rid = props.node.parent.data.id;
    const did = props.node.data.id;
    const res = await importExcelPoints(rid, did, file);
    if (res.state) {
        initDevicePoints();
        CvMessage.success('导入成功');
    } else {
        CvMessage.error(res.data.msg || '导入失败');
    }
};

const handleAdd = () => {
    transferRef.value.open({
        type: activeName.value,
        ...props.node.data,
    });
};

const handleSearch = () => {
    const keys: Partial<{
        label: string | number;
        name: string | number;
    }> = {};
    for (const key in formData.value) {
        // @ts-ignore
        if (formData.value[key]) keys[key] = formData.value[key];
    }
    const filterList = rowPointsData.value[activeName.value].filter(item => {
        return Object.values(keys).every((key, index) => {
            return (item[Object.keys(keys)[index]] + '').includes(key);
        });
    });
    pointsData.value[activeName.value] = filterList;
};

const handleSubmit = async () => {
    const rid = props.node.parent.data.id;
    const did = props.node.data.id;

    // 只比较当前激活 tab 的修改项
    const initList = initPointsData.value[activeName.value] || [];
    const currentList = pointsData.value[activeName.value] || [];

    const modifiedItems = currentList.filter((item: any) => {
        const initItem = initList.find((i: any) => i.id === item.id);
        return initItem && JSON.stringify(initItem) !== JSON.stringify(item);
    });

    if (modifiedItems.length > 0) {
        loading.value = true;

        const param = {};
        param[activeName.value] = modifiedItems;
        const res = await updatePoint(rid, did, param);
        if (res.state) {
            CvMessage.success('操作成功');
            initDevicePoints();
        } else {
            CvMessage.error(res.data.msg || '操作失败');
        }
        loading.value = false;
    }
};

const handleTransferSubmit = async (values: any) => {
    const param = {
        analog: [],
        attribute: [],
        control: [],
        digital: [],
        pulse: [],
        regulate: [],
    };
    param[activeName.value] =
        values.map(item => {
            return {
                ...item,
                datasource: item.id,
                id: '',
                gin: '',
            };
        }) || [];
    const rid = props.node.parent.data.id;
    const did = props.node.data.id;
    const res = await updateDevicePoints(rid, did, param);
    if (res.state) {
        initDevicePoints();
        CvMessage.success('添加成功');
    } else {
        CvMessage.error(res.data.msg || '添加失败');
    }
};

const handleReset = () => {
    formData.value = {};
    handleSearch();
};

//批量删除测点
const handleBatchDelete = () => {
    CvMessageBox.confirm(`确定要删除选中的 ${selectedCount.value} 条记录吗？`, '确认删除', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            await collectRef.value?.batchDelete();
            selectedCount.value = 0;
        })
        .catch(() => {});
};

const handleSelectionChange = (rows: any[]) => {
    selectedCount.value = rows.length;
};

//点表导出
const handleExport = () => {
    const rid = props.node.parent.data.id;
    const did = props.node.data.id;
    const token = sessionStorage.getItem('token');
    const tokenType = sessionStorage.getItem('tokenType');

    axios
        .get(`/api/v1/log/dbcfg/rtu/${rid}/device/${did}/excel`, {
            responseType: 'blob',
            headers: {
                'Authorization': `${tokenType} ${token}`,
            },
        })
        .then(res => {
            if (res.data) {
                const blob = new Blob([res.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${props.node.data.name}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        })
        .catch(err => {
            console.error('导出失败:', err);
        });
};
</script>
<style scoped lang="scss">
:deep(.el-tabs__header) {
    margin: 0;
}

:deep(.el-tabs__nav) {
    gap: 16px;

    .el-tabs__item {
        background: #e6e6e6;
        border: none !important;
        border-radius: 12px;
    }

    .is-active {
        background: #3162e1 !important;
        color: #fff;
    }
}

:deep(.cv-upload__file-list) {
}

:deep(.el-form-item) {
    margin-bottom: 0;
}

.main-contain {
    height: 100%;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
}

.main-contain__header {
    height: 66px;
    background: #fff;
    border-bottom: 1px solid #ebebeb;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.main-contain__center {
    padding: 16px;
    background: #fff;
    height: calc(100% - 66px);
}

.form-container {
    display: flex;
    flex-wrap: nowrap;
}

.extra {
    display: flex;
    gap: 10px;
    margin-left: auto;
}

.divider {
    border-bottom: 1px dashed #e5e6ea;
    margin: 12px 0;
}

.w-cm {
    width: 180px;
}

.empty-bg {
    background: #fff;
    border-radius: 12px;
}

.custom-tree-node-cont {
    width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.table-container {
    height: calc(100% - 40px - 24px);
    width: 100%;
}
</style>
