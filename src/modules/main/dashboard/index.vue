<template>
    <div class="container">
        <div class="container-top">
            <div class="card-contain card1">
                <div class="card-contain__header">
                    监控数据
                </div>
                <div class="card-contain__body  ">
                    <monitor v-if="configData" :topology="configData.topology" />
                </div>
            </div>
            <div class="card-contain card2">
                <div class="card-contain__header">
                    实时功率
                    <div class="header-select">
                        <el-select v-model="value" placeholder="Select" style="width: 100px">
                            <el-option v-for="item in options" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <el-date-picker v-model="realTimeDate" @change="getRealTime" type="date" :editable="false"
                            :clearable='false' style="width: 120px;margin-left:10px" />
                    </div>
                </div>
                <div class="card-contain__body">
                    <charts :data="realTimeData!" />
                </div>
            </div>
        </div>
        <div class="container-middle">
            <div class="card-contain  card3">
                <div class="card-contain__header">
                    基本信息
                </div>
                <div class="card-contain__body">
                    <div class="baseInfo-content" v-if="configData">
                        <div class="baseInfo-content-item" v-for="item, index in configData.basic_info" :key="index">
                            <div class="item-name">{{ item.show_name }}</div>
                            <div class="item-value" :style="`color:${item.color}`">{{ item.show_text }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-contain card4">
                <div class="card-contain__header">
                    实时数据
                </div>
                <div class="card-contain__body ">
                    <div class="realtimeData-content" v-if="configData">
                        <div class="realtimeData-content-item" v-for="item, index in configData.realtime" :key="index">
                            <div class="item-name">{{ item.show_name }}</div>
                            <div class="item-value" :style="`color:${item.color}`">{{ item.show_text }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-bottom">
            <div class="card-contain card5">
                <div class="card-contain__header">
                    充放电量与效率
                    <div class="header-select">
                        <el-date-picker v-model="powerLevelDate" @change="getPowerLevel" type="month" :editable="false"
                            :clearable='false' style="width: 120px;" />
                    </div>
                </div>
                <div class="card-contain__body">
                    <charts :data="powerLevelData!" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue';
import dashboardServiceApi from '@/modules/main/dashboard/dashboard.service';
import charts from '@/modules/main/dashboard/charts.vue';
import monitor from '@/modules/main/dashboard/monitor.vue';
import { webSocket } from '@/common/websocket/websocket';
import dayjs from 'dayjs'

type chartParams = { xAxis: (number | string)[]; data: { name: string; type: 'line' | 'bar', color?: string, data: (number | string)[] }[] };
const configData = ref();
const realTimeData = ref<chartParams>({
    xAxis: [],
    data: []
});
const powerLevelData = ref<chartParams>({
    xAxis: [],
    data: []
});
const value = ref('全站')
const powerLevelDate = ref(new Date())
const realTimeDate = ref(new Date())
const options = [
    {
        value: '全站',
        label: '全站',
    },
]
const getRealTime = async () => {
    realTimeData.value = {
        xAxis: [],
        data: []
    };
    let dataList = configData.value.topology.filter((item) => {
        return item.used == 1;
    })
    let requistList: any[] = [];
    dataList.forEach((n, i) => {
        const params = {
            "type": "analog",
            "ids": [n.oid],
            "start_time": dayjs(realTimeDate.value).startOf('day'),
            "end_time": dayjs(realTimeDate.value).startOf('day').add(1, 'day'),
            "interval": 3600
        };
        switch (n.oid.split("-")[2]) {
            case '101':
                params.type = "digital";
                break;
            case '102':
                params.type = "analog";
                break;
            case '105':
                params.type = "pulse";
                break;
        }
        requistList.push(dashboardServiceApi.getHistory(params))
    })
    const result = await Promise.all(requistList)
    dataList.forEach((n1, i1) => {
        if (result[i1].state) {
            if (realTimeData.value.xAxis.length == 0) {
                realTimeData.value.xAxis = result[i1].data.data.map((n2, i2) => {
                    return dayjs(n2.time).format("HH:mm")
                });
            }
            realTimeData.value.data.push({
                name: n1.show_name,
                type: "line",
                data: result[i1].data.data.map((n3) => { return n3.data[n1.oid] }),
            })
        }
    })
    realTimeData.value = JSON.parse(JSON.stringify(realTimeData.value))
}

const getPowerLevel = async () => {
    powerLevelData.value = {
        xAxis: [],
        data: []
    };
    let dataList = configData.value.power_level;
    let requistList: any[] = [];
    dataList.forEach((n, i) => {
        const params = {
            "type": "analog",
            "ids": [n.oid],
            "start_time": dayjs(powerLevelDate.value).startOf('month'),
            "end_time": dayjs(powerLevelDate.value).startOf('month').add(1, 'month'),
            "interval": 86400
        };
        switch (n.oid.split("-")[2]) {
            case '101':
                params.type = "digital";
                break;
            case '102':
                params.type = "analog";
                break;
            case '105':
                params.type = "pulse";
                break;
        }
        requistList.push(dashboardServiceApi.getHistory(params))
    })
    const result = await Promise.all(requistList)
    dataList.forEach((n1, i1) => {
        if (result[i1].state) {
            if (powerLevelData.value.xAxis.length == 0) {
                powerLevelData.value.xAxis = result[i1].data.data.map((n2, i2) => {
                    return dayjs(n2.time).format("D")
                });
            }
            powerLevelData.value.data.push({
                name: n1.show_name,
                type: "bar",
                data: result[i1].data.data.map((n3) => { return n3.data[n1.oid] }),
            })
        }
    })
    powerLevelData.value = JSON.parse(JSON.stringify(powerLevelData.value))
}

function onMessage(data: any) {
    if (data) {
        const res = JSON.parse(data);
        Object.keys(configData.value).forEach((item, index) => {
            configData.value[item].forEach((n1, i1) => {
                if (n1.type != 3) {//不是固定值
                    configData.value[item][i1].show_text = "--";
                    const info = res.content.find((n2, i2) => {
                        return n2.oid == n1.oid
                    })
                    if (info) {
                        if (n1.type == 2) {//枚举值
                            configData.value[item][i1].show_text = n1.table[info.value].split("_")[0]
                            configData.value[item][i1].color = n1.table[info.value].split("_")[1]
                        } else {//实时值
                            configData.value[item][i1].show_text = info.value + " " + n1.show_unit;
                        }
                    }
                }
            });
        })
    }
}
const initData = () => {
    dashboardServiceApi.getConfig().then(res => {
        if (res.state) {
            configData.value = res.data.data
            getPowerLevel();
            getRealTime();
            webSocket.send(JSON.stringify({ topic: "homepage_subscribe" }))
            webSocket.onMessage(onMessage);
            Object.keys(configData.value).forEach((item, index) => {
                configData.value[item].forEach((n1, i1) => {
                    configData.value[item][i1].show_text = "--";
                    if (n1.type == 3) {//固定值
                        configData.value[item][i1].show_text = n1.show_value
                    }
                });
            })
        }
    });
};
onMounted(async () => {
    initData();
});
onUnmounted(() => {
});

</script>
<style scoped lang="scss">
$gap: 24px;

.container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: $gap;
    overflow-y: auto;
}

.container-top,
.container-middle,
.container-bottom {
    display: flex;
    width: 100%;
}

.card-contain {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    width: 100%;
    border-bottom: 1px solid #EBEBEB;
    box-shadow: 0px 2px 8px 0px #0C19330F;
}

.card1 {
    width: 35%;
    height: 320px;
}

.card2 {
    width: 65%;
    margin-left: 20px;
    height: 320px;
}

.card3 {
    width: 35%;
    height: 300px;
}

.card4 {
    width: 65%;
    margin-left: 20px;
    height: 300px;
}

.card5 {
    width: 100%;
    height: 300px;
}

.card-contain__header {
    height: 56px;
    padding: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EBEBEB;

    .header-select {
        display: flex;
    }
}

.card-contain__body {
    padding: 0px 16px;
    height: 100%;
    overflow-y: auto;
}

.baseInfo-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .baseInfo-content-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: calc(50% - 16px);
        padding: 16px 0;
        border-bottom: 1px solid #EBEBEB;

        .item-name {
            color: #5C6373;
            font-size: 12px;
        }

        .item-value {
            color: #1a2233;
            font-size: 14px;
            font-weight: 600;
        }
    }
}

.realtimeData-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 16px 0;

    .realtimeData-content-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: calc(33.3% - 10px);
        height: 36px;
        padding: 0px 10px;
        margin-bottom: 5px;
        background-color: #FAFBFC;
        border: solid 1px #F2F4F7;
        border-radius: 2px;

        .item-name {
            color: #5C6373;
            font-size: 12px;
        }

        .item-value {
            color: #1a2233;
            font-size: 14px;
            font-weight: 600;
        }
    }

    .warn {
        background-color: #FFDEDE;
        border: solid 1px #F4353533;
    }
}
</style>