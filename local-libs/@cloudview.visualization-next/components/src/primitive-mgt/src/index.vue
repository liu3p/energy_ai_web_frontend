<template>
    <vis-mgt-framework
        ref="framework"
        v-model:query="query"
        v-model:keywords="keywords"
        class="vis-primitive-mgt"
        :title="t('vis.primitive.primitive')"
        :get-tags="getTags"
        :total="total"
        :loading="loading"
        @create="createPrimitive"
        @batch-download="beforeBatchDownload"
        @batch-import="beforeBatchImport"
    >
        <template v-if="!loading">
            <vis-card
                v-for="item in primitiveList"
                :key="item.id"
                :info="item"
                :operates="operates"
                :img-src="
                    item.type === 'image' ? imgMap[item.model_id] : Utils.svgString2Base64Img(imgMap[item.model_id])
                "
                @delete="deletePrimitive"
            >
            </vis-card>
        </template>
        <div v-if="primitiveList.length === 0 && !loading">{{ t('vis.common.noPrimitive') }}</div>
    </vis-mgt-framework>
    <vis-obj-definition-dialog
        ref="defDialog"
        v-model:formModel="formModel"
        :title="title"
        :get-tags="getTags"
        :check-name="PrimitiveApi.checkName"
        :upload-disabled="uploadDisabled"
        :submit="definitionSubmit"
    ></vis-obj-definition-dialog>
    <vis-import-export-dialog
        v-if="transmitDialogVisible"
        ref="transmitDialog"
        :type="transmitDialogType"
        :is-primitive="true"
        :get-tags-method="PrimitiveApi.getTags"
        :get-list-method="PrimitiveApi.getPrimitiveList"
        :export-method="PrimitiveApi.exportPrimitives"
        :import-preview-method="PrimitiveApi.importPreviewPrimitives"
        :import-method="PrimitiveApi.importPrimitives"
        @cancel="transmitCancel"
        @refresh="getPrimitiveList"
    ></vis-import-export-dialog>
</template>
<script lang="ts" setup>
import type {IMgtFrameworkQuery} from '../../mgt-framework';
import VisMgtFramework from '../../mgt-framework';
import VisCard from '../../card';
import VisObjDefinitionDialog from '../../obj-definition-dialog';
import VisImportExportDialog, {ImportExportDialogTypeEnum} from '../../import-export-dialog';
import type {IErrorData, IPaginationData, IPrimitive} from '@cloudview.visualization-next/services';
import {
    EngineTypeEnum,
    type IObject,
    ObjectApi,
    PrimitiveApi,
    PrimitiveFactory,
    PrimitiveImage,
    PrimitiveSvg,
    PrimitiveTypeAllEnum,
    StringUtils,
    useGlobalConfig,
    Utils,
    VisRouteNames,
} from '@cloudview.visualization-next/services';
import {reactive, ref, watch} from 'vue';
import {useLocale} from 'cloudview.ui-next';
import {useRouter} from 'vue-router';

const {t} = useLocale();

defineOptions({name: 'PrimitiveMgt'});
const framework = ref();
const {getTags} = PrimitiveApi;
const total = ref(0);
const primitiveList = reactive<IPrimitive[]>([]);
const imgMap = ref<Record<string, string>>({});
const query = ref<IMgtFrameworkQuery>({
    tag: '',
    engineType: EngineTypeEnum.ALL,
    page: 1,
    pageSize: 20,
});
const keywords = ref('');

const loading = ref(false);
const defDialog = ref();
const title = ref('');
const vnbId = useGlobalConfig('vnbId');
const formModel = ref();

const formatQuery = () => {
    const queryInfo = {
        tags: '',
        page: 1,
        pageSize: 20,
        keywords: '',
        enginType: '',
    };
    for (const key in query.value) {
        if (!Utils.isString(query.value[key]) || !StringUtils.isEmpty(query.value[key])) {
            queryInfo[key] = query.value[key];
        }
    }
    if (!StringUtils.isEmpty(keywords.value)) {
        queryInfo['keywords'] = keywords.value.trim();
    }
    return queryInfo;
};

const getImgList = async thumbSet => {
    const ids = Array.from(thumbSet);
    const res = await ObjectApi.getAssets(ids);
    if (res.state) {
        imgMap.value = {};
        res.data = res.data as IObject[];
        res.data.forEach(item => {
            imgMap.value[item.id] = item.content;
        });
    }
};

const getPrimitiveList = async () => {
    loading.value = true;
    try {
        const res = await PrimitiveApi.getPrimitiveList(formatQuery());
        if (res.state) {
            res.data = res.data as IPaginationData<IPrimitive[]>;
            primitiveList.length = 0;
            const imgSet = new Set<string>();
            res.data.data.forEach(item => {
                primitiveList.push(item);
                if (!StringUtils.isEmpty(item.model_id)) {
                    imgSet.add(item.model_id!);
                }
            });
            total.value = res.data.pagination.total_count;
            await getImgList(imgSet);
        }
    } finally {
        loading.value = false;
    }
};

