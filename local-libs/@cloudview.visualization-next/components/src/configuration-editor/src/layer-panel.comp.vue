<template>
    <div class="vis-layer-panel" @click="focusBoard">
        <span class="vis-layer-panel__title">{{ t('vis.configuration.SVGLayer') }}</span>
        <div class="vis-layer-panel__content">
            <cv-scrollbar>
                <div class="vis-layer-panel__container">
                    <ul v-for="(layer, index) in layers" :key="layer.id" class="vis-layer-panel__list">
                        <li class="vis-layer-panel__item" :class="{'is-selected': board.selectedLayer === layer}">
                            <cv-icon v-if="!layer.invisible" @click="layerInvisible(layer)">
                                <cv-icon-eye></cv-icon-eye>
                            </cv-icon>
                            <cv-checkbox v-else @change="layer.invisible = !layer.invisible"></cv-checkbox>
                            <cv-icon :class="{'is-locked': layer.locked}" @click="layerLocked(layer)">
                                <cv-icon-unlock v-if="!layer.locked"></cv-icon-unlock>
                                <cv-icon-lock v-else></cv-icon-lock>
                            </cv-icon>
                            <cv-icon
                                class="vis-layer-panel__expand"
                                :class="{'is-collapse': !expandDict[layer.id]}"
                                :size="12"
                                @click="expandDict[layer.id] = !expandDict[layer.id]"
                            >
                                <cv-icon-arrow-down></cv-icon-arrow-down>
                            </cv-icon>
                            <label
                                :title="`${t('vis.configuration.SVGLayer')}${layer.index}`"
                                @click="selectedLayerChanged(layer)"
                                >{{ `${t('vis.configuration.SVGLayer')}${layer.index}` }}</label
                            >
                            <cv-button
                                type="primary"
                                text
                                :icon="CvIconUp"
                                :disabled="index === 0"
                                @click="layerUp(layer, index)"
                            ></cv-button>
                            <cv-button
                                type="primary"
                                text
                                :icon="CvIconDown"
                                :disabled="index === layers.length - 1"
                                @click="layerDown(layer, index)"
                            ></cv-button>
                            <cv-button
                                type="primary"
                                text
                                :icon="CvIconClose"
                                @click="deleteLayer(index, layer)"
                            ></cv-button>
                        </li>

                        <transition name="vis-layer-panel__primitives">
                            <ul v-if="expandDict[layer.id]" class="vis-layer-panel__primitives">
                                <li
                                    v-for="item in layer.reverseElements"
                                    :key="item.id"
                                    class="vis-layer-panel__item is-primitive"
                                    :class="{
                                        'is-selected':
                                            item.selected &&
                                            !layer.invisible &&
                                            !layer.locked &&
                                            !item.locked &&
                                            !item.invisible,
                                        'is-locked': layer.locked || layer.invisible || item.locked || item.invisible,
                                    }"
                                >
                                    <cv-icon
                                        v-if="!item.invisible"
                                        :class="{'is-disabled': layer.invisible}"
                                        @click="() => layer.invisible || primitiveInvisible(item)"
                                    >
                                        <cv-icon-eye></cv-icon-eye>
                                    </cv-icon>
                                    <cv-checkbox
                                        v-else
                                        :disabled="layer.invisible"
                                        @change="primitiveInvisible(item)"
                                    ></cv-checkbox>
                                    <cv-icon
                                        :class="{'is-disabled': layer.locked, 'is-locked': item.locked}"
                                        @click="() => layer.locked || primitiveLocked(item)"
                                    >
                                        <cv-icon-unlock v-if="!item.locked"></cv-icon-unlock>
                                        <cv-icon-lock v-else></cv-icon-lock>
                                    </cv-icon>
                                    <label
                                        :title="item.name"
                                        @click.exact="selected(item, layer)"
                                        @click.ctrl.exact="winClickSelect(item, layer)"
                                        @click.meta.exact="macClickSelect(item, layer)"
                                        >{{ item.name }}</label
                                    >
                                </li>
                            </ul>
                        </transition>
                    </ul>
                </div>
            </cv-scrollbar>
        </div>
        <cv-button @click="addLayer">{{ t('vis.property.createLayer') }}</cv-button>
    </div>
</template>

<script lang="ts" setup>
import {useLocale} from 'cloudview.ui-next';
import {
    Board,
    CommandAddLayer,
    CommandLayerLock,
    CommandLayerVisible,
    CommandMoveLayer,
    CommandPrimitiveLock,
    CommandPrimitiveVisible,
    CommandRemoveLayer,
    Configuration,
    IdUtils,
    Layer,
    provideObserver,
    Topics,
    Utils,
} from '@cloudview.visualization-next/services';
import {computed, ref, watch} from 'vue';
import {
    CvIconArrowDown,
    CvIconClose,
    CvIconDown,
    CvIconEye,
    CvIconLock,
    CvIconUnlock,
    CvIconUp,
} from 'cloudview.ui-next-icon';

interface IProps {
    configuration: Configuration;
}

const props = defineProps<IProps>();

const {t} = useLocale();
defineOptions({name: 'LayerPanel'});

const observer = provideObserver();
const board = ref<Board>();

