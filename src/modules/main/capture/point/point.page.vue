<template>
    <div class="container">
        <div class="side-tree__wrapper">
            <collapse-slider v-model="collapse" :width="sliderProps.width" :collapse-width="sliderProps.collapseWidth">
                <cv-button style="margin: 0 auto 8px; width: 100%" @click="addRtuRef.open()">新增RTU</cv-button>
                <cv-tree
                    ref="treeRef"
                    node-key="key"
                    :data="treeData"
                    :props="{
                        children: 'device',
                        label: 'name',
                    }"
                    default-expand-all
                    :default-expanded-keys="expandedNodes"
                    @node-click="handleNodeClick"
                >
                    <template #default="{node, data}">
                        <div class="custom-tree-node">
                            <cv-tooltip :content="`${node.label}（${data.id}）`" placement="right">
                                <div class="custom-tree-node-cont">{{ node.label }}</div>
                            </cv-tooltip>
                            <cv-popover
                                ref="myPopover"
                                :width="210"
                                placement="right-start"
                                popper-style="padding:0"
                                trigger="click"
                                :hide-after="0"
                            >
                                <template #reference>
                                    <div class="custom-tree__icon">
                                        <cv-icon :size="14" color="#3162E1">
                                            <cv-icon-d-more></cv-icon-d-more>
                                        </cv-icon>
                                    </div>
                                </template>
                                <div class="config-menu">
                                    <div v-if="node.level === 1" @click="nodeAdd(node, data)">新增设备</div>
                                    <div v-else @click="nodeEdit(node, data)">编辑</div>
                                    <div v-if="node.level === 2" @click="nodeClean(node, data)">清空数据</div>
                                    <div @click="removeNode(node, data)">删除</div>
                                </div>
                            </cv-popover>
                        </div>
                    </template>
                </cv-tree>
            </collapse-slider>
        </div>
        <div class="main-contain">
            <rtu-page v-if="currentNode?.level === 1" :data="currentNode?.data" @submit="handleSubmitRtu" />
            <!-- <import-point :node="currentNode" v-else-if="currentNode?.level === 2" /> -->
            <import-point
                :node="currentNode"
                :deviceOption="treeData"
                v-else-if="currentNode?.level === 2 && currentNode?.parent?.data?.type !== 3"
            />
            <acg-import-point
                :node="currentNode"
                v-else-if="currentNode?.level === 2 && currentNode?.parent?.data?.type === 3"
            />
            <empty class-name="empty" v-else />
        </div>
        <rtu-dialog ref="addRtuRef" @submit="handleSubmitRtu" />
        <batching-dialog />
        <formula-drawer />
        <device-dialog
            ref="deviceRef"
            @submit="handleSubmitDevice"
            :type="currentNode?.data?.type"
            :deviceOption="treeData"
        />
    </div>
</template>
<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import CollapseSlider from '@/common/collapse-slider.vue';
import RtuPage from '@/modules/main/capture/point/rtu-page.vue';
import ImportPoint from '@/modules/main/capture/point/import-point.vue';
import AcgImportPoint from '@/modules/main/capture/point/acg/acg-import-point.vue';
import RtuDialog from '@/modules/main/capture/point/rtu.dialog.vue';
import BatchingDialog from '@/modules/main/capture/point/batching-dialog.vue';
import FormulaDrawer from '@/modules/main/capture/point/formula.drawer.vue';
import DeviceDialog from '@/modules/main/capture/point/device.dialog.vue';
import Empty from '@/common/empty.vue';
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
const sliderProps = {
    collapseWidth: '48px',
    width: '300px',
};
const sliderWidth = computed(() => {
    return collapse.value ? sliderProps.collapseWidth : sliderProps.width;
});
const deviceRef = ref();
const addRtuRef = ref();
const treeRef = ref();
const currentNode = ref();
const collapse = ref(false);
// 收集所有展开的节点
const expandedNodes = ref<string[]>([]);
const treeData = ref<any[]>([]);

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
    const {id, name, memofcabinet} = form;
    let res: any;
    if (id || id === 0) {
        res = await updateRtu(id, {...currentNode.value.data, name, memofcabinet});
    } else {
        res = await createRtu(form);
    }
    if (res.state) {
        CvMessage.success('操作成功');
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
        // 编辑设备
        res = await updateDevice(currentNode.value.parent.data.id, id, form);
    } else if (currentNode.value?.data?.type === 2) {
        // 转发设备
        const rtuId = form.rtuId === '' ? -1 : form.rtuId;
        const deviceId = form.deviceId === '' ? -1 : form.deviceId;

        form.memofrtu = currentNode.value?.data?.id;
        res = await createTransDevice(rtuId, deviceId, form);
    } else {
        res = await createDevice(rid, form);
    }
    if (res?.state) {
        CvMessage.success('操作成功');
        deviceRef.value.close();
        initRtuList();
    } else {
        CvMessage.error(res.data.msg);
    }
};

const nodeAdd = (node: any, data: any) => {
    deviceRef.value.open();
};
const nodeEdit = (node: any, data: any) => {
    deviceRef.value.open(data);
};
const nodeClean = (node: any, data: any) => {
    const {memofrtu: rid, id: did} = data;

    CvMessageBox.confirm('确认清空该设备下的所有数据吗？', '确认清空', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            const res = await delDevicePoints(rid, did);
            if (res?.state) {
                CvMessage.success('清空数据成功');
                currentNode.value.update_time = Date.now();
            } else {
                CvMessage.error(res?.data?.msg || '删除失败');
            }
        })
        .catch(() => {});
};

const removeNode = (node: any) => {
    if (node.level === 1 && node.childNodes?.length) {
        return CvMessageBox.alert('当前节点无法删除，请先删除子节点。', t('fw.common.tips'), {
            confirmButtonText: '取消',
        });
    }
    const id = node.data.id;
    CvMessageBox.confirm(t('fw.common.confirmDel'), t('fw.common.tips'), {
        type: 'warning',
    }).then(() => {
        if (node.level === 1) {
            delRtu(id).then(res => {
                if (res?.state) {
                    CvMessage.success('操作成功');
                    initRtuList();
                    currentNode.value = null;
                }
            });
        } else {
            delDevice(node.parent.data.id, id).then(res => {
                if (res?.state) {
                    CvMessage.success('操作成功');
                    initRtuList();
                    currentNode.value = null;
                }
            });
        }
    });
};

// 点击节点事件
const handleNodeClick = (_: any, node: any) => {
    currentNode.value = node;
};
</script>
<style scoped lang="scss">
$sliderWidth: v-bind(sliderWidth);
$gap: 24px;
.container {
    width: 100%;
    height: 100%;
    display: flex;
    gap: $gap;
}

.side-tree__wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 12px;
}

.main-contain {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
}

.main-contain__center {
    padding: 16px;
    background: #fff;
    height: calc(100% - 48px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.bold-text {
    color: #35353e;
    font-weight: bold;
}

.custom-tree-node {
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-cont {
        width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.custom-tree__icon {
    visibility: hidden;

    :deep(.el-icon) {
        color: #35353e !important;
    }
}

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

.w-cm {
    width: 220px;
}

.empty {
    background: #fff;
}
</style>
