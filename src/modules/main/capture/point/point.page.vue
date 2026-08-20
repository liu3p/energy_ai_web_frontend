<template>
    <div class="container">
        <div class="panel">
            <div class="side-tree">
                <div class="side-tree__toolbar">
                    <cv-input
                        v-model="filterText"
                        style="height: 28px"
                        :placeholder="t('fw.capturePoint.pleaseInputContent')"
                        :suffix-icon="Search"
                        clearable
                    />
                    <cv-button type="primary" style="height: 28px; flex-shrink: 0" @click="addRtuRef.open()">
                        <cv-icon size="10">
                            <cv-icon-add />
                        </cv-icon>
                        <span style="margin-left: 4px">{{ t('fw.capturePoint.add') }}</span>
                    </cv-button>
                </div>
                <cv-scrollbar height="calc(100% - 36px)">
                    <cv-tree
                        ref="treeRef"
                        class="device-tree"
                        node-key="key"
                        :data="treeData"
                        :props="{
                            children: 'device',
                            label: 'name',
                        }"
                        :current-node-key="currentKey"
                        :indent="18"
                        highlight-current
                        default-expand-all
                        :default-expanded-keys="expandedNodes"
                        :filter-node-method="filterNode"
                        @node-click="handleNodeClick"
                    >
                        <template #default="{node, data}">
                            <div class="custom-tree-node">
                                <cv-tooltip :content="`${node.label}（${data.id}）`" placement="right">
                                    <div class="custom-tree-node-cont">{{ node.label }}</div>
                                </cv-tooltip>
                                <cv-popover
                                    :width="210"
                                    placement="right-start"
                                    popper-style="padding:0"
                                    trigger="click"
                                    :hide-after="0"
                                >
                                    <template #reference>
                                        <div class="custom-tree__icon" @click.stop>
                                            <cv-icon :size="14" color="#98a3be">
                                                <cv-icon-d-more></cv-icon-d-more>
                                            </cv-icon>
                                        </div>
                                    </template>
                                    <div class="config-menu">
                                        <div v-if="node.level === 1" @click="nodeAdd(node, data)">{{ t('fw.capturePoint.addDevice') }}</div>
                                        <div v-else @click="nodeEdit(node, data)">{{ t('fw.common.edit') }}</div>
                                        <div v-if="node.level === 2" @click="nodeClean(node, data)">{{ t('fw.capturePoint.clearData') }}</div>
                                        <div @click="removeNode(node, data)">{{ t('fw.common.delete') }}</div>
                                    </div>
                                </cv-popover>
                            </div>
                        </template>
                    </cv-tree>
                </cv-scrollbar>
            </div>
            <div class="main-contain">
                <rtu-page
                    v-if="currentNode?.level === 1"
                    :data="currentNode?.data"
                    @submit="handleSubmitRtu"
                />
                <import-point
                    v-else-if="currentNode?.level === 2 && currentNode?.parent?.data?.type !== 3"
                    :node="currentNode"
                    :deviceOption="treeData"
                />
                <acg-import-point
                    v-else-if="currentNode?.level === 2 && currentNode?.parent?.data?.type === 3"
                    :node="currentNode"
                />
                <empty v-else class-name="empty" />
            </div>
        </div>
        <rtu-dialog ref="addRtuRef" @submit="handleSubmitRtu" />
        <batching-dialog />
        <formula-drawer />
        <device-dialog
            ref="deviceRef"
            :type="currentNode?.data?.type"
            :deviceOption="treeData"
            @submit="handleSubmitDevice"
        />
    </div>
</template>
<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import RtuPage from '@/modules/main/capture/point/rtu-page.vue';
import ImportPoint from '@/modules/main/capture/point/import-point.vue';
import AcgImportPoint from '@/modules/main/capture/point/acg/acg-import-point.vue';
import RtuDialog from '@/modules/main/capture/point/rtu.dialog.vue';
import BatchingDialog from '@/modules/main/capture/point/batching-dialog.vue';
import FormulaDrawer from '@/modules/main/capture/point/formula.drawer.vue';
import DeviceDialog from '@/modules/main/capture/point/device.dialog.vue';
import Empty from '@/common/empty.vue';
import {Search} from '@element-plus/icons-vue';
import {
    createDevice,
    createRtu,
    delDevice,
    delRtu,
    queryRtuListExceptPoints,
    updateDevice,
    updateRtu,
    delDevicePoints,
    createTransDevice,
} from '@/modules/main/capture/point/point.service';
import {CvMessageBox, CvMessage, useLocale} from 'cloudview.ui-next';

const {t} = useLocale();
const deviceRef = ref();
const addRtuRef = ref();
const treeRef = ref();
const currentNode = ref();
const currentKey = ref('');
const expandedNodes = ref<string[]>([]);
const treeData = ref<any[]>([]);
const filterText = ref('');

watch(filterText, val => {
    treeRef.value?.filter(val);
});

const filterNode = (value: string, data: any) => {
    if (!value) return true;
    return data.name.indexOf(value) !== -1;
};

const initRtuList = () => {
    queryRtuListExceptPoints().then(res => {
        if (res.state) {
            treeData.value = res.data.map(rtu => ({
                ...rtu,
                key: rtu.name + rtu.id,
                device: rtu.device?.map(dev => ({
                    ...dev,
                    key: dev.name + dev.id,
                })),
            }));
        }
    });
};

