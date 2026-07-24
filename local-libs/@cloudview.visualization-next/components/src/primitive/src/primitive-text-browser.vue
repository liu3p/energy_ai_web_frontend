<!--eslint-disable vue/no-v-html-->
<template>
    <g class="vis-primitive-text">
        <foreignObject
            :height="model.attributes.height"
            :width="model.attributes.width"
            :x="model.attributes.x"
            :y="model.attributes.y"
            class="vis-primitive-text__foreign-object"
            style="overflow: visible"
        >
            <div
                ref="textStage"
                class="vis-primitive-text__foreign"
                :title="model.attributes.title"
                style="display: flex; justify-content: center; align-items: center"
                :style="styleConfig"
            >
                <div
                    ref="textBox"
                    class="vis-primitive-text__text-box"
                    style="white-space: nowrap"
                    :style="padding"
                    v-html="content"
                ></div>
            </div>
        </foreignObject>
    </g>
</template>

<script setup lang="ts">
import type {PrimitiveInstanceText} from '@cloudview.visualization-next/services';
import {computed, ref} from 'vue';

interface IProps {
    model: PrimitiveInstanceText;
}

const props = defineProps<IProps>();

const textAlignDict = {
    'left': 'flex-start',
    'center': 'center',
    'right': 'flex-end',
};

const verticalAlignDict = {
    'top': 'flex-start',
    'middle': 'center',
    'bottom': 'flex-end',
};

const styleConfig = computed(() => {
    return {
        opacity: props.model.attributes.opacity,
        'background-color': props.model.attributes['background-color'],
        color: props.model.attributes.color,
        'font-size': props.model.attributes['font-size'] + 'px',
        'font-weight': props.model.attributes['font-weight'] ? 'bold' : 'normal',
        'font-style': props.model.attributes['font-style'] ? 'italic' : 'normal',
        'text-decoration-line': props.model.attributes['text-decoration-line'] ? 'underline' : 'none',
        'justify-content': textAlignDict[props.model.attributes['text-align']],
        'align-items': verticalAlignDict[props.model.attributes['vertical-align']],
        width: props.model.attributes.width + 'px',
        height: props.model.attributes.height + 'px',
    };
});

const padding = computed(() => {
    return {
        padding: (props.model.attributes['font-size'] || 12) / 2 + 'px',
    };
});

const textBox = ref();

const content = computed(() => {
    return (
        (props.model.attributes['content-prefix'] ?? '') +
        props.model.attributes.content +
        (props.model.attributes['content-suffix'] ?? '')
    );
});
</script>
