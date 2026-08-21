<template>
    <div class="main-contain">
        <div class="main-contain__header">
            <cv-tabs v-model="activeName" :panes="panes" class="point-type-tabs"></cv-tabs>
            <div class="extra">
                <cv-button v-if="type === 2 || type === 3" @click="acgTransferRef.open(rowPointsData[activeName])">
                    <span>{{ t('fw.capturePoint.add') }}</span>
                </cv-button>
                <cv-button v-else @click="fileImportRef.open()">
                    <cv-icon :size="16" color="transparent" style="cursor: pointer">
                        <icon-download></icon-download>
                    </cv-icon>
                    <span>{{ t('fw.common.import') }}</span>
                </cv-button>

                <cv-button @click="handleExport">
                    <span>{{ t('fw.capturePoint.export') }}</span>
                </cv-button>
                <cv-button type="danger" :disabled="selectedCount === 0" @click="handleBatchDelete">
                    <span>{{ t('fw.capturePoint.batchDeleteWithCount').replace('{count}', String(selectedCount)) }}</span>
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
                    <span>{{ t('fw.common.submit') }}</span>
                </cv-button>
            </div>
        </div>
        <div class="main-contain__center">
            <cv-scrollbar style="height: 40px">
                <cv-form ref="formRef" inline :model="formData" class="form-container">
                    <cv-form-item :label="t('fw.capturePoint.gin')">
                        <cv-input v-model.trim="formData.gin" class="w-cm" />
                    </cv-form-item>
                    <cv-form-item :label="t('fw.capturePoint.originalName')">
                        <cv-input v-model.trim="formData.name" class="w-cm" />
                    </cv-form-item>
                    <cv-button size="default" @click="handleReset" style="margin-left: 20px">
                        <span>{{ t('fw.common.clear') }}</span>
                    </cv-button>
                    <cv-button size="default" type="primary" @click="handleSearch">
                        <span>{{ t('fw.common.search') }}</span>
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
        <acg-reply-point-transfer ref="acgTransferRef" :type="activeName" @submit="handleTransferSubmit" />
        <!-- <reply-point-transfer ref="transferRef" :type="activeName" @submit="handleTransferSubmit" /> -->
    </div>
</template>
<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import FileImport from '@/modules/main/capture/point/file-import.vue';
import {IconSubmit, IconDownload} from '@/icons';
import Collect from '@/modules/main/capture/point/collect/collect.page.vue';
import AcgReplyPointTransfer from '@/modules/main/capture/point/acg/acg-reply-point-transfer.vue';
import {
    delDevicePoints,
    queryDevicePoints,
    updateDevicePoints,
    updatePoint,
    importExcelPoints,
} from '@/modules/main/capture/point/point.service';
// import {pointType} from '@/modules/main/capture/point/point.model';
import {acgPointType} from '@/modules/main/capture/point/point.model';
import axios from 'axios';
import _ from 'lodash';
import {CvMessageBox, CvMessage, useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

const props = defineProps<{
    node: any;
}>();

//RTU类型
const type = computed(() => props.node.parent?.data?.type);
const rid = computed(() => props.node.parent?.data?.id);
const did = computed(() => props.node.data?.id);
const activeName = ref('analog');
const fileImportRef = ref();
const acgTransferRef = ref();
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
const panes = computed(() =>
    acgPointType
        .filter(item => item.name !== 'attribute')
        .map(item => ({
            ...item,
            label: t(`fw.monitor.pointType.${item.name}`),
        }))
);

const initDevicePoints = () => {
    const rid = props.node.parent.data.id;
    const did = props.node.data.id;
    const type = activeName.value;
    queryDevicePoints(rid, did, type).then(res => {
        if (res.state) {
            rowPointsData.value = res.data || {};
            pointsData.value = {...rowPointsData.value};
            initPointsData.value = JSON.parse(JSON.stringify(pointsData.value));
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
        CvMessage.success(t('fw.capturePoint.importSuccess'));
    } else {
        CvMessage.error(res.data.msg || t('fw.capturePoint.importFailed'));
    }
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
            CvMessage.success(t('fw.common.operateSuccess'));
            initDevicePoints();
        } else {
            CvMessage.error(res.data.msg || t('fw.common.operateFailed'));
        }
        loading.value = false;
    }
};

const handleTransferSubmit = async (values: any, type: string) => {
    activeName.value = type.toLowerCase();

    const param = {
        analog: [],
        attribute: [],
        control: [],
        digital: [],
        pulse: [],
        regulate: [],
    };
    values.forEach(item => {
        const type = item.type.toLowerCase();
        param[type].push(item);
    });
    const rid = props.node.parent.data.id;
    const did = props.node.data.id;
    const res = await updateDevicePoints(rid, did, param);
    if (res.state) {
        initDevicePoints();
        CvMessage.success(t('fw.capturePoint.addSuccess'));
    } else {
        CvMessage.error(t('fw.capturePoint.addFailed'));
    }
};

const handleReset = () => {
    formData.value = {};
    handleSearch();
};

//批量删除测点
const handleBatchDelete = () => {
    CvMessageBox.confirm(
        t('fw.capturePoint.confirmDeleteSelected').replace('{count}', String(selectedCount.value)),
        t('fw.capturePoint.confirmDeleteTitle'),
        {
            confirmButtonText: t('fw.common.delete'),
            cancelButtonText: t('fw.common.cancel'),
            type: 'warning',
        }
    )
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
.point-type-tabs {
    height: 100%;
    flex: 1;
    min-width: 0;

    :deep(.el-tabs__header) {
        margin: 0;
        height: 100%;
        border-bottom: none;
    }

    :deep(.el-tabs__nav-wrap) {
        height: 100%;

        &::after {
            display: none;
        }
    }

    :deep(.el-tabs__nav-scroll),
    :deep(.el-tabs__nav) {
        height: 100%;
    }

    :deep(.el-tabs__item) {
        height: 48px;
        padding: 0 20px;
        line-height: 48px;
        color: #5c6373;
        font-size: 14px;
        font-weight: 400;
    }

    :deep(.el-tabs__item.is-active) {
        color: #1a2233;
        font-weight: 600;
    }

    :deep(.el-tabs__item:hover) {
        color: #1a2233;
    }

    :deep(.el-tabs__active-bar) {
        height: 3px;
        background-color: #1a2233;
        border-radius: 2px;
    }
}

:deep(.cv-upload__file-list) {
}

:deep(.el-form-item) {
    margin-bottom: 0;
}

.main-contain {
    height: 100%;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
}

.main-contain__header {
    height: 48px;
    background: transparent;
    border-bottom: 1px solid #ebebeb;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.main-contain__center {
    padding: 16px;
    background: transparent;
    height: calc(100% - 48px);
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
