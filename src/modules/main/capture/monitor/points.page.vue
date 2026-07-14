<template>
    <div class="container">
        <cv-table :data="data" class="table-container" row-key="no">
            <cv-table-column prop="index" label="序号" width="80" fixed>
                <template #default="{$index}">
                    <span>{{ $index + 1 }}</span>
                </template>
            </cv-table-column>
            <cv-table-column prop="pointID" label="OID" width="160" />
            <cv-table-column prop="name" label="参数名称"></cv-table-column>
            <template v-if="['analog', 'digital', 'pulse'].includes(active)">
                <cv-table-column prop="rawvalue" label="原始值"></cv-table-column>
                <cv-table-column prop="currvalue" label="当前值"></cv-table-column>
                <cv-table-column prop="dead" label="死数"></cv-table-column>
                <cv-table-column prop="quality" label="品质位"></cv-table-column>
                <cv-table-column prop="sendtime" label="刷新时间"></cv-table-column>
            </template>
            <template v-if="['regulate', 'control'].includes(active)">
                <cv-table-column prop="rawvalue" label="下发值"></cv-table-column>
                <cv-table-column prop="ctlvalue" label="前置控制值"></cv-table-column>
                <cv-table-column label="操作">
                    <template #default="{row}">
                        <cv-button type="primary" text @click="monitor(row)">下发</cv-button>
                    </template>
                </cv-table-column>
            </template>
            <template v-if="active === 'attribute'">
                <cv-table-column prop="currvalue" label="属性值"></cv-table-column>
                <cv-table-column prop="dead" label="死数"></cv-table-column>
                <cv-table-column prop="sendtime" label="刷新时间"></cv-table-column>
            </template>
        </cv-table>
        <cv-pagination
            layout="->,total,sizes,prev, pager, next,jumper"
            :page-sizes="[10, 20, 30, 40, 50]"
            :total="pageTotal"
            :current-page="currentPage"
            :page-size="pageSize"
            style="margin-top: 10px"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
        >
        </cv-pagination>
    </div>
    <cv-dialog-form
        v-model="visible"
        :title="title"
        ref="dialogForm"
        v-model:form-model="formData"
        :rules="rules"
        :submit="submit"
        width="428px"
        submitText="确定"
        label-position="top"
        style="padding: 0 24px"
    >
        <cv-form-item label="设备名称：" prop="deviceName">
            <cv-input disabled v-model="props.deviceName"></cv-input>
        </cv-form-item>
        <cv-form-item label="参数名称：" prop="name">
            <cv-input disabled v-model="formData.name"></cv-input>
        </cv-form-item>
        <cv-form-item label="下发值：" prop="value">
            <cv-input-number
                v-if="active === 'regulate'"
                v-model="formData.value"
                style="width: 100%"
            ></cv-input-number>
            <cv-select v-if="active === 'control'" v-model="formData.value">
                <cv-option :value="1">控合</cv-option>
                <cv-option :value="0">控分</cv-option>
            </cv-select>
        </cv-form-item>
        <cv-form-item label="登录密码：" prop="checkpwd">
            <cv-input type="password" show-password v-model="formData.checkpwd"></cv-input>
        </cv-form-item>
    </cv-dialog-form>
</template>

<script setup lang="ts">
import {computed, reactive, toRefs, ref} from 'vue';
import {monitorControl, monitorRegulate} from '@/modules/main/capture/monitor/monitor.service';

const props = defineProps<{
    active: string;
    rid: string;
    did: string;
    deviceName: string;
    data: any[];
    pageTotal: number;
}>();

const emit = defineEmits<{
    (e: 'page-change', pageInfo: {currentPage: number; pageSize: number}): void;
}>();

const rules = {
    value: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ],
    checkpwd: [
        {
            required: true,
            message: '请输入',
            trigger: 'blur',
        },
    ],
};
const pages = reactive({
    currentPage: 1,
    pageSize: 10,
});

const {currentPage, pageSize} = toRefs(pages);
const visible = ref(false);
const formData = ref<
    Partial<{
        pid: string;
        value: string;
        name: string;
        checkpwd: string;
    }>
>({});
const title = computed(() => {
    if (props.active === 'regulate') return '下发遥调';
    else if (props.active === 'control') return '下发遥控';
});

const monitor = (records: any) => {
    const {pointID, ctlvalue, name} = records;
    visible.value = true;
    formData.value.value = ctlvalue;
    formData.value.name = name;
    formData.value.pid = pointID;
};
const handleCurrentChange = (val: number) => {
    pages.currentPage = val;
    emit('page-change', {currentPage: val, pageSize: pages.pageSize});
};
const handleSizeChange = (val: number) => {
    pages.pageSize = val;
    emit('page-change', {currentPage: pages.currentPage, pageSize: val});
};
const initPage = (pageInfo?: {currentPage?: number; pageSize?: number}) => {
    pages.currentPage = pageInfo?.currentPage ?? 1;
    pages.pageSize = pageInfo?.pageSize ?? 10;
};
const cancel = () => {
    visible.value = false;
    formData.value = {};
};
const submit = async () => {
    const {did, rid} = props;
    const {checkpwd, pid, value} = formData.value;
    console.log(rid, did, checkpwd, pid);
    const data = {value, checkpwd};
    let res: any;
    if (props.active === 'regulate') res = await monitorRegulate(rid, did, pid!, data);
    else if (props.active === 'control') res = await monitorControl(rid, did, pid!, data);
    if (res.state) {
        CvMessage.success('操作成功');
        cancel();
    }
};

defineExpose({
    initPage,
});
</script>

<style scoped lang="scss">
.cv-form-item {
    margin-bottom: 12px !important;
}
.container {
    width: 100%;
    height: 100%;
}

.table-container {
    width: 100%;
    height: calc(100% - 64px);
    border: none;
}
</style>
