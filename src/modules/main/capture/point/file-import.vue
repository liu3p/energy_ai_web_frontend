<template>
    <cv-dialog v-model="visible" :title="t('fw.common.import')" size="small" width="420" @close="cancel">
        <div class="tips">
            <div class="tips-item">
                <span>导入说明：只支持上传 <span style="color: #3162e1">.xls .xlsx</span> 文件</span>
                <cv-button class="download-temp" @click="downloadFile">下载模版</cv-button>
            </div>
            <div class="tips-warn">
                <span>注意：导入成功后，将清空该设备下原有的所有点位数据。</span>
            </div>
        </div>
        <cv-upload
            ref="uploadRef"
            action="#"
            :limit="1"
            :auto-upload="false"
            accept=".xls,.xlsx"
            :on-change="changeFile"
        >
        </cv-upload>
        <template #footer>
            <span class="dialog-footer">
                <cv-button @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
                <cv-button type="primary" @click="submit">{{ t('fw.common.confirm') }}</cv-button>
            </span>
        </template>
    </cv-dialog>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {getConfig} from '@/common/config_util';

const {t} = useLocale();
const emits = defineEmits(['submit']);

const uploadRef = ref();
const visible = ref(false);
const selectedFile = ref<File | null>(null);

const changeFile = (file: any) => {
    file.status = 'success';
    selectedFile.value = file.raw;
};

const submit = () => {
    if (selectedFile.value) {
        emits('submit', selectedFile.value);
    }
    cancel();
};

const cancel = () => {
    visible.value = false;
    selectedFile.value = null;
    uploadRef.value.clearFiles();
};

const open = () => {
    visible.value = true;
};

const downloadFile = () => {
    window.open(getConfig('FILE_URL') + 'template.xlsx');
};

defineExpose({open});
</script>
<style scoped lang="scss">
.tips {
    width: 100%;
    padding: 8px 12px;
    box-sizing: border-box;
    margin-bottom: 16px;
    color: #576381;
    border-radius: 4px;
    background: #f3f6f8;

    .tips-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .tips-warn {
        margin-top: 8px;
        color: #f79900;
    }
}

.download-temp {
    border-radius: 4px;
    border: 1px solid #3162e1;
    color: #3162e1;
    font-weight: normal;
}
</style>
