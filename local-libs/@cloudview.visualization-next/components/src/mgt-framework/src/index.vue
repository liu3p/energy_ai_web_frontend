<template>
    <div class="vis-mgt-framework">
        <div class="vis-mgt-framework__operate-box">
            <cv-select v-model="queryInfo.tag" size="large">
                <cv-option v-for="item in tags" :key="item.value" :label="item.label" :value="item.value"></cv-option>
            </cv-select>
            <span class="vis-mgt-framework__splitter"></span>
            <cv-select v-model="queryInfo.engineType" size="large">
                <cv-option
                    v-for="item in engineTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                ></cv-option>
            </cv-select>
            <span class="vis-mgt-framework__splitter"></span>
            <div class="vis-mgt-framework__search">
                <cv-input
                    v-model.lazyTrim="keywords"
                    typ="search"
                    :show-word-limit="true"
                    :maxlength="40"
                    :placeholder="t('vis.common.search')"
                ></cv-input>
            </div>
            <span class="vis-mgt-framework__splitter"></span>
            <cv-button type="primary" text @click="emits('batch-download')"
                >{{ t('vis.common.batchDownload') }}
            </cv-button>
            <span class="vis-mgt-framework__splitter"></span>
            <cv-button type="primary" text @click="emits('batch-import')">{{ t('vis.common.batchUpload') }}</cv-button>
            <span class="vis-mgt-framework__splitter"></span>
            <cv-button type="primary" text @click="emits('create')">
                {{ t('vis.common.createObj', {0: props.title}) }}
            </cv-button>
        </div>
        <cv-scrollbar ref="scrollbar" v-loading="props.loading" class="vis-mgt-framework__container">
            <slot></slot>
        </cv-scrollbar>
        <div class="vis-mgt-framework__footer">
            <cv-pagination
                v-model:current-page="queryInfo.page"
                type="simple"
                layout="total, prev, pager, next, jumper"
                :page-size="queryInfo.pageSize"
                :total="props.total"
            ></cv-pagination>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {computed, onMounted, reactive} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import defaultProps from './props';
import type {IOption} from '@cloudview.visualization-next/services';
import {getEngineTypes, StringUtils} from '@cloudview.visualization-next/services';

const {t} = useLocale();

defineOptions({name: 'Common'});
const props = defineProps(defaultProps);
const emits = defineEmits(['batch-download', 'batch-import', 'create', 'update:query', 'update:keywords']);

const tags = reactive<IOption[]>([
    {
        label: t('vis.common.allGroup'),
        value: '',
    },
]);
const engineTypes = getEngineTypes();

const getTags = async () => {
    const res = await props.getTags?.();
    if (res?.state) {
        tags.length = 1;
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

const queryInfo = computed({
    get() {
        return props.query;
    },
    set(val) {
        emits('update:query', val);
    },
});

const keywords = computed({
    get() {
        return props.keywords;
    },
    set(val) {
        emits('update:keywords', val);
    },
});
onMounted(() => getTags());

defineExpose({
    refreshTags: getTags,
});
</script>
