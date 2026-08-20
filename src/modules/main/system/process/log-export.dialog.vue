<template>
    <cv-dialog v-model="visible" :title="t('fw.systemPages.logExport')" width="600px" @close="cancel">
        <div class="log-list-container">
            <cv-table ref="tableRef" :data="logList" style="width: 100%" @selection-change="handleSelectionChange">
                <cv-table-column type="selection" width="55" />
                <cv-table-column prop="name" :label="t('fw.systemPages.logFileName')" />
                <cv-table-column prop="size" :label="t('fw.systemPages.size')">
                    <template #default="{row}">
                        <span>{{ Utils.formatFileSize(row.size) }}</span>
                    </template>
                </cv-table-column>
            </cv-table>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <cv-button @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
                <cv-button
                    type="primary"
                    :disabled="selectedFiles.length === 0"
                    :loading="exportLoading"
                    @click="handleExport"
                >
                    {{ t('fw.systemPages.batchExportWithCount').replace('{count}', String(selectedFiles.length)) }}
                </cv-button>
            </span>
        </template>
    </cv-dialog>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import {getProcessLogList, downloadProcessLogs} from './process.service';
import {CvMessage, useLocale} from 'cloudview.ui-next';
import Utils from '@/common/utils';

const {t} = useLocale();

const visible = ref(false);
const logList = ref<any[]>([]);
const selectedFiles = ref<any[]>([]);
const tableRef = ref();
const currentProcessName = ref('');
const exportLoading = ref(false);

const handleSelectionChange = (rows: any[]) => {
    selectedFiles.value = rows;
};

const handleExport = async () => {
    exportLoading.value = true;
    try {
        const fileNames = selectedFiles.value.map(file => file.name);
        const res = await downloadProcessLogs(fileNames);
        if (res?.data) {
            const blob = new Blob([res.data], {type: 'application/zip'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentProcessName.value}_logs.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            CvMessage.success(t('fw.systemPages.exportSubmitted'));
            cancel();
        } else {
            CvMessage.error(t('fw.systemPages.exportFailed'));
        }
    } finally {
        exportLoading.value = false;
    }
};

const cancel = () => {
    visible.value = false;
    logList.value = [];
    selectedFiles.value = [];
};

const open = async (processName: string) => {
    currentProcessName.value = processName;
    visible.value = true;
    const res = await getProcessLogList(processName);
    if (res.state) {
        const data = res.data || {};
        const files: string[] = data.files || [];
        const sizes: number[] = data.sizes || [];
        logList.value = files.map((name, index) => ({
            name,
            size: sizes[index] || 0,
        }));
    } else {
        CvMessage.error(res.data.msg || t('fw.systemPages.getLogListFailed'));
    }
};

defineExpose({open});
</script>
<style scoped lang="scss">
.log-list-container {
    max-height: 400px;
    overflow-y: auto;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>
