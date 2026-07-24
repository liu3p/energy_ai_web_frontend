<template>
    <component
        :is="dict[props.type]"
        v-bind="subProps"
        @cancel="emits('cancel')"
        @refresh="emits('refresh')"
    ></component>
</template>
<script lang="ts" setup>
import {type Response, useLocale} from 'cloudview.ui-next';
import ExportComp from './export.comp.vue';
import ImportComp from './import.comp.vue';
import type {Component} from 'vue';
import {computed, onMounted, reactive, withDefaults} from 'vue';
import {ImportExportDialogTypeEnum} from './types';
import type {IConfiguration, IPrimitive} from '@cloudview.visualization-next/services';
import {type IImportPreviewItem, type IOption, StringUtils} from '@cloudview.visualization-next/services';

const {t} = useLocale();

type IDict = {
    [name in ImportExportDialogTypeEnum]: Component;
};

interface IProps {
    type: string;
    isPrimitive?: boolean;
    getListMethod: (query: Record<string, string>) => Promise<Response<IPrimitive[] | IConfiguration[]>>;
    getTagsMethod: (keywords?: string) => Promise<Response<string[]>>;
    exportMethod: (ids: string[], tag: string, search: string) => Promise<Response<Blob>>;
    importMethod: (file: File, ids: string[]) => Promise<Response<any>>;
    importPreviewMethod: (file: File) => Promise<Response<IImportPreviewItem[]>>;
}

const dict: IDict = {
    import: ImportComp,
    export: ExportComp,
};
const props = withDefaults(defineProps<IProps>(), {
    type: ImportExportDialogTypeEnum.export,
    isPrimitive: false,
});
defineOptions({name: 'ImportExportDialog'});
const emits = defineEmits(['cancel', 'refresh']);

const tags = reactive<IOption[]>([
    {
        label: t('vis.common.allGroup'),
        value: '',
    },
]);
const getTags = async () => {
    const res = await props.getTagsMethod?.();
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

const subProps = computed(() => {
    const _subProps = Object.entries(Object.assign({}, props, {tags})).filter(item => {
        console.log(props.type);
        if (props.type === ImportExportDialogTypeEnum.export) {
            return !['getTagsMethod', 'importMethod', 'importPreviewMethod', 'type'].includes(item[0]);
        } else {
            return !['getTagsMethod', 'exportMethod', 'type', 'tags'].includes(item[0]);
        }
    });
    const _props = {};
    _subProps.forEach(item => {
        _props[item[0]] = item[1];
    });
    return _props;
});

onMounted(async () => {
    await getTags();
});
</script>
