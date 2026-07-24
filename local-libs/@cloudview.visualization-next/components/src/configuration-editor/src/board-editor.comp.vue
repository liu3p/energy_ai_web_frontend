<template>
    <div
        class="vis-board-editor"
        :class="{'is-hidden': hideEditor, 'is-binding-active': additionWindowVisible[selectedMenu]}"
        @mouseover="mouseover"
        @mouseout="mouseout"
    >
        <div class="vis-board-editor__handle" :class="{'is-hidden': hideHandle}" @click="hideEditor = !hideEditor">
            <cv-icon>
                <component :is="hideEditor ? CvIconDArrowLeftOpacity : CvIconDArrowRightOpacity"></component>
            </cv-icon>
        </div>

        <div class="vis-board-editor__container">
            <keep-alive include="LayerPanel,BoardArgsPanel">
                <component
                    :is="compDict[selectedMenu]"
                    :configuration="props.configuration"
                    :binding-visible="additionWindowVisible[selectedMenu]"
                ></component>
            </keep-alive>
        </div>

        <div class="vis-board-editor__menu">
            <div
                v-for="item in menu"
                :key="item.key"
                class="vis-board-editor__menu-item"
                :class="{'is-selected': item.key === selectedMenu}"
                @click="menuChange(item)"
            >
                <cv-icon :size="36">
                    <component :is="item.icon"></component>
                </cv-icon>
                <span>{{ item.name }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {onUnmounted, ref} from 'vue';
import {
    CvIconDArrowLeftOpacity,
    CvIconDArrowRightOpacity,
    CvIconLayer,
    CvIconManage,
    CvIconProps,
} from 'cloudview.ui-next-icon';
import {CvIcon, useLocale} from 'cloudview.ui-next';
import {
    Configuration,
    EditorMenuKey,
    PrimitiveInstance,
    provideObserver,
    Topics,
} from '@cloudview.visualization-next/services';
import AttrsPanel from './attrs-panel.comp.vue';
import LayerPanel from './layer-panel.comp.vue';
import BoardArgsPanel from './board-args-panel.vue';

interface IProps {
    configuration: Configuration;
}

const props = defineProps<IProps>();

defineOptions({name: 'BoardEditor'});

const {t} = useLocale();
const hideHandle = ref(true);
const hideEditor = ref(false);
const observer = provideObserver();
const primitive = ref<PrimitiveInstance>();

const additionWindowVisible = ref({
    [EditorMenuKey.ATTR]: false,
    [EditorMenuKey.LAYER]: false,
    [EditorMenuKey.BOARD_ARGS]: false,
});
const showAdditionWindowCB = observer.on(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, visible => {
    additionWindowVisible.value[selectedMenu.value] = visible;
});
onUnmounted(() => {
    observer.off(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, showAdditionWindowCB);
});

const mouseover = () => (hideHandle.value = false);

const mouseout = () => (hideHandle.value = true);

const menu = [
    {
        icon: CvIconProps,
        name: t('vis.common.property'),
        key: EditorMenuKey.ATTR,
    },
    {
        icon: CvIconLayer,
        name: t('vis.configuration.SVGLayer'),
        key: EditorMenuKey.LAYER,
    },
    {
        icon: CvIconManage,
        name: t('vis.property.boardArgs'),
        key: EditorMenuKey.BOARD_ARGS,
    },
];

const selectedMenu = ref(EditorMenuKey.ATTR);

const menuChange = item => {
    selectedMenu.value = item.key;
    observer.dispatch(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, false);
};

const compDict = {
    [EditorMenuKey.ATTR]: AttrsPanel,
    [EditorMenuKey.LAYER]: LayerPanel,
    [EditorMenuKey.BOARD_ARGS]: BoardArgsPanel,
};
</script>
