<!--eslint-disable vue/use-v-on-exact-->
<template>
    <div
        ref="editor"
        v-loading="loading"
        class="vis-configuration-editor"
        tabindex="0"
        @keydown.ctrl.s.exact.prevent="winSave"
        @keydown.shift.ctrl.h.exact.prevent="winHorizontalLayout"
        @keydown.shift.ctrl.v.exact.prevent="winVerticalLayout"
        @keydown.shift.ctrl.l.exact.prevent="winLeftJustifying"
        @keydown.shift.ctrl.c.exact.prevent="winAlignCenter"
        @keydown.shift.ctrl.r.exact.prevent="winRightJustifying"
        @keydown.shift.ctrl.u.exact.prevent="winAlignTop"
        @keydown.shift.ctrl.m.exact.prevent="winAlignMiddle"
        @keydown.shift.ctrl.b.exact.prevent="winAlignBottom"
        @keydown.ctrl.up.exact.prevent="winLayerUp"
        @keydown.ctrl.down.exact.prevent="winLayerDown"
        @keydown.shift.ctrl.up.exact.prevent="winTopLayer"
        @keydown.shift.ctrl.down.exact.prevent="winBottomLayer"
        @keydown.shift.ctrl.f.exact.prevent="winFullscreen"
        @keydown.shift.ctrl.j.exact.prevent="winFitToScreen"
        @keydown.ctrl.-.exact.prevent="winNarrow"
        @keydown.meta.s.exact.prevent="macSave"
        @keydown.shift.meta.h.exact.prevent="macHorizontalLayout"
        @keydown.shift.meta.v.exact.prevent="macVerticalLayout"
        @keydown.shift.meta.l.exact.prevent="macLeftJustifying"
        @keydown.shift.meta.c.exact.prevent="macAlignCenter"
        @keydown.shift.meta.r.exact.prevent="macRightJustifying"
        @keydown.shift.meta.u.exact.prevent="macAlignTop"
        @keydown.shift.meta.m.exact.prevent="macAlignMiddle"
        @keydown.shift.meta.b.exact.prevent="macAlignBottom"
        @keydown.meta.up.exact.prevent="macLayerUp"
        @keydown.meta.down.exact.prevent="macLayerDown"
        @keydown.shift.meta.f.exact.prevent="macFullscreen"
        @keydown.shift.meta.j.exact.prevent="macFitToScreen"
        @keydown.shift.meta.up.exact.prevent.stop="macTopLayer"
        @keydown.shift.meta.down.exact.prevent.stop="macBottomLayer"
        @keydown="enlarge($event)"
        @keydown.meta.-.exact.prevent="macNarrow"
        @keydown.ctrl.z.exact.prevent="winUndo"
        @keydown.ctrl.y.exact.prevent="winRedo"
        @keydown.ctrl.shift.z.exact.prevent="winRedo"
        @keydown.meta.z.exact.prevent="macUndo"
        @keydown.meta.y.exact.prevent="macRedo"
        @keydown.meta.shift.z.exact.prevent="macRedo"
    >
        <editor-top
            v-if="configuration"
            ref="editorTopComp"
            :title="configuration?.name"
            :model="configuration"
            @save="save"
            @focus-board="focusBoard"
        ></editor-top>
        <board-tab :boards="configuration?.content"></board-tab>
        <div class="vis-configuration-editor__container">
            <primitive-set></primitive-set>
            <div class="vis-configuration-editor__board">
                <div
                    v-for="item in configuration?.content"
                    :class="{'is-hidden': activatedBoardId !== item.boardId}"
                    class="vis-configuration-editor__board-container"
                >
                    <transition name="vis-configuration-editor__board" mode="out-in" appear>
                        <keep-alive>
                            <vis-board
                                v-if="item.boardId === activatedBoardId"
                                :ref="el => (boards[item.boardId] = el)"
                                :board="item"
                                :configuration="configuration"
                            ></vis-board>
                        </keep-alive>
                    </transition>
                </div>
            </div>
            <board-editor v-if="configuration" :configuration="configuration" @focus-board="focusBoard"></board-editor>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';
import type {IConfiguration, IErrorData, IObjectRes} from '@cloudview.visualization-next/services';
import {
    alignDirection,
    Board,
    Configuration,
    ConfigurationApi,
    distributeType,
    editBoard,
    editConfiguration,
    editPrimitive,
    ObjectApi,
    PrimitiveInstance,
    provideObserver,
    Topics,
    Utils,
} from '@cloudview.visualization-next/services';
import {useLocale} from 'cloudview.ui-next';
import {nextTick, provide, reactive, type Ref, ref, watch} from 'vue';
import BoardTab from './board-tab.comp.vue';
import PrimitiveSet from './primitive-set.comp.vue';
import VisBoard from '../../board';
import BoardEditor from './board-editor.comp.vue';
import EditorTop from './editor-top.comp.vue';

