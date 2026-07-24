<template>
    <div ref="boardEl" class="vis-player-board" @click="onBoardClick">
        <!-- 主舞台 -->
        <vis-player-stage
            ref="stage"
            :config="props.board.attributes"
            @panning="
                relocationPopover();
                panned = true;
            "
            @zoom="relocationPopover"
        >
            <vis-primitive
                v-for="(primitive, key) in props.board.primitives"
                :key="key"
                :model="primitive"
                :editable="false"
            ></vis-primitive>
        </vis-player-stage>

        <!-- 遥控/遥调弹窗 -->
        <vis-player-control ref="control"></vis-player-control>

        <!-- 弹窗绑定 -->
        <vis-player-dialog ref="dialog"></vis-player-dialog>

        <!-- 浮窗绑定 -->
        <vis-player-popover ref="popover" :board-el="boardEl"></vis-player-popover>

        <!-- 自定义组件 -->
        <component :is="customComponent" v-bind="customComponentProps" ref="customComponentRef"></component>
    </div>
</template>
<script lang="ts" setup>
import {
    type BoardRuntime,
    type ConfigurationRuntime,
    DataEngine,
    DataEngineEvent,
    type IBinding,
    type IBindingBoardToggle,
    type IBindingLinkToConfiguration,
    type ICustomComponentDefinition,
    type ICustomComponentShowParam,
    type IPrimitiveInstance,
    MqttClient,
    PlayerError,
    type Timer,
    useGlobalConfig,
} from '@cloudview.visualization-next/services';
import {useLocale} from 'cloudview.ui-next';
import {type Component, h, nextTick, onMounted, onUnmounted, ref, shallowRef, type VNode, watch} from 'vue';
import VisPlayerControl from './player-control.vue';
import VisPlayerDialog from './player-dialog.vue';
import VisPlayerPopover from './player-popover.vue';
import VisPlayerStage from './player-stage.vue';
import VisPrimitive from '../../primitive';

defineOptions({name: 'VisPlayerBoard'});
const props = defineProps<{
    configuration: ConfigurationRuntime;
    board: BoardRuntime;
    visible: boolean;
    timer: Timer;
    toggleBoard: (boardId: string) => void;
    navigateConfiguration: (configurationId: string) => void;
    mqttClient: MqttClient;
}>();

const {t} = useLocale();
const topicPre = useGlobalConfig('topicPre');
const popover = ref();
const control = ref();
const dialog = ref();
const boardEl = ref();
const stage = ref();
const customBindings = useGlobalConfig('customBindings');
const customComponent = shallowRef();
const customComponentProps = ref<Record<string, unknown> | undefined>();
const customComponentRef = ref();
const customComponentTriggerTarget = ref<HTMLElement | undefined>();
const getCustomComponentLocation = (): ICustomComponentShowParam['targetRect'] => {
    const boardRect = boardEl.value.getBoundingClientRect();
    const targetRect = customComponentTriggerTarget.value?.getBoundingClientRect();
    return {
        left: targetRect?.left ? targetRect.left - boardRect.left : 0,
        top: targetRect?.top ? targetRect.top - boardRect.top : 0,
        width: targetRect?.width ?? 0,
        height: targetRect?.height ?? 0,
    };
};
let isParsed = false;

// 舞台缩放或拖动时重新定位popover
const relocationPopover = () => {
    popover.value.locationPopover();
    customComponentRef.value?.visLocation?.(getCustomComponentLocation());
};
// 点击board关闭浮动窗口
const panned = ref(false);
const onBoardClick = () => {
    if (panned.value) {
        panned.value = false;
    } else {
        popover.value.close();
        customComponentRef.value?.visClose?.();
    }
};

const getErrorMessage = (error: Error | PlayerError | undefined, message: VNode[] = []) => {
    if (error) {
        if (error instanceof PlayerError) {
            message.push(h('div', `- ${t(error.template, error.params)}`));
            if (error.reason) {
                getErrorMessage(error.reason as Error | PlayerError, message);
            }
        } else {
            message.push(h('div', `- ${error.toString()}`));
        }
    }
    return message;
};
const showError = (message: string, params: Record<string, string>, error: Error | PlayerError) => {
    CvMessage({
        type: 'error',
        message: h('div', [h('div', t(message, params)), ...getErrorMessage(error)]),
        duration: 10000,
        showClose: true,
    });
};

// 渲染画板
const render = async () => {
    // 解析画板
    await props.board.parse();
    // 创建数据引擎实例
    const dataEngine = new DataEngine({
        configuration: props.configuration,
        board: props.board,
        timer: props.timer,
        topicPre: topicPre.value,
        customBindings: customBindings.value,
        mqttClient: props.mqttClient,
    });
    // 订阅错误提示
    dataEngine.on(DataEngineEvent.ERROR, ({message, params, error}) => {
        showError(message, params, error);
    });
    dataEngine.on(DataEngineEvent.TELECONTROL_TRIGGER, (binding: IBinding) => control.value.show(binding));
    dataEngine.on(DataEngineEvent.TELEADJUST_TRIGGER, (binding: IBinding) => control.value.show(binding));
    dataEngine.on(DataEngineEvent.DIALOG_TRIGGER, (binding: IBinding, primitive: IPrimitiveInstance) =>
        dialog.value.show(binding, primitive)
    );
    dataEngine.on(DataEngineEvent.POPOVER_TRIGGER, (binding: IBinding, primitive: IPrimitiveInstance, event, target) =>
        popover.value.show(binding, primitive, event, target)
    );
    dataEngine.on(
        DataEngineEvent.CUSTOM_COMPONENT_TRIGGER,
        ({
            component,
            componentProps,
            params,
            target,
        }: {
            component: Component;
            componentProps: ICustomComponentDefinition['componentProps'];
            params: ICustomComponentShowParam;
            target: HTMLElement;
        }) => {
            customComponent.value = component;
            customComponentProps.value = componentProps;
            nextTick(() => {
                customComponentTriggerTarget.value = target;
                params.targetRect = getCustomComponentLocation();
                customComponentRef.value.visShow(params);
            });
        }
    );
    dataEngine.on(DataEngineEvent.BOARD_TOGGLE_TRIGGER, (binding: IBindingBoardToggle) =>
        props.toggleBoard(binding.boardId)
    );
    dataEngine.on(DataEngineEvent.LINK_TO_CONFIGURATION_TRIGGER, (binding: IBindingLinkToConfiguration) =>
        props.navigateConfiguration(binding.configurationId)
    );
    // 解析数据绑定
    await dataEngine.parse();
    isParsed = true;
};

watch(
    () => props.visible,
    value => {
        if (value && !isParsed) render();
    },
    {immediate: true}
);

onMounted(() => {
    window.addEventListener('resize', relocationPopover);
});
onUnmounted(() => {
    window.removeEventListener('resize', relocationPopover);
});

defineExpose({
    getStageSvg: () => stage.value.getSvg(),
});
</script>
