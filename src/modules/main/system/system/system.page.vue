<template>
    <div class="container">
        <div class="device-param" style="height: 138px">
            <div class="device-param__header">
                <span>设备参数</span>
                <span>
                    <cv-button v-if="disabled" @click="disabled = false">编辑</cv-button>
                    <cv-button v-if="!disabled" @click="disabled = true">取消</cv-button>
                    <cv-button v-if="!disabled" @click="save">保存</cv-button>
                </span>
            </div>
            <div class="device-param__contain">
                <div class="form-item">
                    <div class="label">序列号</div>
                    <div class="form-wrap">
                        <cv-input v-model="formData.sn" :disabled="disabled" />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">设备型号</div>
                    <div class="form-wrap">
                        <cv-input v-model="formData.modelnum" :disabled="disabled" />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">主机名</div>
                    <div class="form-wrap">
                        <cv-input v-model="formData.hostname" :disabled="disabled" />
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">当前时间</div>
                    <div class="form-wrap">
                        <cv-date-picker
                            v-model="formData.timeinfo.time"
                            type="datetime"
                            :disabled="true"
                            @change="changeCurTime"
                            @visible-change="dateVisibleChange"
                            style="width: 100%"
                        ></cv-date-picker>
                    </div>
                </div>
                <div class="form-item">
                    <div class="label">时区</div>
                    <div class="form-wrap">
                        <cv-select
                            v-model="formData.timeinfo.zone"
                            filterable
                            :filter-method="filterMethod"
                            :disabled="disabled"
                        >
                            <cv-option v-for="item in doneZoneOptions" :key="item" :label="item"
                                       :value="item"></cv-option>
                        </cv-select>
                    </div>
                </div>
            </div>
        </div>
        <report-log></report-log>
    </div>
</template>
<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {zoneOptions} from '@/modules/main/system/system/zone';
import ReportLog from '@/modules/main/system/system/report-log.vue';
import {getSystemInfo, updateSystemInfo} from '@/modules/main/system/system/system.service';
import moment from 'moment';

let timer: any;
const formData = ref<Partial<{
    sn: string;
    addr: string;
    name: string;
    modelnum: string;
    hostname: string;
    timeinfo: {
        time: string;
        zone: string;
    }
}>>({
    timeinfo: {time: '', zone: ''},
});
const doneZoneOptions = ref(zoneOptions);
const disabled = ref(true);

function filterMethod(v: string) {
    doneZoneOptions.value = zoneOptions.filter(item => (item?.toLowerCase())?.search(v?.toLowerCase()) !== -1);
}

const init = () => {
    getSystemInfo().then(res => {
        if (res.state) {
            formData.value = res.data;
            timer = setInterval(() => {
                formData.value.timeinfo!.time = moment(formData.value.timeinfo!.time).add('s', 1).format('YYYY-MM-DD HH:mm:ss');
            }, 1000);
        }
    });
};
const save = () => {
    updateSystemInfo(formData.value).then(res => {
        if (res.state) {
            init();
            disabled.value = true;
            CvMessage.success('操作成功');
        } else CvMessage.error(res.data.msg);
    });
};

onMounted(() => {
    init();
});

onUnmounted(() => {
    clearInterval(timer);
});

</script>
<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
}

.device-param {
    width: 100%;
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
}
</style>