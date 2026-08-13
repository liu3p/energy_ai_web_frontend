<template>
    <div class="operation-strategy">
        <template v-if="sections.length">
            <strategy-section-panel
                v-for="section in sections"
                :key="section.id"
                :section="section"
                @dispatch="handleDispatch"
            />
        </template>
        <empty v-else class-name="operation-strategy__empty" />
        <dispatch-control-dialog
            ref="dispatchDialogRef"
            v-model="dispatchVisible"
            @success="handleDispatchSuccess"
        />
    </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import Empty from '@/common/empty.vue';
import StrategySectionPanel from './strategy-section-panel.vue';
import DispatchControlDialog from './dispatch-control-dialog.vue';
import type {DispatchTarget, StrategyRunValue, StrategySection} from './operation-strategy.types';
import {fetchStrategySections} from './operation-strategy.service';

const POLL_INTERVAL_MS = 3000;

const sections = ref<StrategySection[]>([]);
const dispatchVisible = ref(false);
const dispatchDialogRef = ref<InstanceType<typeof DispatchControlDialog>>();
let pollTimer: ReturnType<typeof setInterval> | null = null;
let loadingSections = false;

async function loadSections() {
    if (loadingSections) {
        return;
    }
    loadingSections = true;
    try {
        sections.value = await fetchStrategySections();
    } finally {
        loadingSections = false;
    }
}

function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => {
        void loadSections();
    }, POLL_INTERVAL_MS);
}

function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

function handleDispatch(sectionId: string, runValue: StrategyRunValue) {
    dispatchDialogRef.value?.open({sectionId, runValue});
}

function handleDispatchSuccess(target: DispatchTarget, value: string) {
    const section = sections.value.find(item => item.id === target.sectionId);
    const runValue = section?.runValues.find(item => item.fieldName === target.runValue.fieldName);
    if (runValue) {
        runValue.value = value;
    }
}

onMounted(() => {
    void loadSections();
    startPolling();
});

onUnmounted(() => {
    stopPolling();
});
</script>

<style scoped lang="scss">
.operation-strategy {
    height: 100%;
    overflow: auto;
}

.operation-strategy__empty {
    height: 100%;
    background: #fff;
    border-radius: 12px;
}
</style>
