<template>
    <div class="vis-configuration-editor-top">
        <span class="vis-configuration-editor-top__title">
            <cv-tooltip :content="props.title" :show-after="1500">
                {{ props.title }}
            </cv-tooltip>
        </span>
        <div class="vis-configuration-editor-top__icons" @click="focusBoard">
            <div v-for="(group, index) in icons" :key="index" class="vis-configuration-editor-top__icon-group">
                <template v-for="icon in group" :key="icon.title">
                    <cv-tooltip :content="icon.title">
                        <cv-icon
                            v-show="!icon.hidden"
                            :size="icon.size ?? 14"
                            :class="{'is-activated': iconActive[icon.name]}"
                            @click="icon.callback(icon)"
                        >
                            <component :is="icon.icon"></component>
                        </cv-icon>
                    </cv-tooltip>
                </template>
            </div>
        </div>
        <div class="vis-configuration-editor-top__ops-item">
            <cv-button type="primary" text @click="definition">
                {{ t('vis.configuration.configurationDefinition') }}
            </cv-button>
        </div>
        <div class="vis-configuration-editor-top__ops-item">
            <cv-button type="primary" text :disabled="saveDisabled" @click="save">{{ t('vis.common.save') }}</cv-button>
        </div>
        <div class="vis-configuration-editor-top__ops-item">
            <cv-button type="primary" text @click="back">{{ t('vis.common.goBack') }}</cv-button>
        </div>
    </div>
    <vis-obj-definition-dialog
        ref="defDialog"
        v-model:formModel="formModel"
        :title="t('vis.configuration.configurationDefinition')"
        :is-primitive="false"
        :get-tags="ConfigurationApi.getTags"
        :submit="definitionSubmit"
        :check-name="ConfigurationApi.checkName"
        :submit-text="t('vis.common.confirm')"
        is-edit
    ></vis-obj-definition-dialog>
