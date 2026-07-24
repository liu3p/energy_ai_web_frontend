<template>
    <g class="vis-primitive-svg">
        <rect
            :x="model.attributes.x"
            :y="model.attributes.y"
            :width="model.attributes.width"
            :height="model.attributes.height"
            fill-opacity="0"
        ></rect>
        <g ref="contentBox"></g>
    </g>
</template>

<script lang="ts" setup>
import {getModels, PrimitiveInstanceSvg, SvgAttrs, throwError} from '@cloudview.visualization-next/services';
import {onMounted, ref, watch} from 'vue';
import {Dom, SVG} from '@svgdotjs/svg.js';

interface IProps {
    model: PrimitiveInstanceSvg;
}

const props = withDefaults(defineProps<IProps>(), {});

const contentBox = ref();
let group: Dom | null = null;
let primitive: Node | null = null;
let primitiveStage: Dom | null = null;

const setConfig = () => {
    if (!primitiveStage) return;
    Object.keys(props.model.attributes).forEach(key => {
        if (SvgAttrs.has(key)) {
            watch(
                () => props.model.attributes[key],
                value => {
                    if (primitiveStage) {
                        primitiveStage.attr(key, value);
                    }
                },
                {
                    immediate: true,
                }
            );
        } else if (key === 'style') {
            watch(
                () => props.model.attributes[key],
                value => {
                    if (primitiveStage) {
                        primitiveStage.node.setAttribute('style', props.model.attributes[key]);
                    }
                },
                {
                    immediate: true,
                }
            );
        }
    });
};

const setStatus = () => {
    if (!primitiveStage) return;
    for (const key in props.model.status) {
        const groups = primitiveStage.children().filter(e => e.type === 'g');
        groups[Number(key)].attr('visibility', props.model.status[key] ? 'visible' : 'hidden');
    }
};

const init = () => {
    try {
        if (props.model.model) {
            contentBox.value.innerHTML = props.model.model;
            primitive = contentBox.value.querySelector('svg');
            if (primitive === null) {
                throw new Error('Primitive svg file has no svg element');
            }
            const titleNodes: Node[] = [];
            primitive.childNodes.forEach(node => {
                if (node.nodeName === 'title') {
                    titleNodes.push(node);
                }
            });
            titleNodes.forEach(el => primitive?.removeChild(el));
            primitiveStage = SVG(primitive);
            setConfig();
            setStatus();
        }
    } catch (e: any) {
        throwError('PrimitiveSvg', e.message);
    }
};

onMounted(() => {
    group = SVG(contentBox.value);
    if (props.model.model) {
        init();
    } else {
        getModels(props.model);
    }
});

watch(
    () => props.model.model,
    () => {
        if (primitiveStage) {
            primitiveStage.remove();
        }
        init();
    }
);

watch(
    () => props.model.status,
    () => {
        setStatus();
    },
    {deep: true}
);
</script>