defineOptions({name: 'ConfigurationEditor'});

const route = useRoute();
const router = useRouter();
const {t} = useLocale();
const {id} = route.params;
const configuration = ref<Configuration | null>();

const observer = provideObserver();

const boardsActivatedMap = reactive<Record<string, boolean>>({});
const loading = ref(false);

// 为子级提供当前编辑的组态图实例
provide(editConfiguration, configuration);

let isEdited = false;
let oldConfiguration = '';
let editedTimer: number;
let configurationEditedWatch: () => void;
const isConfigurationEdited = (configuration: Ref<Configuration | null | undefined>) => {
    configurationEditedWatch = watch(
        configuration,
        () => {
            window.clearTimeout(editedTimer);
            if (!isEdited) {
                editedTimer = window.setTimeout(() => {
                    const newConfiguration = JSON.stringify(configuration.value?.getConfig());
                    isEdited = oldConfiguration !== newConfiguration;
                    if (isEdited) {
                        configurationEditedWatch();
                    }
                    observer.dispatch(Topics.EDITED, isEdited);
                }, 200);
            }
        },
        {deep: true}
    );
};

const editor = ref();
const getConfiguration = async () => {
    loading.value = true;
    try {
        const res = await ConfigurationApi.getConfigurationById(id as string);
        if (res.state) {
            res.data = res.data as IConfiguration;
            configuration.value = new Configuration(res.data as IConfiguration);
            oldConfiguration = JSON.stringify(configuration.value!.getConfig());
            configuration.value?.content.forEach(board => {
                boardsActivatedMap[board.boardId] = false;
            });
            isConfigurationEdited(configuration);
            await nextTick();
            configuration.value?.setEl(editor.value);
        } else {
            res.data = res.data as IErrorData;
            CvNotification.error({
                title: t(`vis.configuration.getConfigurationFailed`),
                message: res.data.code ? t(`vis.error.${res.data.code}`) : '',
            });
        }
    } finally {
        loading.value = false;
    }
};
getConfiguration();

const boards = {};
const activatedBoardId = ref('');
const save = async () => {
    loading.value = true;
    try {
        const config = configuration.value!.getConfig();
        // 截图画板生成缩略图
        const svg = boards[activatedBoardId.value].getSvg();
        const [error, canvas] = await Utils.screenShotSvg(svg, true);
        if (error) {
            CvMessage({
                type: 'error',
                message: t('vis.common.failedScreenShots'),
            });
            return false;
        }
        const blob = await Utils.canvasToBlob(canvas!);
        const thumbResult = await ObjectApi.postFile(blob);
        if (!thumbResult.state) {
            CvMessage({
                type: 'error',
                message: t('vis.configuration.failedUploadThumbnails'),
            });
            return false;
        }
        config.thumb_id = (thumbResult.data as IObjectRes).id;
        // 保存组态图配置
        const res = await ConfigurationApi.updateConfiguration(config, config.id);
        if (res.state) {
            isEdited = false;
            observer.dispatch(Topics.EDITED, isEdited);
            oldConfiguration = JSON.stringify(configuration.value?.getConfig());
            isConfigurationEdited(configuration);
            CvNotification.success({
                title: t('vis.common.successSave'),
            });
        } else {
            CvNotification.error({
                title: t('vis.common.failedSave'),
                message: t(`vis.error.${res.data.code}`),
            });
        }
    } finally {
        loading.value = false;
        focusBoard();
    }
};

// 为子级提供当前编辑的画板实例
const board = ref<Board>();
provide(editBoard, board);
const activeBoardChanged = activeBoard => {
    activatedBoardId.value = activeBoard.boardId;
    boardsActivatedMap[activatedBoardId.value] = true;
    board.value = activeBoard;
    configuration.value?.setActivatedBoard(activeBoard);
};
observer.on(Topics.ACTIVE_BOARD_CHANGED, activeBoardChanged);

const editorTopComp = ref();
const winSave = () => {
    if (Utils.useWin() && !editorTopComp.value.saveDisabled) {
        save();
    }
};

const winHorizontalLayout = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.horizontalLayout) {
            board.value?.distribute(distributeType.HORIZONTAL);
        }
    }
};

const winVerticalLayout = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.verticalLayout) {
            board.value?.distribute(distributeType.VERTICAL);
        }
    }
};

