<template>
    <cv-dialog v-model="visible" title="选择点位" width="1200" @close="onclose">
        <div class="pick-container">
            <div class="select-tree">
                <cv-scrollbar height="100%">
                    <cv-tree
                        ref="treeRef"
                        :data="treeData"
                        :props="{
                            children: 'device',
                            label: 'name',
                        }"
                        default-expand-all
                        @node-click="handleClick"
                    >
                    </cv-tree>
                </cv-scrollbar>
            </div>
            <div class="select-block">
                <cv-scrollbar height="100%">
                    <cv-form :inline="true" :model="form">
                        <cv-form-item label="原始名：">
                            <cv-input v-model="form.name"></cv-input>
                        </cv-form-item>
                        <cv-form-item label="MqttKey：">
                            <cv-input v-model="form.mqttkey"></cv-input>
                        </cv-form-item>
                    </cv-form>
                    <div class="block-wrapper" v-if="filterDataSource?.length">
                        <div
                            :class="{'block': true, 'item-selected': actived === item.id}"
                            v-for="item in filterDataSource"
                            :key="item.id"
                            @click="pickPoints(item)"
                        >
                            <div style="color: #155dfc">{{ item.name }}</div>
                            <div>{{ item.mqttkey || '-' }}</div>
                        </div>
                    </div>
                    <div class="empty" v-else>暂无数据</div>
                </cv-scrollbar>
            </div>
        </div>
        <template #footer>
            <cv-button @click="visible = false">关闭</cv-button>
        </template>
    </cv-dialog>
</template>
<script setup lang="ts">
import {computed, ref} from 'vue';
import {queryRtuListExceptPoints, queryDevicePoints} from '@/modules/main/capture/point/point.service';

const emits = defineEmits(['submit']);
const visible = ref(false);
const trigger = ref(false);
const form = ref({
    name: '',
    mqttkey: '',
});
const treeData = ref([]);
const dataSource = ref([]);
const actived = ref();
const filterDataSource = computed<{id: string; name: string; mqttkey: string}[]>(() => {
    const filters = form.value;
    return dataSource.value.filter((item: any) => {
        return Object.values(filters).every((key, index) => {
            return item[Object.keys(filters)[index]]?.includes(key) ?? true;
        });
    });
});

const init = (isTrigger: boolean, isAgc?: boolean) => {
    queryRtuListExceptPoints().then(res => {
        if (res.state) {
            treeData.value = res.data.map(rtu => ({
                ...rtu,
                device: rtu.device?.map(dev => ({
                    ...dev,
                    device: [
                        {
                            name: '遥信',
                            key: Math.random(),
                            type: 'digital',
                            rid: rtu.id,
                            did: dev.id,
                            points: [],
                        },
                        ...(isTrigger
                            ? []
                            : [
                                  {
                                      name: '遥测',
                                      key: Math.random(),
                                      type: 'analog',
                                      rid: rtu.id,
                                      did: dev.id,
                                      points: [],
                                  },
                                  {
                                      name: '遥脉',
                                      key: Math.random(),
                                      type: 'pulse',
                                      rid: rtu.id,
                                      did: dev.id,
                                      points: [],
                                  },
                              ]),
                        ...(isAgc
                            ? [
                                  {
                                      name: '遥调',
                                      key: Math.random(),
                                      type: 'regulate',
                                      rid: rtu.id,
                                      did: dev.id,
                                      points: [],
                                  },
                                  {
                                      name: '遥控',
                                      key: Math.random(),
                                      type: 'control',
                                      rid: rtu.id,
                                      did: dev.id,
                                      points: [],
                                  },
                              ]
                            : []),
                    ],
                })),
            }));
        }
    });
};
const handleClick = async (data: any) => {
    const {rid, did, type} = data;
    const res = await queryDevicePoints(rid, did, type);
    if (res.state) {
        dataSource.value = res.data?.[type] ?? [];
    }
};

const pickPoints = (records: any) => {
    emits('submit', records, trigger.value);
    visible.value = false;
};

const onclose = () => {
    visible.value = false;
    dataSource.value = [];
    form.value = {
        name: '',
        mqttkey: '',
    };
};
defineExpose({
    open(isTrigger: boolean, point: string, isAgc?: boolean) {
        actived.value = point;
        trigger.value = !!isTrigger;
        init(isTrigger, !!isAgc);
        visible.value = true;
    },
});
</script>

<style scoped lang="scss">
.pick-container {
    width: 100%;
    height: 500px;
    display: flex;
    gap: 20px;
}

.select-tree {
    width: 200px;
    height: 100%;
}

.select-block {
    flex: 1;
}

.block-wrapper {
    width: 100%;
    margin-top: 16px;
    height: calc(100% - 64px);
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(6, 1fr);

    .block {
        display: flex;
        cursor: pointer;
        height: 82px;
        padding: 16px;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        border-radius: 10px;
        background: linear-gradient(180deg, #f4f4f4 0%, #fefefe 100%);
        box-shadow: 0 0.899px 3.598px 0.899px rgba(0, 0, 0, 0.12);
    }
}

.empty {
    display: flex;
    justify-content: center;
    margin-top: 180px;
}

.item-selected {
    cursor: not-allowed !important;
    pointer-events: none;
    background: #d1d1d1 !important;
}
</style>
