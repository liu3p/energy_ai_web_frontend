<template>
    <div class="vis-layout">
        <div class="vis-layout__filter-box">
            <cv-select v-model="queryInfo.tag" size="large" @change="queryChanged(true)">
                <cv-option
                    v-for="item in props.tags"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></cv-option>
            </cv-select>
            <span class="vis-layout__splitter"></span>
            <cv-input
                v-model.lazyTrim="queryInfo.keywords"
                type="search"
                :show-word-limit="true"
                :maxlength="40"
                :placeholder="t('vis.common.search')"
                auto-search
                :auto-blur-after-enter="false"
                :delay="500"
                @search="queryChanged(true)"
            ></cv-input>
        </div>
        <div class="vis-layout__option-box">
            <slot name="option"></slot>
        </div>
        <cv-scrollbar ref="scrollbar">
            <ul v-infinite-scroll="load" class="vis-layout__card-box" :infinite-scroll-disabled="disabled">
                <slot></slot>
            </ul>
            <div v-if="props.disabled" class="vis-layout__loading-text">{{ t('vis.common.loading') }}</div>
        </cv-scrollbar>
    </div>
</template>

<script lang="ts" setup>
import {computed, reactive} from 'vue';
import type {IOption} from '@cloudview.visualization-next/services';
import {StringUtils} from '@cloudview.visualization-next/services';
import {useLocale} from 'cloudview.ui-next';

const {t} = useLocale();

defineOptions({name: 'VisLayout'});
const emits = defineEmits(['search', 'check-change']);

interface IProps {
    tags: IOption[];
    noMore: boolean;
    disabled: boolean;
}

const props = withDefaults(defineProps<IProps>(), {});

const disabled = computed(() => {
    return props.noMore || props.disabled;
});

const queryInfo = reactive({
    keywords: '',
    tag: '',
    pageSize: 20,
    page: 1,
});

const query = computed(() => {
    const res = {
        pageSize: queryInfo.pageSize,
        page: queryInfo.page,
    };
    if (queryInfo.keywords.length > 0) {
        res['keywords'] = queryInfo.keywords.trim();
    }
    if (!StringUtils.isEmpty(queryInfo.tag)) {
        res['tag'] = queryInfo.tag;
    }
    return res;
});

const queryChanged = refresh => {
    if (refresh) {
        queryInfo.page = 1;
    }
    emits('search', query.value, refresh);
    queryInfo.page++;
};

const load = () => {
    queryChanged(false);
};

const clear = () => {
    queryInfo.tag = '';
    queryInfo.keywords = '';
    queryInfo.page = 1;
};
defineExpose({clear});
</script>
