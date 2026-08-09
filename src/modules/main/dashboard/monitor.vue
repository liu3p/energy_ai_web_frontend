<template>
    <div class="monitor-container">
        <div class="device-list" style="margin-left:20px">
            <div class="device-item" v-if="props.topology[3].used">
                <div class="device-value"> {{ props.topology[3].show_text }} kW
                </div>
                <img src="@/assets/device/guang-fu-ban.png" alt="" :width="80" :height="80" />
                <div class="v-line"></div>
            </div>
            <div class="device-item" v-if="props.topology[1].used">
                <div class="device-value"> {{ props.topology[1].show_text }} kW</div>
                <img src="@/assets/device/dian-wang.png" alt="" :width="80" :height="80" />
                <div class="v-line"></div>
            </div>
            <div class="device-item" v-if="props.topology[4].used">
                <div class="device-value"> {{ props.topology[4].show_text }} kW</div>
                <img src="@/assets/device/fa-dian-ji.png" alt="" :width="80" :height="80" />
                <div class="v-line"></div>
            </div>
        </div>
        <div class="center-div"> </div>
        <div class="device-list">
            <div class="device-item" v-if="props.topology[0].used">
                <div class="v-line"></div>
                <img src="@/assets/device/chu-neng.png" alt="" :width="80" :height="80" />
                <div class="device-value"> {{ props.topology[0].show_text }} kW</div>
            </div>
            <div class="device-item" v-if="props.topology[2].used">
                <div class="v-line"></div>
                <img src="@/assets/device/fu-zai.png" alt="" :width="80" :height="80" />
                <div class="device-value"> {{ props.topology[2].show_text }} kW</div>
            </div>
            <div class="device-item" v-if="props.topology[5].used">
                <div class="v-line"></div>
                <img src="@/assets/device/chong-dian-zhuang.png" alt="" :width="80" :height="80" />
                <div class="device-value"> {{ props.topology[5].show_text }} kW</div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue';
const props = defineProps<{
    topology: {
        show_name: string,
        show_text: string,
        used: number,
    }[];
}>();
onMounted(() => {
});
onUnmounted(() => {
});
</script>
<style scoped lang="scss">
.monitor-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    .center-div {
        width: 100%;
        height: 1px;
        background-color: #D0D3D8;
    }

    .device-list {
        display: flex;
        width: calc(100% - 20px);
        justify-content: space-around;

        .device-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .v-line {
            width: 1px;
            height: 22px;
            background-color: #D0D3D8;
        }

        .device-value {
            font-weight: bold;
        }
    }
}
</style>