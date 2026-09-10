<template>
    <cv-dialog v-model="visible" :title="t('fw.capturePoint.selectPoint')" width="960" @close="onClose">
        <div class="pick-container">
            <cv-tabs v-model="activeType" :panes="panes" class="point-type-tabs" @tab-change="onTabChange" />

            <div class="filter-form">
                <div class="filter-form__item">
                    <span class="filter-form__label">RTU</span>
                    <cv-select
                        v-model="form.rid"
                        clearable
                        filterable
                        :placeholder="t('fw.common.pleaseSelect')"
                        style="width: 200px"
                        @change="onRtuChange"
                    >
                        <cv-option
                            v-for="rtu in rtuList"
                            :key="rtu.id"
                            :label="rtu.name"
                            :value="rtu.id"
                        />
                    </cv-select>
                </div>
                <div class="filter-form__item">
                    <span class="filter-form__label">{{ t('fw.capturePoint.device') }}</span>
                    <cv-select
                        v-model="form.did"
                        clearable
                        filterable
                        :placeholder="t('fw.common.pleaseSelect')"
                        style="width: 200px"
                        :disabled="!form.rid"
                    >
                        <cv-option
                            v-for="dev in deviceOptions"
                            :key="dev.id"
                            :label="dev.name"
                            :value="dev.id"
                        />
                    </cv-select>
                </div>
                <cv-button type="primary" @click="handleSearch">
                    {{ t('fw.common.search') }}
                </cv-button>
            </div>

            <cv-table border :data="tableData" height="360" class="point-table">
                <cv-table-column prop="id" :label="t('fw.capturePoint.col.oid')" min-width="180" />
                <cv-table-column prop="name" :label="t('fw.capturePoint.paramName')" min-width="200" />
                <cv-table-column :label="t('fw.common.operation')" width="120">
                    <template #default="{row}">
                        <cv-button
                            type="primary"
                            text
                            :disabled="actived === row.id"
                            @click="pickPoints(row)"
                        >
                            {{ t('fw.capturePoint.pick') }}
                        </cv-button>
                    </template>
                </cv-table-column>
            </cv-table>
        </div>
        <template #footer>
            <cv-button @click="visible = false">{{ t('fw.monitor.close') }}</cv-button>
        </template>
    </cv-dialog>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {CvMessage, useLocale} from 'cloudview.ui-next';
import {queryRtuListExceptPoints, queryDevicePoints} from '@/modules/main/capture/point/point.service';

type PointType = 'analog' | 'digital' | 'pulse' | 'control' | 'regulate';

const {t} = useLocale();
const emits = defineEmits(['submit']);

const visible = ref(false);
const trigger = ref(false);
const actived = ref();
const rtuList = ref<any[]>([]);
const tableData = ref<any[]>([]);
const activeType = ref<PointType>('analog');
const form = ref<{rid: string | number | ''; did: string | number | ''}>({
    rid: '',
    did: '',
});

const panes = computed(() => [
    {label: t('fw.monitor.pointType.analog'), name: 'analog'},
    {label: t('fw.monitor.pointType.digital'), name: 'digital'},
    {label: t('fw.monitor.pointType.pulse'), name: 'pulse'},
    {label: t('fw.monitor.pointType.control'), name: 'control'},
    {label: t('fw.monitor.pointType.regulate'), name: 'regulate'},
]);

const deviceOptions = computed(() => {
    const rtu = rtuList.value.find(item => String(item.id) === String(form.value.rid));
    return rtu?.device ?? [];
});

const loadRtuList = async () => {
    const res = await queryRtuListExceptPoints();
    if (res.state) {
        rtuList.value = res.data ?? [];
    }
};

const onRtuChange = () => {
    form.value.did = '';
    tableData.value = [];
};

const onTabChange = () => {
    tableData.value = [];
};

const handleSearch = async () => {
    if (!form.value.rid) {
        CvMessage.warning(`${t('fw.common.pleaseSelect')} RTU`);
        return;
    }
    if (!form.value.did) {
        CvMessage.warning(`${t('fw.common.pleaseSelect')}${t('fw.capturePoint.device')}`);
        return;
    }
    const res = await queryDevicePoints(String(form.value.rid), String(form.value.did), activeType.value);
    if (res.state) {
        tableData.value = res.data?.[activeType.value] ?? [];
    } else {
        tableData.value = [];
        CvMessage.error(t('fw.capturePoint.queryFailed'));
    }
};

const pickPoints = (records: any) => {
    emits('submit', records, trigger.value);
    visible.value = false;
};

const onClose = () => {
    visible.value = false;
    tableData.value = [];
    form.value = {rid: '', did: ''};
};

defineExpose({
    open(isTrigger: boolean, point: string, _isAgc?: boolean) {
        actived.value = point;
        trigger.value = !!isTrigger;
        activeType.value = isTrigger ? 'digital' : 'analog';
        form.value = {rid: '', did: ''};
        tableData.value = [];
        loadRtuList();
        visible.value = true;
    },
});
</script>

<style scoped lang="scss">
.pick-container {
    width: 90%;
    min-height: 520px;
    text-align: left;
    margin-left:5%;
}

.point-type-tabs {
    margin-bottom: 16px;

    :deep(.el-tabs__header),
    :deep(.cv-tabs__header) {
        margin: 0;
    }

    :deep(.el-tabs__nav-wrap),
    :deep(.cv-tabs__nav-wrap) {
        margin-left: 0;
    }
}

.filter-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;

    &__item {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    &__label {
        width: 40px;
        flex-shrink: 0;
        text-align: left;
        color: #606266;
        line-height: 32px;
    }
}

.point-table {
    width: 100%;

    :deep(.el-table) {
        --el-table-border-color: #ebeef5;
        --el-table-header-bg-color: #f5f7fa;
        --el-table-header-text-color: #909399;
    }

    :deep(.el-table th.el-table__cell) {
        background: #f5f7fa;
        font-weight: 500;
        color: #909399;
    }

    :deep(.el-table--border) {
        border: 1px solid #ebeef5;
    }
}
</style>