onMounted(() => {
    initRtuList();
});

const handleSubmitRtu = async (form: any) => {
    const {id} = form;
    let res: any;
    if (id || id === 0) {
        res = await updateRtu(id, {...form});
    } else {
        res = await createRtu(form);
    }
    if (res.state) {
        CvMessage.success(t('fw.common.operateSuccess'));
        addRtuRef.value.close();
        initRtuList();
    } else {
        CvMessage.error(res.data.msg);
    }
};

const handleSubmitDevice = async (form: any) => {
    const rid = currentNode.value.data.id;
    const {id} = form;
    let res: any;
    if (id || id === 0) {
        res = await updateDevice(currentNode.value.parent.data.id, id, form);
    } else if (currentNode.value?.data?.type === 2) {
        const rtuId = form.rtuId === '' ? -1 : form.rtuId;
        const deviceId = form.deviceId === '' ? -1 : form.deviceId;

        form.memofrtu = currentNode.value?.data?.id;
        res = await createTransDevice(rtuId, deviceId, form);
    } else {
        res = await createDevice(rid, form);
    }
    if (res?.state) {
        CvMessage.success(t('fw.common.operateSuccess'));
        deviceRef.value.close();
        initRtuList();
    } else {
        CvMessage.error(res.data.msg);
    }
};

const nodeAdd = (_node: any, _data: any) => {
    deviceRef.value.open();
};
const nodeEdit = (_node: any, data: any) => {
    deviceRef.value.open(data);
};
const nodeClean = (_node: any, data: any) => {
    const {memofrtu: rid, id: did} = data;

    CvMessageBox.confirm(t('fw.capturePoint.confirmClearData'), t('fw.capturePoint.confirmClearTitle'), {
        confirmButtonText: t('fw.common.confirm'),
        cancelButtonText: t('fw.common.cancel'),
        type: 'warning',
    })
        .then(async () => {
            const res = await delDevicePoints(rid, did);
            if (res?.state) {
                CvMessage.success(t('fw.capturePoint.clearDataSuccess'));
                currentNode.value.update_time = Date.now();
            } else {
                CvMessage.error(res?.data?.msg || t('fw.common.operateFailed'));
            }
        })
        .catch(() => {});
};

const removeNode = (node: any) => {
    if (node.level === 1 && node.childNodes?.length) {
        return CvMessageBox.alert(t('fw.capturePoint.cannotDeleteHasChildren'), t('fw.common.tips'), {
            confirmButtonText: t('fw.common.cancel'),
        });
    }
    const id = node.data.id;
    CvMessageBox.confirm(t('fw.common.confirmDel'), t('fw.common.tips'), {
        type: 'warning',
    }).then(() => {
        if (node.level === 1) {
            delRtu(id).then(res => {
                if (res?.state) {
                    CvMessage.success(t('fw.common.operateSuccess'));
                    initRtuList();
                    currentNode.value = null;
                    currentKey.value = '';
                }
            });
        } else {
            delDevice(node.parent.data.id, id).then(res => {
                if (res?.state) {
                    CvMessage.success(t('fw.common.operateSuccess'));
                    initRtuList();
                    currentNode.value = null;
                    currentKey.value = '';
                }
            });
        }
    });
};

const handleNodeClick = (_: any, node: any) => {
    currentNode.value = node;
    currentKey.value = node?.data?.key ?? '';
};
</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
}

.panel {
    display: flex;
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
}

.side-tree {
    flex: 0 0 260px;
    width: 260px;
    height: 100%;
    padding: 16px 12px;
    border-right: 1px solid #eef1f6;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__toolbar {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-shrink: 0;
    }
}

.device-tree {
    background: transparent;

    :deep(.el-tree-node__content) {
        height: 36px;
        margin-bottom: 2px;
        padding-right: 8px;
        border-radius: 6px;
        color: #35353e;
        font-size: 14px;
        font-weight: 400;
    }

    :deep(.el-tree-node__content:hover) {
        background-color: #f5f6f8;
    }

    :deep(.el-tree-node__expand-icon) {
        margin-right: 4px;
        font-size: 12px;
        color: #98a3be;
    }

    :deep(.el-tree-node__expand-icon.is-leaf) {
        color: transparent;
        cursor: default;
    }

    :deep(.is-current > .el-tree-node__content) {
        background-color: #f0f1f5 !important;
        color: #35353e !important;
        font-weight: 400 !important;
    }
}

.custom-tree-node {
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;

    &-cont {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.custom-tree__icon {
    flex-shrink: 0;
    visibility: hidden;
    margin-left: 4px;

    :deep(.el-icon) {
        color: #98a3be !important;
    }
}

:deep(.el-tree-node__content:hover .custom-tree__icon),
:deep(.is-current > .el-tree-node__content .custom-tree__icon) {
    visibility: visible !important;
}

.config-menu {
    > div {
        width: 100%;
        padding: 0 16px;
        height: 40px;
        line-height: 40px;
        cursor: pointer;
    }

    > div:hover {
        background: rgba(63, 63, 74, 0.1);
        color: #35353e;
    }
}

.main-contain {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.empty {
    height: 100%;
    background: transparent;
}
</style>
