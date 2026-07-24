<template>
    <div class="vis-board-args-panel">
        <div
            class="vis-board-args-panel__add-panel"
            :class="{'vis-board-args-panel__add-panel--show': props.bindingVisible}"
        >
            <vis-attr-add
                ref="attrAdd"
                :prefix-name="t('vis.common.parameter')"
                :groups="tags.slice(1)"
                :forbidden-keys="Object.keys(board?.parameters)"
                @close="closeAddPanel"
                @submit="addBoardAttr"
                @delete="deleteBoardAttr"
            ></vis-attr-add>
        </div>
        <div class="vis-board-args-panel__list-panel">
            <div class="vis-board-args-panel__list-panel-title">{{ t('vis.property.boardArgs') }}</div>
            <div class="vis-board-args-panel__list-panel-search">
                <cv-select v-model="selectedTag" size="small">
                    <cv-option
                        v-for="item in tags"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    ></cv-option>
                </cv-select>
                <span class="vis-board-args-panel__list-panel-split"></span>
                <cv-input
                    v-model="keywords"
                    size="small"
                    type="search"
                    :placeholder="t('vis.common.search')"
                ></cv-input>
            </div>
            <cv-scrollbar class="vis-board-args-panel__list-panel-body">
                <div v-for="item in filterParameters" :key="item.id" class="vis-board-args-panel__list-panel-item">
                    <vis-attr-input
                        v-if="keywords === '' || item.id.includes(keywords) || item.name.includes(keywords)"
                        v-model="item.value"
                        :config="item"
                        :show-edit="true"
                        :show-id="true"
                        :show-binding="false"
                        @edit="showAddPanel"
                    ></vis-attr-input>
                </div>
            </cv-scrollbar>
            <div class="vis-board-args-panel__list-panel-add-button">
                <cv-button @click="showAddPanel()">{{ t('vis.property.createParam') }}</cv-button>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {computed, inject, ref, watch} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {Configuration, editBoard, type IAttrDef, provideObserver, Topics} from '@cloudview.visualization-next/services';
import VisAttrAdd from '../../attr-add';
import VisAttrInput from '../../attr-input';

interface IProps {
    configuration: Configuration;
    bindingVisible: boolean;
}

const props = defineProps<IProps>();

defineOptions({name: 'BoardArgsPanel'});

const {t} = useLocale();
const board = inject(editBoard);
const keywords = ref('');
const selectedTag = ref('');
const filterParameters = computed(() => {
    return Object.values(board!.value?.parameters).filter(item => {
        return selectedTag.value === '' || item.tag === selectedTag.value;
    });
});
const tags = computed(() => {
    return [
        {
            value: '',
            label: t('vis.common.all'),
        },
        ...Object.values(board!.value.parameters)
            .filter(item => item.tag !== '')
            .map(item => {
                return {
                    value: item.tag,
                    label: item.tag,
                };
            }),
    ];
});

// 新增属性
const attrAdd = ref();
const observer = provideObserver();
const showAddPanel = (config?: IAttrDef) => {
    attrAdd.value.show(config);
    observer.dispatch(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, true);
};
const closeAddPanel = () => {
    observer.dispatch(Topics.SHOW_EDITOR_RIGHT_ADDITION_WINDOW, false);
};
const addBoardAttr = (param: IAttrDef) => {
    board!.value.parameters[param.id] = param;
    closeAddPanel();
};
const deleteBoardAttr = (id: string) => {
    Reflect.deleteProperty(board!.value.parameters, id);
    closeAddPanel();
};

watch(
    () => props.configuration?.activatedBoard,
    () => {
        closeAddPanel();
    },
    {immediate: true}
);
</script>
