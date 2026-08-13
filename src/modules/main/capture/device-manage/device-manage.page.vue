<template>
    <div class="container">
        <div class="side-tree__wrapper">
            <cv-scrollbar height="100%">
                <cv-tree
                    ref="treeRef"
                    node-key="key"
                    :data="treeData"
                    :props="{children: 'children', label: 'label'}"
                    :current-node-key="currentKey"
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

        treeData.value = [root];
        const previousKey = preserveSelection ? currentKey.value : '';
        const targetNode =
            (previousKey ? findNodeByKey(root, previousKey) : null) ?? findFirstLeafNode(root) ?? root;

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
$gap: 16px;

.container {
    width: 100%;
    height: 100%;
    display: flex;
    gap: $gap;
}

.side-tree__wrapper {
    flex: 0 0 240px;
    width: 240px;
    height: 100%;
    padding: 16px;
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
}

.main-contain {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
}

.empty {
    background: #fff;
    border-radius: 12px;
}
</style>
