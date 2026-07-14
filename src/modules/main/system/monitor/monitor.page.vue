<template>
    <div class="container">
        <div class="main-contain">
            <div class="main-contain__header">
                性能监控
            </div>
            <div class="monitor-contain">
                <div class="main-contain__left">
                    <div class="main-contain__left1">
                        <h1 class="bold-text">主机</h1>
                        <div class="bold-text">{{ systemInfo?.hostname ?? '-' }}</div>
                        <div>主机名</div>
                        <div class="bold-text">{{ systemInfo?.sn ?? '-' }}</div>
                        <div>序列号</div>
                        <div class="bold-text">{{ systemInfo?.modelnum ?? '-' }}</div>
                        <div>设备型号</div>
                        <div class="bold-text">{{ systemInfo?.version ?? '-' }}</div>
                        <div>软件版本号</div>
                    </div>
                    <div class="main-contain__left2">
                        <cv-scrollbar height="100%">
                            <h1 class="bold-text">设备统计</h1>
                            <div class="bold-text">{{ systemDevice.connectCount ?? '-' }} /
                                {{ systemDevice.deviceTotal ?? '-'
                                }}
                            </div>
                            <div style="margin-top: 8px;">RTU在线/总数</div>
                            <div class="bold-text">
                                <p v-for="(item,i) in systemDevice.device" :key="i">{{ item.rtuname }}
                                    <span v-if="item.device?.length">（
                                     <span v-for="(dev,ci) in item.device" :key="ci">{{ dev }}
                                        <i v-if="ci !== item.device.length - 1">、</i>
                                     </span>
                                ）</span>
                                </p>
                            </div>
                            <div style="margin-top: 8px;">离线设备</div>
                        </cv-scrollbar>
                    </div>
                </div>
                <div class="main-contain__center">
                    <div class="chart-block">
                        <h2 class="chart-block-title">CPU</h2>
                        <div class="chart-block-unit">利用率(%)</div>
                        <div class="chart-block-content">
                            <line-charts :data="cpuData!" />
                        </div>
                        <div class="chart-block-footer">
                            <div>
                                <h2 class="chart-block-title">{{ cpuData?.value }}%</h2>
                                <div class="chart-block-unit">利用率</div>
                            </div>
                            <div>
                                <h2 class="chart-block-title">{{ cpuData?.freq }}GHz</h2>
                                <div class="chart-block-unit">主频</div>
                            </div>
                        </div>
                    </div>
                    <div class="chart-block">
                        <h2 class="chart-block-title">内存</h2>
                        <div class="chart-block-unit">利用率(%)</div>
                        <div class="chart-block-content">
                            <line-charts :data="memData!" />
                        </div>
                        <div class="chart-block-footer">
                            <div>
                                <h2 class="chart-block-title">{{ memData?.value }}%</h2>
                                <div class="chart-block-unit">利用率</div>
                            </div>
                            <div>
                                <h2 class="chart-block-title">{{ memData?.memused }}/{{ memData?.memtotal }}GB</h2>
                                <div class="chart-block-unit">使用量/总量</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="main-contain__right">
                    <div class="main-contain__right1">
                        <h1 class="bold-text">系统磁盘</h1>
                        <div class="disc-wrapper"><span style="font-weight: bold;">{{ sysDisk?.used ?? '-' }} /</span>
                            {{ sysDisk?.total ?? '-' }}GB
                        </div>
                        <cv-progress :percentage="sysDisk?.ratio" :show-text="false" style="width: 100%;"
                                     :stroke-width="8" />
                    </div>
                    <!-- <div class="main-contain__right1">
                        <h1 class="bold-text">数据磁盘</h1>
                        <div class="disc-wrapper"><span style="font-weight: bold;">{{ dataDisk?.used ?? '-' }} /</span>
                            {{ dataDisk?.total ?? '-' }}GB
                        </div>
                        <cv-progress color="#1DA500" :percentage="dataDisk?.ratio" :show-text="false"
                                     style="width: 100%;" :stroke-width="8" />
                    </div> -->
                    <div class="main-contain__right2">
                        <cv-scrollbar height="100%">
                            <h1 class="bold-text">网络</h1>
                            <template v-for="(item,i) in networks" :key="i">
                                <div class="network-block">
                                    <div class="network-block-title">
                                        <cv-icon color="transparent" size="22">
                                            <icon-network v-if="item.type === 'wired'" />
                                            <icon-wifi v-if="item.type === 'wireless'" />
                                            <icon-signal v-if="item.type === 'cellular'" />
                                        </cv-icon>
                                        <span style="font-weight: bold;">{{ item.name }}</span>
                                    </div>
                                    <div class="network-block-second">{{ item.upspeed }}
                                        <cv-icon size="10" color="#3162E1">
                                            <cv-icon-up />
                                        </cv-icon>
                                    </div>
                                    <div class="network-block-third">{{ item.ipv4 || '-' }}
                                        <span>{{ item.downspeed }} <cv-icon size="10" color="#1DA500"><cv-icon-down /></cv-icon></span>
                                    </div>
                                </div>
                            </template>
                        </cv-scrollbar>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {ref, onUnmounted, onMounted} from 'vue';
import {IconNetwork, IconWifi, IconSignal} from '@/icons';
import {CvIconDown, CvIconUp} from 'cloudview.ui-next-icon';
import LineCharts from '@/modules/main/system/monitor/line-charts.vue';
import {initDeviceWebsocket, initWebsocket} from '@/modules/main/system/monitor/monitor.service';
import {WebsocketClass} from '@/common/websocket/websocket.class';
import moment from 'moment';
import {getSystemInfo} from '@/modules/main/system/system/system.service';

