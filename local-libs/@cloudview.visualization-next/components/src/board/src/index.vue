<template>
    <svg
        ref="svg"
        class="vis-board"
        :class="{'before-pan-zoom': shortcutsOptions.beforePanZoom, 'pan-zooming': shortcutsOptions.panZooming}"
        :style="{'background-color': board?.attributes['background-color']}"
        width="100%"
        height="100%"
        tabindex="-1"
        @dragover.prevent
        @drop="drop"
        @keydown.space.exact.prevent="board.spaceDown?.($event)"
        @keyup.space.exact.prevent="board.spaceUp?.($event)"
        @keydown.ctrl.c.exact.prevent="winCopy()"
        @keydown.ctrl.v.exact.prevent="winPaste()"
        @keydown.meta.c.exact.prevent="macCopy()"
        @keydown.meta.v.exact.prevent="macPaste()"
        @keydown.delete.exact.prevent="board.delete?.($event)"
        @mousedown.left.exact="mousedown($event)"
        @mousewheel="board.zooming?.($event)"
        @keydown.alt.exact.prevent="resizePointsComp.altDown"
    >
        <vis-layer
            v-for="layer in board.layers"
            v-show="!layer.invisible"
            :key="layer.id"
            :no-cursor="board.isSpaceDown"
            :layer="layer"
            :zoom="board.zoom"
            @selected="selectedSingle"
            @before-select="beforeSelect"
            @click-select="clickSelect"
        ></vis-layer>
        <rect
            ref="selectRect"
            :x="board.selectRectBox?.x"
            :y="board.selectRectBox?.y"
            :width="board.selectRectBox?.width"
            :height="board.selectRectBox?.height"
            class="vis-board__select-rect"
        ></rect>
        <rect
            v-show="board.movingRect?.visible"
            ref="movingRect"
            :x="board.movingRect?.x"
            :y="board.movingRect?.y"
            :width="board.movingRect?.width"
            :height="board.movingRect?.height"
            :transform="board.movingRect?.transform"
            class="vis-board__moving-rect"
        ></rect>
        <resize-points
            ref="resizePointsComp"
            :model="selectedPrimitive"
            :svg-instance="board.svgInstance"
            :board="board"
        ></resize-points>
    </svg>
</template>
<script lang="ts" setup>
import {
    type Board,
    CommandAddPrimitive,
    Configuration,
    dragPrimitiveInfo,
    type IPrimitive,
    moveDirection,
    MovingTypes,
    PrimitiveInstance,
    PrimitiveInstanceFactory,
    provideObserver,
    store,
    Topics,
    Utils,
} from '@cloudview.visualization-next/services';
import {computed, onActivated, onBeforeUnmount, onMounted, reactive, ref} from 'vue';
import VisLayer from './layer.comp.vue';
// @ts-ignore
import {Svg, SVG} from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import ResizePoints from './resize-points.comp.vue';
import {CvNotification, useLocale} from 'cloudview.ui-next';

defineOptions({name: 'VisBoard'});

interface IProps {
    board: Board;
    configuration: Configuration;
}

const props = withDefaults(defineProps<IProps>(), {});
const emits = defineEmits(['update:board']);
const {t} = useLocale();

const observer = provideObserver();

const board = computed<Board>({
    get() {
        return props.board;
    },
    set(val) {
        emits('update:board', val);
    },
});

const selectedPrimitive = computed(() => {
    if (board.value.selectedPrimitives.length === 1) {
        return board.value.selectedPrimitives[0];
    }
    return null;
});

const svg = ref();
const shortcutsOptions = reactive({
    beforePanZoom: false,
    panZooming: false,
});

const resizePointsComp = ref();

onMounted(async () => {
    const svgInstance: Svg = SVG(svg.value) as Svg;
    const rect = svgInstance.node.getBoundingClientRect();
    if (board.value.attributes.viewBox.width === -1) {
        board.value.attributes.viewBox.width = rect.width;
    }
    if (board.value.attributes.viewBox.height === -1) {
        board.value.attributes.viewBox.height = rect.height;
    }
    svgInstance.viewbox(board.value.attributes.viewBox);
    board.value.setObserver(observer);
    board.value.setOptions(shortcutsOptions);
    board.value.setSvgInstance(svgInstance);
});

const mousedown = event => {
    board.value.mousedown(event);
};

const keyDown = event => {
    if (event.key in moveDirection) {
        event.preventDefault();
        if (!event.shiftKey) {
            board.value.microMove(moveDirection[event.key]);
        } else if (!event.altKey && !event.metaKey && !event.ctrlKey) {
            board.value.microMove(moveDirection[event.key], true);
        }
    }
};
const keyUp = event => {
    if (event.key in moveDirection) {
        event.preventDefault();
        board.value.microMoveEnd(moveDirection[event.key]);
    } else if (event.key === 'Alt') {
        resizePointsComp.value.altUp();
    }
};

onActivated(() => {
    document.onmouseup = board.value.mouseup.bind(board.value);
    document.onmousemove = board.value.mousemove.bind(board.value);
    document.oncontextmenu = board.value.mouseup.bind(board.value);
    window.onresize = board.value.resetZoom.bind(board.value);
    svg.value.addEventListener('keydown', keyDown);
    svg.value.addEventListener('keyup', keyUp);
    svg.value.focus();
});