const winLeftJustifying = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.leftJustifying) {
            board.value?.align(alignDirection.LEFT);
        }
    }
};

const winAlignCenter = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.alignCenter) {
            board.value?.align(alignDirection.CENTER);
        }
    }
};

const winRightJustifying = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.rightJustifying) {
            board.value?.align(alignDirection.RIGHT);
        }
    }
};

const winAlignTop = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.alignTop) {
            board.value?.align(alignDirection.TOP);
        }
    }
};

const winAlignMiddle = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.alignMiddle) {
            board.value?.align(alignDirection.MIDDLE);
        }
    }
};

const winAlignBottom = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.alignBottom) {
            board.value?.align(alignDirection.BOTTOM);
        }
    }
};

const winLayerUp = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.layerUp) {
            board.value?.layerUp();
        }
    }
};

const winLayerDown = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.layerDown) {
            board.value?.layerDown();
        }
    }
};

const winTopLayer = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.topLayer) {
            board.value?.topLayer();
        }
    }
};

const winBottomLayer = () => {
    if (Utils.useWin()) {
        if (editorTopComp.value.iconActive.bottomLayer) {
            board.value?.bottomLayer();
        }
    }
};

const winFullscreen = () => {
    if (Utils.useWin()) {
        configuration.value?.toggleFullscreen();
    }
};

const winFitToScreen = () => {
    if (Utils.useWin()) {
        board.value?.fitToScreen();
    }
};

const winNarrow = () => {
    if (Utils.useWin()) {
        board.value?.narrow();
    }
};

const macSave = () => {
    if (Utils.useMac() && !editorTopComp.value.saveDisabled) {
        save();
    }
};

const macHorizontalLayout = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.horizontalLayout) {
            board.value?.distribute(distributeType.HORIZONTAL);
        }
    }
};

const macVerticalLayout = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.verticalLayout) {
            board.value?.distribute(distributeType.VERTICAL);
        }
    }
};

const macLeftJustifying = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.leftJustifying) {
            board.value?.align(alignDirection.LEFT);
        }
    }
};

const macAlignCenter = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.alignCenter) {
            board.value?.align(alignDirection.CENTER);
        }
    }
};

const macRightJustifying = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.rightJustifying) {
            board.value?.align(alignDirection.RIGHT);
        }
    }
};

const macAlignTop = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.alignTop) {
            board.value?.align(alignDirection.TOP);
        }
    }
};

const macAlignMiddle = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.alignMiddle) {
            board.value?.align(alignDirection.MIDDLE);
        }
    }
};

const macAlignBottom = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.alignBottom) {
            board.value?.align(alignDirection.BOTTOM);
        }
    }
};

const macLayerUp = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.layerUp) {
            board.value?.layerUp();
        }
    }
};

const macLayerDown = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.layerDown) {
            board.value?.layerDown();
        }
    }
};

const macTopLayer = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.topLayer) {
            board.value?.topLayer();
        }
    }
};

const macBottomLayer = () => {
    if (Utils.useMac()) {
        if (editorTopComp.value.iconActive.bottomLayer) {
            board.value?.bottomLayer();
        }
    }
};

const macFullscreen = () => {
    if (Utils.useMac()) {
        configuration.value?.toggleFullscreen();
    }
};

const macFitToScreen = () => {
    if (Utils.useMac()) {
        board.value?.fitToScreen();
    }
};

const enlarge = (event: KeyboardEvent) => {
    if (event.key === '=' && !event.altKey && !event.shiftKey) {
        if (Utils.useMac()) {
            if (event.metaKey && !event.ctrlKey) {
                event.preventDefault();
                board.value?.enlarge();
            }
        } else if (Utils.useWin()) {
            if (event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                board.value?.enlarge();
            }
        }
    }
};

const macNarrow = () => {
    if (Utils.useMac()) {
        board.value?.narrow();
    }
};

const winUndo = () => {
    if (Utils.useWin()) {
        board.value?.undo();
    }
};

const winRedo = () => {
    if (Utils.useWin()) {
        board.value?.redo();
    }
};

const macUndo = () => {
    if (Utils.useMac()) {
        board.value?.undo();
    }
};

const macRedo = () => {
    if (Utils.useMac()) {
        board.value?.redo();
    }
};

// 为子级提供当前编辑的图元实例
const primitive = ref<PrimitiveInstance>();
provide(editPrimitive, primitive);
observer.on(Topics.PROVIDE_PRIMITIVE_ATTR, instance => {
    primitive.value = instance;
});

const focusBoard = () => {
    board.value?.svgInstance?.node.focus();
};
</script>
