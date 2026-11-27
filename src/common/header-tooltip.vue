<template>
    <cv-tooltip :disabled="!isOverflow" :content="content" effect="dark" placement="top">
        <div
            ref="textRef"
            class="text-ellipsis"
            :class="{
                'multi-line': maxLines > 1,
                'color-error': props.colorType === ColorType.ERROR,
                'color-normal': props.colorType === ColorType.NORMAL,
                'color-success': props.colorType === ColorType.SUCCESS,
            }"
            :style="{
                '--max-lines': maxLines,
                'text-overflow': maxLines === 1 ? 'ellipsis' : '',
            }"
        >
            {{ content }}
            <slot></slot>
        </div>
    </cv-tooltip>
</template>

<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import {ColorType} from '@/common/dict';
const props = defineProps({
    content: {type: String, default: ''},
    maxLines: {type: Number, default: 1}, // 支持多行省略
    height: {type: Number, default: 19},
    colorType: {type: Number, default: ColorType.DEF},
});

const textRef = ref();
const isOverflow = ref(false);

// 溢出检测逻辑
const checkOverflow = () => {
    if (!textRef.value) return;
    // 单行省略是横向溢出，scrollHeight 恒等于一行高，必须比宽度
    if (props.maxLines === 1) {
        isOverflow.value = textRef.value.scrollWidth > textRef.value.clientWidth;
        return;
    }
    const lineHeight = parseInt(getComputedStyle(textRef.value).lineHeight);
    if (lineHeight) {
        isOverflow.value = textRef.value.scrollHeight > lineHeight * props.maxLines;
    } else {
        isOverflow.value = textRef.value.scrollHeight > props.height * props.maxLines;
    }
};

// 监听容器尺寸变化
let observer: ResizeObserver | undefined;
onMounted(() => {
    observer = new ResizeObserver(checkOverflow);
    observer.observe(textRef.value);
});
onBeforeUnmount(() => {
    observer?.disconnect();
});
</script>

<style scoped>
.text-ellipsis {
    overflow: hidden;
    white-space: nowrap;
}

/* 多行省略支持 */
.text-ellipsis.multi-line {
    display: -webkit-box;
    -webkit-line-clamp: var(--max-lines);
    -webkit-box-orient: vertical;
    white-space: normal;
    font-weight: 700;
}
.color-normal {
    color: #3162e1;
}
.color-error {
    color: #ef424c;
}
.color-success {
    color: #1da500;
}
</style>
