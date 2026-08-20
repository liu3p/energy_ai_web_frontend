<template>
    <cv-drawer
        v-model="visible"
        :title="t('fw.strategyManagement.configParams')"
        size="800"
        @close="cancel"
    >
        <cv-table :data="dataSource" class="table-container" row-key="id">
            <cv-table-column prop="name" :label="t('fw.strategyManagement.name')" width="120" />
            <cv-table-column prop="desc" :label="t('fw.strategyManagement.description')" width="120" />
            <cv-table-column prop="type" :label="t('fw.strategyManagement.dataType')" width="120" />
            <cv-table-column prop="max" :label="t('fw.strategyManagement.max')" width="120" />
            <cv-table-column prop="min" :label="t('fw.strategyManagement.min')" width="120" />
            <cv-table-column prop="value" :label="t('fw.strategyManagement.value')">
                <template #default="scope">
                    <cv-input-number v-if="scope.row.min && scope.row.max" 
                                     v-model="scope.row.value"
                                     :min="scope.row.min" 
                                     :max="scope.row.max" 
                                     @change="(val) => { scope.row.value = Number(Number(val).toFixed(2)) }" />
                    <cv-input v-else v-model="scope.row.value" />
                </template>
            </cv-table-column>
        </cv-table>
        <template #footer>
            <cv-button @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
            <cv-button type="primary" @click="submit">{{ t('fw.common.sure') }}</cv-button>
        </template>
    </cv-drawer>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {ref} from 'vue';
import StrategicManagementService from '@/modules/main/agc/strategy/strategic-management.service';

const {t} = useLocale();

const visible = ref(false);
const disabled = ref(false);
const dataSource = ref([]);
const strategyName = ref('');


const open = (name: string, active: boolean) => {
    disabled.value = active;
    visible.value = true;
    strategyName.value = name;
    StrategicManagementService.getStrategyParams(name).then(res => {
        if (res.state) {
            dataSource.value = res.data;
        }
    });
};
const cancel = () => {
    visible.value = false;
};
const convertValueToString = (items: any[]) => {
    return items.map(item => ({
        ...item,
        value: String(item.value)
    }));
};
const submit = () => {
    StrategicManagementService.updateStrategyParams(strategyName.value, convertValueToString(dataSource.value)).then(res => {
        if (res.state) {
            CvMessage.success(t('fw.common.operateSuccess'));
            cancel();
        }
    });

};

defineExpose({
    open,
    cancel,
});
</script>

<style lang="scss" scoped>
.form-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    row-gap: 8px;
}

.w-cm {
    width: 200px;
}

.unit {
    margin-left: 4px;
    color: #707083;
}

.table-container {
    width: 100%;
    height: 100%;
    border: none;
}
</style>