const cpuData = ref<{
    freq: string;
    value: string;
    point: string;
}>();
const memData = ref<{
    memtotal: string;
    memused: string;
    value: string;
    point: string;
}>();
const sysDisk = ref<{
    used: number;
    total: number;
    ratio: number;
}>();
const dataDisk = ref<{
    used: number;
    total: number;
    ratio: number;
}>();
const networks = ref<{
    ipv4: string;
    downspeed: string;
    upspeed: string;
    name: string;
    type: string;
}[]>();
const socket = ref<WebsocketClass>();
const deviceSocket = ref<WebsocketClass>();
const systemInfo = ref();
const systemDevice = ref<{
    connectCount: number;
    deviceTotal: number;
    device: any[];
}>({
    connectCount: 0,
    device: [],
    deviceTotal: 0,
});

function calculatePercentage(part: number, total: number) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
}

const onMessage = (data: any) => {
    if (data) {
        const response = JSON.parse(data);
        const {cpu: {cpufreq, cpuusage}, mem: {memtotal, memusage, memused}, disk: [disk1, disk2], nets} = response;
        networks.value = nets || [];
        sysDisk.value = {
            used: disk1.diskused,
            total: disk1.disktotal,
            ratio: calculatePercentage(disk1.diskused, disk1.disktotal),
        };
        dataDisk.value = {
            used: disk2?.diskused,
            total: disk2?.disktotal,
            ratio: calculatePercentage(disk2?.diskused, disk2?.disktotal),
        };
        cpuData.value = {
            freq: cpufreq,
            value: cpuusage,
            point: moment().format('HH:mm:ss'),
        };
        memData.value = {
            memtotal,
            memused,
            value: memusage,
            point: moment().format('HH:mm:ss'),
        };
    }
};

const onDeviceMessage = (data: any) => {
    if (data) {
        const response = JSON.parse(data) ?? [];
        const deviceAccount = {
            connectCount: 0,
            deviceTotal: response.length ?? 0,
            device: [],
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
};

function closeSocket() {
    deviceSocket.value?.offMessage(onDeviceMessage);
    deviceSocket.value?.close();
    socket.value?.offMessage(onMessage);
    socket.value?.close();
}

const init = () => {
    getSystemInfo().then(res => {
        if (res.state) {
            systemInfo.value = res.data;
        }
    });
};
onMounted(async () => {
    init();
    deviceSocket.value = await initDeviceWebsocket();
    deviceSocket.value.connect();
    deviceSocket.value.onMessage(onDeviceMessage);
    socket.value = await initWebsocket();
    socket.value.connect();
    socket.value.onMessage(onMessage);
});
onUnmounted(() => {
    closeSocket();
});

</script>
<style scoped lang="scss">
$gap: 24px;
.container {
    width: 100%;
    height: 100%;
    display: flex;
    gap: $gap;
}

.main-contain {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    width: 100%
}

.main-contain__header {
    height: 48px;
    background: #fff;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EBEBEB;
}

.monitor-contain {
    background: #fff;
    height: calc(100% - 48px);
    overflow: hidden;
    display: flex;
}

.main-contain__left {
    width: 286px;
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: rgba(53, 53, 62, 0.6);
    font-size: 12px;
    font-style: normal;
    line-height: 12px;
}

.main-contain__center {
    flex-grow: 1;
    padding: 16px;
    border-inline: 1px solid #EBEBEB;
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.main-contain__right {
    width: 286px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.main-contain__left1 {
    height: 254px;
    border-radius: 6px;
    background: #EFF1F4;
    display: flex;
    padding: 16px;
    gap: 2px;
    flex-direction: column;
}

.main-contain__left2 {
    height: calc(100% - 256px);
    display: flex;
    padding: 16px;
    flex-direction: column;
    gap: 12px;
    border-radius: 6px;
    background: #EFF1F4;
}

.main-contain__right1 {
    height: 108px;
    display: flex;
    padding: 16px;
    flex-direction: column;
    gap: 12px;
    border-radius: 6px;
    background: #EFF1F4;
}

.main-contain__right2 {
    flex: 1;
    height: 200px;
    display: flex;
    padding: 16px;
    flex-direction: column;
    gap: 12px;
    border-radius: 6px;
    background: #EFF1F4;
}

.bold-text {
    color: #35353E;
    font-size: 16px;
    font-weight: 700;
    line-height: 24px;
    margin-top: 6px;
}

.disc-wrapper {
    color: #000;
    font-size: 14px;
    line-height: 16px;
}

.network-block {
    color: #35353E;

    &-title {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 12px;
    }

    &-second {
        text-align: right;
    }

    &-third {
        margin-left: 24px;
        display: flex;
        justify-content: space-between;
    }
}

.chart-block {
    border-radius: 6px;
    border: 1px solid rgba(134, 134, 134, 0.24);
    width: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    &-title {
        padding: 8px;
        color: #35353E;
        font-size: 16px;
        font-weight: 700;
    }

    &-unit {
        padding: 0 8px;
        color: rgba(53, 53, 62, 0.6);
        font-size: 12px;
        font-weight: 400;
    }

    &-content {
        width: 100%;
        min-height: 200px;
        flex-grow: 1;
        border-radius: 6px;
        border: 1px solid #E2E2E2;
        border-left: none;
        border-right: none;
        margin: 4px 0;
    }

    &-footer {
        margin: 12px;
        display: flex;
        gap: 32px;
    }
}
</style>