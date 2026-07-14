<template>
    <div class="rtu-container">
        <cv-form ref="ruleFormRef" :rules="rules" :inline="true" :model="formData">
            <div class="rtu-contain__header">
                <span>基础信息</span>
                <div>
                    <cv-form-item style="margin: 0 4px">
                        <cv-button size="mini" @click="save">保存</cv-button>
                    </cv-form-item>
                    <cv-form-item style="margin: 0 4px">
                        <cv-button type="primary" size="mini" @click="publicNotify">发布</cv-button>
                    </cv-form-item>
                </div>
            </div>
            <div class="rtu-contain__center">
                <cv-form-item label="通道组名称" prop="name">
                    <cv-input v-model.trim="formData.name" :controls="false" class="w-cm" />
                </cv-form-item>
                <cv-form-item label="通道组ID">
                    <cv-input v-model="formData.id" disabled></cv-input>
                </cv-form-item>
                <cv-form-item label="是否转发厂站" prop="fortransfer">
                    <cv-switch v-model="formData.fortransfer" active-value="1" inactive-value="0"
                               style="width: 100px;" />
                </cv-form-item>
                <cv-form-item label="关联RTU" prop="stationid">
                    <cv-select
                        v-model="formData.stationid"
                        filterable
                        style="width: 260px;"
                    >
                        <cv-option
                            v-for="item in options"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </cv-select>
                </cv-form-item>
            </div>
        </cv-form>
    </div>
</template>
<script setup lang="ts">
import {ref, reactive, watch} from 'vue';
import {notifyReload} from '@/modules/main/capture/channel/channel.service';

const emit = defineEmits(['submit']);
const props = defineProps<{
    data: {name: string, fortransfer: string, stationid: string, id?: string},
    options: {
        id: string;
        name: string;
    }[]
}>();

const ruleFormRef = ref();
const rules = reactive({
    name: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ],
    fortransfer: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ],
    stationid: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ],
});
const formData = ref<{
    id?: string;
    name: string;
    fortransfer: string;
    stationid: string;
}>({
    name: '',
    fortransfer: '',
    stationid: '',
});
const save = () => {
    ruleFormRef.value.validate((valid: any) => {
        if (valid) {
            emit('submit', formData.value);
        }
    });

};

const publicNotify = () => {
    notifyReload().then(res => {
        if (res.state) {
            CvMessage.success('操作成功');
        } else CvMessage.error(res.data.msg);
    });
};

watch(() => props.data, (records: any) => {
    const {id, name, model} = records;
    const params = {
        id, name, fortransfer: '', stationid: '',
    };
    model?.Parameters?.map((item: {name: string; value: string}) => {
        if (item.name === 'FOR_TRANSFER') params.fortransfer = item.value;
        else if (item.name === 'STATION_BASE_ID') params.stationid = item.value;
    });
    formData.value = params;
}, {immediate: true});
</script>
<style scoped lang="scss">
.rtu-container {
    width: 100%;
    height: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
}

.rtu-contain__header {
    height: 48px;
    background: #fff;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EBEBEB;
}

.rtu-contain__center {
    padding: 16px;
    background: #fff;
    height: calc(100% - 48px);
    overflow: hidden;
}

.bold-text {
    color: #35353E;
    font-weight: bold;
}

</style>