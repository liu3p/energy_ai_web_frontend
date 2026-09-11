<template>
    <div class="device-stats">
        <div class="device-stats__summary">
            <div class="device-stats__title">{{ t('fw.systemPages.deviceStats') }}</div>
            <div class="device-stats__ratio">
                <span class="device-stats__ratio-online">{{ systemDevice.connectCount ?? '-' }}</span>
                <span class="device-stats__ratio-sep">/</span>
                <span>{{ systemDevice.deviceTotal ?? '-' }}</span>
            </div>
            <div class="device-stats__ratio-label">{{ t('fw.systemPages.rtuOnlineTotal') }}</div>
        </div>

        <section class="device-stats__block device-stats__block--online">
            <div class="device-stats__block-head">
                <span class="device-stats__dot device-stats__dot--online"></span>
                <span class="device-stats__block-title">{{ t('fw.systemPages.onlineDevices') }}</span>
                <span class="device-stats__count">{{ systemDevice.onlineDevices.length }}</span>
            </div>
            <ul v-if="systemDevice.onlineDevices.length" class="device-stats__list">
                <li v-for="(item, i) in systemDevice.onlineDevices" :key="`online-${i}`" class="device-stats__item">
                    {{ formatDeviceLabel(item) }}
                </li>
            </ul>
            <div v-else class="device-stats__empty">{{ t('fw.systemPages.none') }}</div>
        </section>

        <section class="device-stats__block device-stats__block--offline">
            <div class="device-stats__block-head">
                <span class="device-stats__dot device-stats__dot--offline"></span>
                <span class="device-stats__block-title">{{ t('fw.systemPages.offlineDevices') }}</span>
                <span class="device-stats__count">{{ systemDevice.offlineDevices.length }}</span>
            </div>
            <ul v-if="systemDevice.offlineDevices.length" class="device-stats__list">
                <li v-for="(item, i) in systemDevice.offlineDevices" :key="`offline-${i}`" class="device-stats__item">
                    {{ formatDeviceLabel(item) }}
                </li>
            </ul>
            <div v-else class="device-stats__empty">{{ t('fw.systemPages.none') }}</div>
        </section>
    </div>
</template>
<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {WebsocketClass} from '@/common/websocket/websocket.class';
import {initDeviceWebsocket} from '@/modules/main/system/monitor/monitor.service';

const {t} = useLocale();

type DeviceRtu = {
    rtuname?: string;
    device?: string[];
    connected?: number;
};

const deviceSocket = ref<WebsocketClass>();
const systemDevice = ref<{
    connectCount: number;
    deviceTotal: number;
    onlineDevices: DeviceRtu[];
    offlineDevices: DeviceRtu[];
}>({
    connectCount: 0,
    deviceTotal: 0,
    onlineDevices: [],
    offlineDevices: [],
});

function formatDeviceLabel(item: DeviceRtu) {
    const name = item.rtuname || '-';
    if (!item.device?.length) return name;
    return `${name}（${item.device.join('、')}）`;
}

function onDeviceMessage(data: any) {
    if (data) {
        const response = JSON.parse(data) ?? [];
        const onlineDevices: DeviceRtu[] = [];
        const offlineDevices: DeviceRtu[] = [];
        response.forEach((rtu: DeviceRtu) => {
            if (rtu.connected !== 0) {
                onlineDevices.push(rtu);
            } else {
                offlineDevices.push(rtu);
            }
        });
        systemDevice.value = {
            connectCount: onlineDevices.length,
            deviceTotal: response.length ?? 0,
            onlineDevices,
            offlineDevices,
        };
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
    padding: 4px;
    color: #5c6373;
    font-size: 13px;
    line-height: 1.5;
}

.device-stats__summary {
    padding: 12px 14px 16px;
    margin-bottom: 12px;
    border-radius: 8px;
    background: #f2f4f7;
}

.device-stats__title {
    color: #35353e;
    font-size: 15px;
    font-weight: 700;
    line-height: 22px;
}

.device-stats__ratio {
    margin-top: 8px;
    color: #35353e;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
}

.device-stats__ratio-online {
    color: #1da500;
}

.device-stats__ratio-sep {
    margin: 0 4px;
    color: #98a0b3;
    font-weight: 500;
}

.device-stats__ratio-label {
    margin-top: 2px;
    color: #8b92a3;
    font-size: 12px;
}

.device-stats__block {
    padding: 12px 14px;
    border-radius: 8px;
    margin-bottom: 12px;

    &:last-child {
        margin-bottom: 0;
    }

    &--online {
        background: rgba(29, 165, 0, 0.08);
        border: 1px solid rgba(29, 165, 0, 0.18);
    }

    &--offline {
        background: rgba(255, 77, 79, 0.08);
        border: 1px solid rgba(255, 77, 79, 0.18);
    }
}

.device-stats__block-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.device-stats__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &--online {
        background: #1da500;
    }

    &--offline {
        background: #ff4d4f;
    }
}

.device-stats__block-title {
    color: #35353e;
    font-size: 13px;
    font-weight: 600;
}

.device-stats__count {
    margin-left: auto;
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    border-radius: 11px;
    background: rgba(53, 53, 62, 0.08);
    color: #5c6373;
    font-size: 12px;
    font-weight: 600;
    line-height: 22px;
    text-align: center;
}

.device-stats__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.device-stats__item {
    padding: 8px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.72);
    color: #35353e;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    word-break: break-all;
}

.device-stats__empty {
    padding: 10px 12px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.55);
    color: #98a0b3;
    font-size: 13px;
    line-height: 20px;
}
</style>
