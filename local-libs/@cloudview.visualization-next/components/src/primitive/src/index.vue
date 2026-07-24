<template>
    <g
        v-if="props.editable"
        class="vis-primitive is-editable"
        :class="{
            'no-cursor':
                props.noCursor ||
                props.model.locked ||
                props.model.layer?.locked ||
                props.model.invisible ||
                props.model.layer?.invisible,
        }"
        :transform="transform"
        @mousedown.left.exact="mousedown"
        @mousedown.left.shift.exact.stop="mousedown"
        @click.stop
        @mouseup.left.exact="mouseup"
        @click.ctrl.exact.stop="winSelect"
        @click.meta.exact.stop="macSelect"
    >
        <component :is="compDict[model.type]" :model="model" :zoom="props.zoom"></component>
        <title>{{ model.attributes?.title }}</title>
        <vis-primitive-animation
            :flash="model.attributes.flash"
            :flash-begin="model.attributes['flash-begin']"
            :flash-dur="model.attributes['flash-dur']"
        ></vis-primitive-animation>
    </g>
    <g v-else ref="browserG" class="vis-primitive" :style="{cursor: cursorType}" :transform="transform">
        <component :is="browserCompDict[model.type]" :model="model"></component>
        <title>{{ model.attributes?.title }}</title>
        <vis-primitive-animation
            :flash="model.attributes.flash"
            :flash-begin="model.attributes['flash-begin']"
            :flash-dur="model.attributes['flash-dur']"
        ></vis-primitive-animation>
        <vis-primitive-error
            v-if="model.hasBindingError"
            :x="model.getMinX()"
            :y="model.getMinY()"
            :end-x="model.getMaxX()"
            :end-y="model.getMaxY()"
        ></vis-primitive-error>
    </g>
</template>
<script lang="ts" setup>
import type {PrimitiveInstance} from '@cloudview.visualization-next/services';
import {eventNames, PrimitiveTypeAllEnum, Utils} from '@cloudview.visualization-next/services';

import VisPrimitiveAnimation from './primitive-animation.vue';
import VisPrimitiveError from './primitive-error.vue';
import SvgRect from './primitive-svg-rect.comp.vue';
import SvgEllipse from './primitive-svg-ellipse.comp.vue';
import SvgLine from './primitive-svg-line.comp.vue';
import Svg from './primitive-svg.comp.vue';
import Text from './primitive-text.vue';
import SvgImage from './primitive-img.vue';
import SvgEllipseBrowser from './primitive-svg-ellipse-browser.comp.vue';
import SvgLineBrowser from './primitive-svg-line-browser.comp.vue';
import SvgRectBrowser from './primitive-svg-rect-browser.comp.vue';
import TextBrowser from './primitive-text-browser.vue';
import SvgBrowser from './primitive-svg-browser.vue';
import SvgImageBrowser from './primitive-img-browser.vue';
import {computed, onMounted, ref} from 'vue';

defineOptions({name: 'Primitive'});
const emits = defineEmits(['before-select', 'selected', 'click-select']);

interface IProps {
    model: PrimitiveInstance;
    editable?: boolean;
    noCursor?: boolean;
    zoom?: number;
}

const props = withDefaults(defineProps<IProps>(), {
    editable: false,
    noCursor: false,
    zoom: 1,
});

const compDict = {
    [PrimitiveTypeAllEnum.RECT]: SvgRect,
    [PrimitiveTypeAllEnum.SVG]: Svg,
    [PrimitiveTypeAllEnum.ELLIPSE]: SvgEllipse,
    [PrimitiveTypeAllEnum.LINE]: SvgLine,
    [PrimitiveTypeAllEnum.TEXT]: Text,
    [PrimitiveTypeAllEnum.IMAGE]: SvgImage,
};

const mousedown = event => {
    requestAnimationFrame(() => {
        emits('before-select', props.model, event);
    });
};

const mouseup = () => {
    emits('selected', props.model);
};

const transform = computed(() => {
    let transformContent = '';
    if (props.model.attributes.rotate! % 360 !== 0) {
        const {centerX, centerY} = props.model.getCenter();
        transformContent += `rotate(${props.model.attributes.rotate}, ${centerX}, ${centerY})`;
    }
    const {scaleX, scaleY, translateX, translateY} = props.model.getFlip();
    if (scaleX === -1 || scaleY === -1) {
        transformContent += `scale(${scaleX}, ${scaleY}) translate(${translateX}, ${translateY})`;
    }
    return transformContent;
});

const browserCompDict = {
    [PrimitiveTypeAllEnum.ELLIPSE]: SvgEllipseBrowser,
    [PrimitiveTypeAllEnum.LINE]: SvgLineBrowser,
    [PrimitiveTypeAllEnum.RECT]: SvgRectBrowser,
    [PrimitiveTypeAllEnum.TEXT]: TextBrowser,
    [PrimitiveTypeAllEnum.SVG]: SvgBrowser,
    [PrimitiveTypeAllEnum.IMAGE]: SvgImageBrowser,
};

const cursorType = computed(() => {
    return Reflect.ownKeys(props.model.eventDict).length > 0 ? 'pointer' : 'default';
});

const execEventCallback = (name, ev, currentTarget) => {
    const eventCallback = props.model.eventDict[name];
    if (Utils.isFunction(eventCallback)) {
        eventCallback(ev, currentTarget);
    }
};

const winSelect = event => {
    if (!props.model.locked && !props.model.layer!.locked) {
        if (Utils.useWin()) {
            emits('click-select', props.model);
        }
    }
};

const macSelect = event => {
    if (!props.model.locked && !props.model.layer!.locked) {
        if (Utils.useMac()) {
            emits('click-select', props.model);
        }
    }
};

const browserG = ref();
onMounted(() => {
    if (!props.editable) {
        let clickTimer = 0;
        let manualClick = false;
        eventNames.forEach(eventName => {
            browserG.value.addEventListener(eventName, ev => {
                const {currentTarget} = ev;
                if (eventName === 'click') {
                    if (manualClick) {
                        manualClick = false;
                        execEventCallback(eventName, ev, currentTarget);
                    } else {
                        clearTimeout(clickTimer);
                        ev.stopPropagation();
                        ev.preventDefault();
                        clickTimer = window.setTimeout(() => {
                            if (!manualClick) {
                                manualClick = true;
                                ev = document.createEvent('MouseEvents');
                                ev.initEvent(eventName, true, true);
                                currentTarget.dispatchEvent(ev);
                            }
                        }, 200);
                    }
                } else if (eventName === 'dblclick') {
                    clearTimeout(clickTimer);
                    execEventCallback(eventName, ev, currentTarget);
                } else {
                    execEventCallback(eventName, ev, currentTarget);
                }
            });
        });
    }
});
</script>
