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
                        :props="{
                            children: 'device',
                            label: 'name',
                        }"
                        :current-node-key="currentKey"
                        :indent="18"
                        highlight-current
                        default-expand-all
                        @node-click="handleNodeClick"
                    />
                </cv-scrollbar>
            </div>
            <div class="main-contain">
                <monitor-point v-if="currentNode?.level === 2" :node="currentNode" />
                <empty v-else class-name="empty" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue';
import {queryRtuListExceptPoints} from '@/modules/main/capture/point/point.service';
import MonitorPoint from '@/modules/main/capture/monitor/monitor-point.vue';
import Empty from '@/common/empty.vue';

const treeData = ref<any[]>([]);
const currentNode = ref();
const currentKey = ref('');
const treeRef = ref();

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

            const firstDevice = treeData.value.find(rtu => rtu.device?.length)?.device?.[0];
            if (firstDevice) {
                currentKey.value = firstDevice.key;
                nextTick(() => {
                    const node = treeRef.value?.getNode?.(firstDevice.key);
                    if (node) {
                        currentNode.value = node;
                        treeRef.value?.setCurrentKey?.(firstDevice.key);
                    }
                });
            }
        }
    });
};

onMounted(() => {
    initRtuList();
});

const handleNodeClick = (_data: any, node: any) => {
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
    display: flex;
    flex-direction: column;
}

.empty {
    height: 100%;
    background: transparent;
}
</style>
