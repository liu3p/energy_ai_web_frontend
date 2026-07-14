<template>
    <cv-drawer
        v-model="visible"
        title="绑定点位"
        size="908"
        @close="cancel"
    >
        <cv-form
            :model="filters"
            class="transfer-form"
            inline
        >
            <cv-form-item>
                <cv-select
                    v-model="filters.type"
                    style="width: 180px;"
                    @change="handleChange"
                >
                    <cv-option
                        v-for="item in panes"
                        :key="item.name"
                        :label="item.label"
                        :value="item.name"
                    />
                </cv-select>
            </cv-form-item>
            <cv-form-item>
                <cv-input v-model="filters.pointID" placeholder="请输入代码" allow-clear style="width: 180px;" />
            </cv-form-item>
            <cv-form-item>
                <cv-input v-model="filters.name" placeholder="请输入名称" allow-clear style="width: 180px;" />
            </cv-form-item>
        </cv-form>
        <cv-table :data="filterData" class="table-container" :row-style="rowStyle" row-key="id">
            <cv-table-column prop="pointID" label="代码" />
            <cv-table-column prop="name" label="名称" />
            <cv-table-column prop="mqttkey" label="MQTT_ID" />
            <cv-table-column prop="value" label="操作">
                <template #default="scope">
                    <cv-button v-if="activeId !== scope.row.pointID" text type="primary" @click="submit(scope.row)"
                    >绑定
                    </cv-button>
                    <span v-else style="color: #006F04;">已绑定</span>
                </template>
            </cv-table-column>
        </cv-table>
        <template #footer>
            <cv-button @click="cancel">{{ t('fw.common.cancel') }}</cv-button>
        </template>
    </cv-drawer>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {computed, onMounted, reactive, ref} from 'vue';
import ModelManagementServiceApi from '@/modules/main/agc/model-management/model-management.service';
import _ from 'lodash';

const {t} = useLocale();
const emit = defineEmits(['submit']);

const filters = reactive({
    type: 'yc',
    pointID: '',
    name: '',
});

const panes = ref<
    {
        label: string;
        name: string;
    }[]
>([
    {label: '遥测', name: 'yc'},
    {label: '遥信', name: 'yx'},
    {label: '遥脉', name: 'ym'},
    {label: '遥控', name: 'yk'},
    {label: '遥调', name: 'yt'},
]);
const visible = ref(false);
const rowData = ref<{database_id?: string;}>({});
const dataSource = ref([]);
const activeId = computed(() => {
    return rowData.value.database_id?.split('$')[0];
});
const filterData = computed(() => {
    return dataSource.value.filter((item: any) => {
        return Object.values(filters).every((key, index) => {
            if (Object.keys(filters)[index] === 'mqttkey') {
                return key ? item[Object.keys(filters)[index]] : true;
            }
            return item[Object.keys(filters)[index]]?.includes(key) ?? true;
        });
    });
});

const rowStyle = ({row}: any) => {
    return {
        background: row.pointID === activeId.value ? '#eaeffc' : '',
    };
};
const open = (data: any) => {
    rowData.value = data;
    visible.value = true;
    queryTableData();
};
const queryTableData = () => {
    ModelManagementServiceApi.getTransferGroupPointSource(filters.type).then(res => {
        if (res?.state) {
            dataSource.value = res.data;
        }
    });
};
const cancel = () => {
    visible.value = false;
};
const handleChange = () => {
    queryTableData();
};
const submit = (data: any) => {
    const {pointID, tablename} = data;
    rowData.value.database_id = tablename ? `${pointID}$${tablename}` : pointID;
    cancel();
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