watch(
    () => query.value,
    () => {
        getPrimitiveList();
    },
    {
        deep: true,
        immediate: true,
    }
);

watch(
    () => vnbId,
    () => {
        getPrimitiveList();
        framework.value.refreshTags();
    },
    {deep: true}
);

let latency: number;

watch(keywords, val => {
    window.clearTimeout(latency);
    latency = window.setTimeout(() => {
        getPrimitiveList();
    }, 500);
});

const definitionAdd = async (notifySuccess: string, notifyFailed: string): Promise<boolean> => {
    let primitive = PrimitiveFactory.getInstance(formModel.value);
    const fileRes = await ObjectApi.getFile(primitive.model_id);
    let code;
    if (fileRes.state) {
        // 获取图片初始尺寸
        const img = document.createElement('img');
        img.src = URL.createObjectURL(fileRes.data as File);
        await new Promise<void>(resolve => {
            img.addEventListener('load', () => {
                (primitive as PrimitiveSvg | PrimitiveImage).attributes.width = img.naturalWidth;
                (primitive as PrimitiveSvg | PrimitiveImage).attributes.height = img.naturalHeight;
                resolve();
            });
        });

        if (primitive instanceof PrimitiveSvg) {
            const content = await Utils.readSvgFile(fileRes.data as File);
            primitive.setModel(content);
            primitive.parseStatus();
        }

        const res = await PrimitiveApi.addPrimitive(primitive.getConfig());
        if (res.state) {
            CvNotification.success({
                message: t(`vis.primitive.message.${notifySuccess}`),
            });
            getPrimitiveList().then();
            return true;
        } else {
            code = res.data.code;
        }
    } else {
        code = (fileRes.data as IErrorData).code;
    }

    CvNotification.error({
        title: t(`vis.primitive.message.${notifyFailed}`),
        message: t(`vis.error.${code}`),
    });
    return false;
};

const definitionCreate = (): Promise<boolean> => {
    return definitionAdd('createSuccess', 'createFailed');
};

const definitionCopy = (): Promise<boolean> => {
    return definitionAdd('copySuccess', 'copyFailed');
};

const definitionSubmit = ref(definitionCreate);

const router = useRouter();
const operates = [
    {
        label: t('vis.common.edit'),
        callback: (model: IPrimitive) => {
            router.push({
                name: VisRouteNames.PRIMITIVE_EDITOR,
                params: {
                    id: model.id,
                },
            });
        },
    },
    {
        label: t('vis.common.copy'),
        callback: (model: IPrimitive) => {
            defDialog.value.open();
            title.value = t('vis.primitive.copyPrimitive');
            formModel.value = JSON.parse(JSON.stringify(model));
            formModel.value.id = '';
            formModel.value.name += t('vis.common.ectype');
            definitionSubmit.value = definitionCopy;
        },
    },
    {
        label: t('vis.common.download'),
        callback: async (model: IPrimitive) => {
            const result = await PrimitiveApi.exportPrimitives([model.id!]);
            if (result.state) {
                Utils.download(result.data, model.name + '.bin');
            } else {
                CvMessage({type: 'error', message: t('vis.common.failedExport')});
            }
        },
    },
];

const uploadDisabled = ref(false);

const deletePrimitive = async (info: IPrimitive) => {
    await CvMessageBox.confirm(t('vis.primitive.deletePrimitive', {0: info.name}), t('vis.common.prompt'), {
        type: 'info',
    });
    const res = await PrimitiveApi.deletePrimitive(info.id!);
    if (res.state) {
        CvNotification.success({
            message: t('vis.message.deleteSuccess'),
        });
        await getPrimitiveList();
        await framework.value.refreshTags();
    } else {
        CvNotification.error({
            title: t('vis.message.deleteFailed'),
            message: t(`vis.error.${res.data.code}`),
        });
    }
};

const createPrimitive = () => {
    defDialog.value.open();
    title.value = t('vis.primitive.createPrimitive');
    formModel.value = getDefaultFormModel();
    definitionSubmit.value = definitionCreate;
};

const getDefaultFormModel = (): IPrimitive => {
    return {
        name: '',
        type: PrimitiveTypeAllEnum.SVG,
        tag: '',
        description: '',
        enabled: true,
        engine_type: EngineTypeEnum['2D'],
        model: '',
        model_id: '',
        vnb_id: vnbId.value,
        public: false,
        isBasic: false,
    } as IPrimitive;
};

formModel.value = getDefaultFormModel();

const transmitDialogVisible = ref(false);
const transmitDialogType = ref(ImportExportDialogTypeEnum.export);

const beforeBatchDownload = async () => {
    transmitDialogType.value = ImportExportDialogTypeEnum.export;
    transmitDialogVisible.value = true;
};

const beforeBatchImport = async () => {
    transmitDialogType.value = ImportExportDialogTypeEnum.import;
    transmitDialogVisible.value = true;
};

const transmitCancel = () => (transmitDialogVisible.value = false);
</script>
