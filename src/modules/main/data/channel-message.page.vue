<template>
    <div class="channel-message main-body">
        <monitor-report />
    </div>
</template>

<script setup lang="ts">
import MonitorReport from '@/modules/main/capture/monitor/monitor-report.vue';
</script>

<style scoped lang="scss">
.channel-message {
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
}
</style>
