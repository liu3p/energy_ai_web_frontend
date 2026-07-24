<template>
    <cv-dialog
        v-model="dialogVisible"
        :title="t('vis.property.selectDevice')"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @open="onOpen"
    >
        <div class="vis-select-equipment__select-board">
            <div class="vis-select-equipment__equipment-board">
                <div class="vis-select-equipment__equipment-list-origin">
                    <div class="vis-select-equipment__site-board">
                        <div class="vis-select-equipment__selected-equipment-title">
                            {{ t('vis.property.selectSite') }}
                        </div>

                        <div class="vis-select-equipment__site-tree">
                            <cv-scrollbar>
                                <cv-tree
                                    :props="defaultProps"
                                    :load="getSiteData"
                                    lazy
                                    @node-click="showStationDetail"
                                ></cv-tree>
                            </cv-scrollbar>
                        </div>
                    </div>
                    <div class="vis-select-equipment__equipment-list-site">
                        <div class="vis-select-equipment__selected-equipment-title-with-search">
                            <div>{{ t('vis.property.selectDevice') }}</div>
                            <cv-input
                                v-model="keywords"
                                class="vis-select-equipment__selected-equipment-title-input"
                                size="small"
                                @change="onSearchChange"
                            >
                                <template #prefix>
                                    <cv-icon>
                                        <cv-icon-search />
                                    </cv-icon>
                                </template>
                            </cv-input>
                        </div>
                        <div class="vis-select-equipment__site-equipment-list">
                            <cv-scrollbar>
                                <div
                                    v-infinite-scroll="() => showStationDetail()"
                                    :infinite-scroll-disabled="equipmentLoadDisabled"
                                >
                                    <div
                                        v-for="equipment in candidateEquipment"
                                        :key="equipment.id"
                                        class="vis-select-equipment__card-item"
                                    >
                                        <cv-checkbox
                                            v-model="equipment.checked"
                                            :label="equipment.name"
                                            @change="value => onEquipmentChecked(equipment, value)"
                                        ></cv-checkbox>
                                    </div>
                                </div>
                            </cv-scrollbar>
                        </div>
                    </div>
                </div>
                <div class="vis-select-equipment__equipment-list-selected">
                    <div class="vis-select-equipment__selected-equipment-title">
                        {{ t('vis.configuration.selectedDevice') }}
                    </div>
                    <div class="vis-select-equipment__selected-equipment-list">
                        <cv-scrollbar>
                            <div
                                v-for="equipment in checkedEquipment"
                                :key="equipment.id"
                                class="vis-select-equipment__card-item"
                            >
                                <cv-checkbox
                                    :checked="true"
                                    :label="equipment.name"
                                    @change="value => onEquipmentChecked(equipment, value)"
                                ></cv-checkbox>
                            </div>
                        </cv-scrollbar>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="vis-select-equipment__operations-board">
                <cv-button @click="onCancel">
                    {{ t('vis.common.cancel') }}
                </cv-button>
                <cv-pop-confirm
                    v-if="checkedEquipment.length === 1"
                    :title="t('vis.property.confirmUpdateDeviceInDataBindings')"
                    placement="top"
                    @confirm="submitAndUpdateBindings"
                >
                    <template #reference>
                        <cv-button type="success">
                            {{ t('vis.property.submitAndUpdateBindings') }}
                        </cv-button>
                    </template>
                </cv-pop-confirm>
                <cv-button type="primary" @click="onSubmit">
                    {{ t('vis.common.submit') }}
                </cv-button>
            </div>
        </template>
    </cv-dialog>
</template>
<script setup lang="ts">
import {useLocale} from 'cloudview.ui-next';
import {ConfigurationApi, DeviceApi, PrimitiveInstance, Utils} from '@cloudview.visualization-next/services';
import {computed, ref} from 'vue';

interface StationModel {
    id: string;
    name: string;
}

interface StationDeviceModel {
    id: string;
    sn: string;
    name: string;
}

defineOptions({name: 'VisSelectEquipment'});
const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
    modelValue: boolean;
    primitive?: PrimitiveInstance;
    batchPrimitives?: PrimitiveInstance[];
}>();

const {t} = useLocale();
const defaultProps = {
    children: 'children',
    label: 'name',
};
const dialogVisible = computed<boolean>({
    get: () => {
        return props.modelValue;
    },
    set: value => {
        emit('update:modelValue', value);
    },
});
const primitives = computed(() => {
    return props.batchPrimitives ? props.batchPrimitives : props.primitive ? [props.primitive] : [];
});
const getSiteData = (node, resolve) => {
    ConfigurationApi.getStationList(node.data && node.data.id).then(res => {
        if (res.status) {
            resolve(res.data);
        } else {
            CvMessage({
                message: t('vis.common.getStationTreeFailed'),
                type: 'warning',
            });
        }
    });
};

const deviceList = ref<StationDeviceModel[]>([]);
const equipmentPage = ref(1);
const equipmentTotal = ref(0);
const keywords = ref('');
const onSearchChange = () => {
    equipmentPage.value = 1;
    deviceList.value = [];
    showStationDetail();
};
const equipmentLoadDisabled = ref(false);
const selectedStationNode = ref<StationModel | null>(null);
const showStationDetail = async (stationData?: StationModel) => {
    equipmentLoadDisabled.value = true;

    if (stationData) {
        selectedStationNode.value = stationData;
        deviceList.value = [];
        equipmentPage.value = 1;
    } else {
        if (!selectedStationNode.value) {
            return;
        }
    }

    const res = await DeviceApi.getDeviceList({
        treeId: selectedStationNode.value.id,
        keywords: keywords.value,
        page: equipmentPage.value++,
        pageSize: 50,
    });
    if (res.state) {
        deviceList.value = deviceList.value.concat(res.data.data ?? []);
        equipmentTotal.value = res.data.pagination.total_count;
        equipmentLoadDisabled.value = deviceList.value.length >= equipmentTotal.value;
    } else {
        CvMessage({
            message: t('vis.common.getDeviceFailed'),
            type: 'warning',
        });
    }
};

const checkedEquipment = ref<StationDeviceModel[]>([]);
const candidateEquipment = computed(() => {
    return deviceList.value.map(item => {
        return {
            ...item,
            checked: checkedEquipment.value.some(equipment => {
                if (equipment.id === item.id) {
                    return true;
                }
            }),
        };
    });
});
const onEquipmentChecked = (equipment: StationDeviceModel, state: boolean) => {
    if (state) {
        checkedEquipment.value.push(equipment);
    } else {
        checkedEquipment.value = checkedEquipment.value.filter(item => item.id !== equipment.id);
    }
};

const onCancel = () => {
    dialogVisible.value = false;
};
const onSubmit = () => {
    primitives.value.forEach(p =>
        p.setDevices(
            checkedEquipment.value.map(equipment => {
                return {
                    id: equipment.id,
                    sn: equipment.sn,
                    name: equipment.name,
                };
            })
        )
    );
    dialogVisible.value = false;
};
const submitAndUpdateBindings = async () => {
    primitives.value.forEach(p => p.updateBindingConfigDevice(checkedEquipment.value[0]));
    onSubmit();
};

const onOpen = () => {
    if (primitives.value.length === 1) {
        checkedEquipment.value = Utils.deepClone(primitives.value[0].devices);
    } else {
        checkedEquipment.value = [];
    }
};
</script>
