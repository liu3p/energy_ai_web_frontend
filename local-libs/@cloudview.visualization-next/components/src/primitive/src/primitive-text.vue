<!--eslint-disable vue/no-v-html-->
<template>
    <g class="vis-primitive-text" @dblclick.stop="beforeEdit">
        <box-rect v-show="model.selected" :type="model.type" :box="model.box" :zoom="props.zoom"></box-rect>
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
                style="display: flex; justify-content: center; align-items: center"
                :title="model.attributes.title"
                :style="styleConfig"
            >
                <div ref="textBoxWrap" style="white-space: nowrap; user-select: none">
                    {{ model.attributes['content-prefix'] }}
                    <div
                        ref="textBox"
                        style="white-space: nowrap"
                        :style="padding"
                        class="vis-primitive-text__text-box"
                        :class="{'is-edit': model.editing}"
                        :contenteditable="model.editing"
                        @keydown="contentChange"
                        @compositionstart="compositionHandler"
                        @compositionend="compositionHandler"
                        @mousedown="mousedown"
                        @mousemove="mousemove"
                        @mouseup="mouseup"
                        v-html="model.attributes.content"
                    ></div>
                    {{ model.attributes['content-suffix'] }}
                </div>
            </div>
        </foreignObject>
    </g>
</template>

<script setup lang="ts">
import BoxRect from './box.comp.vue';
import type {PrimitiveInstanceText} from '@cloudview.visualization-next/services';
import {requestFrame} from '@cloudview.visualization-next/services';
import {computed, nextTick, onBeforeUnmount, ref, watch} from 'vue';

interface IProps {
    model: PrimitiveInstanceText;
    zoom: number;
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

const textBoxWrap = ref();
const textBox = ref();
const resetBox = async (force?: boolean) => {
    await nextTick();
    let {offsetWidth, offsetHeight} = textBoxWrap.value;
    if (force) {
        offsetWidth = offsetWidth > props.model.attributes.width ? offsetWidth : props.model.attributes.width;
        offsetHeight = offsetHeight > props.model.attributes.height ? offsetHeight : props.model.attributes.height;
        props.model.setSize(offsetWidth, offsetHeight);
    } else {
        props.model.setSize(props.model.attributes.width, props.model.attributes.height);
    }
};

const composition = ref(false);
const compositionHandler = (): void => {
    composition.value = !composition.value;
    if (composition.value) {
        requestFrame.next(() => {
            resetBox(true);
        });
    }
};

const contentChange = event => {
    if (props.model.editing) {
        event.stopPropagation();
        requestFrame.next(() => {
            resetBox(true);
        });
    }
};

let isMousedown = false;

const cancelEdit = () => {
    if (!isMousedown) {
        return;
    }
    props.model.setEditing(false);
    isMousedown = false;
    resetBox(true);
    props.model.setContent(textBox.value.innerHTML);
    document.removeEventListener('mousedown', cancelEdit);
    document.removeEventListener('mouseup', cancelEdit);
};

const beforeCancelEdit = () => {
    isMousedown = true;
};

const beforeEdit = () => {
    props.model.setEditing(true);
    document.addEventListener('mousedown', beforeCancelEdit);
    document.addEventListener('mouseup', cancelEdit);
};

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', beforeCancelEdit);
    document.removeEventListener('mouseup', cancelEdit);
});

const content = computed(() => {
    return (
        (props.model.attributes['content-prefix'] ?? '') +
        props.model.attributes.content +
        (props.model.attributes['content-suffix'] ?? '')
    );
});

watch(
    () => [
        props.model.attributes['content-prefix'],
        props.model.attributes.content,
        props.model.attributes['content-suffix'],
        props.model.attributes['font-size'],
        props.model.attributes['font-weight'],
        props.model.attributes['font-style'],
        props.model.attributes['text-decoration-line'],
        props.model.attributes['style'],
    ],
    () => {
        resetBox(true);
    },
    {}
);

const mousemove = e => {
    if (props.model.editing) {
        e.stopPropagation();
    }
};
const mousedown = e => {
    if (props.model.editing) {
        e.stopPropagation();
    }
};
const mouseup = e => {
    if (props.model.editing) {
        e.stopPropagation();
    }
};
</script>

<style scoped lang="scss"></style>
