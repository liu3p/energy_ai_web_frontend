<template>
    <div class="container">
        <div class="panel">
            <div class="side-tree">
                <cv-scrollbar height="100%">
                    <cv-tree
                        ref="treeRef"
                        class="device-tree"
                        node-key="key"
                        :data="treeData"
                        :props="{children: 'children', label: 'label'}"
                        :current-node-key="currentKey"
                        :indent="18"
                        highlight-current
                        default-expand-all
                        @node-click="handleNodeClick"
                    />
                </cv-scrollbar>
            </div>
            <div class="main-contain">
                <device-detail
                    v-if="currentNode"
                    :node="currentNode"
                    @dispatch="handleDispatch"
                />
                <empty v-else class-name="empty" />
            </div>
        </div>
        <dispatch-dialog
            ref="dispatchDialogRef"
            v-model="dispatchVisible"
            @success="handleDispatchSuccess"
        />
    </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref} from 'vue';
import Empty from '@/common/empty.vue';
import DeviceDetail from './device-detail.vue';
import DispatchDialog from './dispatch-dialog.vue';
import type {DeviceTreeNode, ParamCardItem} from './device-manage.types';
import {fetchStationModel} from './device-manage.service';
import {findFirstLeafNode, findNodeByKey} from './station-model.util';

const POLL_INTERVAL_MS = 3000;

const treeData = ref<DeviceTreeNode[]>([]);
const currentNode = ref<DeviceTreeNode | null>(null);
const currentKey = ref('');
const dispatchVisible = ref(false);
const dispatchDialogRef = ref<InstanceType<typeof DispatchDialog>>();
const treeRef = ref();
let pollTimer: ReturnType<typeof setInterval> | null = null;
let loadingTree = false;

function findInForest(nodes: DeviceTreeNode[], key: string): DeviceTreeNode | null {
    for (const node of nodes) {
        const matched = findNodeByKey(node, key);
        if (matched) {
            return matched;
        }
    }
    return null;
}

function findFirstLeafInForest(nodes: DeviceTreeNode[]): DeviceTreeNode | null {
    for (const node of nodes) {
        const leaf = findFirstLeafNode(node);
        if (leaf) {
            return leaf;
        }
    }
    return nodes[0] ?? null;
}

async function loadTree(preserveSelection = false) {
    if (loadingTree) {
        return;
    }
    loadingTree = true;
    try {
        const root = await fetchStationModel();
        if (!root) {
            if (!preserveSelection) {
                treeData.value = [];
                currentNode.value = null;
                currentKey.value = '';
            }
            return;
        }

        // 与设计稿一致：树从厂站下级设备开始展示
        treeData.value = root.children.length ? root.children : [root];
        const previousKey = preserveSelection ? currentKey.value : '';
        const targetNode =
            (previousKey ? findInForest(treeData.value, previousKey) : null) ??
            findFirstLeafInForest(treeData.value);

        if (!targetNode) {
            currentNode.value = null;
            currentKey.value = '';
            return;
        }

        currentNode.value = targetNode;
        currentKey.value = targetNode.key;
        await nextTick();
        treeRef.value?.setCurrentKey?.(targetNode.key);
    } finally {
        loadingTree = false;
    }
}

function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => {
        void loadTree(true);
    }, POLL_INTERVAL_MS);
}

function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

function handleNodeClick(data: DeviceTreeNode) {
    currentNode.value = data;
    currentKey.value = data.key;
}

function handleDispatch(param: ParamCardItem) {
    dispatchDialogRef.value?.open(param);
}

function handleDispatchSuccess(paramName: string, value: string | number) {
    if (!currentNode.value) {
        return;
    }
    const target = currentNode.value.para.find(item => item.name === paramName);
    if (target) {
        target.value = value;
        return;
    }
    const dynTarget = currentNode.value.dyn_para.find(item => item.name === paramName);
    if (dynTarget) {
        dynTarget.value = value;
    }
}

onMounted(() => {
    void loadTree(false);
    startPolling();
});

onUnmounted(() => {
    stopPolling();
});
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
    flex: 0 0 240px;
    width: 240px;
    height: 100%;
    padding: 16px 12px;
    border-right: 1px solid #eef1f6;
    box-sizing: border-box;
    overflow: hidden;
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

    :deep(.el-tree-node__label) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :deep(.is-current > .el-tree-node__content) {
        background-color: #f0f1f5 !important;
        color: #35353e !important;
        font-weight: 400 !important;
    }
}

.main-contain {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
}

.empty {
    height: 100%;
    background: transparent;
}
</style>