</template>
<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {
    CvIconAlignBottom,
    CvIconAlignCenter1,
    CvIconAlignLeft1,
    CvIconAlignMiddle,
    CvIconAlignRight1,
    CvIconAlignTop,
    CvIconBottomLayer,
    CvIconDistriHorizontal,
    CvIconDistriVertical,
    CvIconEditorCancel,
    CvIconEditorRedo,
    CvIconEnlarge,
    CvIconEscFullscreen,
    CvIconFullscreen,
    CvIconLayerDown,
    CvIconLayerUp,
    CvIconNarrow,
    CvIconTopLayer,
} from 'cloudview.ui-next-icon';
import {FullScreen} from '@element-plus/icons-vue';
import {markRaw, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import type {Configuration, IConfiguration} from '@cloudview.visualization-next/services';
import {
    alignDirection,
    ConfigurationApi,
    distributeType,
    provideObserver,
    Topics,
    Utils,
} from '@cloudview.visualization-next/services';
import VisObjDefinitionDialog from '../../obj-definition-dialog';
import {onBeforeRouteLeave, useRouter} from 'vue-router';

const observer = provideObserver();

const {t} = useLocale();
const router = useRouter();

defineOptions({name: 'EditorTop'});

interface IProps {
    title: string;
    model: Configuration;
}

const props = withDefaults(defineProps<IProps>(), {
    title: '',
});
const emits = defineEmits(['definition', 'save', 'back', 'focus-board']);
const save = () => emits('save');

const back = () => router.back();
const saveDisabled = ref(true);

const edited = (isEdited: boolean) => (saveDisabled.value = !isEdited);

observer.on(Topics.EDITED, edited);

const formModel = ref<IConfiguration>({} as IConfiguration);
const defDialog = ref();

const definition = () => {
    formModel.value = JSON.parse(JSON.stringify(props.model.getDefinitionConfig()));
    defDialog.value.open();
};

const definitionSubmit = () => {
    props.model.setConfig(formModel.value);
    observer.dispatch(Topics.EDITED, true);
    return true;
};

onBeforeRouteLeave(async (to, from, next) => {
    if (!saveDisabled.value) {
        try {
            await CvMessageBox.confirm(t('vis.common.leavePrompt'), t('vis.common.prompt'));
            next();
        } catch {
            next(false);
        }
    } else {
        next();
    }
});

watch(saveDisabled, val => {
    if (!val) {
        window.onbeforeunload = () => true;
    } else {
        window.onbeforeunload = null;
    }
});

const activeBoard = ref();
const activeBoardChanged = board => {
    activeBoard.value = board;
};
observer.on(Topics.ACTIVE_BOARD_CHANGED, activeBoardChanged);

const setLayerIconActive = (isActive: boolean) => {
    iconActive.layerUp = isActive;
    iconActive.layerDown = isActive;
    iconActive.topLayer = isActive;
    iconActive.bottomLayer = isActive;
};

const setLayoutIconActive = (isActive: boolean) => {
    iconActive.leftJustifying = isActive;
    iconActive.alignCenter = isActive;
    iconActive.rightJustifying = isActive;
    iconActive.alignTop = isActive;
    iconActive.alignMiddle = isActive;
    iconActive.alignBottom = isActive;
};
const setDistributeIconActive = (isActive: boolean) => {
    iconActive.horizontalLayout = isActive;
    iconActive.verticalLayout = isActive;
};

watch(
    () => activeBoard.value?.undoCommands,
    undoCommands => (iconActive.revocation = undoCommands.length > 0),
    {deep: true}
);

watch(
    () => activeBoard.value?.redoCommands,
    redoCommands => (iconActive.reform = redoCommands.length > 0),
    {deep: true}
);

watch(
    () => activeBoard.value?.selectedPrimitives,
    selectedPrimitives => {
        setLayerIconActive(selectedPrimitives.length === 1);
        setLayoutIconActive(selectedPrimitives.length > 1);
        setDistributeIconActive(selectedPrimitives.length > 2);
    },
    {deep: true}
);

const iconActive = reactive({
    horizontalLayout: false,
    verticalLayout: false,
    leftJustifying: false,
    alignCenter: false,
    rightJustifying: false,
    alignTop: false,
    alignMiddle: false,
    alignBottom: false,
    layerUp: false,
    layerDown: false,
    topLayer: false,
    bottomLayer: false,
    enlarge: true,
    narrow: true,
    fullScreen: true,
    cancelFullScreen: true,
    revocation: false,
    reform: false,
    fitToScreen: false,
});

const icons = reactive<
    Array<
        Array<{
            icon: any;
            name: string;
            title: string;
            size?: number;
            hidden?: boolean;
            callback: (icon?: any) => void;
        }>
    >
>([
    [
        {
            icon: markRaw(CvIconDistriHorizontal),
            name: 'horizontalLayout',
            title: t('vis.common.horizontalLayout', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback(icon) {
                if (iconActive.horizontalLayout) {
                    activeBoard.value?.distribute(distributeType.HORIZONTAL);
                }
            },
        },
        {
            icon: markRaw(CvIconDistriVertical),
            name: 'verticalLayout',
            title: t('vis.common.verticalLayout', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                if (iconActive.verticalLayout) {
                    activeBoard.value?.distribute(distributeType.VERTICAL);
                }
            },
        },
    ],
    [
        {
            icon: markRaw(CvIconAlignLeft1),
            name: 'leftJustifying',
            title: t('vis.common.leftJustifying', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.align(alignDirection.LEFT);
            },
        },
        {
            icon: markRaw(CvIconAlignCenter1),
            name: 'alignCenter',
            title: t('vis.common.alignCenter', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.align(alignDirection.CENTER);
            },
        },
        {
            icon: markRaw(CvIconAlignRight1),
            name: 'rightJustifying',
            title: t('vis.common.rightJustifying', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.align(alignDirection.RIGHT);
            },
        },
        {
            icon: markRaw(CvIconAlignTop),
            name: 'alignTop',
            title: t('vis.common.alignTop', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.align(alignDirection.TOP);
            },
        },
        {
            icon: markRaw(CvIconAlignMiddle),
            name: 'alignMiddle',
            title: t('vis.common.alignMiddle', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.align(alignDirection.MIDDLE);
            },
        },
        {
            icon: markRaw(CvIconAlignBottom),
            name: 'alignBottom',
            title: t('vis.common.alignBottom', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.align(alignDirection.BOTTOM);
            },
        },
    ],
    [
        {
            icon: markRaw(CvIconLayerUp),
            name: 'layerUp',
            title: t('vis.common.layerUp', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback(icon) {
                if (iconActive[icon.name]) {
                    activeBoard.value?.layerUp();
                }
            },
        },
        {
            icon: markRaw(CvIconLayerDown),
            name: 'layerDown',
            title: t('vis.common.layerDown', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback(icon) {
                if (iconActive[icon.name]) {
                    activeBoard.value?.layerDown();
                }
            },
        },
        {
            icon: markRaw(CvIconTopLayer),
            name: 'topLayer',
            title: t('vis.common.topLayer', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback(icon) {
                if (iconActive[icon.name]) {
                    activeBoard.value?.topLayer();
                }
            },
        },
        {
            icon: markRaw(CvIconBottomLayer),
            name: 'bottomLayer',
            title: t('vis.common.bottomLayer', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback(icon) {
                if (iconActive[icon.name]) {
                    activeBoard.value?.bottomLayer();
                }
            },
        },
    ],
    [
        {
            icon: markRaw(CvIconEnlarge),
            name: 'enlarge',
            title: t('vis.common.enlarge', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.enlarge();
            },
        },
        {
            icon: markRaw(CvIconNarrow),
            name: 'narrow',
            title: t('vis.common.narrow', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.narrow();
            },
        },
        {
            icon: markRaw(CvIconFullscreen),
            name: 'fullScreen',
            title: t('vis.common.fullScreen', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            hidden: false,
            callback(icon) {
                props.model.toggleFullscreen();
            },
        },
        {
            icon: markRaw(CvIconEscFullscreen),
            name: 'cancelFullScreen',
            title: t('vis.common.cancelFullScreen', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            hidden: true,
            callback(icon) {
                props.model.toggleFullscreen();
            },
        },
        {
            icon: markRaw(FullScreen),
            name: 'fitToScreen',
            size: 16,
            title: t('vis.common.fitToScreen', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            hidden: false,
            callback(icon) {
                activeBoard.value.fitToScreen();
            },
        },
    ],
    [
        {
            icon: markRaw(CvIconEditorCancel),
            name: 'revocation',
            title: t('vis.common.revocation', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.undo();
            },
        },
        {
            icon: markRaw(CvIconEditorRedo),
            name: 'reform',
            title: t('vis.common.reform', {0: Utils.useWin() ? 'Ctrl' : 'Command'}),
            callback() {
                activeBoard.value?.redo();
            },
        },
    ],
]);

const {isSupport, prefix} = Utils.fullscreenSupport();

const exitFullscreen = () => {
    props.model!.isFullscreen = !props.model.isFullscreen;
    if (!props.model.isFullscreen) {
        props.model.el!.style.position = 'static';
        props.model.el!.style.top = 'auto';
        props.model.el!.style.left = 'auto';
        props.model.el!.style.zIndex = 'auto';
        icons[3][2].hidden = false;
        icons[3][3].hidden = true;
    } else {
        icons[3][2].hidden = true;
        icons[3][3].hidden = false;
    }
};
const fullscreenEventName = prefix + 'fullscreenchange';
onMounted(() => {
    if (isSupport) {
        document.addEventListener(fullscreenEventName, exitFullscreen);
        props.model.setFullscreenInfo(isSupport, prefix);
    }
});

onBeforeUnmount(() => {
    if (isSupport) {
        document.removeEventListener(fullscreenEventName, exitFullscreen);
    }
    window.onbeforeunload = null;
});

// watch(
//     () => props.model,
//     configuration => {
//         if (configuration) {
//             configuration.setFullscreenInfo(isSupport, prefix);
//         }
//     }
// );

const focusBoard = () => emits('focus-board');

defineExpose({
    saveDisabled,
    iconActive,
});
</script>
