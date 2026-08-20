<template>
    <div class="main-contain">
        <div class="main-contain__center">
            <div class="form-wrapper">
                <cv-form ref="ruleFormRef" :model="formData" :rules="rules" inline>
                    <cv-form-item prop="processId" :label="t('fw.systemPages.processName') + t('fw.common.colon')">
                        <cv-select v-model="formData.processId" style="width: 240px">
                            <cv-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id" />
                        </cv-select>
                    </cv-form-item>
                    <cv-form-item>
                        <cv-button v-if="!connected" type="primary" @click="start">
                            {{ t('fw.systemPages.start') }}
                        </cv-button>
                        <cv-button v-else type="danger" @click="closeSocket">
                            {{ t('fw.systemPages.stop') }}
                        </cv-button>
                        <cv-button @click="clear">{{ t('fw.common.clear') }}</cv-button>
                    </cv-form-item>
                </cv-form>
            </div>
            <div class="content-report">
                <div class="content-report__header">
                    {{ t('fw.monitor.channelStatus') }}{{ t('fw.common.colon') }} <span v-if="connected" style="color: #1da500">{{ t('fw.monitor.connected') }}</span>
                    <span v-else style="color: #ff4d4f">{{ t('fw.monitor.disconnected') }}</span>
                </div>
                <div class="content-report__content">
                    <cv-scrollbar id="scroll_id" ref="scrollerRef" height="100%">
                        <p v-for="(item, i) in dataSource" :key="i">{{ item }}</p>
                    </cv-scrollbar>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {initWebsocket} from '@/modules/main/system/log/log.service';
import {initWebsocket as initProcessWebsocket} from '@/modules/main/system/process/process.service';
import {onMounted, onUnmounted, ref} from 'vue';
import {WebsocketClass} from '@/common/websocket/websocket.class';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

const rules = {
    processId: {
        required: true,
        trigger: 'change',
        message: t('fw.common.pleaseSelect'),
    },
};
const socket = ref<WebsocketClass>();
const processSocket = ref<WebsocketClass>();
const dataSource = ref<string[]>([]);
const scrollerRef = ref();
const connected = ref(false);
const options = ref([]);
const ruleFormRef = ref();
const formData = ref({
    processId: null,
});

const onMessage = (data: any) => {
    dataSource.value.push(data);
    // scrollerRef.value.update();
    const dom = document.getElementById('scroll_id')!.parentNode! as HTMLElement;
    const isBottom = Math.abs(dom.scrollHeight - dom.clientHeight - dom.scrollTop) < 1;
    if (!isBottom) {
        scrollerRef.value.setScrollTop(dom.scrollHeight);
    }
};
const onProcessMessage = (data: any) => {
    if (data) {
        const response = JSON.parse(data);
        options.value = response;
    }
};

function closeSocket() {
    socket.value?.offMessage(onMessage);
    socket.value?.close();
    connected.value = false;
}

function closeProcessSocket() {
    processSocket.value?.offMessage(onProcessMessage);
    processSocket.value?.close();
}

const clear = () => {
    dataSource.value = [];
};

const start = () => {
    ruleFormRef.value.validate(async (valid: any) => {
        if (valid) {
            socket.value = await initWebsocket(formData.value.processId!);
            socket.value.connect();
            socket.value.onMessage(onMessage);
            connected.value = true;
        }
    });
};
onMounted(async () => {
    processSocket.value = await initProcessWebsocket();
    processSocket.value.connect();
    processSocket.value.onMessage(onProcessMessage);
});
onUnmounted(() => {
    closeSocket();
    closeProcessSocket();
});
</script>
<style scoped lang="scss">
.main-contain {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
}

.main-contain__center {
    padding: 16px;
    background: #fff;
    height: 100%;
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

    :deep(.cv-form-item),
    :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 16px;
        vertical-align: middle;
    }
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
