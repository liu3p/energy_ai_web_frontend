<template>
    <div
        class="vis-primitive-set"
        :class="{'is-hidden': hidden}"
        @mouseover="hiddenHandle = false"
        @mouseout="hiddenHandle = true"
    >
        <div class="vis-primitive-set__container">
            <span class="vis-primitive-set__title">{{ t('vis.primitive.primitiveGather') }}</span>
            <div class="vis-primitive-set__search">
                <cv-select v-model="selectedTag" size="small" @change="queryPrimitive(true)">
                    <cv-option
                        v-for="item in tags"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    ></cv-option>
                </cv-select>
                <span class="vis-primitive-set__split"></span>
                <cv-input
                    v-model="keywords"
                    size="small"
                    type="search"
                    :placeholder="t('vis.common.search')"
                    auto-blur-after-enter
                    auto-search
                    @search="queryPrimitive(true)"
                    @keydown.ctrl.z.exact.stop
                    @keydown.ctrl.y.exact.stop
                    @keydown.ctrl.shift.z.exact.stop
                    @keydown.meta.z.exact.stop
                    @keydown.meta.y.exact.stop
                    @keydown.meta.shift.z.exact.stop
                ></cv-input>
            </div>
            <cv-scrollbar>
                <ul
                    v-infinite-scroll="queryPrimitive"
                    class="vis-primitive-set__card-box"
                    :infinite-scroll-disabled="disabled"
                >
                    <vis-card
                        v-for="card in primitiveList"
                        :key="card.id"
                        :img-src="
                            card.type === PrimitiveTypeAllEnum.IMAGE
                                ? imgMap[card.model_id]
                                : Utils.svgString2Base64Img(imgMap[card.model_id])
                        "
                        type="mini"
                        :info="card"
                        custom-class="vis-primitive-set__card"
                    ></vis-card>
                </ul>
                <div v-if="loading" class="vis-primitive-set__loading-text">{{ t('vis.common.loading') }}</div>
            </cv-scrollbar>
        </div>
        <div class="vis-primitive-set__handle" :class="{'is-hidden': hiddenHandle}" @click="hidden = !hidden">
            <cv-icon>
                <component :is="hidden ? CvIconDArrowRightOpacity : CvIconDArrowLeftOpacity"></component>
            </cv-icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {computed, reactive, ref} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import type {IOption, IPaginationData, IPrimitive} from '@cloudview.visualization-next/services';
import {
    BasicEllipse,
    BasicLine,
    BasicRect,
    BasicText,
    type IObject,
    ObjectApi,
    PrimitiveApi,
    PrimitiveTypeAllEnum,
    StringUtils,
    Utils,
} from '@cloudview.visualization-next/services';
import VisCard from '../../card';
import {CvIconDArrowLeftOpacity, CvIconDArrowRightOpacity} from 'cloudview.ui-next-icon';

const {t} = useLocale();

defineOptions({name: 'PrimitiveSet'});
const hiddenHandle = ref(true);
const hidden = ref(false);

const tags = reactive<IOption[]>([
    {
        label: t('vis.common.allGroup'),
        value: '',
    },
]);
const basicPrimitiveList = reactive<IPrimitive[]>([BasicRect, BasicEllipse, BasicLine, BasicText]);
const primitiveList = reactive<IPrimitive[]>([]);
const selectedTag = ref('');
const keywords = ref('');
const page = ref(1);
const pageSize = 20;
const total = ref(Infinity);
const loading = ref(false);
const noMore = computed(() => total.value <= primitiveList.length);
const disabled = computed(() => loading.value || noMore.value);

const imgMap = ref<Record<string, string>>({
    [BasicRect.model_id!]: BasicRect.model!,
    [BasicEllipse.model_id!]: BasicEllipse.model!,
    [BasicText.model_id!]: BasicText.model!,
    [BasicLine.model_id!]: BasicLine.model!,
});

const getTags = async () => {
    const res = await PrimitiveApi.getTags();
    if (res?.state) {
        tags.length = 1;
        res.data = res.data as string[];
        tags.push(
            ...res.data
                .filter(item => !StringUtils.isEmpty(item))
                .map(item => {
                    return {
                        label: item,
                        value: item,
                    };
                })
        );
    }
};

getTags();

const getQueryInfo = (
    refresh: boolean
): {page: number; pageSize: number; tag?: string; keywords?: string; engineType: string} => {
    if (refresh) {
        page.value = 1;
    }
    const res = {
        pageSize,
        page: page.value,
        engineType: '2D',
    };
    if (selectedTag.value.length) {
        res['tag'] = selectedTag.value;
    }
    keywords.value = keywords.value.trim();
    if (keywords.value.length) {
        res['keywords'] = keywords.value;
    }
    return res;
};

const getImgList = async (thumbSet: Set<string>, refresh: boolean) => {
    const ids = Array.from(thumbSet);
    const res = await ObjectApi.getAssets(ids);
    if (res.state) {
        if (refresh) {
            imgMap.value = {
                [BasicRect.model_id!]: BasicRect.model!,
                [BasicEllipse.model_id!]: BasicEllipse.model!,
                [BasicText.model_id!]: BasicText.model!,
                [BasicLine.model_id!]: BasicLine.model!,
            };
        }
        res.data = res.data as IObject[];
        res.data.forEach(item => {
            imgMap.value[item.id] = item.content;
        });
        ids.forEach(id => {
            if (!(id in imgMap.value)) {
                imgMap.value[id] = '';
            }
        });
        primitiveList.forEach(primitive => {
            primitive.model = imgMap.value[primitive.model_id!];
        });
    }
};

const queryPrimitive = async (refresh = false) => {
    loading.value = true;
    const queryInfo = getQueryInfo(refresh);
    try {
        if (refresh) {
            primitiveList.length = 0;
            primitiveList.push(
                ...basicPrimitiveList.filter(item => {
                    let flag = true;
                    if ('keywords' in queryInfo && queryInfo.keywords!.length > 0) {
                        flag = flag && item.name.toLowerCase().includes(queryInfo.keywords!.toLowerCase());
                    }
                    if ('tag' in queryInfo && queryInfo.tag!.length > 0) {
                        flag = flag && item.tag.includes(queryInfo.tag!);
                    }
                    return flag;
                })
            );
        }
        const res = await PrimitiveApi.getPrimitiveList(queryInfo);
        if (res.state) {
            res.data = res.data as IPaginationData<IPrimitive[]>;
            if (refresh) {
                total.value = res.data.pagination.total_count + primitiveList.length;
            }
            const imgSet = new Set<string>();
            res.data.data.forEach(item => {
                primitiveList.push(item);
                if (!StringUtils.isEmpty(item.model_id)) {
                    imgSet.add(item.model_id!);
                }
            });
            page.value++;
            await getImgList(imgSet, refresh);
        } else {
            total.value = primitiveList.length;
        }
    } finally {
        loading.value = false;
    }
};

queryPrimitive(true);
</script>
