<template>
    <div class="device-param">
        <div class="device-param__header">
            <span>软件版本</span>
            <span>
                       <cv-upload
                           ref="uploadRef"
                           v-loading="loading"
                           :limit="1"
                           :show-file-list="false"
                           :http-request="uploadFile"
                           :on-exceed="handleExceed"
                           style="width: 100px;"
                       >
                       <span style="font-weight: normal;">上传升级包</span>
                    </cv-upload>
                    <cv-progress
                        v-if="fileName"
                        style="width: 300px"
                        :percentage="percentage"
                        :status="status"
                    ></cv-progress>
                </span>
        </div>
        <div class="device-param__contain">
            <div class="form-item">
                <div class="label">版本号</div>
                <div class="form-wrap">
                    <cv-input :disabled="true" />
                </div>
            </div>
            <div class="form-item">
                <div class="label">升级包</div>
                <div class="form-wrap">
                    <cv-button type="primary" text>{{ fileName }}</cv-button>
                </div>
            </div>
        </div>
        <div class="device-param__log">
            <div class="label">更新日志</div>
            <div class="log-monitor">
                <cv-scrollbar class="log-console-box">
                    {{ uploadInfo }}
                    {{ log }}
                </cv-scrollbar>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import {updateRun, uploadPkg} from '@/modules/main/system/system/system.service';
import {useLocale} from 'cloudview.ui-next';
const {t} = useLocale();

const uploadRef = ref();
const uploadInfo = ref('');
const log = ref<string>('');
const loading = ref(false);
const percentage = ref(0);
const status = ref();
const fileName = ref();

async function uploadFile(options: any) {
    fileName.value = options.file.name;
    status.value = '';
    uploadInfo.value = '';
    const res = await uploadPkg(options.file, event => {
        percentage.value = ((event.loaded / event.total) * 100) | 0;
    });
    if (res.state && !res.data.error) {
        options.onSuccess(res.data);
        uploadInfo.value = res.data.msg;
        status.value = 'success';
        CvMessageBox.confirm(t('fw.updateMng.updateTips'), t('fw.updateMng.update'), {
            confirmButtonText: t('fw.updateMng.updateConfirm'),
            cancelButtonText: t('fw.common.cancel'),
            type: 'warning',
        })
            .then(() => {
                update();
            })
            .catch(() => {
                uploadInfo.value = '';
                fileName.value = '';
                uploadRef.value!.clearFiles();
            });
        return res.data;
    } else {
        status.value = 'exception';
        options.onError(new Error());
        CvMessage.error(t('fw.common.operateFailed'));
    }
}

async function update() {
    loading.value = true;
    log.value = '';
    updateRun()
        .then(response => {
            if (response.ok) {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder('utf-8');

                function readStream() {
                    reader?.read().then(({done, value}) => {
                        if (done) {
                            CvMessage.success(t('fw.updateMng.updateSuccess'));
                            loading.value = false;
                            return;
                        }
                        log.value += decoder.decode(value);
                        readStream(); // 递归读取剩余数据
                    });
                }

                readStream();
            } else {
                loading.value = false;
                CvMessage.error(t('fw.updateMng.updateFailed'));
            }
        })
        .catch(() => {
            loading.value = false;
        });
}

function handleExceed(files: any) {
    uploadRef.value!.clearFiles();
    const file = files[0];
    uploadRef.value!.elUpload.handleStart(file);
    uploadRef.value!.elUpload.submit();
}
</script>
<style scoped lang="scss">
.device-param {
    width: 100%;
    height: calc(100% - 138px - 16px);
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;

    &__header {
        height: 48px;
        background: #fff;
        padding: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #EBEBEB;
    }

    &__contain {
        background: #fff;
        height: 90px;
        padding: 16px;
        overflow: hidden;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 50px;

        .label {
            color: #1A1A1A;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 4px;
        }
    }

    &__log {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 16px;
        font-weight: bold;
        background: #fff;
    }
}

.log-monitor {
    flex: 1;
    margin-top: 8px;
    height: 100px;
    background: #000;
    overflow: hidden;
    color: #1DA500;
}

.log-console-box {
    flex: 1;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 400;
    padding: 16px;
    white-space: pre;

    &-info {
        margin-bottom: 16px;
    }
}
</style>