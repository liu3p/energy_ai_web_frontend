<template>
    <cv-dialog :model-value="true" :title="t('vis.common.batchUpload')">
        <vis-layout ref="layout" :tags="tags" :no-more="true" :disabled="false" @search="onSearch">
            <template #option>
                <cv-checkbox v-model="checkAll" :disabled="filterList.length === 0" @change="onCheckAll"
                    >{{ t('vis.common.checkAll') }}
                </cv-checkbox>
            </template>
            <template #default>
                <div v-for="item in filterList" :key="item.id" @click="onItemClick(item)">
                    <vis-card
                        ref="card"
                        type="small"
                        :info="item"
                        :img-src="item.thumbnail"
                        :custom-class="{'vis-import-dialog__red-border': item.conflict}"
                        :check-able="!item.conflict"
                        @check-change="checkChange"
                    >
                    </vis-card>
                </div>
            </template>
        </vis-layout>
        <template #footer>
            <div class="vis-import-dialog__footer">
                <div class="vis-import-export-dialog__operation-left">
                    <cv-button class="button" :loading="previewLoading" @click="fileEl.click()"
                        >{{ t('vis.common.selectFile') }}
                    </cv-button>
                    <input ref="fileEl" style="display: none" type="file" accept=".bin" @change="preview" />
                </div>
                <div>
                    <cv-button @click="emits('cancel')">{{ t('vis.common.cancel') }}</cv-button>
                    <cv-button
                        type="primary"
                        :disabled="checkedList.size === 0"
                        :loading="uploadLoading"
                        @click="upload"
                    >
                        {{ t('vis.common.batchUpload') }}
                    </cv-button>
                </div>
            </div>
        </template>
    </cv-dialog>
</template>
<script lang="ts" setup>
import {type Response, useLocale} from 'cloudview.ui-next';
import type {IConfiguration, IImportPreviewItem, IOption, IPrimitive} from '@cloudview.visualization-next/services';
import {computed, reactive, ref} from 'vue';
import VisLayout from './layout.comp.vue';
import VisCard from '../../card';

interface IProps {
    isPrimitive: false;
    getListMethod: (query: Record<string, string>) => Promise<Response<IPrimitive[] | IConfiguration[]>>;
    importMethod: (file: File, ids: string[]) => Promise<Response<any>>;
    importPreviewMethod: (file: File) => Promise<Response<IImportPreviewItem[]>>;
}

const {t} = useLocale();
defineOptions({name: 'ImportDialog'});
const emits = defineEmits(['cancel', 'refresh']);
const props = defineProps<IProps>();

const fileEl = ref();
const card = ref();
const checkAll = ref<boolean>(false);
const checkedList = reactive<Set<string>>(new Set());
const onCheckAll = val => {
    card.value.forEach(item => {
        item.card.setChecked(val);
        checkChange(val, item.card.info.id);
    });
};
const checkChange = (val, id) => {
    if (val) {
        checkedList.add(id);
    } else {
        checkedList.delete(id);
    }
};
const onItemClick = (item: IImportPreviewItem) => {
    if (item.conflict) {
        CvMessage({
            type: 'warning',
            message: props.isPrimitive
                ? t('vis.primitive.importReduplicated')
                : t('vis.configuration.importReduplicated'),
        });
    }
};

const tag = ref('');
const keywords = ref('');
const onSearch = ({tag: _tag, keywords: _keywords}) => {
    tag.value = _tag ?? '';
    keywords.value = _keywords ?? '';
};
const filterList = computed<IImportPreviewItem[]>(() => {
    return cardList.value.filter(item => {
        return (
            (tag.value === '' || item.tag === tag.value) &&
            (keywords.value === '' || item.name.includes(keywords.value))
        );
    });
});
const cardList = ref<IImportPreviewItem[]>([]);
const tags = computed<IOption[]>(() => {
    return Array.from(new Set(cardList.value.map(item => item.tag)))
        .filter(item => item !== '')
        .map(item => {
            return {
                label: item,
                value: item,
            };
        });
});

const layout = ref();
let importFile: File;
const previewLoading = ref(false);
const preview = async event => {
    previewLoading.value = true;
    const file = event.target.files[0];
    layout.value.clear();
    tag.value = '';
    keywords.value = '';
    cardList.value = [];

    const result = await props.importPreviewMethod(file);
    if (result.state) {
        importFile = file;
        cardList.value = result.data;
    }
    previewLoading.value = false;
};

const uploadLoading = ref(false);
const upload = async () => {
    uploadLoading.value = true;
    const result = await props.importMethod(importFile, Array.from(checkedList));
    if (result.state) {
        emits('cancel');
        emits('refresh');
    } else {
        CvMessage({type: 'error', message: t('vis.common.failedUpload')});
    }
    uploadLoading.value = false;
};
</script>
