<template>
    <div class="container">
        <div class="container-top">
            <div class="card-contain card1">
                <div class="card-contain__header">
                    监控数据
                </div>
                <div class="card-contain__body">
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
                        <el-date-picker v-model="value1" type="date" :editable="false" :clearable='false'
                            style="width: 120px;margin-left:10px" />
                    </div>
                </div>
                <div class="card-contain__body">
                    <charts :data="lineChartData!" />
                </div>
            </div>
        </div>
        <div class="container-middle">
            <div class="card-contain card1">
                <div class="card-contain__header">
                    基本信息
                </div>
                <div class="card-contain__body">
                    <div class="baseInfo-content">
                        <div class="baseInfo-content-item">
                            <div class="item-name">电站名称</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="baseInfo-content-item">
                            <div class="item-name">储能规模</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="baseInfo-content-item">
                            <div class="item-name">电站位置</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="baseInfo-content-item">
                            <div class="item-name">SOC</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="baseInfo-content-item">
                            <div class="item-name">当前警告数</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="baseInfo-content-item">
                            <div class="item-name">等效循环（次）</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="baseInfo-content-item">
                            <div class="item-name">远方/就地</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="baseInfo-content-item">
                            <div class="item-name">当前策略</div>
                            <div class="item-value">--</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-contain card2">
                <div class="card-contain__header">
                    实时数据
                </div>
                <div class="card-contain__body">
                    <div class="realtimeData-content">
                        <div class="realtimeData-content-item">
                            <div class="item-name">消防系统故障</div>
                            <div class="item-value">未发生</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">配电舱温湿度传感器</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item warn">
                            <div class="item-name">电池模组过流1</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">电池模组过温度</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">电池模组过压</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">消防系统故障</div>
                            <div class="item-value">未发生</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">配电舱温湿度传感器</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">电池模组过流</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">电池模组过温度</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">电池模组过压</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">消防系统故障</div>
                            <div class="item-value">未发生</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">配电舱温湿度传感器</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">电池模组过流</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">电池模组过温度</div>
                            <div class="item-value">--</div>
                        </div>
                        <div class="realtimeData-content-item">
                            <div class="item-name">电池模组过压</div>
                            <div class="item-value">--</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-bottom">
            <div class="card-contain ">
                <div class="card-contain__header">
                    充放电量与效率
                    <div class="header-select">
                        <el-date-picker v-model="value1" type="date" :editable="false" :clearable='false'
                            style="width: 120px;" />
                    </div>
                </div>
                <div class=" card-contain__body">
                    <charts :data="barChartData!" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue';;
import charts from '@/modules/main/dashboard/charts.vue';
import moment from 'moment';
type chartParams = { xAxis: (number | string)[]; data: { name: string; type: 'line' | 'bar', color: string, data: (number | string)[] }[] };
const lineChartData = ref<chartParams>();
const barChartData = ref<chartParams>();
const value = ref('全站')
const value1 = ref(new Date())
const options = [
    {
        value: '全站',
        label: '全站',
    },
    {
        value: '站点1',
        label: '站点1',
    },
]
const init = () => {
    lineChartData.value = {
        xAxis: [1, 2, 3, 4, 5],
        data: [{
            name: "电网",
            type: "line",
            color: '#1A6FB5',
            data: [1, 1, 1, 1, 1],
        }, {
            name: "储能",
            type: "line",
            color: '#1DA500',
            data: [1, 1, 1, 1, 1],
        }, {
            name: "光伏",
            type: "line",
            color: '#E8841A',
            data: [1, 1, 1, 1, 1],
        }, {
            name: "柴油发电机",
            type: "line",
            color: '#D93C3C',
            data: [1, 1, 1, 1, 1],
        }, {
            name: "负载",
            type: "line",
            color: '#8B5CF6',
            data: [1, 1, 1, 1, 1],
        }, {
            name: "充电桩",
            type: "line",
            color: '#0891B2',
            data: [1, 1, 1, 1, 1],
        }]
    };
    barChartData.value = {
        xAxis: [1, 2, 3, 4, 5],
        data: [{
            name: "充电",
            type: "bar",
            color: '#D93C3C',
            data: [1, 1, 1, 1, 1],
        }, {
            name: "放电",
            type: "bar",
            color: '#1DA500',
            data: [1, 1, 1, 1, 1],
        }, {
            name: "效率",
            type: "line",
            color: '#1A6FB5',
            data: [1, 1, 1, 1, 1],
        }]
    };
};
onMounted(async () => {
    init();
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
}

.card1 {
    width: 30%
}

.card2 {
    width: 70%;
    margin-left: 20px;
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
    height: 264px;
    padding: 0px 16px;
    overflow-y: auto;
}

.baseInfo-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .baseInfo-content-item {
        display: flex;
        justify-content: space-between;
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