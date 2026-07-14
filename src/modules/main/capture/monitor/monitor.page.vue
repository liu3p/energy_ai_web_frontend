<template>
    <div class="container">
        <div class="side-tree__wrapper">
            <collapse-slider v-model="collapse" :width="sliderProps.width" :collapse-width="sliderProps.collapseWidth">
                <cv-tree
                    ref="treeRef"
                    node-key="key"
                    :data="treeData"
                    :props="{
                        children: 'device',
                        label: 'name',
                    }"
                    default-expand-all
                    @node-click="handleNodeClick"
                >
                    <template #default="{node, data}">
                        <div class="custom-tree-node">
                            <span class="custom-tree-node-label">{{ node.label }}</span>
                            <!-- <span v-if="node.level === 1" class="custom-tree-node-status"></span> -->
                        </div>
                    </template>
                </cv-tree>
            </collapse-slider>
        </div>
        <div class="main-contain">
            <monitor-report :node="currentNode" :rid="currentNode.data.id" v-if="currentNode?.level === 1" />
            <monitor-point :node="currentNode" v-else-if="currentNode?.level === 2" />
            <empty class-name="empty" v-else />
        </div>
    </div>
</template>
<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import CollapseSlider from '@/common/collapse-slider.vue';
import MonitorReport from '@/modules/main/capture/monitor/monitor-report.vue';
import {queryRtuListExceptPoints} from '@/modules/main/capture/point/point.service';
import MonitorPoint from '@/modules/main/capture/monitor/monitor-point.vue';
import Empty from '@/common/empty.vue';

const sliderProps = {
    collapseWidth: '48px',
    width: '300px',
};
const sliderWidth = computed(() => {
    return collapse.value ? sliderProps.collapseWidth : sliderProps.width;
});
const collapse = ref(false);
const treeData = ref<any[]>([]);
const currentNode = ref();
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

.custom-tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 8px;
}

.custom-tree-node-label {
    flex: 1;
}

.custom-tree-node-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ccc;
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
    width: calc(100% - $gap - $sliderWidth);
}

.empty {
    background: #fff;
}
</style>
