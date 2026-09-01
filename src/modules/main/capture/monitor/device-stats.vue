<template>
    <div class="device-stats">
        <cv-scrollbar height="100%">
            <h1 class="bold-text">{{ t('fw.systemPages.deviceStats') }}</h1>
            <div class="bold-text">{{ systemDevice.connectCount ?? '-' }} /
                {{ systemDevice.deviceTotal ?? '-' }}
            </div>
            <div style="margin-top: 8px;">{{ t('fw.systemPages.rtuOnlineTotal') }}</div>
            <div class="bold-text">
                <p v-for="(item, i) in systemDevice.device" :key="i">{{ item.rtuname }}
                    <span v-if="item.device?.length">（
                        <span v-for="(dev, ci) in item.device" :key="ci">{{ dev }}
                            <i v-if="ci !== item.device.length - 1">、</i>
                        </span>
                    ）</span>
                </p>
            </div>
            <div style="margin-top: 8px;">{{ t('fw.systemPages.offlineDevices') }}</div>
        </cv-scrollbar>
    </div>
</template>
<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {WebsocketClass} from '@/common/websocket/websocket.class';
import {initDeviceWebsocket} from '@/modules/main/system/monitor/monitor.service';

const {t} = useLocale();

const deviceSocket = ref<WebsocketClass>();
const systemDevice = ref<{
    connectCount: number;
    deviceTotal: number;
    device: any[];
}>({
    connectCount: 0,
    device: [],
    deviceTotal: 0,
});

function onDeviceMessage(data: any) {
    if (data) {
        const response = JSON.parse(data) ?? [];
        const deviceAccount = {
            connectCount: 0,
            deviceTotal: response.length ?? 0,
            device: [] as any[],
        };
        response.map(rtu => {
            if (rtu.connected === 1) {
                deviceAccount.connectCount += 1;
            } else if (rtu.connected === 0) {
                deviceAccount.device.push(rtu);
            }
        });
        systemDevice.value = deviceAccount;
    }
}

onMounted(async () => {
    deviceSocket.value = await initDeviceWebsocket();
    deviceSocket.value.connect();
    deviceSocket.value.onMessage(onDeviceMessage);
});

onUnmounted(() => {
    deviceSocket.value?.offMessage(onDeviceMessage);
    deviceSocket.value?.close();
});
</script>
<style scoped lang="scss">
.device-stats {
    height: 100%;
    min-height: 280px;
    padding: 16px;
    border-radius: 6px;
    background: #EFF1F4;
    color: rgba(53, 53, 62, 0.6);
    font-size: 12px;
    line-height: 12px;
    overflow: hidden;
}

.bold-text {
    color: #35353E;
    font-size: 16px;
    font-weight: 700;
    line-height: 24px;
    margin-top: 6px;
}
</style>