const expandDict = ref({});
const layers = computed<Layer[]>(() => {
    if (board.value?.layers) {
        const res = [...board.value!.layers].reverse();
        res.forEach(layer => {
            layer.reverseElements = [...layer.elements].reverse();
        });
        return res;
    }
    return [];
});
watch(
    layers,
    () => {
        layers.value?.forEach(layer => {
            expandDict.value[layer.id] = layer.id in expandDict.value ? expandDict.value[layer.id] : true;
        });
        return expandDict.value;
    },
    {immediate: true}
);

// 根据layer中的index的最大值 + 1得到新的index，同时根据index生成名字
const addLayer = () => {
    let maxIndex = 0;
    layers.value?.forEach(layer => {
        if (layer.index > maxIndex) {
            maxIndex = layer.index;
        }
    });
    const newLayer = new Layer({
        id: IdUtils.genLayerId(),
        index: maxIndex + 1,
        elements: [],
    });
    board.value?.layers.push(newLayer);
    const command = new CommandAddLayer(
        {layer: board.value!.selectedLayer!, board: board.value!},
        {
            layer: newLayer,
            board: board.value!,
        }
    );
    board.value!.addCommand(command);

    observer.dispatch(Topics.SELECTED_LAYER_CHANGED, newLayer);
};

const selectedLayerChanged = layer => {
    if (board.value?.selectedLayer !== layer) {
        observer.dispatch(Topics.SELECTED_LAYER_CHANGED, layer);
    }
};

const selected = (item, layer) => {
    if (layer.locked || layer.invisible || item.locked || item.invisible) {
        return;
    }
    observer.dispatch(Topics.SELECT_SINGLE_PRIMITIVE, item, layer);
};

const deleteLayer = async (index: number, layer: Layer) => {
    if (layers.value?.length === 1) {
        CvNotification.warning({
            // title: t(`vis.configuration.deleteLayerWarn`),
            message: t(`vis.configuration.deleteLayerWarning`),
        });
        return;
    }
    await CvMessageBox.confirm(t('vis.common.confirmDeleteLayer'), t('vis.common.prompt'), {
        type: 'info',
    });
    delete expandDict.value[layer.id];
    index = board.value!.layers.length - index - 1;
    const before = {board: board.value!, layer, index, selectedLayer: board.value!.selectedLayer!};
    board.value!.layers.splice(index, 1);
    observer.dispatch(Topics.LAYER_DELETED, layer);
    const after = {board: board.value!, selectedLayer: board.value!.selectedLayer!, index};
    const command = new CommandRemoveLayer(before, after);
    board.value!.addCommand(command);
};

const provideLayerInfo = (boardInfo: Board) => (board.value = boardInfo);
observer.on(Topics.PROVIDE_LAYER_INFO, provideLayerInfo);
observer.dispatch(Topics.SHOW_LAYER);

watch(
    () => props.configuration?.activatedBoard,
    () => {
        board.value = props.configuration?.activatedBoard;
    },
    {immediate: true}
);

const layerMoveCommandRecord = (beforeIndex: number, afterIndex: number) => {
    const command = new CommandMoveLayer(
        {board: board.value!, index: beforeIndex},
        {
            board: board.value!,
            index: afterIndex,
        }
    );
    board.value?.addCommand(command);
};

const layerUp = (layer, index) => {
    index = board.value!.layers.length - index - 1;
    board.value!.layers.splice(index, 1);
    board.value!.layers.splice(index + 1, 0, layer);
    layerMoveCommandRecord(index, index + 1);
};

const layerDown = (layer, index) => {
    index = board.value!.layers.length - index - 1;
    board.value!.layers.splice(index, 1);
    board.value!.layers.splice(index - 1, 0, layer);
    layerMoveCommandRecord(index, index - 1);
};

const layerInvisible = layer => {
    const before = {layer, invisible: layer.invisible};
    layer.setInvisible(!layer.invisible);
    const command = new CommandLayerVisible(before, {layer, invisible: layer.invisible});
    board.value!.addCommand(command);
};

const primitiveInvisible = primitive => {
    const before = {primitive, invisible: primitive.invisible};
    primitive.invisible = !primitive.invisible;
    const command = new CommandPrimitiveVisible(before, {primitive, invisible: primitive.invisible});
    board.value!.addCommand(command);
};

const layerLocked = layer => {
    const before = {layer, locked: layer.locked, board: board.value!};
    layer.setLocked(!layer.locked);
    board.value?.afterLayerLocked(layer);
    const command = new CommandLayerLock(before, {layer, locked: layer.locked, board: board.value!});
    board.value?.addCommand(command);
};

const primitiveLocked = primitive => {
    const before = {primitive, locked: primitive.locked, board: board.value!};
    primitive.setLocked(!primitive.locked);
    board.value?.afterPrimitiveLocked(primitive);
    const command = new CommandPrimitiveLock(before, {primitive, locked: primitive.locked, board: board.value!});
    board.value?.addCommand(command);
};

const winClickSelect = (item, layer) => {
    if (layer.locked || layer.invisible || item.locked || item.invisible) {
        return;
    }
    if (Utils.useWin()) {
        board.value!.clickSelect(item, layer);
    }
};

const macClickSelect = (item, layer) => {
    if (layer.locked || layer.invisible || item.locked || item.invisible) {
        return;
    }
    if (Utils.useMac()) {
        board.value!.clickSelect(item, layer);
    }
};

const focusBoard = () => {
    board.value?.svgInstance?.node.focus();
};
</script>
