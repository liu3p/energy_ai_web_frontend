<template>
    <g v-show="resizePoints.show.value" class="vis-resize-points" :transform="resizePoints.transform.value">
        <circle
            v-for="(point, index) in resizePoints.points.value"
            v-show="point.visible"
            :key="index"
            class="vis-resize-points__item"
            :cx="point.cx"
            :cy="point.cy"
            :cursor="noCursor && point.canDelete ? 'auto' : point.cursor"
            :opacity="point.needOpacity ? 0.7 : 1"
            :r="point.size"
            fill="#5a81e7"
            @mousedown.left.exact.stop="resizeStart($event, point, index)"
            @mousedown.left.shift.exact.stop="resizeStart($event, point, index)"
            @mousedown.left.alt.exact.stop.prevent="deletePoint($event, point, index)"
        >
            <title v-if="point.canDelete">{{ title }}</title>
        </circle>
        <image
            v-show="resizePoints.rotatePoint.value.visible"
            :x="resizePoints.rotatePoint.value.x"
            :y="resizePoints.rotatePoint.value.y"
            :width="resizePoints.rotatePoint.value.size"
            :height="resizePoints.rotatePoint.value.size"
            cursor="crosshair"
            :transform="resizePoints.rotatePointTransform.value"
            xlink:href="data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgdmVyc2lvbj0iMS4xIj48cGF0aCBzdHJva2U9IiM1YTgxZTciIGZpbGw9IiM1YTgxZTciIGQ9Ik0xNS41NSA1LjU1TDExIDF2My4wN0M3LjA2IDQuNTYgNCA3LjkyIDQgMTJzMy4wNSA3LjQ0IDcgNy45M3YtMi4wMmMtMi44NC0uNDgtNS0yLjk0LTUtNS45MXMyLjE2LTUuNDMgNS01LjkxVjEwbDQuNTUtNC40NXpNMTkuOTMgMTFjLS4xNy0xLjM5LS43Mi0yLjczLTEuNjItMy44OWwtMS40MiAxLjQyYy41NC43NS44OCAxLjYgMS4wMiAyLjQ3aDIuMDJ6TTEzIDE3Ljl2Mi4wMmMxLjM5LS4xNyAyLjc0LS43MSAzLjktMS42MWwtMS40NC0xLjQ0Yy0uNzUuNTQtMS41OS44OS0yLjQ2IDEuMDN6bTMuODktMi40MmwxLjQyIDEuNDFjLjktMS4xNiAxLjQ1LTIuNSAxLjYyLTMuODloLTIuMDJjLS4xNC44Ny0uNDggMS43Mi0xLjAyIDIuNDh6Ii8+PC9zdmc+"
            preserveAspectRatio="none"
            @mousedown.left.exact.stop="rotateStart($event)"
        ></image>
    </g>
</template>

<script lang="ts" setup>
import {
    Board,
    CommandPrimitiveResize,
    CommandPrimitiveRotate,
    type ICommandPrimitiveResizeParams,
    type ICommandPrimitiveRotateParams,
    PrimitiveInstance,
    provideObserver,
    ResizePoints,
    Utils,
} from '@cloudview.visualization-next/services';
import {onBeforeUnmount, ref, watch} from 'vue';
import {Svg} from '@svgdotjs/svg.js';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

interface IProps {
    model: PrimitiveInstance | null;
    svgInstance: Svg | null;
    board: Board;
}

const props = defineProps<IProps>();

const observer = provideObserver();
const resizePoints = new ResizePoints(props.svgInstance, props.model, props.board);

const title = t(Utils.useMac() ? 'vis.configuration.macDeleteAnchor' : 'vis.configuration.winDeleteAnchor');

watch(
    () => props.model,
    () => {
        resizePoints.setPrimitiveModel(props.model!);
    }
);

watch(
    () => props.svgInstance,
    () => {
        resizePoints.setSvgInstance(props.svgInstance!);
    }
);

const resizing = event => {
    resizePoints.resizing(event);
};

let before: ICommandPrimitiveResizeParams;

const resizeStart = (evt, point, index) => {
    props.board.cancelPrimitiveAttrsChangeWatch();
    resizePoints.resizeStart(evt, point, index);
    document.addEventListener('mousemove', resizing);
    document.addEventListener('mouseup', resizeEnd);
    before = {primitive: props.model!, attributes: {...props.model!.attributes!}};
};

const resizeEnd = event => {
    if (event.button !== 0) return;
    resizePoints.resizeEnd(event);
    document.removeEventListener('mousemove', resizing);
    document.removeEventListener('mouseup', resizeEnd);
    props.board.createPrimitiveAttrsChangeWatch();
    const command = new CommandPrimitiveResize(before, {
        primitive: props.model!,
        attributes: {...props.model!.attributes!},
    });
    props.board.addCommand(command);
};

const deletePoint = (evt, point, index) => {
    resizePoints.deletePoint(evt, point, index);
};

let beforeRotate: ICommandPrimitiveRotateParams;

const rotateEnd = event => {
    resizePoints.rotateEnd(event);
    props.board.createPrimitiveAttrsChangeWatch();
    document.removeEventListener('mousemove', rotating);
    document.removeEventListener('mouseup', rotateEnd);
    const command = new CommandPrimitiveRotate(beforeRotate, {
        primitive: props.model!,
        attributes: JSON.parse(JSON.stringify(props.model!.attributes!)),
    });
    props.board.addCommand(command);
};

const rotating = event => {
    resizePoints.rotating(event);
};

const rotateStart = event => {
    resizePoints.rotateStart(event);
    beforeRotate = {primitive: props.model!, attributes: JSON.parse(JSON.stringify(props.model!.attributes!))};
    props.board.cancelPrimitiveAttrsChangeWatch();
    document.addEventListener('mousemove', rotating);
    document.addEventListener('mouseup', rotateEnd);
};

const noCursor = ref(false);

const altDown = () => {
    noCursor.value = true;
};

const altUp = () => {
    noCursor.value = false;
};

defineExpose({altDown, altUp});

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', resizing);
    document.removeEventListener('mouseup', resizeEnd);
    document.removeEventListener('mousemove', rotating);
    document.removeEventListener('mouseup', rotateEnd);
});
</script>