const cancelDocumentMouseHook = () => {
    document.onmouseup = null;
    document.onmousemove = null;
    document.oncontextmenu = null;
    window.onresize = null;
    svg.value.removeEventListener('keydown', keyDown);
    svg.value.removeEventListener('keyup', keyUp);
};
onBeforeUnmount(cancelDocumentMouseHook);

const drop = e => {
    if (board.value.selectedLayer?.invisible) {
        CvNotification.warning({
            message: t('vis.configuration.layerInvisible'),
        });
        return;
    }
    if (board.value.selectedLayer?.locked) {
        CvNotification.warning({
            message: t('vis.configuration.layerLocked'),
        });
        return;
    }
    const point = board.value.svgInstance!.point(e.clientX, e.clientY);
    const primitiveInfo = store.get<IPrimitive>(dragPrimitiveInfo as symbol);

    const instance = reactive(
        PrimitiveInstanceFactory.getInstance(
            primitiveInfo!,
            board.value.selectedLayer!,
            board.value.getNewPrimitiveName(primitiveInfo!.id!, primitiveInfo!.name!)
        )
    );
    board.value.selectedLayer?.elements.push(instance as PrimitiveInstance);
    setSelectedPrimitive(instance, board.value.selectedLayer);
    instance.setPosition(Math.floor(point.x), Math.floor(point.y));
    const command = new CommandAddPrimitive(undefined, {primitive: instance as PrimitiveInstance, board: board.value});
    board.value.addCommand(command);
    svg.value.focus();
};

let mousedownPrimitive = null;

const setSelectedPrimitive = (primitive, layer) => {
    if (board.value !== props.configuration?.activatedBoard) {
        return;
    }
    if (board.value.selectedPrimitives.length === 1 && board.value.selectedPrimitives[0] === primitive) {
        return;
    }
    board.value.clearSelected(primitive);
    primitive.setSelected(true);
    board.value.selectedPrimitives.push(primitive);
    board.value.selectedLayer = layer;
    layer.setSelected(true);
    observer.dispatch(Topics.PROVIDE_PRIMITIVE_ATTR, primitive);
    board.value.movingType = MovingTypes.NONE;
};

const selectedSingle = (primitive, layer) => {
    if (primitive.locked || layer!.locked) {
        return;
    }
    if (primitive === mousedownPrimitive) {
        board.value.resetZoom();
        setSelectedPrimitive(primitive, layer);
    }
    mousedownPrimitive = null;
};

const beforeSelect = (primitive, layer, event) => {
    if (board.value.isSpaceDown) {
        board.value.beforePan(event);
        return;
    }
    if (board.value !== props.configuration?.activatedBoard) {
        return;
    }
    if (primitive.locked || layer!.locked) {
        return;
    }
    mousedownPrimitive = primitive;
    if (board.value.selectedPrimitives.length <= 1) {
        selectedSingle(primitive, layer);
    }
    board.value.movingType = MovingTypes.MOVE;
    board.value.setMovingStartPoint(event.clientX, event.clientY);
    board.value.initMovingRect();
};

observer.on(Topics.SELECT_SINGLE_PRIMITIVE, setSelectedPrimitive);

const showLayer = _ => {
    if (board.value !== props.configuration?.activatedBoard) {
        return;
    }
    observer.dispatch(Topics.PROVIDE_LAYER_INFO, board.value);
};
observer.on(Topics.SHOW_LAYER, showLayer);

const viewBoxChanged = viewbox => {
    board.value.attributes.viewBox.width = viewbox.width;
    board.value.attributes.viewBox.height = viewbox.height;
    board.value.attributes.viewBox.x = viewbox.x;
    board.value.attributes.viewBox.y = viewbox.y;
    observer.dispatch(Topics.EDITED, true);
};

observer.on(Topics.VIEWBOX_CHANGED, viewBoxChanged);

defineExpose({
    getSvg() {
        return svg.value;
    },
});

const selectLayerChanged = layer => {
    if (board.value !== props.configuration?.activatedBoard) {
        return;
    }
    board.value.clearSelected();
    board.value.selectedLayer?.setSelected(false);
    board.value.selectedLayer = layer;
    layer.setSelected(true);
};

const layerDeleted = layer => {
    if (board.value !== props.configuration?.activatedBoard) {
        return;
    }
    const selectedPrimitives = new Set(board.value.selectedPrimitives);
    layer.elements.forEach(element => {
        if (selectedPrimitives.has(element)) {
            selectedPrimitives.delete(element);
        }
    });
    board.value.selectedPrimitives.length = 0;
    board.value.selectedPrimitives.push(...Array.from(selectedPrimitives));
    if (board.value.selectedLayer === layer) {
        board.value.selectedLayer = board.value.layers[0];
        board.value.selectedLayer.setSelected(true);
    }
};
observer.on(Topics.LAYER_DELETED, layerDeleted);
observer.on(Topics.SELECTED_LAYER_CHANGED, selectLayerChanged);

const clickSelect = (primitive, layer) => board.value.clickSelect(primitive, layer);

const winCopy = () => {
    if (Utils.useWin()) {
        props.configuration.copy();
    }
};
const winPaste = () => {
    if (Utils.useWin()) {
        props.configuration.paste();
    }
};

const macCopy = () => {
    if (Utils.useMac()) {
        props.configuration.copy();
    }
};
const macPaste = () => {
    if (Utils.useMac()) {
        props.configuration.paste();
    }
};
</script>
