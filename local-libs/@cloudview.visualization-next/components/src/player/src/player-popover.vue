<template>
    <div
        v-if="visible"
        ref="popover"
        class="vis-player-popover"
        :class="'vis-player-popover--' + direction"
        :style="{'backgroundColor': backColor, 'color': foreColor, 'top': top, 'left': left, 'width': width}"
        @click.stop
    >
        <div class="vis-player-popover__title">{{ title }}</div>
        <!--eslint-disable-next-line-->
        <div class="vis-player-popover__content" v-html="content"></div>
        <div
            class="vis-player-popover__arrow"
            :class="'vis-player-popover__arrow--' + direction"
            :style="{'borderTopColor': backColor, 'borderRightColor': backColor}"
        ></div>
    </div>
</template>

<script lang="ts" setup>
import {type IBindingPopover, type IPrimitiveInstance, Utils} from '@cloudview.visualization-next/services';
import {computed, nextTick, ref} from 'vue';

defineOptions({name: 'VisPlayerPopover'});

const props = defineProps<{
    boardEl: HTMLElement;
}>();

const popover = ref();
const visible = ref(false);
const title = ref('');
const template = ref('');
const direction = ref('');
const top = ref('');
const left = ref('');
const backColor = ref('');
const foreColor = ref('');
const width = ref('');
let targetEl: SVGElement;
const primitive = ref<IPrimitiveInstance>({} as IPrimitiveInstance);
const content = computed(() => Utils.parseTemplate(template.value, primitive.value));

const locationPopover = () => {
    nextTick(() => {
        if (visible.value) {
            const boardRect = props.boardEl.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            const relationTop = targetRect.top - boardRect.top;
            const relationLeft = targetRect.left - boardRect.left;
            const arrowSize = 14;
            switch (direction.value) {
                case 'left':
                    top.value = `${relationTop + targetRect.height / 2}px`;
                    left.value = `${relationLeft - arrowSize}px`;
                    break;
                case 'right':
                    top.value = `${relationTop + targetRect.height / 2}px`;
                    left.value = `${relationLeft + targetRect.width + arrowSize}px`;
                    break;
                case 'top':
                    top.value = `${relationTop - arrowSize}px`;
                    left.value = `${relationLeft + targetRect.width / 2}px`;
                    break;
                case 'bottom':
                    top.value = `${relationTop + targetRect.height + arrowSize}px`;
                    left.value = `${relationLeft + targetRect.width / 2}px`;
                    break;
            }
        }
    });
};

const show = (binding: IBindingPopover, instance: IPrimitiveInstance, event: Event, target: SVGElement) => {
    event.stopPropagation();
    targetEl = target;
    primitive.value = instance;
    template.value = binding.template;
    title.value = binding.title;
    direction.value = binding.direction;
    backColor.value = binding.backColor;
    foreColor.value = binding.foreColor;
    width.value = /^\d+$/.test(binding.width) ? binding.width + 'px' : binding.width;
    visible.value = true;
    locationPopover();
};
const close = () => {
    visible.value = false;
};

defineExpose({show, close, locationPopover});
</script>
