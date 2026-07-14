<template>
    <div class="main-contain__header">报文</div>
    <div class="main-contain__center">
        <div class="form-wrapper">
            <cv-form :rules="rules" ref="ruleFormRef" :model="formData" inline>
                <cv-form-item label="通道：" prop="channel">
                    <cv-select v-model="formData.channel" style="width: 240px" size="large" @change="handleChange">
                        <cv-option v-for="item in channelOptions" :key="item.id" :label="item.name" :value="item.id" />
                    </cv-select>
                </cv-form-item>
                <cv-form-item label="协议：" prop="plugin">
                    <cv-select v-model="formData.plugin" style="width: 240px" size="large">
                        <cv-option v-for="item in pluginOptions" :key="item.id" :label="item.name" :value="item.id" />
                    </cv-select>
                </cv-form-item>
                <cv-form-item>
                    <cv-button v-if="!reportConnected" type="primary" @click="runReportSocket">启动</cv-button>
                    <cv-button v-if="reportConnected" type="danger" @click="stop">停止</cv-button>
                    <cv-button @click="clearBoard">清空</cv-button>
                </cv-form-item>
            </cv-form>
        </div>
        <div class="content-report">
            <div class="content-report__header">
                通道状态： <span style="color: #1da500" v-if="connected">已连接</span>
                <span style="color: #ff4d4f" v-else>未连接</span>
            </div>
            <div class="content-report__content">
                <cv-scrollbar id="scroll_id" ref="scrollerRef" height="100%" @scroll="onScroll">
                    <p v-for="(item, i) in dataSource" :key="i">{{ item }}</p>
                </cv-scrollbar>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {nextTick, onUnmounted, ref, watch} from 'vue';
import {WebsocketClass} from '@/common/websocket/websocket.class';
import {
    getChannelByRtu,
    initChannelReportWebsocket,
    initChannelStatusWebsocket,
} from '@/modules/main/capture/monitor/monitor.service';

const props = defineProps<{rid: string; node: any}>();

const rules = {
    channel: [
        {
            required: true,
            message: '请选择',
            trigger: 'change',
        },
    ],
    plugin: [
        {
            required: true,
            message: '请选择',
            trigger: 'change',
        },
    ],
};
const ruleFormRef = ref();
const socket = ref<WebsocketClass>();
const reportSocket = ref<WebsocketClass>();
const formData = ref<{
    channel: string;
    plugin: string;
}>({channel: '', plugin: ''});
const channelOptions = ref<{name: string; id: string; plugins: any[]}[]>();
const pluginOptions = ref<{name: string; id: string; plugins: any[]}[]>();
const channelId = ref();
const connected = ref(false);
const reportConnected = ref(false);
const dataSource = ref<string[]>([]);
const scrollerRef = ref();
const scrollTimer = ref<number | null>(null);

watch(
    () => props.node,
    () => {
        close();
        formData.value = {channel: '', plugin: ''};
        channelOptions.value = [];
        pluginOptions.value = [];
        initChannelList(props.rid);
    },
    {immediate: true}
);

function initChannelList(id: string) {
    getChannelByRtu(id).then(res => {
        if (res.state) {
            const {channel = []} = res.data;
            channelId.value = res.data.id;
            channelOptions.value = channel;
        }
    });
}

const handleChange = async (val: string) => {
    closeSocket();
    const row = channelOptions.value!.find(channel => channel.id === val)!;
    pluginOptions.value = row.plugins;
    connected.value = false;
    socket.value = await initChannelStatusWebsocket(channelId.value, row.id);
    socket.value.connect();
    socket.value.onMessage(onMessage);
};

function onMessage(data: any) {
    if (data) {
        const res = JSON.parse(data);
        connected.value = res.connected === 1;
    }
}

function onScroll() {
    if (scrollTimer.value) {
        clearTimeout(scrollTimer.value);
    }
    scrollTimer.value = window.setTimeout(() => {
        scrollTimer.value = null;
    }, 500);
}

function onReportMessage(data: any) {
    data = JSON.parse(data);
    dataSource.value.push(data);
    if (dataSource.value.length > 200) {
        dataSource.value = dataSource.value.slice(-200);
    }

    nextTick(() => {
        if (!scrollTimer.value) {
            const dom = document.getElementById('scroll_id')!.parentNode! as HTMLElement;
            scrollerRef.value.setScrollTop(dom.scrollHeight);
        }
    });
}

function closeReportSocket() {
    reportSocket.value?.offMessage(onMessage);
    reportSocket.value?.close();
}

function closeSocket() {
    socket.value?.offMessage(onMessage);
    socket.value?.close();
}

const runReportSocket = () => {
    ruleFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            closeReportSocket();
            const cgid = channelId.value;
            const cid = formData.value.channel;
            const pluginId = formData.value.plugin;
            reportSocket.value = await initChannelReportWebsocket(cgid, cid, pluginId);
            reportSocket.value.connect();
            reportSocket.value.onMessage(onReportMessage);
            reportConnected.value = true;
        }
    });
};
const clearBoard = () => {
    dataSource.value = [];
};
const stop = () => {
    reportConnected.value = false;
    closeReportSocket();
};

function close() {
    connected.value = false;
    reportConnected.value = false;
    dataSource.value = [];
    closeSocket();
    closeReportSocket();
}

onUnmounted(() => {
    close();
});
</script>
<style scoped lang="scss">
.cv-form-item {
    margin-bottom: 0 !important;
}

.main-contain__header {
    height: 48px;
    background: #fff;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ebebeb;
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

.form-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;
}

.content-report {
    width: 100%;
    height: calc(100% - 56px);

    &__header {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 12px 16px;
        background: #f3f3f5;
        border-radius: 8px 8px 0 0;
        border: 1px solid #d6d6d6;
        font-weight: bold;
    }

    &__content {
        height: calc(100% - 40px);
        padding: 16px;
        border-radius: 0 0 8px 8px;
        background: #000;
        overflow: hidden;
        color: #1da500;

        p {
            min-height: 26px;
        }
    }
}
</style>
