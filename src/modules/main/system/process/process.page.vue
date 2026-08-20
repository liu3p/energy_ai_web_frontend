<template>
    <div class="container">
        <div class="main-contain">
            <div class="process-contain">
                <div class="form-wrapper">
                    <div>
                        <span>{{ t('fw.monitor.search') }}{{ t('fw.common.colon') }} </span>
                        <cv-input v-model="filter.keywords" :placeholder="t('fw.systemPages.pleaseInputProcessName')" style="width: 200px" />
                    </div>
                    <cv-button type="primary" @click="reset(t('fw.systemPages.deviceRestart'))">{{ t('fw.systemPages.deviceRestart') }}</cv-button>
                </div>
                <div class="table-container">
                    <cv-table :data="filterData" style="width: 100%; border: none">
                        <cv-table-column type="index" prop="index" :label="t('fw.common.number')" width="100px" />
                        <cv-table-column prop="name" :label="t('fw.systemPages.processName')" width="600px" />
                        <cv-table-column prop="cpuusage" label="CPU">
                            <template #default="{row}">
                                <span>{{ row.cpuusage }}%</span>
                            </template>
                        </cv-table-column>
                        <cv-table-column prop="memused" :label="t('fw.systemPages.memory')">
                            <template #default="{row}">
                                <span>{{ row.memused }}MB</span>
                            </template>
                        </cv-table-column>
                        <cv-table-column prop="status" :label="t('fw.systemPages.status')">
                            <template #default="{row}">
                                <cv-tag v-if="row.status === 'Stopped'" type="danger">{{ t('fw.systemPages.stopped') }}</cv-tag>
                                <cv-tag v-else-if="row.status === 'Running'" type="success">{{ t('fw.systemPages.running') }}</cv-tag>
                            </template>
                        </cv-table-column>
                        <cv-table-column :label="t('fw.common.operation')" width="160px">
                            <template #default="{row}">
                                <cv-button
                                    type="primary"
                                    link
                                    v-if="row.status === 'Running'"
                                    @click="reset(t('fw.systemPages.processRestart'), row.id)"
                                >
                                    {{ t('fw.systemPages.processRestart') }}
                                </cv-button>
                                <cv-button type="primary" link @click="handleExportLog(row)">{{ t('fw.systemPages.logExport') }}</cv-button>
                            </template>
                        </cv-table-column>
                    </cv-table>
                </div>
            </div>
        </div>
        <confirm-pwd-dialog ref="pwdRef" :title="title" @submit="submit" />
        <log-export-dialog ref="logExportRef" />
    </div>
</template>
<script setup lang="ts">
import {onMounted, onUnmounted, ref, computed, reactive} from 'vue';
import {initWebsocket, resetProcess, resetReboot} from '@/modules/main/system/process/process.service';
import {WebsocketClass} from '@/common/websocket/websocket.class';
import ConfirmPwdDialog from '@/modules/main/system/process/confirm-pwd.dialog.vue';
import LogExportDialog from '@/modules/main/system/process/log-export.dialog.vue';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

const tableData = ref();
const pwdRef = ref();
const logExportRef = ref();
const socket = ref<WebsocketClass>();
const filter = reactive({
    keywords: '',
});
const title = ref('');

const filterData = computed(() => {
    if (!filter.keywords.trim()) return tableData.value;
    const searchTerm = filter.keywords.toLowerCase();
    return tableData.value.filter(item => {
        const fieldValue = item['name'];
        if (fieldValue == null) return false;
        const valueStr = String(fieldValue);
        const compareValue = valueStr.toLowerCase();
        return compareValue.includes(searchTerm);
    });
});
const onMessage = (data: any) => {
    if (data) {
        const response = JSON.parse(data);
        tableData.value = response;
    }
};

function closeSocket() {
    socket.value?.offMessage(onMessage);
    socket.value?.close();
}

const reset = (name: string, id?: string) => {
    pwdRef.value.open(id);
    title.value = name;
};

const handleExportLog = (row: any) => {
    logExportRef.value.open(row.name);
};
const submit = async (values: {password: string; id: string}) => {
    const {password, id} = values;
    let res: any;
    if (id) {
        res = await resetProcess(id, {
            checkpwd: password,
            op: 'restart',
        });
    } else {
        res = await resetReboot({
            checkpwd: password,
        });
    }
    if (res.state) {
        CvMessage.success(t('fw.common.operateSuccess'));
        pwdRef.value.close();
    } else {
        CvMessage.error(t('fw.common.operateFailed'));
    }
};
onMounted(async () => {
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
    width: 100%;
}

.process-contain {
    background: #fff;
    height: 100%;
    overflow: hidden;
}

.form-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 4px 16px;
    margin-top: 10px;
}

.table-container {
    width: 100%;
    height: calc(100% - 48px);
    padding: 16px;
}
</style>
