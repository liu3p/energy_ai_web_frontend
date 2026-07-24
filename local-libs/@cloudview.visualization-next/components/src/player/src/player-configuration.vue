<template>
    <div
        v-loading="loading"
        class="vis-player-configuration"
        :element-loading-text="t('vis.common.loading')"
        element-loading-background="rgba(255, 255, 255, 0.6)"
    >
        <!-- 画板Tab -->
        <div v-if="props.showBoardTab && configuration?.boards.length > 1" class="vis-player-configuration__boards">
            <div
                v-for="(board, index) in configuration?.boards"
                :key="index"
                class="vis-player-configuration__boards-item"
                :class="{'active': currBoardIndex === index}"
                @click="toggleBoard(index)"
            >
                {{ board.name }}
            </div>
        </div>
        <div class="vis-player-configuration__main">
            <div
                v-for="(board, index) in configuration?.boards"
                :key="index"
                class="vis-player-configuration__board"
                :class="{'vis-player-configuration__board--hidden': currBoardIndex !== index}"
            >
                <vis-player-board
                    :ref="el => (boardComponents[index] = el)"
                    :visible="currBoardIndex === index"
                    :configuration="configuration"
                    :board="board"
                    :timer="timer"
                    :toggle-board="toggleBoard"
                    :navigate-configuration="props.navigateConfiguration"
                    :mqtt-client="mqttClient"
                >
                </vis-player-board>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useLocale} from 'cloudview.ui-next';
import {onMounted, onUnmounted, ref} from 'vue';
import type {IConfiguration} from '@cloudview.visualization-next/services';
import {
    ConfigurationApi,
    ConfigurationRuntime,
    DataEngine,
    MqttClient,
    MqttClientError,
    PrimitiveInstance,
    useGlobalConfig,
} from '@cloudview.visualization-next/services';
// @ts-ignore
import VisPlayerBoard from './player-board.vue';

defineOptions({name: 'VisPlayerConfiguration'});
const props = withDefaults(
    defineProps<{
        visId: string;
        showBoardTab?: boolean;
        navigateConfiguration?: (id: string) => void;
    }>(),
    {
        showBoardTab: true,
        navigateConfiguration: () => {
            return;
        },
    }
);
const emit = defineEmits(['sendName', 'sendConfiguration']);

const {t} = useLocale();
const loading = ref(true);
const configuration = ref<ConfigurationRuntime>();
const currBoardIndex = ref(0);
const boardComponents = ref<VisPlayerBoard[]>([]);
const parsedBoards = ref<
    Map<
        number,
        {
            dataEngine: DataEngine;
            primitives: PrimitiveInstance[];
        }
    >
>(new Map());
const timer = {timeout: [], interval: []};
const mqttUrl = useGlobalConfig('mqttUrl');
const mqttQos = useGlobalConfig('mqttQos');
const mqttClient = ref<MqttClient>();

// 切换画板
async function toggleBoard(param: number | string) {
    if (typeof param === 'number') {
        if (param != currBoardIndex.value) {
            if (parsedBoards.value.has(currBoardIndex.value)) {
                parsedBoards.value.get(currBoardIndex.value)!.dataEngine.closeClient();
            }
            currBoardIndex.value = param;
        }
    } else {
        const findBoard = configuration.value?.boards.some((item, index) => {
            if (item.id === param) {
                toggleBoard(index);
                return true;
            } else {
                return false;
            }
        });
        if (!findBoard) {
            CvMessage({type: 'error', message: t('vis.player.unFoundBoard')});
        }
    }
}

onMounted(async () => {
    // 读取组态图配置
    const visResult = await ConfigurationApi.getConfigurationById(props.visId);
    if (!visResult.status) {
        CvMessage({type: 'error', message: t('vis.player.failedSelectConfiguration'), duration: 0, showClose: true});
        loading.value = false;
        return;
    }
    const visData = visResult.data as IConfiguration;

    // 创建Mqtt客户端
    mqttClient.value = new MqttClient(mqttUrl.value, mqttQos.value);
    try {
        await mqttClient.value!.connect();
    } catch (e) {
        if ((e as Error).message === MqttClientError.AUTH_FAILED) {
            CvMessage({type: 'error', message: t('vis.player.mqttForbidden')});
        }
    }

    // 创建组态图实例
    configuration.value = new ConfigurationRuntime(visData);
    emit('sendName', {id: props.visId, name: configuration.value.name});
    emit('sendConfiguration', visData);
    loading.value = false;
});

onUnmounted(() => {
    mqttClient.value?.close();
});

defineExpose({
    getStageSvg: () => boardComponents.value[currBoardIndex.value]!.getStageSvg(),
});
</script>
