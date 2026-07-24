<template>
    <cv-dialog :model-value="true" size="medium" :title="t('vis.common.batchDownload')">
        <vis-layout ref="layout" :tags="props.tags" :no-more="noMore" :disabled="loadingDisabled" @search="getList">
            <template #option>
                <cv-checkbox v-model="checkAll" :disabled="cardList.length === 0" @change="onCheckAll"
                    >{{ t('vis.common.checkAll') }}
                </cv-checkbox>
            </template>
            <template #default>
                <vis-card
                    v-for="item in cardList"
                    ref="card"
                    :key="item.id"
                    type="small"
                    :info="item"
                    :img-src="
                        item.thumb_id
                            ? thumbMap[item.thumb_id]
                            : item.type === PrimitiveTypeAllEnum.IMAGE
                            ? thumbMap[item.model_id]
                            : Utils.svgString2Base64Img(thumbMap[item.model_id])
                    "
                    @check-change="checkChange"
                >
                </vis-card>
            </template>
        </vis-layout>
        <template #footer>
            <cv-button @click="emits('cancel')">{{ t('vis.common.cancel') }}</cv-button>
            <cv-button type="primary" :disabled="checkedList.size === 0" :loading="downloadLoading" @click="download">
                {{ t('vis.common.download') }}
            </cv-button>
        </template>
    </cv-dialog>
</template>
<script lang="ts" setup>
import {type Response, useLocale} from 'cloudview.ui-next';
import {computed, reactive, ref} from 'vue';
import type {
    IConfiguration,
    IErrorData,
    IObject,
    IOption,
    IPaginationData,
    IPrimitive,
} from '@cloudview.visualization-next/services';
import {ObjectApi, PrimitiveTypeAllEnum, StringUtils, Utils} from '@cloudview.visualization-next/services';
import VisCard from '../../card';
import VisLayout from './layout.comp.vue';

const {t} = useLocale();
defineOptions({name: 'ExportDialog'});
const emits = defineEmits(['cancel', 'refresh']);

interface IProps {
    title?: string;
    isPrimitive: boolean;
    tags: IOption[];
    getListMethod: (
        query: Record<string, string>
    ) => Promise<Response<IPaginationData<IPrimitive[] | IConfiguration[]> | IErrorData>>;
    exportMethod: (ids: string[], tag: string, search: string) => Promise<Response<Blob>>;
}

const props = withDefaults(defineProps<IProps>(), {
    title: '',
});

const cardList = reactive<IPrimitive[] | IConfiguration[]>([]);
const thumbMap = ref<Record<string, string>>({});
const total = ref(Infinity);
const noMore = computed(() => cardList.length >= total.value);
const loadingDisabled = ref(false);

const getThumbList = async (thumbSet, refresh) => {
    const ids = Array.from(thumbSet);
    const res = await ObjectApi.getAssets(ids);
    if (res.state) {
        if (refresh) {
            thumbMap.value = {};
        }
        res.data = res.data as IObject[];
        res.data.forEach(item => {
            thumbMap.value[item.id] = item.content;
        });
    }
};

let tag = '';
let keywords = '';
const getList = async (query, refresh) => {
    tag = query.tag;
    keywords = query.search;
    loadingDisabled.value = true;
    const res = await props.getListMethod(query);
    if (res.state) {
        if (refresh) {
            cardList.length = 0;
            checkAll.value = false;
            thumbMap.value = {};
        }
        const thumbSet = new Set<string>();
        res.data = res.data as IPaginationData<IPrimitive[] | IConfiguration[]>;
        res.data.data.forEach(item => {
            cardList.push(item);
            if (!StringUtils.isEmpty(item.thumb_id)) {
                thumbSet.add(item.thumb_id!);
            } else if (!StringUtils.isEmpty(item.model_id)) {
                thumbSet.add(item.model_id!);
            }
        });
        total.value = res.data.pagination.total_count;

        await getThumbList(thumbSet, refresh);
    }
    loadingDisabled.value = false;
};

const card = ref();
const checkedList = reactive<Set<string>>(new Set());
const checkChange = (val, id) => {
    if (val) {
        checkedList.add(id);
    } else {
        checkedList.delete(id);
    }
};
const checkAll = ref<boolean>(false);
const onCheckAll = val => {
    card.value.forEach(item => {
        item.card.setChecked(val);
        checkChange(val, item.card.info.id);
    });
};

const downloadLoading = ref(false);
const download = async () => {
    downloadLoading.value = true;
    const result = await props.exportMethod(checkAll.value ? [] : Array.from(checkedList), tag, keywords);
    if (result.state) {
        Utils.download(
            result.data,
            `${props.isPrimitive ? t('vis.primitive.primitiveList') : t('vis.configuration.configurationList')}.bin`
        );
    } else {
        CvMessage({type: 'error', message: t('vis.common.exportFailed')});
    }
    downloadLoading.value = false;
};
</script>
